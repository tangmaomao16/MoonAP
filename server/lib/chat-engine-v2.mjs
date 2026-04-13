import { generateWithMock } from "./mock-generator-v2.mjs";
import { generateWithOpenAI } from "./openai-compatible.mjs";
import { analyzeLocalFile, inspectLocalFile } from "./local-file-service.mjs";
import { useRemoteModel } from "./config.mjs";

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) {
    return "unknown";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

function buildFileContextSnippet(fileInfo, analysis) {
  const lines = [];

  if (fileInfo) {
    lines.push(`Current file: ${fileInfo.path}`);
    lines.push(`File type: ${fileInfo.detectedType}`);
    lines.push(`File size: ${formatBytes(fileInfo.sizeBytes)}`);
    if (fileInfo.previewLines.length > 0) {
      lines.push("Preview:");
      lines.push(fileInfo.previewLines.join("\n"));
    }
  }

  if (analysis) {
    lines.push(`Latest analysis type: ${analysis.analysisType}`);
    lines.push(`Latest analysis summary: ${analysis.summary}`);
  }

  return lines.join("\n");
}

function wantsFileAnalysis(prompt) {
  const normalized = prompt.toLowerCase();
  return [
    "fastq",
    ".fq",
    ".fastq",
    "file",
    "文件",
    "分析",
    "统计",
    "n碱基",
    "n base",
    "csv",
    "json",
    "log",
  ].some((keyword) => normalized.includes(keyword));
}

function wantsFastqN(prompt, fileInfo) {
  const normalized = prompt.toLowerCase();
  return (
    normalized.includes("fastq") ||
    normalized.includes(".fq") ||
    normalized.includes(".fastq") ||
    normalized.includes("n碱基") ||
    normalized.includes("n base") ||
    normalized.includes("碱基n") ||
    fileInfo?.detectedType === "fastq"
  );
}

function buildAssistantReply({ prompt, fileInfo, analysis, artifact }) {
  if (analysis) {
    const intro = fileInfo
      ? `已经基于本地文件 ${fileInfo.path} 完成一次真实分析。`
      : "已经完成一次本地文件分析。";
    const codeNote =
      "右侧的 MoonBit 代码是同类分析逻辑的示例程序，方便继续演示 MoonBit 到 Wasm 的链路。";
    return `${intro}\n\n${analysis.summary}\n\n${codeNote}`;
  }

  if (fileInfo) {
    return `我已经读取到本地文件 ${fileInfo.path} 的基本信息。你现在可以继续提需求，例如“统计 FastQ 文件中 N 碱基的个数和比例”或“分析这个 CSV 的列结构”。`;
  }

  if (wantsFileAnalysis(prompt)) {
    return "要分析本地文件，请先在左侧填入文件路径并点击“读取文件信息”，然后继续描述你想做的统计或质量检测任务。";
  }

  return artifact.summary;
}

export async function generateMoonAPResponse({ prompt, history = [], filePath = "" }) {
  const trimmedPath = String(filePath || "").trim();
  const fileInfo = trimmedPath ? await inspectLocalFile(trimmedPath) : null;
  let analysis = null;

  if (fileInfo && wantsFileAnalysis(prompt)) {
    const requestedAnalysis = wantsFastqN(prompt, fileInfo) ? "fastq-n-stats" : "auto";
    analysis = await analyzeLocalFile({
      filePath: fileInfo.path,
      requestedAnalysis,
    });
  }

  const promptWithContext = [prompt, buildFileContextSnippet(fileInfo, analysis)]
    .filter(Boolean)
    .join("\n\n");

  let artifact;
  if (useRemoteModel()) {
    try {
      artifact = {
        ...(await generateWithOpenAI(promptWithContext, history)),
        adapter: "openai-compatible",
      };
    } catch (error) {
      artifact = {
        ...generateWithMock(promptWithContext, { fileInfo, analysis }),
        adapter: "mock-fallback",
        warning: `Remote model request failed, so MoonAP fell back to the local generator: ${error.message}`,
      };
    }
  } else {
    artifact = {
      ...generateWithMock(promptWithContext, { fileInfo, analysis }),
      adapter: "mock",
    };
  }

  return {
    assistant: {
      role: "assistant",
      content: buildAssistantReply({ prompt, fileInfo, analysis, artifact }),
    },
    artifact,
    fileInfo,
    analysis,
  };
}
