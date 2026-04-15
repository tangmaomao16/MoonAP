import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { once } from "node:events";
import { performance } from "node:perf_hooks";
import { spawn } from "node:child_process";
import { ROOT_DIR, TEMP_ROOT } from "./config.mjs";
import { analyzeLocalFile, inspectLocalFile } from "./local-file-service.mjs";
import { generateMockMoonBit } from "./mock-v3.mjs";
import { compileMoonBitToWasm } from "./moonbit-compiler.mjs";

const BENCHMARK_ROOT = path.join(ROOT_DIR, ".moonap-artifacts", "benchmarks");
const SAMPLES_ROOT = path.join(ROOT_DIR, "samples");

const DEFAULT_CASES = [
  { id: "sample-demo", reads: 3, readLength: 10, tier: "demo" },
  { id: "dev-small", reads: 2_000, readLength: 150, tier: "developer-small" },
  { id: "dev-medium", reads: 20_000, readLength: 150, tier: "developer-medium" },
  { id: "dev-large", reads: 100_000, readLength: 150, tier: "developer-large" },
];

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KiB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GiB`;
}

function buildSequence(readIndex, readLength) {
  const alphabet = ["A", "T", "G", "C", "N"];
  let sequence = "";
  for (let index = 0; index < readLength; index += 1) {
    sequence += alphabet[(readIndex * 7 + index * 11) % alphabet.length];
  }
  return sequence;
}

async function writeSyntheticFastq(filePath, { reads, readLength }) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  const stream = fs.createWriteStream(filePath, { encoding: "utf8" });

  for (let index = 0; index < reads; index += 1) {
    const sequence = buildSequence(index, readLength);
    const quality = "I".repeat(readLength);
    const record = `@read${index + 1}\n${sequence}\n+\n${quality}\n`;
    if (!stream.write(record)) {
      await once(stream, "drain");
    }
  }

  stream.end();
  await once(stream, "finish");
}

function detectMoonVersion() {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn("moon", ["version"], {
        cwd: ROOT_DIR,
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch {
      resolve("moon cli unavailable in benchmark sandbox");
      return;
    }

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", () => resolve("moon cli unavailable"));
    child.on("close", () => {
      const text = [stdout.trim(), stderr.trim()].filter(Boolean).join(" ").trim();
      resolve(text || "moon version unavailable");
    });
  });
}

async function runCase(tempDir, benchmarkCase) {
  const filePath = path.join(tempDir, `${benchmarkCase.id}.fastq`);
  await writeSyntheticFastq(filePath, benchmarkCase);
  const fileInfo = await inspectLocalFile(filePath);
  const startedAt = performance.now();
  const analysis = await analyzeLocalFile({
    filePath: fileInfo.path,
    requestedAnalysis: "fastq-n-stats",
  });
  const durationMs = performance.now() - startedAt;
  const sizeMiB = fileInfo.sizeBytes / (1024 * 1024);

  return {
    id: benchmarkCase.id,
    tier: benchmarkCase.tier,
    source: benchmarkCase.source || "synthetic",
    filePath: fileInfo.path,
    sizeBytes: fileInfo.sizeBytes,
    sizeLabel: formatBytes(fileInfo.sizeBytes),
    reads: analysis.metrics.readCount,
    totalBases: analysis.metrics.totalBases,
    nRatio: analysis.metrics.nRatio,
    gcRatio: analysis.metrics.gcRatio,
    averageReadLength: analysis.metrics.averageReadLength,
    recommendedChunkSizes: analysis.benchmarkPlan.recommendedChunkSizes,
    estimatedChunksAtCurrentSize: analysis.benchmarkPlan.estimatedChunksAtCurrentSize,
    durationMs,
    throughputMiBPerSecond: durationMs > 0 ? sizeMiB / (durationMs / 1000) : 0,
    summary: analysis.summary,
    benchmarkReport: analysis.benchmarkReport,
    analysis,
    fileInfo,
  };
}

async function listSampleFastqFiles() {
  try {
    const entries = await fsp.readdir(SAMPLES_ROOT, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => /\.(fastq|fq)$/i.test(name))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

async function runSampleCase(fileName) {
  const filePath = path.join(SAMPLES_ROOT, fileName);
  const fileInfo = await inspectLocalFile(filePath);
  const startedAt = performance.now();
  const analysis = await analyzeLocalFile({
    filePath: fileInfo.path,
    requestedAnalysis: "fastq-n-stats",
  });
  const durationMs = performance.now() - startedAt;
  const sizeMiB = fileInfo.sizeBytes / (1024 * 1024);

  return {
    id: path.parse(fileName).name,
    tier: fileInfo.sizeBytes >= 1024 * 1024 ? "saved-sample-large" : "saved-sample",
    source: "sample",
    filePath: fileInfo.path,
    sizeBytes: fileInfo.sizeBytes,
    sizeLabel: formatBytes(fileInfo.sizeBytes),
    reads: analysis.metrics.readCount,
    totalBases: analysis.metrics.totalBases,
    nRatio: analysis.metrics.nRatio,
    gcRatio: analysis.metrics.gcRatio,
    averageReadLength: analysis.metrics.averageReadLength,
    recommendedChunkSizes: analysis.benchmarkPlan.recommendedChunkSizes,
    estimatedChunksAtCurrentSize: analysis.benchmarkPlan.estimatedChunksAtCurrentSize,
    durationMs,
    throughputMiBPerSecond: durationMs > 0 ? sizeMiB / (durationMs / 1000) : 0,
    summary: analysis.summary,
    benchmarkReport: analysis.benchmarkReport,
    analysis,
    fileInfo,
  };
}

function buildMarkdownReport({ moonVersion, generatedAt, cases, compileValidation }) {
  const header = [
    "# MoonAP FastQ Benchmark Report",
    "",
    `- generated at: ${generatedAt}`,
    `- moon version: ${moonVersion}`,
    `- benchmark cases: ${cases.length}`,
    "",
    "## Summary Table",
    "",
    "| Case | Source | Tier | Size | Reads | N Ratio | GC Ratio | Duration (ms) | Throughput (MiB/s) | Chunk Sizes |",
    "| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |",
  ];

  const tableRows = cases.map((item) =>
    `| ${item.id} | ${item.source} | ${item.tier} | ${item.sizeLabel} | ${item.reads} | ${(item.nRatio * 100).toFixed(4)}% | ${(item.gcRatio * 100).toFixed(4)}% | ${item.durationMs.toFixed(2)} | ${item.throughputMiBPerSecond.toFixed(2)} | ${item.recommendedChunkSizes.join(" / ")} |`
  );

  const caseSections = cases.flatMap((item) => [
    "",
    `## Case: ${item.id}`,
    "",
    `- source: ${item.source}`,
    `- file: ${item.filePath}`,
    `- size: ${item.sizeBytes} bytes`,
    `- reads: ${item.reads}`,
    `- total bases: ${item.totalBases}`,
    `- average read length: ${item.averageReadLength.toFixed(2)}`,
    `- estimated chunks: ${item.estimatedChunksAtCurrentSize}`,
    `- analysis duration: ${item.durationMs.toFixed(2)} ms`,
    `- throughput: ${item.throughputMiBPerSecond.toFixed(2)} MiB/s`,
    "",
    "```text",
    item.benchmarkReport,
    "```",
  ]);

  const compileSection = [
    "",
    "## Wasm Build Validation",
    "",
    `- compiled: ${compileValidation.compiled ? "yes" : "no"}`,
    `- source files: ${compileValidation.sourceFileCount}`,
    `- build log: ${compileValidation.buildLog || "(none)"}`,
  ];

  return [...header, ...tableRows, ...caseSections, ...compileSection, ""].join("\n");
}

export async function runFastqBenchmarkSuite({ cases = DEFAULT_CASES, compileArtifact = true, includeSamples = true } = {}) {
  await fsp.mkdir(TEMP_ROOT, { recursive: true });
  const tempDir = await fsp.mkdtemp(path.join(TEMP_ROOT, "fastq-benchmark-"));
  const moonVersion = await detectMoonVersion();
  const results = [];

  for (const benchmarkCase of cases) {
    results.push(await runCase(tempDir, benchmarkCase));
  }

  if (includeSamples) {
    const sampleFiles = await listSampleFastqFiles();
    for (const fileName of sampleFiles) {
      results.push(await runSampleCase(fileName));
    }
  }

  let compileValidation = {
    compiled: false,
    sourceFileCount: 0,
    buildLog: "",
  };

  if (compileArtifact && results.length > 0) {
    const reference = results[results.length - 1];
    const artifact = generateMockMoonBit("Analyze this FastQ file and count N bases.", {
      selectedMode: "fastq-agent",
      fileInfo: reference.fileInfo,
      analysis: reference.analysis,
    });
    const compiled = await compileMoonBitToWasm(artifact);
    compileValidation = {
      compiled: true,
      sourceFileCount: artifact.sourceFiles?.length || 0,
      buildLog: compiled.buildLog,
    };
  }

  const report = {
    generatedAt: new Date().toISOString(),
    moonVersion,
    cases: results.map((item) => ({
      id: item.id,
      source: item.source,
      tier: item.tier,
      filePath: item.filePath,
      sizeBytes: item.sizeBytes,
      sizeLabel: item.sizeLabel,
      reads: item.reads,
      totalBases: item.totalBases,
      nRatio: item.nRatio,
      gcRatio: item.gcRatio,
      averageReadLength: item.averageReadLength,
      recommendedChunkSizes: item.recommendedChunkSizes,
      estimatedChunksAtCurrentSize: item.estimatedChunksAtCurrentSize,
      durationMs: item.durationMs,
      throughputMiBPerSecond: item.throughputMiBPerSecond,
      summary: item.summary,
    })),
    compileValidation,
  };

  return {
    report,
    markdown: buildMarkdownReport({
      moonVersion,
      generatedAt: report.generatedAt,
      cases: results,
      compileValidation,
    }),
  };
}

export async function writeFastqBenchmarkArtifacts(options = {}) {
  await fsp.mkdir(BENCHMARK_ROOT, { recursive: true });
  const { report, markdown } = await runFastqBenchmarkSuite(options);
  const jsonPath = path.join(BENCHMARK_ROOT, "fastq-benchmark-latest.json");
  const markdownPath = path.join(BENCHMARK_ROOT, "fastq-benchmark-latest.md");
  await fsp.writeFile(jsonPath, JSON.stringify(report, null, 2), "utf8");
  await fsp.writeFile(markdownPath, markdown, "utf8");
  return { report, markdown, jsonPath, markdownPath };
}
