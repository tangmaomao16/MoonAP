import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";

const MAX_PREVIEW_BYTES = 4096;
const MAX_PREVIEW_LINES = 12;

function detectFileType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if ([".fastq", ".fq"].includes(extension)) {
    return "fastq";
  }
  if (extension === ".csv") {
    return "csv";
  }
  if (extension === ".json") {
    return "json";
  }
  if ([".log", ".txt", ".tsv"].includes(extension)) {
    return "text";
  }
  return "unknown";
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
  const stream = fs.createReadStream(filePath, { encoding: "utf8" });
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  let lineIndex = 0;
  let readCount = 0;
  let totalBases = 0;
  let nBases = 0;

  try {
    for await (const line of rl) {
      if (lineIndex % 4 === 1) {
        readCount += 1;
        totalBases += line.length;
        for (const char of line) {
          if (char === "N" || char === "n") {
            nBases += 1;
          }
        }
      }
      lineIndex += 1;
    }
  } finally {
    rl.close();
  }

  return {
    analysisType: "fastq-n-stats",
    summary: [
      "FastQ streaming analysis completed.",
      `Reads processed: ${readCount}`,
      `Total bases: ${totalBases}`,
      `N bases: ${nBases}`,
      `N ratio: ${formatRatio(nBases, totalBases)}`,
    ].join("\n"),
    metrics: {
      readCount,
      totalBases,
      nBases,
      nRatio: totalBases ? nBases / totalBases : 0,
    },
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

  if (requestedAnalysis === "fastq-n-stats" || fileInfo.detectedType === "fastq") {
    return analyzeFastqN(fileInfo.path);
  }

  if (requestedAnalysis === "auto" && fileInfo.detectedType === "csv") {
    return analyzeCsv(fileInfo.path, fileInfo.previewLines);
  }

  if (requestedAnalysis === "auto" && fileInfo.detectedType === "json") {
    return analyzeJson(fileInfo.path);
  }

  return analyzeText(fileInfo.path, fileInfo.previewLines);
}
