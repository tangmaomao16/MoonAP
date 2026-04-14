const form = document.getElementById("chat-form");
const messages = document.getElementById("messages");
const promptInput = document.getElementById("prompt-input");
const sendButton = document.getElementById("send-button");
const analyzeBrowserFileButton = document.getElementById("analyze-browser-file-button");
const buildBrowserWasmButton = document.getElementById("build-browser-wasm-button");
const clearFileButton = document.getElementById("clear-file-button");
const saveSettingsButton = document.getElementById("save-llm-settings");
const runButton = document.getElementById("run-button");
const seedChatButton = document.getElementById("seed-chat");
const seedAnalysisButton = document.getElementById("seed-analysis");
const seedGameButton = document.getElementById("seed-game");
const browserFileInput = document.getElementById("browser-file-input");
const browserFileSummary = document.getElementById("browser-file-summary");
const analysisOutput = document.getElementById("analysis-output");
const codeOutput = document.getElementById("code-output");
const sourceFilesOutput = document.getElementById("source-files-output");
const programOutput = document.getElementById("program-output");
const buildLog = document.getElementById("build-log");
const artifactTitle = document.getElementById("artifact-title");
const artifactSummary = document.getElementById("artifact-summary");
const artifactWarning = document.getElementById("artifact-warning");
const verificationOutput = document.getElementById("verification-output");
const manifestOutput = document.getElementById("manifest-output");
const kernelProtocolOutput = document.getElementById("kernel-protocol-output");
const benchmarkOutput = document.getElementById("benchmark-output");
const benchmarkReportOutput = document.getElementById("benchmark-report-output");
const skillOutput = document.getElementById("skill-output");
const modeBadge = document.getElementById("mode-badge");
const adapterBadge = document.getElementById("adapter-badge");
const runBadge = document.getElementById("run-badge");
const experienceBadge = document.getElementById("experience-badge");
const llmBaseUrl = document.getElementById("llm-base-url");
const llmApiKey = document.getElementById("llm-api-key");
const llmModel = document.getElementById("llm-model");
const llmStatus = document.getElementById("llm-status");
const moonVersion = document.getElementById("moon-version");
const presetButtons = Array.from(document.querySelectorAll(".preset-button"));
const modePicker = document.getElementById("mode-picker");
const modeCards = Array.from(document.querySelectorAll(".mode-card"));
const emptyState = document.getElementById("empty-state");
const promptCards = Array.from(document.querySelectorAll(".prompt-card"));
const workspaceTitle = document.getElementById("workspace-title");
const workspaceSubtitle = document.getElementById("workspace-subtitle");
const composerModeLabel = document.getElementById("composer-mode-label");
const pipelineChat = document.getElementById("pipeline-chat");
const pipelineMoonbit = document.getElementById("pipeline-moonbit");
const pipelineBuild = document.getElementById("pipeline-build");
const pipelineRun = document.getElementById("pipeline-run");

const MODE_DETAILS = {
  chat: {
    title: "Chat with MoonAP",
    subtitle: "Use MoonAP like a conversational coding agent, then switch into executable MoonBit workflows.",
    composer: "Chat mode",
  },
  "moonbit-task": {
    title: "Build a MoonBit workflow",
    subtitle: "Generate MoonBit code for practical tasks, then compile to WebAssembly when it makes sense.",
    composer: "MoonBit Builder mode",
  },
  "fastq-agent": {
    title: "Analyze a FastQ file",
    subtitle: "Inspect local sequencing data, summarize analysis, and generate MoonBit-assisted execution artifacts.",
    composer: "FastQ Analyst mode",
  },
  "game-agent": {
    title: "Prototype a browser mini-game",
    subtitle: "Describe gameplay in natural language and let MoonAP prepare MoonBit + Wasm-friendly logic.",
    composer: "Game Studio mode",
  },
};

const LLM_PRESETS = {
  glm51: {
    baseUrl: "https://api.z.ai/api/paas/v4/",
    model: "glm-5.1",
    label: "GLM 5.1 preset loaded. Paste your Z.AI API key and save settings.",
  },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    model: "openrouter/free",
    label: "OpenRouter preset loaded. Paste your OpenRouter API key and save settings.",
  },
};

let history = [];
let latestWasmBase64 = "";
let currentFileInfo = null;
let currentBrowserFile = null;
let latestBrowserAnalysis = null;
let selectedMode = localStorage.getItem("moonap.selectedMode") || "chat";

function addMessage(role, content) {
  const wrapper = document.createElement("article");
  wrapper.className = `message ${role}`;
  wrapper.textContent = content;
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
  syncEmptyState();
}

function syncEmptyState() {
  emptyState.classList.toggle("hidden", messages.children.length > 0);
}

function getLlmConfig() {
  return {
    baseUrl: llmBaseUrl.value.trim(),
    apiKey: llmApiKey.value.trim(),
    model: llmModel.value.trim(),
  };
}

function updateLlmStatus() {
  const config = getLlmConfig();
  llmStatus.textContent = config.baseUrl && config.apiKey && config.model
    ? "Your custom LLM endpoint is configured for this browser."
    : "Fill these values to use your own LLM endpoint. If left empty, MoonAP uses the local fallback logic.";
}

function saveLlmConfig() {
  localStorage.setItem("moonap.llm.baseUrl", llmBaseUrl.value);
  localStorage.setItem("moonap.llm.apiKey", llmApiKey.value);
  localStorage.setItem("moonap.llm.model", llmModel.value);
  updateLlmStatus();
}

function loadLlmConfig() {
  llmBaseUrl.value = localStorage.getItem("moonap.llm.baseUrl") || "";
  llmApiKey.value = localStorage.getItem("moonap.llm.apiKey") || "";
  llmModel.value = localStorage.getItem("moonap.llm.model") || "";
  updateLlmStatus();
}

function setMode(mode) {
  selectedMode = MODE_DETAILS[mode] ? mode : "chat";
  localStorage.setItem("moonap.selectedMode", selectedMode);
  modeCards.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === selectedMode);
  });
  const details = MODE_DETAILS[selectedMode];
  workspaceTitle.textContent = details.title;
  workspaceSubtitle.textContent = details.subtitle;
  composerModeLabel.textContent = details.composer;
  experienceBadge.textContent = `workflow: ${selectedMode}`;
}

function renderBrowserFileInfo(file) {
  if (!file) {
    browserFileSummary.textContent = "No browser-local file selected.";
    return;
  }

  browserFileSummary.innerHTML = [
    `<p><strong>Name:</strong> ${file.name}</p>`,
    `<p><strong>Type:</strong> ${file.type || "unknown"}</p>`,
    `<p><strong>Size:</strong> ${file.size} bytes</p>`,
    `<p><strong>Last Modified:</strong> ${new Date(file.lastModified).toLocaleString()}</p>`,
  ].join("");
}

function renderVerificationGate(checks = []) {
  if (!checks.length) {
    verificationOutput.textContent = "No verification gate yet.";
    return;
  }

  verificationOutput.textContent = checks
    .map((check) => {
      const status = check.passed ? "PASS" : "FAIL";
      return `[${status}] ${check.name} (${check.level})\n${check.detail}`;
    })
    .join("\n\n");
}

function renderProjectManifest(manifest) {
  if (!manifest) {
    manifestOutput.textContent = "No project manifest yet.";
    return;
  }

  const header = [
    `package = ${manifest.packageName}`,
    `entrypoint = ${manifest.entrypoint}`,
    `runtime = ${manifest.runtimeTarget}`,
    "",
    "files:",
  ];
  const files = (manifest.projectFiles || []).map((file) =>
    `- ${file.path} | ${file.language} | ${file.purpose}`
  );
  manifestOutput.textContent = [...header, ...files].join("\n");
}

function renderTaskKernelProtocol(protocol = null) {
  if (!protocol) {
    kernelProtocolOutput.textContent = "No task kernel protocol yet.";
    return;
  }

  kernelProtocolOutput.textContent = [
    `protocol = ${protocol.protocolName}`,
    `input mode = ${protocol.inputMode}`,
    `state type = ${protocol.stateType}`,
    `init = ${protocol.initFn}`,
    `ingest = ${protocol.ingestFn}`,
    `finalize = ${protocol.finalizeFn}`,
    "",
    "host responsibilities:",
    ...(protocol.hostResponsibilities || []).map((item) => `- ${item}`),
    "",
    "kernel responsibilities:",
    ...(protocol.kernelResponsibilities || []).map((item) => `- ${item}`),
  ].join("\n");
}

function renderSourceFiles(sourceFiles = []) {
  if (!sourceFiles.length) {
    sourceFilesOutput.textContent = "No generated source files yet.";
    return;
  }

  sourceFilesOutput.textContent = sourceFiles
    .map((file) => `// ${file.path}\n${file.content}`)
    .join("\n\n");
}

function renderSkills(skills = []) {
  if (!skills.length) {
    skillOutput.textContent = "No reusable skills yet.";
    return;
  }

  skillOutput.textContent = skills
    .map((skill) => `- ${skill.name} [${skill.category}]\n  ${skill.summary}`)
    .join("\n\n");
}

function renderBenchmarkProfile(profile = null) {
  if (!profile) {
    benchmarkOutput.textContent = "No benchmark profile yet.";
    return;
  }

  const lines = [
    `primary scenario = ${profile.scenario}`,
    `current input = ${profile.currentInput}`,
    `benchmark tiers = ${(profile.benchmarkTiers || []).join(" / ")}`,
    `recommended chunk sizes = ${(profile.recommendedChunkSizes || []).join(" / ")}`,
    `evaluation focus = ${(profile.evaluationFocus || []).join(", ")}`,
    `generated source files = ${profile.generatedFileCount}`,
  ];

  if (profile.estimatedChunksAtCurrentSize) {
    lines.push(`estimated chunks at current size = ${profile.estimatedChunksAtCurrentSize}`);
  }

  if (profile.metricsSnapshot) {
    lines.push(`reads = ${profile.metricsSnapshot.readCount}`);
    lines.push(`total bases = ${profile.metricsSnapshot.totalBases}`);
    lines.push(`average read length = ${Number(profile.metricsSnapshot.averageReadLength || 0).toFixed(2)}`);
    lines.push(`N ratio = ${(Number(profile.metricsSnapshot.nRatio || 0) * 100).toFixed(4)}%`);
    lines.push(`GC ratio = ${(Number(profile.metricsSnapshot.gcRatio || 0) * 100).toFixed(4)}%`);
  }

  benchmarkOutput.textContent = lines.join("\n");
}

function renderBenchmarkReport(report = "") {
  benchmarkReportOutput.textContent = report || "No benchmark report yet.";
}

function chooseBrowserChunkSizes(sizeBytes) {
  if (sizeBytes >= 5 * 1024 * 1024 * 1024) {
    return ["16 MB", "8 MB", "4 MB"];
  }
  if (sizeBytes >= 1024 * 1024 * 1024) {
    return ["8 MB", "16 MB", "4 MB"];
  }
  return ["4 MB", "8 MB", "16 MB"];
}

function chunkLabelToBytes(label) {
  return Number.parseInt(label, 10) * 1024 * 1024;
}

function formatPercent(value) {
  return `${(Number(value || 0) * 100).toFixed(4)}%`;
}

function buildBrowserBenchmarkReport(file, metrics, chunkSizes, durationMs) {
  const primaryChunkLabel = chunkSizes[0];
  const estimatedChunks = Math.ceil(file.size / chunkLabelToBytes(primaryChunkLabel));
  const throughputMiBPerSecond = durationMs > 0 ? (file.size / (1024 * 1024)) / (durationMs / 1000) : 0;

  return [
    "MoonAP Browser FastQ Benchmark Report",
    "====================================",
    `file = ${file.name}`,
    `size = ${file.size} bytes`,
    "",
    "browser-local metrics",
    `- reads processed: ${metrics.readCount}`,
    `- total bases: ${metrics.totalBases}`,
    `- N ratio: ${formatPercent(metrics.nRatio)}`,
    `- GC ratio: ${formatPercent(metrics.gcRatio)}`,
    `- average read length: ${metrics.averageReadLength.toFixed(2)}`,
    `- longest read: ${metrics.longestRead}`,
    `- shortest read: ${metrics.shortestRead}`,
    "",
    "chunk execution plan",
    `- primary chunk size: ${primaryChunkLabel}`,
    `- chunk sweep: ${chunkSizes.join(" / ")}`,
    `- estimated chunks: ${estimatedChunks}`,
    `- duration: ${durationMs.toFixed(2)} ms`,
    `- throughput: ${throughputMiBPerSecond.toFixed(2)} MiB/s`,
    "",
    "competition talking points",
    "- file stays in the browser instead of being uploaded to the server",
    "- chunk-based reading keeps the workflow ready for much larger FastQ inputs",
    "- the benchmark report can be compared against MoonBit-generated Wasm analyzers",
  ].join("\n");
}

function updatePipeline(step) {
  [pipelineChat, pipelineMoonbit, pipelineBuild, pipelineRun].forEach((node) => {
    node.classList.remove("active", "complete");
  });

  pipelineChat.classList.add("complete");

  if (step === "chat") {
    pipelineChat.classList.add("active");
    return;
  }

  pipelineMoonbit.classList.add("complete");
  if (step === "artifact") {
    pipelineMoonbit.classList.add("active");
    return;
  }

  pipelineBuild.classList.add("complete");
  if (step === "build") {
    pipelineBuild.classList.add("active");
    return;
  }

  pipelineRun.classList.add("active");
  if (step === "run-complete") {
    pipelineRun.classList.add("complete");
  }
}

function createFastqAnalysisFromWasm(file, wasmResult) {
  const chunkSizes = chooseBrowserChunkSizes(file.size);
  const primaryChunkSize = chunkLabelToBytes(chunkSizes[0]);
  const metrics = wasmResult.metrics;

  return {
    analysisType: "fastq-n-stats",
    summary: [
      "MoonBit Wasm FastQ analysis completed.",
      `Reads processed: ${metrics.readCount}`,
      `Total bases: ${metrics.totalBases}`,
      `N ratio: ${formatPercent(metrics.nRatio)}`,
      `GC ratio: ${formatPercent(metrics.gcRatio)}`,
      `Average read length: ${metrics.averageReadLength.toFixed(2)}`,
      `Recommended chunk sizes: ${chunkSizes.join(" / ")}`,
      `Wasm duration: ${wasmResult.durationMs.toFixed(2)} ms`,
    ].join("\n"),
    benchmarkProfile: {
      scenario: "browser-local-fastq-analysis",
      currentInput: `${file.name} (${file.size} bytes)`,
      benchmarkTiers: ["0.1 GB", "1 GB", "5 GB"],
      recommendedChunkSizes: chunkSizes,
      evaluationFocus: ["memory peak", "chunk throughput", "total runtime", "output correctness"],
      generatedFileCount: 0,
      estimatedChunksAtCurrentSize: Math.ceil(file.size / primaryChunkSize),
      metricsSnapshot: {
        readCount: metrics.readCount,
        totalBases: metrics.totalBases,
        averageReadLength: metrics.averageReadLength,
        nRatio: metrics.nRatio,
        gcRatio: metrics.gcRatio,
      },
    },
    benchmarkReport: buildBrowserBenchmarkReport(file, metrics, chunkSizes, wasmResult.durationMs),
    metrics,
    benchmarkPlan: {
      benchmarkTiers: ["0.1 GB", "1 GB", "5 GB"],
      recommendedChunkSizes: chunkSizes,
      evaluationFocus: ["memory peak", "chunk throughput", "total runtime", "output correctness"],
      estimatedChunksAtCurrentSize: Math.ceil(file.size / primaryChunkSize),
    },
  };
}

async function requestBrowserFastqArtifact(prompt, analysis = null) {
  if (!currentBrowserFile) {
    throw new Error("Choose a browser-local FastQ file first.");
  }

  const response = await fetch("/api/browser-analysis/artifact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      browserFile: {
        name: currentBrowserFile.name,
        size: currentBrowserFile.size,
        lastModified: currentBrowserFile.lastModified,
      },
      analysis,
    }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Unable to build a browser-local FastQ artifact.");
  }
  payload.mode = payload.mode || "analysis";
  payload.experienceMode = payload.experienceMode || "browser-local-fastq";
  if (payload.artifact) {
    payload.artifact.adapter = payload.artifact.adapter || "browser-analysis";
  }
  return payload;
}

async function buildWasmFromBrowserAnalysis() {
  if (!currentBrowserFile || !latestBrowserAnalysis) {
    throw new Error("Run browser-local FastQ analysis first.");
  }

  const payload = await requestBrowserFastqArtifact(
    `Generate a MoonBit FastQ report program for browser-local file ${currentBrowserFile.name}.`,
    latestBrowserAnalysis,
  );

  addMessage("assistant", payload.assistant.content);
  artifactTitle.textContent = payload.artifact.title;
  artifactSummary.textContent = payload.artifact.summary;
  artifactWarning.textContent = payload.artifact.warning || "";
  codeOutput.textContent = payload.artifact.moonbitCode;
  renderSourceFiles(payload.artifact.sourceFiles || []);
  renderVerificationGate(payload.artifact.verificationGate || []);
  renderProjectManifest(payload.artifact.projectManifest || null);
  renderTaskKernelProtocol(payload.artifact.taskKernelProtocol || null);
  renderBenchmarkProfile(payload.artifact.benchmarkProfile || null);
  renderBenchmarkReport(payload.analysis?.benchmarkReport || latestBrowserAnalysis.benchmarkReport || "");
  renderSkills(payload.artifact.skills || []);
  buildLog.textContent = payload.artifact.buildLog || "moon build finished without extra logs.";
  latestWasmBase64 = payload.artifact.wasmBase64 || "";
  runButton.disabled = !latestWasmBase64;
  runBadge.textContent = latestWasmBase64 ? "wasm: ready" : "wasm: idle";
  modeBadge.textContent = "mode: browser-analysis-wasm";
  experienceBadge.textContent = "workflow: browser-local-fastq -> moonbit-wasm";
  updatePipeline(latestWasmBase64 ? "build" : "artifact");
}

async function synthesizeFromBrowserAnalysis(prompt) {
  if (selectedMode === "fastq-agent") {
    if (!latestBrowserAnalysis) {
      throw new Error("Run Analyze In Browser before sending a FastQ request.");
    }
    return requestBrowserFastqArtifact(prompt, latestBrowserAnalysis);
  }

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: prompt,
      history,
      filePath: "",
      selectedMode,
      llmConfig: getLlmConfig(),
    }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error(payload.error || "Unknown server error");
  return payload;
}

async function runWasm(wasmBase64) {
  const wasmBytes = Uint8Array.from(atob(wasmBase64), (char) => char.charCodeAt(0));
  const collected = [];
  const module = await WebAssembly.instantiate(wasmBytes, {
    spectest: {
      print_char(value) {
        collected.push(String.fromCharCode(Number(value)));
      },
    },
  });
  if (typeof module.instance.exports._start !== "function") {
    throw new Error("The generated wasm file does not export _start.");
  }
  module.instance.exports._start();
  return collected.join("");
}

async function instantiateWasmModule(wasmBase64) {
  const wasmBytes = Uint8Array.from(atob(wasmBase64), (char) => char.charCodeAt(0));
  return WebAssembly.instantiate(wasmBytes, {
    spectest: {
      print_char() {},
    },
  });
}

async function analyzeBrowserFastqFileWithWasm(file, wasmBase64) {
  const module = await instantiateWasmModule(wasmBase64);
  const exports = module.instance.exports;

  if (typeof exports.is_n_base !== "function" || typeof exports.is_gc_base !== "function" || typeof exports.is_sequence_line !== "function") {
    throw new Error("The generated Wasm artifact does not expose FastQ analysis functions.");
  }
  if (
    typeof exports.is_sequence_state !== "function" ||
    typeof exports.next_fastq_state !== "function" ||
    typeof exports.accumulate_read_count !== "function" ||
    typeof exports.accumulate_total_bases !== "function" ||
    typeof exports.accumulate_n_bases !== "function" ||
    typeof exports.accumulate_gc_bases !== "function" ||
    typeof exports.update_longest_read !== "function" ||
    typeof exports.update_shortest_read !== "function"
  ) {
    throw new Error("The generated Wasm artifact does not expose FastQ accumulation helpers.");
  }

  const chunkSizes = chooseBrowserChunkSizes(file.size);
  const primaryChunkSize = chunkLabelToBytes(chunkSizes[0]);
  const decoder = new TextDecoder();
  let offset = 0;
  let carry = "";
  let fastqState = 0;
  let readCount = 0;
  let totalBases = 0;
  let nBases = 0;
  let gcBases = 0;
  let longestRead = 0;
  let shortestRead = Number.MAX_SAFE_INTEGER;
  const startedAt = performance.now();

  while (offset < file.size) {
    const nextOffset = Math.min(offset + primaryChunkSize, file.size);
    const chunk = await file.slice(offset, nextOffset).arrayBuffer();
    const text = carry + decoder.decode(chunk, { stream: nextOffset < file.size });
    const lines = text.split(/\r?\n/);
    carry = lines.pop() || "";

    for (const line of lines) {
      if (Number(exports.is_sequence_state(fastqState)) === 1) {
        const readLength = line.length;
        readCount = Number(exports.accumulate_read_count(readCount, fastqState));
        longestRead = Number(exports.update_longest_read(longestRead, readLength));
        shortestRead = Number(exports.update_shortest_read(shortestRead, readLength));
        for (const char of line) {
          const code = char.charCodeAt(0);
          totalBases = Number(exports.accumulate_total_bases(totalBases, code));
          nBases = Number(exports.accumulate_n_bases(nBases, code));
          gcBases = Number(exports.accumulate_gc_bases(gcBases, code));
        }
      }
      fastqState = Number(exports.next_fastq_state(fastqState));
    }

    offset = nextOffset;
  }

  if (carry.length > 0 && Number(exports.is_sequence_state(fastqState)) === 1) {
    const readLength = carry.length;
    readCount = Number(exports.accumulate_read_count(readCount, fastqState));
    longestRead = Number(exports.update_longest_read(longestRead, readLength));
    shortestRead = Number(exports.update_shortest_read(shortestRead, readLength));
    for (const char of carry) {
      const code = char.charCodeAt(0);
      totalBases = Number(exports.accumulate_total_bases(totalBases, code));
      nBases = Number(exports.accumulate_n_bases(nBases, code));
      gcBases = Number(exports.accumulate_gc_bases(gcBases, code));
    }
  }

  return {
    metrics: {
      readCount,
      totalBases,
      nBases,
      gcBases,
      nRatio: totalBases ? nBases / totalBases : 0,
      gcRatio: totalBases ? gcBases / totalBases : 0,
      averageReadLength: readCount ? totalBases / readCount : 0,
      longestRead,
      shortestRead: Number.isFinite(shortestRead) ? shortestRead : 0,
    },
    durationMs: performance.now() - startedAt,
  };
}

function resetArtifactPanelForChat() {
  analysisOutput.textContent = "No local analysis was run for this message.";
  artifactTitle.textContent = "No artifact generated";
  artifactSummary.textContent = "Chat mode stays conversational. Switch to MoonBit Builder, FastQ Analyst, or Game Studio to produce executable artifacts.";
  artifactWarning.textContent = "";
  codeOutput.textContent = "// artifact generation is idle in chat mode";
  renderSourceFiles([]);
  renderVerificationGate([]);
  renderProjectManifest(null);
  renderTaskKernelProtocol(null);
  renderBenchmarkProfile(null);
  renderBenchmarkReport("");
  renderSkills([]);
  buildLog.textContent = "No MoonBit build was run for this message.";
  programOutput.textContent = "waiting for wasm...";
  runButton.disabled = true;
  latestWasmBase64 = "";
  runBadge.textContent = "wasm: idle";
  updatePipeline("chat");
}

async function sendPrompt(prompt) {
  const payload = await synthesizeFromBrowserAnalysis(prompt);

  addMessage("assistant", payload.assistant.content);
  history.push({ role: "user", content: prompt });
  history.push({ role: "assistant", content: payload.assistant.content });
  currentFileInfo = payload.fileInfo || currentFileInfo;
  modeBadge.textContent = `mode: ${payload.mode || "chat"}`;
  experienceBadge.textContent = `workflow: ${payload.experienceMode || selectedMode}`;

  if (!payload.artifact) {
    adapterBadge.textContent = getLlmConfig().baseUrl ? "adapter: remote-chat" : "adapter: local-chat";
    resetArtifactPanelForChat();
    return;
  }

  adapterBadge.textContent = `adapter: ${payload.artifact.adapter || "local-artifact"}`;
  analysisOutput.textContent = payload.analysis?.summary || "No local analysis summary.";
  artifactTitle.textContent = payload.artifact.title;
  artifactSummary.textContent = payload.artifact.summary;
  artifactWarning.textContent = payload.artifact.warning || "";
  codeOutput.textContent = payload.artifact.moonbitCode;
  renderSourceFiles(payload.artifact.sourceFiles || []);
  renderVerificationGate(payload.artifact.verificationGate || []);
  renderProjectManifest(payload.artifact.projectManifest || null);
  renderTaskKernelProtocol(payload.artifact.taskKernelProtocol || null);
  renderBenchmarkProfile(payload.artifact.benchmarkProfile || null);
  renderBenchmarkReport(payload.analysis?.benchmarkReport || "");
  renderSkills(payload.artifact.skills || []);
  buildLog.textContent = payload.artifact.buildLog || "moon build finished without extra logs.";
  latestWasmBase64 = payload.artifact.wasmBase64 || "";
  runButton.disabled = !latestWasmBase64;
  runBadge.textContent = latestWasmBase64 ? "wasm: ready" : "wasm: idle";
  updatePipeline(latestWasmBase64 ? "build" : "artifact");
}

async function refreshHealth() {
  try {
    const response = await fetch("/api/health");
    const payload = await response.json();
    moonVersion.textContent = payload.moonVersion ? `MoonBit: ${payload.moonVersion}` : "MoonBit: unavailable";
  } catch {
    moonVersion.textContent = "MoonBit: unavailable";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const prompt = promptInput.value.trim();
  if (!prompt) return;
  addMessage("user", prompt);
  promptInput.value = "";
  sendButton.disabled = true;
  modeBadge.textContent = "mode: sending";
  try {
    await sendPrompt(prompt);
  } catch (error) {
    addMessage("assistant", `Request failed: ${error.message}`);
    modeBadge.textContent = "mode: error";
    adapterBadge.textContent = "adapter: error";
    runBadge.textContent = "wasm: failed";
  } finally {
    sendButton.disabled = false;
  }
});

browserFileInput.addEventListener("change", () => {
  currentBrowserFile = browserFileInput.files?.[0] || null;
  latestBrowserAnalysis = null;
  latestWasmBase64 = "";
  renderBrowserFileInfo(currentBrowserFile);
  analysisOutput.textContent = currentBrowserFile
    ? "Browser-local file selected. Click Analyze In Browser to start MoonBit Wasm analysis."
    : "No local analysis yet.";
});

analyzeBrowserFileButton.addEventListener("click", async () => {
  if (!currentBrowserFile) {
    addMessage("assistant", "Please choose a browser-local FastQ file first.");
    return;
  }

  analyzeBrowserFileButton.disabled = true;
  modeBadge.textContent = "mode: browser-analyzing";
  try {
    analysisOutput.textContent = "MoonAP is compiling a MoonBit Wasm FastQ kernel for browser analysis...";
    const artifactPayload = await requestBrowserFastqArtifact(
      `Generate a MoonBit FastQ streaming kernel for browser-local file ${currentBrowserFile.name}.`,
      null,
    );
    artifactTitle.textContent = artifactPayload.artifact.title;
    artifactSummary.textContent = artifactPayload.artifact.summary;
    artifactWarning.textContent = artifactPayload.artifact.warning || "";
    codeOutput.textContent = artifactPayload.artifact.moonbitCode;
    renderSourceFiles(artifactPayload.artifact.sourceFiles || []);
    renderVerificationGate(artifactPayload.artifact.verificationGate || []);
    renderProjectManifest(artifactPayload.artifact.projectManifest || null);
    renderTaskKernelProtocol(artifactPayload.artifact.taskKernelProtocol || null);
    renderSkills(artifactPayload.artifact.skills || []);
    buildLog.textContent = artifactPayload.artifact.buildLog || "moon build finished without extra logs.";
    latestWasmBase64 = artifactPayload.artifact.wasmBase64 || "";
    runButton.disabled = !latestWasmBase64;
    runBadge.textContent = latestWasmBase64 ? "wasm: ready" : "wasm: idle";

    if (!latestWasmBase64) {
      throw new Error("MoonAP did not receive a Wasm module for FastQ analysis.");
    }

    analysisOutput.textContent = "MoonBit Wasm kernel ready. Running browser-local FastQ analysis...";
    const wasmResult = await analyzeBrowserFastqFileWithWasm(currentBrowserFile, latestWasmBase64);
    const result = createFastqAnalysisFromWasm(currentBrowserFile, wasmResult);
    latestBrowserAnalysis = result;
    analysisOutput.textContent = result.summary;
    renderBenchmarkProfile(result.benchmarkProfile);
    renderBenchmarkReport(result.benchmarkReport);
    addMessage("assistant", `MoonBit Wasm analyzed ${currentBrowserFile.name} in the browser.\n\n${result.summary}`);
    modeBadge.textContent = "mode: browser-analysis";
    experienceBadge.textContent = "workflow: browser-local-fastq";
    updatePipeline("build");
  } catch (error) {
    addMessage("assistant", `Browser-local analysis failed: ${error.message}`);
    modeBadge.textContent = "mode: error";
  } finally {
    analyzeBrowserFileButton.disabled = false;
  }
});

buildBrowserWasmButton.addEventListener("click", async () => {
  buildBrowserWasmButton.disabled = true;
  try {
    await buildWasmFromBrowserAnalysis();
    if (latestWasmBase64 && currentBrowserFile && latestBrowserAnalysis) {
      const wasmResult = await analyzeBrowserFastqFileWithWasm(currentBrowserFile, latestWasmBase64);
      analysisOutput.textContent = [
        latestBrowserAnalysis.summary,
        "",
        "MoonBit Wasm report refresh",
        `- reads = ${wasmResult.metrics.readCount}`,
        `- total bases = ${wasmResult.metrics.totalBases}`,
        `- N ratio = ${formatPercent(wasmResult.metrics.nRatio)}`,
        `- GC ratio = ${formatPercent(wasmResult.metrics.gcRatio)}`,
        `- average read length = ${wasmResult.metrics.averageReadLength.toFixed(2)}`,
        `- Wasm duration = ${wasmResult.durationMs.toFixed(2)} ms`,
        "",
        "consistency",
        `- current analysis N ratio = ${formatPercent(latestBrowserAnalysis.metrics.nRatio)}`,
        `- refreshed Wasm N ratio = ${formatPercent(wasmResult.metrics.nRatio)}`,
        `- current analysis GC ratio = ${formatPercent(latestBrowserAnalysis.metrics.gcRatio)}`,
        `- refreshed Wasm GC ratio = ${formatPercent(wasmResult.metrics.gcRatio)}`,
        "- MoonBit Wasm remains the active FastQ analysis kernel in this workflow",
      ].join("\n");
    }
  } catch (error) {
    addMessage("assistant", `Browser-analysis Wasm build failed: ${error.message}`);
    modeBadge.textContent = "mode: error";
  } finally {
    buildBrowserWasmButton.disabled = false;
  }
});

clearFileButton.addEventListener("click", () => {
  browserFileInput.value = "";
  currentFileInfo = null;
  currentBrowserFile = null;
  latestBrowserAnalysis = null;
  renderBrowserFileInfo(null);
  analysisOutput.textContent = "No local analysis yet.";
  renderTaskKernelProtocol(null);
  renderBenchmarkProfile(null);
  renderBenchmarkReport("");
  addMessage("assistant", "Cleared the current local file context.");
});

saveSettingsButton.addEventListener("click", () => {
  saveLlmConfig();
  addMessage("assistant", "Saved the current LLM API settings for this browser.");
});

runButton.addEventListener("click", async () => {
  if (!latestWasmBase64) return;
  runButton.disabled = true;
  runBadge.textContent = "wasm: running";
  updatePipeline("run");
  try {
    const output = await runWasm(latestWasmBase64);
    programOutput.textContent = output || "(program completed with empty stdout)";
    runBadge.textContent = "wasm: completed";
    updatePipeline("run-complete");
  } catch (error) {
    programOutput.textContent = `runtime error: ${error.message}`;
    runBadge.textContent = "wasm: error";
    updatePipeline("build");
  } finally {
    runButton.disabled = false;
  }
});

seedChatButton.addEventListener("click", () => {
  setMode("chat");
  promptInput.value = "Help me design a practical MoonBit-first product workflow for local FastQ analysis and browser execution.";
  promptInput.focus();
});

seedAnalysisButton.addEventListener("click", () => {
  setMode("fastq-agent");
  promptInput.value = "Please analyze this FastQ file, count N bases, compute the ratio, and generate a MoonBit demo program.";
  promptInput.focus();
});

seedGameButton.addEventListener("click", () => {
  setMode("game-agent");
  promptInput.value = "Generate a browser mini-game in MoonBit with a simple dodge gameplay loop and WebAssembly-friendly logic.";
  promptInput.focus();
});

modePicker.addEventListener("click", (event) => {
  const button = event.target.closest(".mode-card");
  if (!button) return;
  setMode(button.dataset.mode);
});

promptCards.forEach((button) => {
  button.addEventListener("click", () => {
    setMode(button.dataset.mode || "chat");
    promptInput.value = button.dataset.prompt || "";
    promptInput.focus();
  });
});

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const preset = LLM_PRESETS[button.dataset.preset];
    if (!preset) return;
    llmBaseUrl.value = preset.baseUrl;
    llmModel.value = preset.model;
    updateLlmStatus();
    addMessage("assistant", preset.label);
  });
});

loadLlmConfig();
setMode(selectedMode);
renderBrowserFileInfo(null);
resetArtifactPanelForChat();
syncEmptyState();
refreshHealth();
addMessage("assistant", "MoonAP is ready. Talk to it like a ChatGPT-style coding agent, or switch modes to generate MoonBit code, compile WebAssembly, and run results in the browser.");
