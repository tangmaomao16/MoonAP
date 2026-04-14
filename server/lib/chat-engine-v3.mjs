import { resolveModelConfig, useRemoteModel } from "./config.mjs";
import { analyzeLocalFile, inspectLocalFile } from "./local-file-service.mjs";
import { generateMockChatReply, generateMockMoonBit } from "./mock-v3.mjs";
import { generateMoonBitProgram, generateTextReply } from "./openai-compatible-v2.mjs";

function normalizeMode(mode) {
  const value = String(mode || "").trim().toLowerCase();
  if (["chat", "moonbit-task", "fastq-agent", "game-agent"].includes(value)) {
    return value;
  }
  return "chat";
}

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

function modeSystemPrompt(mode) {
  if (mode === "moonbit-task") {
    return "The user explicitly wants a MoonBit-first workflow. Generate a practical MoonBit program that is suitable for compilation to WebAssembly and browser execution when possible.";
  }
  if (mode === "fastq-agent") {
    return "The user is using MoonAP as a FastQ analysis agent. Focus on local file analysis, explain the result clearly, and produce MoonBit code that demonstrates or supports the requested analysis.";
  }
  if (mode === "game-agent") {
    return "The user is using MoonAP as a browser mini-game generator. Produce MoonBit code that is compact, understandable, and suitable as a WebAssembly game prototype or gameplay core.";
  }
  return "The user is chatting with MoonAP in conversational mode.";
}

function buildContextPrompt(prompt, fileInfo, analysis, mode) {
  const lines = [
    `MoonAP mode: ${mode}`,
    modeSystemPrompt(mode),
    `User request:\n${prompt}`,
  ];
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

function modeNeedsArtifact(mode, prompt) {
  const normalized = prompt.toLowerCase();
  return (
    mode === "moonbit-task" ||
    mode === "game-agent" ||
    containsArtifactIntent(normalized)
  );
}

function containsArtifactIntent(normalizedPrompt) {
  const keywords = [
    "moonbit",
    "webassembly",
    "wasm",
    "game",
    "小游戏",
    "generate code",
    "生成代码",
    "compile",
    "编译",
  ];
  return keywords.some((keyword) => normalizedPrompt.includes(keyword));
}

function buildMissingFileReply(mode) {
  if (mode === "fastq-agent") {
    return "FastQ analyst mode is ready. Please attach a local `.fastq` or `.fq` file path first, then ask me for N-base ratio, read counts, quality statistics, or a MoonBit analysis program.";
  }
  return "Please attach a local file path first so MoonAP can inspect it and switch into the MoonBit -> Wasm workflow for this task.";
}

export async function generateMoonAPResponse({ prompt, history = [], filePath = "", llmConfig = {}, selectedMode = "chat" }) {
  const resolvedConfig = resolveModelConfig(llmConfig);
  const mode = normalizeMode(selectedMode);
  const trimmedPath = String(filePath || "").trim();
  const fileInfo = trimmedPath ? await inspectLocalFile(trimmedPath) : null;
  const analysisMode = mode === "fastq-agent" ? Boolean(fileInfo) : wantsFileAnalysis(prompt, fileInfo);
  const artifactMode = analysisMode || modeNeedsArtifact(mode, prompt);
  let analysis = null;

  if (analysisMode && fileInfo) {
    analysis = await analyzeLocalFile({
      filePath: fileInfo.path,
      requestedAnalysis: wantsFastqAnalysis(prompt, fileInfo) ? "fastq-n-stats" : "auto",
    });
  }

  if (mode === "fastq-agent" && !fileInfo) {
    return {
      mode: "chat",
      experienceMode: mode,
      assistant: { role: "assistant", content: buildMissingFileReply(mode) },
      artifact: null,
      fileInfo,
      analysis: null,
    };
  }

  if (!artifactMode) {
    const reply = useRemoteModel(resolvedConfig)
      ? await generateTextReply(buildContextPrompt(prompt, fileInfo, null, mode), history, resolvedConfig)
      : generateMockChatReply(prompt, { fileInfo, selectedMode: mode });

    return {
      mode: "chat",
      experienceMode: mode,
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
        ...(await generateMoonBitProgram(buildContextPrompt(prompt, fileInfo, analysis, mode), history, resolvedConfig)),
        adapter: "openai-compatible",
      };
    } catch (error) {
      artifact = {
        ...generateMockMoonBit(prompt, { fileInfo, analysis, selectedMode: mode }),
        adapter: "mock-fallback",
        warning: `Remote model request failed, so MoonAP fell back to the local generator: ${error.message}`,
      };
    }
  } else {
    artifact = {
      ...generateMockMoonBit(prompt, { fileInfo, analysis, selectedMode: mode }),
      adapter: "mock",
    };
  }

  return {
    mode: "analysis",
    experienceMode: mode,
    assistant: {
      role: "assistant",
      content: generateMockChatReply(prompt, { fileInfo, analysis, selectedMode: mode, artifact }),
    },
    artifact,
    fileInfo,
    analysis,
  };
}
