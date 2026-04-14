const form = document.getElementById("chat-form");
const messages = document.getElementById("messages");
const promptInput = document.getElementById("prompt-input");
const sendButton = document.getElementById("send-button");
const inspectFileButton = document.getElementById("inspect-file-button");
const clearFileButton = document.getElementById("clear-file-button");
const saveSettingsButton = document.getElementById("save-llm-settings");
const runButton = document.getElementById("run-button");
const seedChatButton = document.getElementById("seed-chat");
const seedAnalysisButton = document.getElementById("seed-analysis");
const seedGameButton = document.getElementById("seed-game");
const filePathInput = document.getElementById("file-path-input");
const fileSummary = document.getElementById("file-summary");
const analysisOutput = document.getElementById("analysis-output");
const codeOutput = document.getElementById("code-output");
const programOutput = document.getElementById("program-output");
const buildLog = document.getElementById("build-log");
const artifactTitle = document.getElementById("artifact-title");
const artifactSummary = document.getElementById("artifact-summary");
const artifactWarning = document.getElementById("artifact-warning");
const verificationOutput = document.getElementById("verification-output");
const manifestOutput = document.getElementById("manifest-output");
const benchmarkOutput = document.getElementById("benchmark-output");
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

function renderFileInfo(fileInfo) {
  if (!fileInfo) {
    fileSummary.textContent = "No local file attached.";
    return;
  }

  fileSummary.innerHTML = [
    `<p><strong>Path:</strong> ${fileInfo.path}</p>`,
    `<p><strong>Type:</strong> ${fileInfo.detectedType}</p>`,
    `<p><strong>Size:</strong> ${fileInfo.sizeBytes} bytes</p>`,
    `<p><strong>Preview:</strong></p>`,
    `<pre>${fileInfo.previewLines.join("\n") || "(empty preview)"}</pre>`,
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

function renderSkills(skills = []) {
  if (!skills.length) {
    skillOutput.textContent = "No reusable skills yet.";
    return;
  }

  skillOutput.textContent = skills
    .map((skill) => `- ${skill.name} [${skill.category}]\n  ${skill.summary}`)
    .join("\n\n");
}

function renderBenchmarkProfile({ mode = "chat", fileInfo = null, analysis = null, manifest = null }) {
  if (!manifest) {
    benchmarkOutput.textContent = "No benchmark profile yet.";
    return;
  }

  if (mode === "fastq-agent" || analysis?.analysisType === "fastq-n-stats" || fileInfo?.detectedType === "fastq") {
    const fileSize = fileInfo ? `${fileInfo.sizeBytes} bytes` : "attach a FASTQ file";
    benchmarkOutput.textContent = [
      "primary scenario = FastQ local analysis",
      `current file size = ${fileSize}`,
      "benchmark tiers = 0.1 GB / 1 GB / 5 GB",
      "recommended chunk sizes = 4 MB / 8 MB / 16 MB",
      "evaluation focus = memory peak, chunk throughput, total runtime, output correctness",
      `generated project files = ${(manifest.projectFiles || []).length}`,
    ].join("\n");
    return;
  }

  if (mode === "game-agent") {
    benchmarkOutput.textContent = [
      "primary scenario = browser mini-game synthesis",
      "evaluation focus = gameplay loop stability, wasm startup time, browser-safe runtime surface",
      `generated project files = ${(manifest.projectFiles || []).length}`,
    ].join("\n");
    return;
  }

  benchmarkOutput.textContent = [
    "primary scenario = MoonBit workflow synthesis",
    "evaluation focus = project completeness, reusable skills, build success, explainability",
    `generated project files = ${(manifest.projectFiles || []).length}`,
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

async function inspectFile() {
  const path = filePathInput.value.trim();
  if (!path) throw new Error("Please enter a local file path first.");
  const response = await fetch("/api/files/inspect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error(payload.error || "Unable to inspect file.");
  currentFileInfo = payload.fileInfo;
  renderFileInfo(currentFileInfo);
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

function resetArtifactPanelForChat() {
  analysisOutput.textContent = "No local analysis was run for this message.";
  artifactTitle.textContent = "No artifact generated";
  artifactSummary.textContent = "Chat mode stays conversational. Switch to MoonBit Builder, FastQ Analyst, or Game Studio to produce executable artifacts.";
  artifactWarning.textContent = "";
  codeOutput.textContent = "// artifact generation is idle in chat mode";
  renderVerificationGate([]);
  renderProjectManifest(null);
  renderBenchmarkProfile({});
  renderSkills([]);
  buildLog.textContent = "No MoonBit build was run for this message.";
  programOutput.textContent = "waiting for wasm...";
  runButton.disabled = true;
  latestWasmBase64 = "";
  runBadge.textContent = "wasm: idle";
  updatePipeline("chat");
}

async function sendPrompt(prompt) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: prompt,
      history,
      filePath: filePathInput.value.trim(),
      selectedMode,
      llmConfig: getLlmConfig(),
    }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error(payload.error || "Unknown server error");

  addMessage("assistant", payload.assistant.content);
  history.push({ role: "user", content: prompt });
  history.push({ role: "assistant", content: payload.assistant.content });
  currentFileInfo = payload.fileInfo || currentFileInfo;
  renderFileInfo(currentFileInfo);
  modeBadge.textContent = `mode: ${payload.mode || "chat"}`;
  experienceBadge.textContent = `workflow: ${payload.experienceMode || selectedMode}`;

  if (!payload.artifact) {
    adapterBadge.textContent = getLlmConfig().baseUrl ? "adapter: remote-chat" : "adapter: local-chat";
    resetArtifactPanelForChat();
    return;
  }

  adapterBadge.textContent = `adapter: ${payload.artifact.adapter}`;
  analysisOutput.textContent = payload.analysis?.summary || "No local analysis summary.";
  artifactTitle.textContent = payload.artifact.title;
  artifactSummary.textContent = payload.artifact.summary;
  artifactWarning.textContent = payload.artifact.warning || "";
  codeOutput.textContent = payload.artifact.moonbitCode;
  renderVerificationGate(payload.artifact.verificationGate || []);
  renderProjectManifest(payload.artifact.projectManifest || null);
  renderBenchmarkProfile({
    mode: payload.experienceMode || selectedMode,
    fileInfo: currentFileInfo,
    analysis: payload.analysis || null,
    manifest: payload.artifact.projectManifest || null,
  });
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

inspectFileButton.addEventListener("click", async () => {
  inspectFileButton.disabled = true;
  try {
    await inspectFile();
    addMessage("assistant", `Loaded local file context for ${currentFileInfo.path}.`);
  } catch (error) {
    addMessage("assistant", `File inspect failed: ${error.message}`);
  } finally {
    inspectFileButton.disabled = false;
  }
});

clearFileButton.addEventListener("click", () => {
  filePathInput.value = "";
  currentFileInfo = null;
  renderFileInfo(null);
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
renderFileInfo(null);
resetArtifactPanelForChat();
syncEmptyState();
refreshHealth();
addMessage("assistant", "MoonAP is ready. Talk to it like a ChatGPT-style coding agent, or switch modes to generate MoonBit code, compile WebAssembly, and run results in the browser.");
