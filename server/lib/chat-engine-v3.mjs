import { resolveModelConfig, useRemoteModel } from "./config.mjs";
import { analyzeLocalFile, inspectLocalFile } from "./local-file-service.mjs";
import { generateMockChatReply, generateMockMoonBit } from "./mock-v3.mjs";
import { generateMoonBitProgram, generateTextReply } from "./openai-compatible-v2.mjs";

function wantsFileAnalysis(prompt, fileInfo) {
  const normalized = prompt.toLowerCase();
  const keywords = [
    "fastq", ".fq", ".fastq", "analy", "count", "ratio", "quality", "csv", "json", "log", "stats", "inspect",
    "\u6587\u4ef6", "\u5206\u6790", "\u7edf\u8ba1", "\u6bd4\u4f8b", "\u8d28\u91cf", "\u78b1\u57fa",
  ];
  return Boolean(fileInfo) && keywords.some((keyword) => normalized.includes(keyword));
}

function wantsFastqAnalysis(prompt, fileInfo) {
  const normalized = prompt.toLowerCase();
  return (
    fileInfo?.detectedType === "fastq" ||
    normalized.includes("fastq") ||
    normalized.includes(".fastq") ||
    normalized.includes(".fq") ||
    normalized.includes("\u78b1\u57fa") ||
    normalized.includes("n base")
  );
}

function buildContextPrompt(prompt, fileInfo, analysis) {
  const lines = [prompt];
  if (fileInfo) {
    lines.push(`Current file path: ${fileInfo.path}`);
    lines.push(`Current file type: ${fileInfo.detectedType}`);
    lines.push(`Current file size bytes: ${fileInfo.sizeBytes}`);
  }
  if (analysis) {
    lines.push(`Local analysis summary:\n${analysis.summary}`);
  }
  return lines.join("\n\n");
}

export async function generateMoonAPResponse({ prompt, history = [], filePath = "", llmConfig = {} }) {
  const resolvedConfig = resolveModelConfig(llmConfig);
  const trimmedPath = String(filePath || "").trim();
  const fileInfo = trimmedPath ? await inspectLocalFile(trimmedPath) : null;
  const analysisMode = wantsFileAnalysis(prompt, fileInfo);
  let analysis = null;

  if (analysisMode && fileInfo) {
    analysis = await analyzeLocalFile({
      filePath: fileInfo.path,
      requestedAnalysis: wantsFastqAnalysis(prompt, fileInfo) ? "fastq-n-stats" : "auto",
    });
  }

  if (!analysisMode) {
    const reply = useRemoteModel(resolvedConfig)
      ? await generateTextReply(buildContextPrompt(prompt, fileInfo, null), history, resolvedConfig)
      : generateMockChatReply(prompt, { fileInfo });

    return {
      mode: "chat",
      assistant: { role: "assistant", content: reply },
      artifact: null,
      fileInfo,
      analysis: null,
    };
  }

  let artifact;
  if (useRemoteModel(resolvedConfig)) {
    try {
      artifact = {
        ...(await generateMoonBitProgram(buildContextPrompt(prompt, fileInfo, analysis), history, resolvedConfig)),
        adapter: "openai-compatible",
      };
    } catch (error) {
      artifact = {
        ...generateMockMoonBit(prompt, { fileInfo, analysis }),
        adapter: "mock-fallback",
        warning: `Remote model request failed, so MoonAP fell back to the local generator: ${error.message}`,
      };
    }
  } else {
    artifact = {
      ...generateMockMoonBit(prompt, { fileInfo, analysis }),
      adapter: "mock",
    };
  }

  return {
    mode: "analysis",
    assistant: {
      role: "assistant",
      content: generateMockChatReply(prompt, { fileInfo, analysis }),
    },
    artifact,
    fileInfo,
    analysis,
  };
}
