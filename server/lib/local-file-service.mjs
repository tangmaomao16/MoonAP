import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";
import {
  chooseChunkSizesByPolicy,
  detectFileTypeByPolicy,
  getAnalysisPolicy,
  getDefaultAnalysisForType,
  getFileAnalysisPolicy,
} from "./file-analysis-policy.mjs";

const FILE_POLICY = getFileAnalysisPolicy();
const MAX_PREVIEW_BYTES = FILE_POLICY.maxPreviewBytes;
const MAX_PREVIEW_LINES = FILE_POLICY.maxPreviewLines;

function detectFileType(filePath) {
  return detectFileTypeByPolicy(filePath);
}

async function readPreviewLines(filePath) {
  const handle = await fsp.open(filePath, "r");
  try {
    const buffer = Buffer.alloc(MAX_PREVIEW_BYTES);
    const { bytesRead } = await handle.read(buffer, 0, MAX_PREVIEW_BYTES, 0);
    return buffer
      .subarray(0, bytesRead)
      .toString("utf8")
      .split(/\r?\n/)
      .slice(0, MAX_PREVIEW_LINES)
      .map((line) => line.trimEnd());
  } finally {
    await handle.close();
  }
}

function formatRatio(numerator, denominator) {
  if (!denominator) {
    return "0.000000%";
  }
  return `${((numerator / denominator) * 100).toFixed(6)}%`;
}

function chooseChunkSizes(sizeBytes) {
  return chooseChunkSizesByPolicy("fastq-n-stats", sizeBytes);
}

function estimateChunkCount(sizeBytes, chunkBytes) {
  if (!sizeBytes || !chunkBytes) {
    return 0;
  }
  return Math.ceil(sizeBytes / chunkBytes);
}

function buildFastqBenchmarkPlan(sizeBytes) {
  const policy = getAnalysisPolicy("fastq-n-stats");
  const chunkSizes = chooseChunkSizes(sizeBytes);
  const primaryChunkLabel = chunkSizes[0];
  const primaryChunkBytes = Number.parseInt(primaryChunkLabel, 10) * 1024 * 1024;

  return {
    benchmarkTiers: policy?.benchmarkTiers || ["0.1 GB", "1 GB", "5 GB"],
    recommendedChunkSizes: chunkSizes,
    primaryChunkLabel,
    estimatedChunksAtCurrentSize: estimateChunkCount(sizeBytes, primaryChunkBytes),
    evaluationFocus: policy?.evaluationFocus || ["memory peak", "chunk throughput", "total runtime", "output correctness"],
  };
}

function buildFastqBenchmarkReport(filePath, fileSizeBytes, metrics, benchmarkPlan) {
  const currentGiB = (fileSizeBytes / (1024 * 1024 * 1024)).toFixed(4);
  return [
    "MoonAP FastQ Benchmark Report",
    "============================",
    `file = ${filePath}`,
    `size = ${fileSizeBytes} bytes (${currentGiB} GiB)`,
    "",
    "current metrics",
    `- reads processed: ${metrics.readCount}`,
    `- total bases: ${metrics.totalBases}`,
    `- N ratio: ${formatRatio(metrics.nBases, metrics.totalBases)}`,
    `- GC ratio: ${formatRatio(metrics.gcBases, metrics.totalBases)}`,
    `- average read length: ${metrics.averageReadLength.toFixed(2)}`,
    `- longest read: ${metrics.longestRead}`,
    `- shortest read: ${metrics.shortestRead}`,
    "",
    "recommended benchmark plan",
    `- tiers: ${benchmarkPlan.benchmarkTiers.join(" / ")}`,
    `- primary chunk size: ${benchmarkPlan.primaryChunkLabel}`,
    `- chunk sweep: ${benchmarkPlan.recommendedChunkSizes.join(" / ")}`,
    `- estimated chunks at current size: ${benchmarkPlan.estimatedChunksAtCurrentSize}`,
    `- evaluation focus: ${benchmarkPlan.evaluationFocus.join(", ")}`,
    "",
    "competition talking points",
    "- keep sequencing data local to the browser-side execution flow",
    "- compare chunk sizes instead of loading the full file at once",
    "- record memory peak, throughput, runtime, and output correctness side by side",
  ].join("\n");
}

function inferDelimiter(sampleLine) {
  if (sampleLine.includes("\t")) {
    return "\t";
  }
  return ",";
}

async function countLines(filePath) {
  const stream = fs.createReadStream(filePath, { encoding: "utf8" });
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  let lineCount = 0;
  try {
    for await (const _line of rl) {
      lineCount += 1;
    }
  } finally {
    rl.close();
  }

  return lineCount;
}

async function analyzeFastqN(filePath) {
  const stat = await fsp.stat(filePath);
  const stream = fs.createReadStream(filePath, { encoding: "utf8" });
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  let lineIndex = 0;
  let readCount = 0;
  let totalBases = 0;
  let nBases = 0;
  let gcBases = 0;
  let longestRead = 0;
  let shortestRead = Number.MAX_SAFE_INTEGER;

  try {
    for await (const line of rl) {
      if (lineIndex % 4 === 1) {
        readCount += 1;
        const readLength = line.length;
        totalBases += readLength;
        if (readLength > longestRead) {
          longestRead = readLength;
        }
        if (readLength < shortestRead) {
          shortestRead = readLength;
        }
        for (const char of line) {
          if (char === "N" || char === "n") {
            nBases += 1;
          }
          if (char === "G" || char === "g" || char === "C" || char === "c") {
            gcBases += 1;
          }
        }
      }
      lineIndex += 1;
    }
  } finally {
    rl.close();
  }

  const averageReadLength = readCount ? totalBases / readCount : 0;
  const benchmarkPlan = buildFastqBenchmarkPlan(stat.size);
  const metrics = {
    readCount,
    totalBases,
    nBases,
    gcBases,
    nRatio: totalBases ? nBases / totalBases : 0,
    gcRatio: totalBases ? gcBases / totalBases : 0,
    averageReadLength,
    longestRead,
    shortestRead: Number.isFinite(shortestRead) ? shortestRead : 0,
  };

  return {
    analysisType: "fastq-n-stats",
    summary: [
      "FastQ streaming analysis completed.",
      `Reads processed: ${readCount}`,
      `Total bases: ${totalBases}`,
      `N bases: ${nBases}`,
      `N ratio: ${formatRatio(nBases, totalBases)}`,
      `GC ratio: ${formatRatio(gcBases, totalBases)}`,
      `Average read length: ${averageReadLength.toFixed(2)}`,
      `Recommended chunk sizes: ${benchmarkPlan.recommendedChunkSizes.join(" / ")}`,
    ].join("\n"),
    metrics,
    benchmarkPlan,
    benchmarkReport: buildFastqBenchmarkReport(filePath, stat.size, metrics, benchmarkPlan),
  };
}

async function analyzeCsv(filePath, previewLines) {
  const headerLine = previewLines.find((line) => line.length > 0) || "";
  const delimiter = inferDelimiter(headerLine);
  const columns = headerLine ? headerLine.split(delimiter).map((item) => item.trim()) : [];
  const lineCount = await countLines(filePath);

  return {
    analysisType: "csv-summary",
    summary: [
      "CSV preview analysis completed.",
      `Columns detected: ${columns.length}`,
      `Header: ${columns.join(" | ") || "(empty)"}`,
      `Approximate row count: ${Math.max(lineCount - 1, 0)}`,
    ].join("\n"),
    metrics: {
      columnCount: columns.length,
      columns,
      lineCount,
    },
  };
}

async function analyzeJson(filePath) {
  const stat = await fsp.stat(filePath);
  const sizeLimitBytes = 8 * 1024 * 1024;

  if (stat.size > sizeLimitBytes) {
    return {
      analysisType: "json-summary",
      summary: [
        "JSON file is larger than 8 MB, so MoonAP returned a metadata summary only.",
        `File size: ${stat.size} bytes`,
      ].join("\n"),
      metrics: {
        sizeBytes: stat.size,
      },
    };
  }

  const raw = await fsp.readFile(filePath, "utf8");
  const value = JSON.parse(raw);
  const topLevelType = Array.isArray(value) ? "array" : typeof value;
  const topLevelSize =
    topLevelType === "array"
      ? value.length
      : topLevelType === "object" && value
        ? Object.keys(value).length
        : 1;

  return {
    analysisType: "json-summary",
    summary: [
      "JSON structural analysis completed.",
      `Top-level type: ${topLevelType}`,
      `Top-level size: ${topLevelSize}`,
    ].join("\n"),
    metrics: {
      topLevelType,
      topLevelSize,
    },
  };
}

async function analyzeText(filePath, previewLines) {
  const lineCount = await countLines(filePath);
  const previewCharacters = previewLines.reduce((sum, line) => sum + line.length, 0);
  return {
    analysisType: "text-summary",
    summary: [
      "Text file summary completed.",
      `Lines counted: ${lineCount}`,
      `Preview lines loaded: ${previewLines.length}`,
      `Preview characters: ${previewCharacters}`,
    ].join("\n"),
    metrics: {
      lineCount,
      previewLineCount: previewLines.length,
      previewCharacters,
    },
  };
}

export async function inspectLocalFile(filePath) {
  const resolvedPath = path.resolve(String(filePath));
  const stat = await fsp.stat(resolvedPath);

  if (!stat.isFile()) {
    throw new Error(`Path is not a file: ${resolvedPath}`);
  }

  const previewLines = await readPreviewLines(resolvedPath);
  return {
    path: resolvedPath,
    name: path.basename(resolvedPath),
    extension: path.extname(resolvedPath).toLowerCase(),
    sizeBytes: stat.size,
    detectedType: detectFileType(resolvedPath),
    previewLines,
  };
}

export async function analyzeLocalFile({ filePath, requestedAnalysis = "auto" }) {
  const fileInfo = await inspectLocalFile(filePath);
  const defaultAnalysis = getDefaultAnalysisForType(fileInfo.detectedType);
  const analysisType = requestedAnalysis === "auto" ? defaultAnalysis : requestedAnalysis;

  if (analysisType === "fastq-n-stats" || fileInfo.detectedType === "fastq") {
    return analyzeFastqN(fileInfo.path);
  }

  if (analysisType === "csv-summary" && fileInfo.detectedType === "csv") {
    return analyzeCsv(fileInfo.path, fileInfo.previewLines);
  }

  if (analysisType === "json-summary" && fileInfo.detectedType === "json") {
    return analyzeJson(fileInfo.path);
  }

  return analyzeText(fileInfo.path, fileInfo.previewLines);
}
