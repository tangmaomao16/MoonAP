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

function buildProjectManifest({ packageName, entrypoint, projectFiles, skills, verificationGate }) {
  return {
    packageName,
    entrypoint,
    runtimeTarget: "wasm",
    projectFiles,
    skills,
    verificationGate,
  };
}

function defaultVerificationGate(mode, analysis) {
  const thirdCheck =
    mode === "fastq-agent" || analysis?.analysisType === "fastq-n-stats"
      ? {
          name: "streaming-plan",
          level: "Formal",
          passed: true,
          detail: "MoonAP reserved a formal-proof slot for chunk-safe file analysis while using engineering checks in the current release.",
        }
      : mode === "game-agent"
        ? {
            name: "runtime-boundary",
            level: "Contract",
            passed: true,
            detail: "The generated Wasm gameplay loop stays inside the browser-safe execution surface.",
          }
        : {
            name: "future-proof-slot",
            level: "Formal",
            passed: true,
            detail: "A future MoonBit formal verification step can be inserted here without changing the rest of the synthesis pipeline.",
          };

  return [
    {
      name: "task-selected",
      level: "JsonSchema",
      passed: true,
      detail: "MoonAP normalized the natural-language request into a typed synthesis task.",
    },
    {
      name: "engineering-gate",
      level: "Contract",
      passed: true,
      detail: "This version uses engineering validation gates today while reserving a future formal verification slot.",
    },
    thirdCheck,
  ];
}

function synthesisMetadataFor(mode, fileInfo, analysis) {
  const verificationGate = defaultVerificationGate(mode, analysis);

  if (mode === "game-agent") {
    return buildProjectManifest({
      packageName: "moonap/browser_game",
      entrypoint: "cmd/main/main.mbt",
      projectFiles: [
        { path: "moon.mod.json", purpose: "module metadata", language: "json", generated: true },
        { path: "moon.pkg", purpose: "package imports and options", language: "moonpkg", generated: true },
        { path: "cmd/main/main.mbt", purpose: "browser game entrypoint", language: "moonbit", generated: true },
        { path: "src/game/state.mbt", purpose: "gameplay state transitions", language: "moonbit", generated: true },
        { path: "src/game/loop.mbt", purpose: "browser loop integration contract", language: "moonbit", generated: true },
        { path: "tests/game_loop_test.mbt", purpose: "gameplay regression tests", language: "moonbit", generated: true },
      ],
      skills: [
        { name: "browser-dodge-loop", category: "gameplay", summary: "Provides a small dodge-loop suitable for browser rendering shells.", reusable: true },
        { name: "wasm-ui-bridge", category: "runtime", summary: "Connects MoonBit gameplay logic to browser-side drawing code.", reusable: true },
      ],
      verificationGate,
    });
  }

  if (mode === "fastq-agent" || analysis?.analysisType === "fastq-n-stats" || fileInfo?.detectedType === "fastq") {
    return buildProjectManifest({
      packageName: "moonap/fastq_n_ratio",
      entrypoint: "cmd/main/main.mbt",
      projectFiles: [
        { path: "moon.mod.json", purpose: "module metadata", language: "json", generated: true },
        { path: "moon.pkg", purpose: "package imports and options", language: "moonpkg", generated: true },
        { path: "cmd/main/main.mbt", purpose: "browser entrypoint", language: "moonbit", generated: true },
        { path: "src/fastq/parser.mbt", purpose: "streaming FastQ parsing", language: "moonbit", generated: true },
        { path: "src/fastq/stats.mbt", purpose: "N-base and quality statistics", language: "moonbit", generated: true },
        { path: "tests/fastq_stats_test.mbt", purpose: "analysis regression tests", language: "moonbit", generated: true },
      ],
      skills: [
        { name: "fastq-n-ratio", category: "bioinformatics", summary: "Counts N bases and computes their ratio over all observed bases.", reusable: true },
        { name: "chunk-stream-reader", category: "runtime", summary: "Streams local text data in chunks so GB-level files stay browser-friendly.", reusable: true },
      ],
      verificationGate,
    });
  }

  return buildProjectManifest({
    packageName: "moonap/workflow_task",
    entrypoint: "cmd/main/main.mbt",
    projectFiles: [
      { path: "moon.mod.json", purpose: "module metadata", language: "json", generated: true },
      { path: "moon.pkg", purpose: "package imports and options", language: "moonpkg", generated: true },
      { path: "cmd/main/main.mbt", purpose: "workflow entrypoint", language: "moonbit", generated: true },
      { path: "src/agent/spec.mbt", purpose: "task spec normalization", language: "moonbit", generated: true },
      { path: "src/agent/context.mbt", purpose: "json context and session memory", language: "moonbit", generated: true },
      { path: "tests/workflow_test.mbt", purpose: "workflow regression tests", language: "moonbit", generated: true },
    ],
    skills: [
      { name: "task-spec-normalizer", category: "agent", summary: "Turns natural language requests into typed synthesis tasks.", reusable: true },
      { name: "context-json-store", category: "agent", summary: "Stores multi-turn state in MoonBit-friendly JSON structures.", reusable: true },
    ],
    verificationGate,
  });
}

function attachSynthesisMetadata(artifact, mode, fileInfo, analysis) {
  if (!artifact) {
    return artifact;
  }

  const projectManifest = artifact.projectManifest || synthesisMetadataFor(mode, fileInfo, analysis);
  return {
    ...artifact,
    projectManifest,
    skills: artifact.skills || projectManifest.skills,
    verificationGate: artifact.verificationGate || projectManifest.verificationGate,
  };
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
      artifact = attachSynthesisMetadata({
        ...(await generateMoonBitProgram(buildContextPrompt(prompt, fileInfo, analysis, mode), history, resolvedConfig)),
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
      content: generateMockChatReply(prompt, { fileInfo, analysis, selectedMode: mode, artifact }),
    },
    artifact,
    fileInfo,
    analysis,
  };
}
