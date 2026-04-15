import { resolveModelConfig, useRemoteModel } from "./config.mjs";
import { analyzeLocalFile, inspectLocalFile } from "./local-file-service.mjs";
import { generateMockChatReply, generateMockMoonBit } from "./mock-v3.mjs";
import { generateMoonBitProgram, generateTextReply } from "./openai-compatible-v2.mjs";
import { getTaskKernelProtocol } from "./task-kernel-protocol.mjs";
import { synthesisMetadataFor } from "./synthesis-metadata.mjs";
import {
  modeNeedsArtifact as policyModeNeedsArtifact,
  modeSystemPrompt as policyModeSystemPrompt,
  normalizeTaskMode,
  requestedAnalysisFor,
  wantsFileAnalysis as policyWantsFileAnalysis,
} from "./task-router-policy.mjs";

const NO_LLM_MARKER = "[No LLM connecting now!]";

function wantsFileAnalysis(prompt, fileInfo) {
  const normalized = prompt.toLowerCase();
  const keywords = [
    "fastq", ".fq", ".fastq", "analy", "count", "ratio", "quality", "csv", "json", "log", "stats", "inspect",
    "文件", "分析", "统计", "比例", "质量", "碱基",
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
    normalized.includes("碱基") ||
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
    policyModeSystemPrompt(mode),
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
  return mode === "moonbit-task" || mode === "game-agent" || containsArtifactIntent(normalized);
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

function attachSynthesisMetadata(artifact, mode, fileInfo, analysis) {
  if (!artifact) {
    return artifact;
  }

  const fallbackMetadata = synthesisMetadataFor(mode, fileInfo, analysis);
  const metadata = artifact.projectManifest
    ? {
        projectManifest: {
          ...fallbackMetadata.projectManifest,
          ...artifact.projectManifest,
          taskKernelProtocol:
            artifact.projectManifest.taskKernelProtocol ||
            artifact.taskKernelProtocol ||
            fallbackMetadata.projectManifest.taskKernelProtocol,
        },
        benchmarkProfile: artifact.benchmarkProfile || null,
      }
    : fallbackMetadata;

  return {
    ...artifact,
    projectManifest: metadata.projectManifest,
    skills: artifact.skills || metadata.projectManifest.skills,
    verificationGate: artifact.verificationGate || metadata.projectManifest.verificationGate,
    benchmarkProfile: artifact.benchmarkProfile || metadata.benchmarkProfile,
    taskKernelProtocol: artifact.taskKernelProtocol || metadata.projectManifest.taskKernelProtocol || null,
  };
}

function buildMissingFileReply(mode) {
  if (mode === "fastq-agent") {
    return "FastQ analyst mode is ready. Please attach a local `.fastq` or `.fq` file path first, then ask me for N-base ratio, read counts, quality statistics, or a MoonBit analysis program.";
  }
  return "Please attach a local file path first so MoonAP can inspect it and switch into the MoonBit -> Wasm workflow for this task.";
}

function withNoLlmMarker(text) {
  const content = String(text || "").trim();
  if (!content) return NO_LLM_MARKER;
  if (content.includes(NO_LLM_MARKER)) return content;
  return `${content}\n${NO_LLM_MARKER}`;
}

function withFallbackWarning(text, warning) {
  const content = String(text || "").trim();
  const detail = String(warning || "").trim();
  if (!detail) return content;
  return `${content}\n\nFallback detail: ${detail}`;
}

export async function generateMoonAPResponse({ prompt, history = [], filePath = "", llmConfig = {}, selectedMode = "chat" }) {
  const resolvedConfig = resolveModelConfig(llmConfig);
  const mode = normalizeTaskMode(selectedMode);
  const trimmedPath = String(filePath || "").trim();
  const fileInfo = trimmedPath ? await inspectLocalFile(trimmedPath) : null;
  const analysisMode = mode === "fastq-agent" ? Boolean(fileInfo) : policyWantsFileAnalysis(prompt, fileInfo);
  const artifactMode = analysisMode || policyModeNeedsArtifact(mode, prompt);
  let analysis = null;

  if (analysisMode && fileInfo) {
    analysis = await analyzeLocalFile({
      filePath: fileInfo.path,
      requestedAnalysis: requestedAnalysisFor(prompt, fileInfo, mode),
    });
  }

  if (mode === "fastq-agent" && !fileInfo) {
    return {
      mode: "chat",
      experienceMode: mode,
      assistant: { role: "assistant", content: withNoLlmMarker(buildMissingFileReply(mode)) },
      artifact: null,
      fileInfo,
      analysis: null,
    };
  }

  if (!artifactMode) {
    let reply;
    if (useRemoteModel(resolvedConfig)) {
      try {
        reply = await generateTextReply(buildContextPrompt(prompt, fileInfo, null, mode), history, resolvedConfig);
      } catch (error) {
        reply = withNoLlmMarker(
          withFallbackWarning(
            generateMockChatReply(prompt, { fileInfo, selectedMode: mode }),
            `Remote chat failed, so MoonAP switched to local fallback: ${error instanceof Error ? error.message : String(error)}`,
          ),
        );
      }
    } else {
      reply = withNoLlmMarker(generateMockChatReply(prompt, { fileInfo, selectedMode: mode }));
    }

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
      artifact = attachSynthesisMetadata({
        ...(await generateMoonBitProgram(
          buildContextPrompt(prompt, fileInfo, analysis, mode),
          history,
          resolvedConfig,
          getTaskKernelProtocol(mode),
        )),
        adapter: "openai-compatible",
      }, mode, fileInfo, analysis);
    } catch (error) {
      artifact = attachSynthesisMetadata({
        ...generateMockMoonBit(prompt, { fileInfo, analysis, selectedMode: mode }),
        adapter: "mock-fallback",
        warning: `Remote model request failed, so MoonAP fell back to the local generator: ${error.message}`,
      }, mode, fileInfo, analysis);
    }
  } else {
    artifact = attachSynthesisMetadata({
      ...generateMockMoonBit(prompt, { fileInfo, analysis, selectedMode: mode }),
      adapter: "mock",
    }, mode, fileInfo, analysis);
  }

  return {
    mode: "analysis",
    experienceMode: mode,
    assistant: {
      role: "assistant",
      content:
        artifact?.warning && artifact.adapter !== "openai-compatible"
          ? withNoLlmMarker(
              withFallbackWarning(
                generateMockChatReply(prompt, { fileInfo, analysis, selectedMode: mode, artifact }),
                artifact.warning,
              ),
            )
          : generateMockChatReply(prompt, { fileInfo, analysis, selectedMode: mode, artifact }),
    },
    artifact,
    fileInfo,
    analysis,
  };
}
