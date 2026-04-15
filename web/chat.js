import { MOONBIT_AGENT_SKILL } from "./moonbit-agent-skill.js";

const form = document.getElementById("chat-form");
const messages = document.getElementById("messages");
const promptInput = document.getElementById("prompt-input");
const sendButton = document.getElementById("send-button");
const attachFileButton = document.getElementById("attach-file-button");
const analyzeBrowserFileButton = document.getElementById("analyze-browser-file-button");
const buildBrowserWasmButton = document.getElementById("build-browser-wasm-button");
const clearFileButton = document.getElementById("clear-file-button");
const saveSettingsButton = document.getElementById("save-llm-settings");
const runButton = document.getElementById("run-button");
const seedAnalysisButton = document.getElementById("seed-analysis");
const browserFileInput = document.getElementById("browser-file-input");
const browserFileSummary = document.getElementById("browser-file-summary");
const analysisOutput = document.getElementById("analysis-output");
const downloadOutput = document.getElementById("download-output");
const codeOutput = document.getElementById("code-output");
const sourceFilesOutput = document.getElementById("source-files-output");
const programOutput = document.getElementById("program-output");
const progressLogOutput = document.getElementById("progress-log-output");
const attachedFileBanner = document.getElementById("attached-file-banner");
const taskStatusBanner = document.getElementById("task-status-banner");
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
const llmConfigBadge = document.getElementById("llm-config-badge");
const skillCountBadge = document.getElementById("skill-count-badge");
const moonVersion = document.getElementById("moon-version");
const presetButtons = Array.from(document.querySelectorAll(".preset-button"));
const modePicker = document.getElementById("mode-picker");
const modeCards = Array.from(document.querySelectorAll(".mode-card"));
const emptyState = document.getElementById("empty-state");
const promptCards = Array.from(document.querySelectorAll(".prompt-card"));
const surfaceTabs = Array.from(document.querySelectorAll("#surface-tabs .tab-button"));
const surfaceCopy = document.getElementById("surface-copy");
const workbenchTabs = Array.from(document.querySelectorAll("#workbench-tabs .tab-button"));
const workbenchCopy = document.getElementById("workbench-copy");
const workbenchResults = document.getElementById("workbench-results");
const workbenchReport = document.getElementById("workbench-report");
const workbenchAdvanced = document.getElementById("workbench-advanced");
const openSkillLibraryButton = document.getElementById("open-skill-library");
const openSkillLibrarySecondaryButton = document.getElementById("open-skill-library-secondary");
const closeSkillLibraryButton = document.getElementById("close-skill-library");
const skillLibraryDialog = document.getElementById("skill-library-dialog");
const skillLibraryGrid = document.getElementById("skill-library-grid");
const openSettingsButton = document.getElementById("open-settings-button");
const openSettingsButtonSecondary = document.getElementById("open-settings-button-secondary");
const closeSettingsButton = document.getElementById("close-settings-button");
const llmSettingsDialog = document.getElementById("llm-settings-dialog");
const openInspectorButton = document.getElementById("open-inspector-button");
const openProgressButtonSecondary = document.getElementById("open-progress-button-secondary");
const inspectorShell = document.getElementById("inspector-shell");
const quickSkillButton = document.getElementById("quick-skill");
const quickApiButton = document.getElementById("quick-api");
const fileContextPanel = document.getElementById("file-context-panel");
const apiBanner = document.getElementById("api-banner");
const apiBannerTitle = document.getElementById("api-banner-title");
const apiBannerBadge = document.getElementById("api-banner-badge");
const apiBannerCopy = document.getElementById("api-banner-copy");
const workspaceTitle = document.getElementById("workspace-title");
const workspaceSubtitle = document.getElementById("workspace-subtitle");
const composerModeLabel = document.getElementById("composer-mode-label");
const workflowFocus = document.getElementById("workflow-focus");
const workflowFocusTitle = document.getElementById("workflow-focus-title");
const workflowFocusBody = document.getElementById("workflow-focus-body");
const workflowFocusStep = document.getElementById("workflow-focus-step");
const fastqActionHint = document.getElementById("fastq-action-hint");
const pipelineChat = document.getElementById("pipeline-chat");
const pipelineMoonbit = document.getElementById("pipeline-moonbit");
const pipelineBuild = document.getElementById("pipeline-build");
const pipelineRun = document.getElementById("pipeline-run");

const MODE_DETAILS = {
  chat: {
    title: "Chat with MoonAP",
    subtitle: "Use MoonAP like a ChatGPT-style workspace for planning, skill routing, and MoonBit generation.",
    composer: "Chat mode",
  },
  "moonbit-task": {
    title: "Build a MoonBit workflow",
    subtitle: "Generate MoonBit code for practical tasks, then compile to WebAssembly when it makes sense.",
    composer: "MoonBit Builder mode",
  },
  "fastq-agent": {
    title: "Analyze a FastQ file",
    subtitle: "Run local-first FastQ analysis in the browser with a MoonBit Wasm kernel, then generate a reusable report app when needed.",
    composer: "FastQ Analyst mode",
  },
  "game-agent": {
    title: "Prototype a browser mini-game",
    subtitle: "Describe gameplay in natural language and let MoonAP prepare MoonBit + Wasm-friendly logic.",
    composer: "Game Studio mode",
  },
};

const LLM_PRESETS = {
  siliconflow: {
    baseUrl: "https://api.siliconflow.cn/v1",
    model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
    label: "SiliconFlow preset loaded. Paste your SiliconFlow API key and save settings.",
  },
  gemini3pro: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
    model: "gemini-3-flash-preview",
    label: "Gemini preset loaded. Paste your Google AI Studio API key and save settings.",
  },
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
let latestArtifact = null;
let latestGeneratedDownloads = [];
let downloadedArtifactSignature = "";
let progressLogEntries = [];
let currentFileInfo = null;
let currentBrowserFile = null;
let latestBrowserAnalysis = null;
let selectedMode = localStorage.getItem("moonap.selectedMode") || "chat";
let selectedSurface = selectedMode === "chat" ? "chat" : "task";
let selectedWorkbench = "results";

const BUILTIN_SKILLS = [
  {
    id: "fastq-sample-generator",
    name: "FastQ Sample Generator",
    mode: "chat",
    availability: "Ready now",
    description: "Generate browser-local synthetic FastQ files such as 1 MB, 5 MB, or 10 MB for benchmark and analysis testing.",
    prompt: "Generate simulated 1MB, 5MB, and 10MB FastQ files for local benchmark testing.",
  },
  {
    id: "fastq-analyst",
    name: "FastQ Analyst",
    mode: "fastq-agent",
    availability: "Ready now",
    description: "Analyze a browser-local FastQ file with a MoonBit Wasm kernel and generate a reusable report app.",
    prompt: "Please analyze this FastQ file, count N bases, compute the ratio, and generate a MoonBit demo program.",
  },
  {
    id: "moonbit-builder",
    name: "MoonBit Builder",
    mode: "moonbit-task",
    availability: "Needs API",
    description: "Generate MoonBit code for a practical workflow with a cloud model.",
    prompt: "Generate a MoonBit tool that reads user intent, tracks context as JSON, and prepares a Wasm-ready task pipeline.",
  },
  {
    id: "game-studio",
    name: "Game Studio",
    mode: "game-agent",
    availability: "Needs API",
    description: "Prototype a browser mini-game in MoonBit with WebAssembly-friendly logic.",
    prompt: "Generate a browser mini-game in MoonBit with a simple dodge gameplay loop and WebAssembly-friendly game logic.",
  },
];

function hasRemoteConfig() {
  const config = getLlmConfig();
  return Boolean(config.baseUrl && config.apiKey && config.model);
}

function syncSurfaceTabs() {
  surfaceTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.surface === selectedSurface);
  });

  if (selectedSurface === "chat") {
    surfaceCopy.textContent = "Use Chat to talk with MoonAP, explore skills, and plan the next MoonBit workflow.";
    return;
  }

  surfaceCopy.textContent = hasRemoteConfig()
    ? "Task mode is ready for built-in skills plus cloud-generated MoonBit apps."
    : "Task mode is ready for built-in skills now. Configure an LLM only when you want live cloud-generated MoonBit apps.";
}

function syncWorkbenchTabs() {
  workbenchTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.workbench === selectedWorkbench);
  });

  workbenchResults.classList.toggle("hidden", selectedWorkbench !== "results");
  workbenchReport.classList.toggle("hidden", selectedWorkbench !== "report");
  workbenchAdvanced.classList.toggle("hidden", selectedWorkbench !== "advanced");

  if (selectedWorkbench === "results") {
    workbenchCopy.textContent = "Results shows the main output first: analysis, benchmark readiness, and benchmark report.";
    return;
  }
  if (selectedWorkbench === "report") {
    workbenchCopy.textContent = "Report App shows the generated MoonBit app and its runtime output.";
    return;
  }
  workbenchCopy.textContent = "Advanced contains source files, verification, protocol, and build details for debugging or judging.";
}

function showInspector(forceOpen = true) {
  inspectorShell.classList.toggle("hidden", !forceOpen);
  openInspectorButton.classList.toggle("active", forceOpen);
}

function renderProgressLog() {
  progressLogOutput.textContent = progressLogEntries.length
    ? progressLogEntries.join("\n")
    : "No progress log yet.";
}

function setTaskStatus(message) {
  taskStatusBanner.textContent = message || "Ready for the next prompt.";
}

function logProgress(message) {
  const timestamp = new Date().toLocaleTimeString("zh-CN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  progressLogEntries.push(`[${timestamp}] ${message}`);
  if (progressLogEntries.length > 120) {
    progressLogEntries = progressLogEntries.slice(-120);
  }
  renderProgressLog();
  setTaskStatus(message);
}

function openProgressInspector() {
  selectedWorkbench = "advanced";
  syncWorkbenchTabs();
  showInspector(true);
}

function updateFastqActionState(stage = "choose-file") {
  const isFastqMode = selectedMode === "fastq-agent";
  workflowFocus.classList.toggle("hidden", !isFastqMode);
  fileContextPanel.classList.toggle("hidden", !isFastqMode);

    if (!isFastqMode) {
      analyzeBrowserFileButton.textContent = "Start FastQ Analysis";
      buildBrowserWasmButton.textContent = "Create Analysis Report";
      buildBrowserWasmButton.disabled = true;
      return;
    }

  workflowFocusTitle.textContent = "FastQ local-first workflow";

  if (stage === "choose-file") {
    workflowFocusBody.textContent = "Choose a browser-local FastQ file. MoonAP will compile a MoonBit Wasm kernel and run the analysis locally in your browser.";
    workflowFocusStep.textContent = "step: choose file";
    fastqActionHint.textContent = "Choose a FastQ file, then let MoonAP compile a MoonBit Wasm kernel and analyze it locally in the browser.";
      analyzeBrowserFileButton.textContent = "Start FastQ Analysis";
      buildBrowserWasmButton.textContent = "Create Analysis Report";
      buildBrowserWasmButton.disabled = true;
      return;
    }

  if (stage === "ready-to-analyze") {
    workflowFocusBody.textContent = "File selected. Start the MoonBit Wasm analysis to produce local metrics, benchmark readiness, and the active analysis kernel.";
    workflowFocusStep.textContent = "step: run analysis";
    fastqActionHint.textContent = "MoonAP is ready to analyze this file with a MoonBit Wasm FastQ kernel.";
      analyzeBrowserFileButton.textContent = "Start FastQ Analysis";
      buildBrowserWasmButton.textContent = "Create Analysis Report";
      buildBrowserWasmButton.disabled = true;
      return;
    }

  if (stage === "analyzing") {
    workflowFocusBody.textContent = "MoonAP is compiling a MoonBit Wasm kernel and running browser-local FastQ analysis.";
    workflowFocusStep.textContent = "step: analyzing";
    fastqActionHint.textContent = "MoonAP is turning your FastQ request into a MoonBit Wasm analysis kernel.";
      analyzeBrowserFileButton.textContent = "Analyzing...";
      buildBrowserWasmButton.textContent = "Create Analysis Report";
      buildBrowserWasmButton.disabled = true;
      return;
    }

  if (stage === "analyzed") {
    workflowFocusBody.textContent = "Analysis is complete. You can now ask follow-up questions or generate a reusable MoonBit analysis report app for this file.";
    workflowFocusStep.textContent = "step: review result";
    fastqActionHint.textContent = "MoonAP finished local FastQ analysis with MoonBit Wasm. You can now generate a reusable analysis report app.";
      analyzeBrowserFileButton.textContent = "Re-run FastQ Analysis";
      buildBrowserWasmButton.textContent = "Create Analysis Report";
      buildBrowserWasmButton.disabled = false;
      return;
    }

  if (stage === "artifact-ready") {
    workflowFocusBody.textContent = "The analysis report app is ready. You can run the Wasm report, inspect generated MoonBit source files, or continue chatting from this context.";
    workflowFocusStep.textContent = "step: report ready";
    fastqActionHint.textContent = "MoonAP prepared a reusable MoonBit analysis report app for the analyzed FastQ file.";
      analyzeBrowserFileButton.textContent = "Re-run FastQ Analysis";
      buildBrowserWasmButton.textContent = "Refresh Analysis Report";
      buildBrowserWasmButton.disabled = false;
    }
  }

function updateApiBanner() {
  const remoteConfigured = hasRemoteConfig();
  if (selectedMode === "fastq-agent") {
    apiBannerTitle.textContent = remoteConfigured ? "FastQ skill is ready" : "FastQ skill works without an API";
    apiBannerBadge.textContent = remoteConfigured ? "Ready now" : "Ready now";
    apiBannerBadge.className = "mini-badge ready-badge";
    apiBannerCopy.textContent = remoteConfigured
      ? "You can run the built-in FastQ skill immediately. Your configured cloud API is still available for chat and live MoonBit generation."
      : "The FastQ skill is built in. Choose a local FastQ file and run it directly in the browser with the prepared MoonBit Wasm app.";
    return;
  }

  if (remoteConfigured) {
    apiBannerTitle.textContent = "Cloud chat is connected";
    apiBannerBadge.textContent = "Configured";
    apiBannerBadge.className = "mini-badge ready-badge";
    apiBannerCopy.textContent = "MoonAP can use your configured LLM for real cloud chat and live MoonBit code generation. Built-in skills remain available from the Skill Library.";
    return;
  }

  apiBannerTitle.textContent = "Connect your LLM API";
  apiBannerBadge.textContent = "Needs API";
  apiBannerBadge.className = "mini-badge cloud-badge";
  apiBannerCopy.textContent = "Add your LLM credentials on the left for real cloud chat and live MoonBit generation. Without an API key, open the Skill Library to run built-in skills like FastQ analysis.";
}

function addMessage(role, content) {
  const wrapper = document.createElement("article");
  wrapper.className = `message ${role}`;
  wrapper.textContent = content;
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
  syncEmptyState();
}

function parseFastqSampleRequest(prompt) {
  const text = String(prompt || "").trim();
  const normalized = text.toLowerCase();
  const looksLikeFastq =
    /fastq|\.fastq|\.fq|模拟.*fastq|fastq.*模拟|sample.*fastq|synthetic.*fastq/i.test(text);
  const wantsGeneration =
    /generate|create|make|simulate|synthetic|mock|produce|生成|创建|模拟/i.test(text);

  if (!looksLikeFastq || !wantsGeneration) {
    return null;
  }

  const explicitSizes = Array.from(normalized.matchAll(/(\d+(?:\.\d+)?)\s*mb/g))
    .map((match) => Number(match[1]))
    .filter((value) => Number.isFinite(value) && value > 0);

  const rangeMatch = normalized.match(/(\d+)\s*mb\s*(?:to|[-~]|到)\s*(\d+)\s*mb/);
  if (rangeMatch) {
    const start = Number(rangeMatch[1]);
    const end = Number(rangeMatch[2]);
    if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
      const sizeList = [];
      const upperBound = Math.min(end, start + 12);
      for (let size = start; size <= upperBound; size += 1) {
        sizeList.push(size);
      }
      return { sizesMb: sizeList };
    }
  }

  if (explicitSizes.length > 0) {
    return {
      sizesMb: Array.from(new Set(explicitSizes)).sort((a, b) => a - b),
    };
  }

  return { sizesMb: [1, 5, 10] };
}

function parseFileGenerationIntent(prompt) {
  const text = String(prompt || "").trim();
  const normalized = text.toLowerCase();
  const wantsGeneration = /generate|create|make|simulate|synthetic|mock|produce|export|download|鐢熸垚|鍒涘缓|妯℃嫙/.test(normalized);
  const wantsFile = /file|files|fastq|fasta|csv|jsonl?|txt|log|dataset|鏂囦欢|鏁版嵁/.test(normalized);

  if (!wantsGeneration || !wantsFile) {
    return null;
  }

  const fastqRequest = parseFastqSampleRequest(prompt);
  const fileType = /fastq|\.fastq|\.fq/.test(normalized)
    ? "fastq"
    : /csv/.test(normalized)
      ? "csv"
      : /jsonl?/.test(normalized)
        ? "json"
        : /fasta/.test(normalized)
          ? "fasta"
          : "text";

  return {
    fileType,
    sizesMb: fastqRequest?.sizesMb?.length ? fastqRequest.sizesMb : [1],
    multipleOutputs: Boolean(fastqRequest?.sizesMb?.length && fastqRequest.sizesMb.length > 1),
  };
}

function buildSyntheticSequence(length = 151, nEvery = 17) {
  const bases = ["A", "C", "G", "T"];
  const chars = [];
  for (let i = 0; i < length; i += 1) {
    if ((i + 1) % nEvery === 0) {
      chars.push("N");
      continue;
    }
    chars.push(bases[i % bases.length]);
  }
  return chars.join("");
}

function buildSyntheticQuality(sequence) {
  const qualityAlphabet = ["I", "H", "G", "F", "E", "D", "C", "B"];
  return Array.from(sequence, (base, index) => {
    if (base === "N") {
      return "5";
    }
    return qualityAlphabet[index % qualityAlphabet.length];
  }).join("");
}

function buildSyntheticFastqHeader(index) {
  const tile = 1101 + (index % 8);
  const x = 1000 + index;
  const y = 2000 + index;
  return `@MN01234:42:000H7Y2LT:1:${tile}:${x}:${y} 1:N:0:ACGTACGT`;
}

function buildSyntheticFastqRecord(index, sequence, quality) {
  return `${buildSyntheticFastqHeader(index)}\n${sequence}\n+\n${quality}\n`;
}

function buildFastqSampleBlob(targetBytes) {
  const sequence = buildSyntheticSequence();
  const quality = buildSyntheticQuality(sequence);
  const chunks = [];
  let totalBytes = 0;
  let index = 0;

  while (totalBytes < targetBytes) {
    const batch = [];
    for (let i = 0; i < 512 && totalBytes < targetBytes; i += 1) {
      const record = buildSyntheticFastqRecord(index, sequence, quality);
      batch.push(record);
      totalBytes += record.length;
      index += 1;
    }
    chunks.push(batch.join(""));
  }

  return {
    blob: new Blob(chunks, { type: "text/plain;charset=utf-8" }),
    readCount: index,
    sequenceLength: sequence.length,
    qualityEncoding: "Phred+33-like ASCII",
  };
}

function downloadGeneratedBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function handleFastqSampleRequest(prompt, sampleRequest) {
  logProgress(`Started built-in local FastQ sample generation for prompt: ${prompt}`);
  const sizesMb = sampleRequest.sizesMb;
  const created = [];

  for (const sizeMb of sizesMb) {
    const targetBytes = Math.floor(sizeMb * 1024 * 1024);
    const { blob, readCount, sequenceLength, qualityEncoding } = buildFastqSampleBlob(targetBytes);
    const filename = `moonap-fastq-sample-${sizeMb}mb.fastq`;
    downloadGeneratedBlob(blob, filename);
    logProgress(`Generated and downloaded local sample ${filename} (${(blob.size / (1024 * 1024)).toFixed(2)} MB, reads=${readCount}).`);
    created.push(`${filename} | ${(blob.size / (1024 * 1024)).toFixed(2)} MB | reads=${readCount} | read_length=${sequenceLength} | quality=${qualityEncoding}`);
  }

  const summary = [
    "MoonAP generated browser-local synthetic FastQ samples.",
    ...created.map((line) => `- ${line}`),
    "",
    "These files were generated locally and downloaded to your browser.",
    "FastQ format note: line 3 is '+', and line 4 is a Phred+33-like quality string with the same length as the sequence line.",
  ].join("\n");

  history.push({ role: "user", content: prompt });
  history.push({ role: "assistant", content: summary });
  resetArtifactPanelForChat();
  modeBadge.textContent = "mode: local-fastq-samples";
  adapterBadge.textContent = "adapter: built-in-skill";
  experienceBadge.textContent = "workflow: browser-local-fastq-sample-generator";
  analysisOutput.textContent = summary;
  renderGeneratedDownloads(created);
  selectedWorkbench = "results";
  syncWorkbenchTabs();
  showInspector(true);
  addMessage("assistant", summary);
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
  llmStatus.textContent = hasRemoteConfig()
    ? "Cloud chat and MoonBit generation are enabled for this browser."
    : "No cloud API configured yet. Built-in skills still work, and chat stays in local fallback mode.";
  llmConfigBadge.textContent = hasRemoteConfig() ? "configured" : "needs setup";
  syncSurfaceTabs();
  updateApiBanner();
}

function renderSkillLibrary() {
  if (skillCountBadge) {
    skillCountBadge.textContent = `${BUILTIN_SKILLS.length} skills`;
  }
  skillLibraryGrid.innerHTML = BUILTIN_SKILLS.map((skill) => `
    <article class="skill-card">
      <div class="skill-card-header">
        <div>
          <p class="eyebrow">Skill</p>
          <h3>${skill.name}</h3>
        </div>
        <span class="mini-badge ${skill.availability === "Ready now" ? "ready-badge" : "cloud-badge"}">${skill.availability}</span>
      </div>
      <p>${skill.description}</p>
      <div class="skill-meta">
        <span class="mini-badge">mode: ${skill.mode}</span>
      </div>
      <button class="primary-button" type="button" data-skill-id="${skill.id}">Use Skill</button>
    </article>
  `).join("");
}

function saveLlmConfig() {
  localStorage.setItem("moonap.llm.baseUrl", llmBaseUrl.value);
  localStorage.setItem("moonap.llm.apiKey", llmApiKey.value);
  localStorage.setItem("moonap.llm.model", llmModel.value);
  updateLlmStatus();
}

function applyPreset(presetKey, announce = true) {
  const preset = LLM_PRESETS[presetKey];
  if (!preset) return;
  llmBaseUrl.value = preset.baseUrl;
  llmModel.value = preset.model;
  if (announce) {
    addMessage("assistant", preset.label);
  }
  updateLlmStatus();
}

function loadLlmConfig() {
  llmBaseUrl.value = localStorage.getItem("moonap.llm.baseUrl") || "";
  llmApiKey.value = localStorage.getItem("moonap.llm.apiKey") || "";
  llmModel.value = localStorage.getItem("moonap.llm.model") || "";
  if (!llmBaseUrl.value && !llmApiKey.value && !llmModel.value) {
    applyPreset("gemini3pro", false);
    return;
  }
  updateLlmStatus();
}

function setMode(mode) {
  selectedMode = MODE_DETAILS[mode] ? mode : "chat";
  localStorage.setItem("moonap.selectedMode", selectedMode);
  modeCards.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === selectedMode);
  });
  document.querySelectorAll("[data-mode].rail-button, [data-mode].rail-brand").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === selectedMode);
  });
  const details = MODE_DETAILS[selectedMode];
  workspaceTitle.textContent = "MoonAP: MoonBit Agent Playground.";
  workspaceSubtitle.textContent = details.subtitle;
  composerModeLabel.textContent = details.composer;
  experienceBadge.textContent = `workflow: ${selectedMode}`;
  selectedSurface = selectedMode === "chat" ? "chat" : "task";
  syncSurfaceTabs();
  updateFastqActionState(currentBrowserFile ? "ready-to-analyze" : "choose-file");
  updateApiBanner();
}

function renderBrowserFileInfo(file) {
  if (!file) {
    browserFileSummary.textContent = "No browser-local file selected.";
    attachedFileBanner.textContent = "No file attached.";
    return;
  }

  browserFileSummary.innerHTML = [
    `<p><strong>Name:</strong> ${file.name}</p>`,
    `<p><strong>Type:</strong> ${file.type || "unknown"}</p>`,
    `<p><strong>Size:</strong> ${file.size} bytes</p>`,
    `<p><strong>Last Modified:</strong> ${new Date(file.lastModified).toLocaleString()}</p>`,
  ].join("");
  attachedFileBanner.textContent = `Attached file: ${file.name} (${file.size} bytes)`;
}

function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === "object") return [value];
  return [];
}

function renderVerificationGate(checks = []) {
  const items = ensureArray(checks);
  if (!items.length) {
    verificationOutput.textContent = "No verification gate yet.";
    return;
  }

  verificationOutput.textContent = items
    .map((check) => {
      const status = check.passed ? "PASS" : "FAIL";
      return `[${status}] ${check.name || "check"} (${check.level || "Contract"})\n${check.detail || "No detail provided."}`;
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
  const files = ensureArray(manifest.projectFiles).map((file) =>
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
    ...ensureArray(protocol.hostResponsibilities).map((item) => `- ${item}`),
    "",
    "kernel responsibilities:",
    ...ensureArray(protocol.kernelResponsibilities).map((item) => `- ${item}`),
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
  const items = ensureArray(skills);
  if (!items.length) {
    skillOutput.textContent = "No reusable skills yet.";
    return;
  }

  skillOutput.textContent = items
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
    `benchmark tiers = ${ensureArray(profile.benchmarkTiers).join(" / ")}`,
    `recommended chunk sizes = ${ensureArray(profile.recommendedChunkSizes).join(" / ")}`,
    `evaluation focus = ${ensureArray(profile.evaluationFocus).join(", ")}`,
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

function renderGeneratedDownloads(items = []) {
  const list = ensureArray(items);
  downloadOutput.textContent = list.length
    ? list.map((item) => `- ${item}`).join("\n")
    : "No generated files yet.";
}

function renderBenchmarkSuiteResult(report, markdown, jsonPath = "", markdownPath = "") {
  if (!report || !Array.isArray(report.cases)) {
    renderBenchmarkProfile(null);
    renderBenchmarkReport(markdown || "");
    return;
  }

  const sampleCases = report.cases.filter((item) => item.source === "sample");
  const syntheticCases = report.cases.filter((item) => item.source !== "sample");
  benchmarkOutput.textContent = [
    `generated at = ${report.generatedAt || "unknown"}`,
    `moon version = ${report.moonVersion || "unknown"}`,
    `cases = ${report.cases.length}`,
    `sample-backed cases = ${sampleCases.length}`,
    `synthetic cases = ${syntheticCases.length}`,
    `wasm build validation = ${report.compileValidation?.compiled ? "yes" : "no"}`,
    jsonPath ? `json report = ${jsonPath}` : "",
    markdownPath ? `markdown report = ${markdownPath}` : "",
  ].filter(Boolean).join("\n");
  renderBenchmarkReport(markdown || "No benchmark report yet.");
}

function normalizeGeneratedDownloads(downloads = []) {
  return ensureArray(downloads)
    .filter((item) => item && typeof item === "object" && item.filename)
    .map((item) => ({
      filename: String(item.filename).trim(),
      contentType: String(item.contentType || "text/plain;charset=utf-8").trim(),
      outputMode: String(item.outputMode || (downloads.length > 1 ? "json-bundle" : "raw")).trim(),
      description: String(item.description || "").trim(),
    }))
    .filter((item) => item.filename);
}

function maybeDownloadGeneratedOutputs(stdoutText, auto = false) {
  if (!latestGeneratedDownloads.length) {
    return [];
  }

  const signature = `${latestArtifact?.title || "artifact"}:${stdoutText.length}:${latestGeneratedDownloads.map((item) => item.filename).join("|")}`;
  if (auto && downloadedArtifactSignature === signature) {
    return [];
  }

  const created = [];

  if (latestGeneratedDownloads.length === 1 && latestGeneratedDownloads[0].outputMode === "raw") {
    const plan = latestGeneratedDownloads[0];
    downloadGeneratedBlob(new Blob([stdoutText], { type: plan.contentType }), plan.filename);
    created.push(plan.filename);
  } else {
    const bundle = JSON.parse(stdoutText);
    const files = ensureArray(bundle?.files);
    files.forEach((file, index) => {
      if (!file || typeof file !== "object" || typeof file.content !== "string") return;
      const plan = latestGeneratedDownloads[index] || latestGeneratedDownloads.find((item) => item.filename === file.filename);
      const filename = String(file.filename || plan?.filename || `moonap-generated-${index + 1}.txt`).trim();
      const contentType = String(file.contentType || plan?.contentType || "text/plain;charset=utf-8").trim();
      downloadGeneratedBlob(new Blob([file.content], { type: contentType }), filename);
      created.push(filename);
    });
  }

  downloadedArtifactSignature = signature;
  return created;
}

function summarizeArtifact(artifact = null) {
  if (!artifact || typeof artifact !== "object") {
    return "MoonAP did not receive a MoonBit artifact.";
  }

  const sourceFiles = ensureArray(artifact.sourceFiles);
  const verificationGate = ensureArray(artifact.verificationGate);
  const skills = ensureArray(artifact.skills);
  const generatedDownloads = normalizeGeneratedDownloads(artifact.generatedDownloads);
  const parts = [
    `artifact: ${artifact.title || "Generated MoonBit Program"}`,
    `build: ${artifact.wasmBase64 ? "Wasm ready" : "MoonBit generated"}`,
    `source files: ${sourceFiles.length}`,
    `verification checks: ${verificationGate.length}`,
    `skills: ${skills.length}`,
  ];

  if (generatedDownloads.length) {
    parts.push(`downloads: ${generatedDownloads.length}`);
  }

  if (artifact.taskKernelProtocol?.protocolName) {
    parts.push(`protocol: ${artifact.taskKernelProtocol.protocolName}`);
  }

  if (artifact.warning) {
    parts.push(`warning: ${artifact.warning}`);
  }

  return parts.join("\n");
}

function populateArtifactPanel(artifact, analysis = null) {
  latestArtifact = artifact;
  latestGeneratedDownloads = normalizeGeneratedDownloads(artifact.generatedDownloads || []);
  downloadedArtifactSignature = "";
  artifactTitle.textContent = artifact.title;
  artifactSummary.textContent = artifact.summary;
  artifactWarning.textContent = artifact.warning || "";
  codeOutput.textContent = artifact.moonbitCode;
  renderSourceFiles(artifact.sourceFiles || []);
  renderVerificationGate(artifact.verificationGate || []);
  renderProjectManifest(artifact.projectManifest || null);
  renderTaskKernelProtocol(artifact.taskKernelProtocol || null);
  renderBenchmarkProfile(artifact.benchmarkProfile || null);
  renderBenchmarkReport(analysis?.benchmarkReport || "");
  renderGeneratedDownloads(normalizeGeneratedDownloads(artifact.generatedDownloads || []).map((item) => item.filename));
  renderSkills(artifact.skills || []);
  buildLog.textContent = artifact.buildLog || "moon build finished without extra logs.";
  if (artifact.buildLog) {
    logProgress("MoonBit build finished and build log was updated.");
  }
  latestWasmBase64 = artifact.wasmBase64 || "";
  selectedWorkbench = latestWasmBase64 ? "report" : "advanced";
  syncWorkbenchTabs();
  showInspector(true);
  runButton.disabled = !latestWasmBase64;
  runBadge.textContent = latestWasmBase64 ? "wasm: ready" : "wasm: idle";
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

function isFastqLikeFile(file) {
  return Boolean(file && /\.(fastq|fq|txt)$/i.test(file.name || ""));
}

function isSpreadsheetLikeFile(file) {
  return Boolean(file && /\.(csv|tsv|xlsx|xls)$/i.test(file.name || ""));
}

function detectAttachedFileType(file) {
  if (!file) return "unknown";
  if (isFastqLikeFile(file)) return "fastq";
  if (isSpreadsheetLikeFile(file)) return "tabular";
  if (/\.(json|jsonl|txt|log)$/i.test(file.name || "")) return "text";
  return "binary";
}

function looksLikeFastqAnalysisPrompt(prompt) {
  const text = String(prompt || "");
  return /fastq|n base|n bases|gc ratio|read count|quality|analy[sz]e|count|ratio|碱基|测序|fastq文件/i.test(text);
}

function looksLikeTabularAnalysisPrompt(prompt) {
  const text = String(prompt || "");
  return /csv|xlsx|excel|table|tabular|row|rows|column|filter|sum|amount|record|records|analy[sz]e|extract|monthly|spend|expense|表格|列名|金额|支出/i.test(text);
}

function inferRemoteArtifactMode(prompt, fallbackMode = selectedMode, fileInfo = currentFileInfo) {
  if (fallbackMode && fallbackMode !== "chat") {
    return fallbackMode;
  }

  if ((fileInfo?.detectedType === "fastq" || isFastqLikeFile(currentBrowserFile)) && looksLikeFastqAnalysisPrompt(prompt)) {
    return "fastq-agent";
  }

  if (/game|canvas|sprite|platformer|browser game/i.test(String(prompt || ""))) {
    return "game-agent";
  }

  if (/moonbit|wasm|webassembly|workflow|tool|agent|json/i.test(String(prompt || ""))) {
    return "moonbit-task";
  }

  return "chat";
}

function inferAttachedTaskDescriptor(prompt, file = currentBrowserFile) {
  if (!file) return null;
  const fileType = detectAttachedFileType(file);

  if (fileType === "fastq" && looksLikeFastqAnalysisPrompt(prompt)) {
    return {
      id: "fastq-analysis",
      mode: "fastq-agent",
      fileType,
      fileInfo: {
        path: file.name,
        sizeBytes: file.size,
        detectedType: "fastq",
      },
      extraRequirements: [
        "This is an attached-file FastQ analysis request.",
        "Do not write a standalone parser in main.mbt that scans a whole in-memory string using unsupported mutable syntax.",
        "Do not use `var`.",
        "Do not use `String.chars()` or similar unsupported iteration helpers.",
        "Keep main.mbt minimal and compile-first.",
        "Put browser-analysis helpers in helper files and export simple numeric functions for JavaScript.",
        "The browser host will stream the attached file and call the exported FastQ helper functions.",
        "main.mbt may print a short analysis banner, but the exported helper functions are mandatory.",
      ].join("\n"),
      validateArtifact: validateFastqArtifactExports,
      successSummary(fileName, resultSummary) {
        return `MoonAP generated a FastQ analyzer for ${fileName} and finished browser-local analysis.\n\n${resultSummary}`;
      },
    };
  }

  if (fileType === "tabular" && looksLikeTabularAnalysisPrompt(prompt)) {
    return {
      id: "tabular-analysis",
      mode: "moonbit-task",
      fileType,
      fileInfo: {
        path: file.name,
        sizeBytes: file.size,
        detectedType: "tabular",
      },
      extraRequirements: [
        "This is an attached tabular-file analysis request.",
        "Treat the attachment as a spreadsheet or CSV-style table, not as a raw binary blob to parse directly in MoonBit.",
        "The browser host may preprocess CSV/XLSX into rows, columns, and structured records before invoking the MoonBit task kernel.",
        "Generate a MoonBit task artifact that is ready for structured row filtering, aggregation, and result formatting.",
        "Keep the project compile-first and multi-task friendly so the same protocol can later be reused for CSV and XLSX analysis.",
      ].join("\n"),
      validateArtifact: null,
      successSummary(fileName) {
        return `MoonAP generated a structured table-analysis artifact for ${fileName}.`;
      },
    };
  }

  return null;
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
      throw new Error(payload.error || "Unable to build a browser-local FastQ report app.");
  }
  payload.mode = payload.mode || "analysis";
  payload.experienceMode = payload.experienceMode || "browser-local-fastq";
  if (payload.artifact) {
    payload.artifact.adapter = payload.artifact.adapter || "browser-analysis";
  }
  return payload;
}

function extractJsonPayload(text) {
  const fenced = String(text || "").match(/```json\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1];
  const objectMatch = String(text || "").match(/\{[\s\S]*\}/);
  return objectMatch ? objectMatch[0] : text;
}

function buildGeneratedFilePromptBlock(prompt) {
  const request = parseFileGenerationIntent(prompt);
  if (!request) {
    return "";
  }

  const sizesLabel = request.sizesMb.map((size) => `${size}MB`).join(", ");

  if (request.fileType === "fastq") {
    return [
      "This request is asking for downloadable synthetic FastQ files.",
      `Requested target size(s): ${sizesLabel}.`,
      "Add generatedDownloads to the JSON artifact.",
      "If one file is requested, use generatedDownloads = [{ filename, contentType, outputMode: \"raw\", description }].",
      "If multiple files are requested, use generatedDownloads entries for each file and set outputMode to \"json-bundle\".",
      "When outputMode is raw, the wasm program must print only FASTQ file content to stdout.",
      "When outputMode is json-bundle, the wasm program must print only one JSON object like {\"files\":[{\"filename\":\"...\",\"content\":\"...\"}]} to stdout.",
      "Use standard 4-line FASTQ records.",
      "Line 1 starts with @ and may use an Illumina-style identifier.",
      "Line 2 is the nucleotide sequence.",
      "Line 3 is a single + line.",
      "Line 4 is a Phred+33 quality string with exactly the same number of characters as line 2.",
      "Include realistic N bases in the synthetic reads by default unless the user explicitly asks for zero Ns.",
      "Use a mixed but nonzero N ratio, roughly around 5% to 10%, so the file is useful for FastQ quality analysis benchmarks.",
      "Generate repeated records until the output size is approximately the requested size.",
      "Keep the MoonBit project compile-first and the generated file content immediately usable for benchmark testing.",
    ].join("\n");
  }

  return [
    "This request is asking for downloadable generated files.",
    `Requested target size(s): ${sizesLabel}.`,
    "Add generatedDownloads to the JSON artifact.",
    "If one file is requested, print only the file content to stdout and mark outputMode as raw.",
    "If multiple files are requested, print one JSON bundle to stdout and mark outputMode as json-bundle.",
  ].join("\n");
}

function browserTaskKernelProtocol(mode) {
  if (mode === "fastq-agent") {
    return {
      protocolName: "moonap.fastq.streaming.v1",
      inputMode: "streaming-bytes",
      stateType: "FastqStreamingState",
      initFn: "init_state",
      ingestFn: "ingest_chunk",
      finalizeFn: "finalize_report",
    };
  }
  if (mode === "game-agent") {
    return {
      protocolName: "moonap.browser.interactive.v1",
      inputMode: "interactive",
      stateType: "GameRuntimeState",
      initFn: "init_state",
      ingestFn: "ingest_event",
      finalizeFn: "finalize_frame",
    };
  }
  return {
    protocolName: "moonap.workflow.whole-file.v1",
    inputMode: "whole-file-text",
    stateType: "WorkflowTaskState",
    initFn: "init_state",
    ingestFn: "ingest_input",
    finalizeFn: "finalize_result",
  };
}

function buildBrowserRemoteSystemPrompt(mode, prompt = "", fileInfo = null, extraRequirements = "") {
  const protocol = browserTaskKernelProtocol(mode);
  const fileStructureBlock = protocol.protocolName === "moonap.workflow.whole-file.v1"
    ? [
        "Expected file structure for workflow tasks:",
        "- cmd/main/main.mbt",
        "- cmd/main/agent_spec.mbt",
        "- cmd/main/session_context.mbt",
        "main.mbt should call helper functions defined in the other two files.",
        "The program should print a request summary plus a session or context label.",
      ].join("\n")
    : protocol.protocolName === "moonap.browser.interactive.v1"
      ? [
          "Expected file structure for browser game tasks:",
          "- cmd/main/main.mbt",
          "- cmd/main/game_state.mbt",
          "- cmd/main/game_loop.mbt",
          "main.mbt should call helper functions from the other files.",
        ].join("\n")
      : protocol.protocolName === "moonap.fastq.streaming.v1"
        ? [
            "Expected file structure for FastQ tasks:",
            "- cmd/main/main.mbt",
            "- cmd/main/fastq_stats.mbt",
            "- cmd/main/fastq_chunking.mbt",
            "Optionally add cmd/main/fastq_wasm_runtime.mbt when exporting browser helpers.",
            "The Wasm module must export these functions for browser-local FastQ analysis: is_n_base, is_gc_base, is_sequence_state, next_fastq_state, accumulate_read_count, accumulate_total_bases, accumulate_n_bases, accumulate_gc_bases, update_longest_read, update_shortest_read.",
            "Keep the exported functions simple and numeric so JavaScript can call them directly from WebAssembly exports.",
          ].join("\n")
        : "Prefer a small multi-file project whose files are actually used by main.mbt.";

  return [
    "You are MoonAP, an expert MoonBit code generator.",
    MOONBIT_AGENT_SKILL,
    "Return strict JSON only.",
    "Required keys: title, summary, moonbitCode, sourceFiles, projectManifest, skills, verificationGate, taskKernelProtocol.",
    "sourceFiles must be an array of { path, content } objects.",
    "cmd/main/main.mbt must exist in sourceFiles.",
    "Prefer a single-package project rooted at cmd/main whenever possible.",
    "If you create extra package directories such as lib or runtime, each directory with .mbt files must be a valid MoonBit package and imports must match those directory names.",
    "Do not reference packages like @lib unless matching source files exist in that package directory.",
    "For workflow and utility tasks, prefer 2-3 small source files instead of a single giant file.",
      "Put reusable logic in helper files under cmd/main and make main.mbt call those helpers.",
      "The generated program must print a visible result to stdout when the wasm entrypoint runs.",
      "Do not use print_string. It is not available here.",
      "Use println for normal visible output.",
      "For downloadable file generation tasks, build the full output string or JSON bundle and print it once at the end with println.",
      "Avoid random-number APIs or numeric reinterpret tricks unless absolutely required. Prefer deterministic generation from the record index.",
      "Use simple MoonBit 0.9-compatible syntax.",
      "Avoid StringView replace chains like raw.trim().replace(...).",
    "Optional key: generatedDownloads. Use it when the task is supposed to create downloadable files from Wasm output.",
    `Protocol: ${protocol.protocolName}`,
    `Lifecycle: ${protocol.initFn} -> ${protocol.ingestFn} -> ${protocol.finalizeFn}`,
    fileInfo ? `Attached browser-local file: ${fileInfo.path} (${fileInfo.sizeBytes} bytes), detectedType=${fileInfo.detectedType || "unknown"}.` : "",
    extraRequirements || "",
    fileStructureBlock,
    buildGeneratedFilePromptBlock(prompt),
  ].join("\n");
}

function buildBrowserRepairPrompt(prompt, artifact, compileError, extraRequirements = "") {
  return [
    "Repair the previous MoonBit artifact so it compiles to WebAssembly.",
    "Return strict JSON only with the same MoonAP artifact schema.",
    `Original user request:\n${prompt}`,
    `Compiler error:\n${compileError}`,
    "If the error mentions print_string, replace it with a compile-safe output strategy.",
    "If the error mentions missing FastQ analysis exports, add explicit exported FastQ helper functions for browser analysis.",
    "For FastQ browser analysis, the Wasm must export: is_n_base, is_gc_base, is_sequence_state, next_fastq_state, accumulate_read_count, accumulate_total_bases, accumulate_n_bases, accumulate_gc_bases, update_longest_read, update_shortest_read.",
    "Use println for normal output.",
    "For file generation tasks, assemble the full file text or JSON bundle and print it once with println.",
    "Avoid deprecated numeric conversion chains and avoid unnecessary randomness.",
    "Keep the project small and compile-first.",
    "Prefer a single-package cmd/main project unless multiple packages are essential.",
    extraRequirements || "",
    "Previous artifact JSON:",
    JSON.stringify(artifact, null, 2),
  ].join("\n\n");
}

async function validateFastqArtifactExports(artifact) {
  if (!artifact?.wasmBase64) {
    throw new Error("The generated artifact does not include Wasm output.");
  }

  const module = await instantiateWasmModule(artifact.wasmBase64);
  const exports = module.instance.exports;
  const required = [
    "is_n_base",
    "is_gc_base",
    "is_sequence_state",
    "next_fastq_state",
    "accumulate_read_count",
    "accumulate_total_bases",
    "accumulate_n_bases",
    "accumulate_gc_bases",
    "update_longest_read",
    "update_shortest_read",
  ];
  const missing = required.filter((name) => typeof exports[name] !== "function");
  if (missing.length) {
    throw new Error(`The generated Wasm artifact does not expose required FastQ analysis exports: ${missing.join(", ")}`);
  }
}

async function executeAttachedTaskDescriptor(taskDescriptor, prompt, payload) {
  if (!taskDescriptor) {
    throw new Error("MoonAP could not infer a supported attached-file task from this prompt.");
  }

  if (taskDescriptor.id === "fastq-analysis") {
    populateArtifactPanel(payload.artifact, null);
    adapterBadge.textContent = `adapter: ${payload.artifact?.adapter || "browser-remote-openai-compatible"}`;

    if (!latestWasmBase64) {
      throw new Error("MoonAP did not receive a Wasm module for the attached FastQ analysis.");
    }

    analysisOutput.textContent = "MoonAP compiled the FastQ analyzer. Running WebAssembly in the browser...";
    logProgress("FastQ analyzer compiled. Starting browser-local Wasm execution over the attached file.");
    const wasmResult = await analyzeBrowserFastqFileWithWasm(currentBrowserFile, latestWasmBase64);
    const result = createFastqAnalysisFromWasm(currentBrowserFile, wasmResult);
    latestBrowserAnalysis = result;
    analysisOutput.textContent = result.summary;
    renderBenchmarkProfile(result.benchmarkProfile);
    renderBenchmarkReport(result.benchmarkReport);
    updatePipeline("run-complete");
    showInspector(true);
    const assistantSummary = taskDescriptor.successSummary(currentBrowserFile.name, result.summary);
    addMessage("assistant", `${payload.assistant?.content || "MoonAP generated a MoonBit artifact from your prompt."}\n\n${assistantSummary}`);
    history.push({ role: "user", content: prompt });
    history.push({ role: "assistant", content: `${payload.assistant?.content || "MoonAP generated a MoonBit artifact from your prompt."}\n\n${assistantSummary}` });
    setTaskStatus("Task completed. Ready for the next prompt.");
    return;
  }

  throw new Error(`MoonAP inferred the attached-file task "${taskDescriptor.id}", but its browser execution path is not implemented yet.`);
}

async function compileArtifactFromBrowser(prompt, artifact, noFallback = false, options = {}) {
  const mode = options.modeOverride || selectedMode;
  const fileInfo = options.fileInfoOverride || currentFileInfo;
  const analysis = Object.prototype.hasOwnProperty.call(options, "analysisOverride") ? options.analysisOverride : latestBrowserAnalysis;
  logProgress(`Submitting MoonBit artifact for ${noFallback ? "strict compile" : "compile with fallback"} on the server.`);
  const compileResponse = await fetch("/api/artifacts/compile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      selectedMode: mode,
      fileInfo,
      analysis,
      artifact,
      noFallback,
    }),
  });
  const payload = await compileResponse.json();
  if (!compileResponse.ok || !payload.ok) {
    logProgress(`Compile request failed: ${payload.error || "unknown compile error"}`);
    throw new Error(payload.error || "Browser-side remote artifact compile failed.");
  }
  logProgress("Server compile request returned successfully.");
  return payload;
}

async function browserCallRemoteModel({ messages, responseFormat = null }) {
  const llmConfig = getLlmConfig();
  const baseUrl = String(llmConfig.baseUrl || "").trim().replace(/\/?$/, "/");
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${llmConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: llmConfig.model,
      temperature: 0.2,
      messages,
      ...(responseFormat ? { response_format: responseFormat } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(`Browser-side remote request failed: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) {
    return content;
  }
  if (Array.isArray(content)) {
    return content.map((item) => item?.text || "").join("\n").trim();
  }
  throw new Error("Browser-side remote model returned an empty response.");
}

async function requestBrowserRemoteArtifact(prompt, options = {}) {
  const fileInfo = options.fileInfoOverride || currentFileInfo;
  const mode = inferRemoteArtifactMode(prompt, options.modeOverride || selectedMode, fileInfo);
  const analysis = Object.prototype.hasOwnProperty.call(options, "analysisOverride") ? options.analysisOverride : latestBrowserAnalysis;
  const extraRequirements = String(options.extraRequirements || "").trim();
  const artifactValidator = typeof options.artifactValidator === "function" ? options.artifactValidator : null;
  const systemPrompt = buildBrowserRemoteSystemPrompt(mode, prompt, fileInfo, extraRequirements);
  logProgress("Calling the browser-connected cloud LLM to generate a MoonBit artifact.");
  let content = await browserCallRemoteModel({
    responseFormat: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      ...history.map((item) => ({ role: item.role, content: item.content })),
      { role: "user", content: prompt },
    ],
  });

  let parsed = JSON.parse(extractJsonPayload(content));
  let payload = null;
  let repairCount = 0;

  while (repairCount < 3) {
    try {
      payload = await compileArtifactFromBrowser(prompt, parsed, true, {
        modeOverride: mode,
        fileInfoOverride: fileInfo,
        analysisOverride: analysis,
      });
      if (artifactValidator) {
        await artifactValidator(payload.artifact);
        logProgress("Validated attachment-task exports for browser-local analysis.");
      } else if (mode === "fastq-agent") {
        await validateFastqArtifactExports(payload.artifact);
        logProgress("Validated required FastQ Wasm exports for browser-local analysis.");
      }
      logProgress("Remote MoonBit artifact compiled successfully without fallback.");
      break;
    } catch (error) {
      repairCount += 1;
      logProgress(`Strict compile failed. Starting repair round ${repairCount}.`);
      if (repairCount >= 3) {
        payload = await compileArtifactFromBrowser(prompt, parsed, false, {
          modeOverride: mode,
          fileInfoOverride: fileInfo,
          analysisOverride: analysis,
        });
        logProgress("Strict compile still failed after repair rounds, so MoonAP requested compile with fallback.");
        break;
      }

      content = await browserCallRemoteModel({
        responseFormat: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: buildBrowserRepairPrompt(prompt, parsed, error.message, extraRequirements),
          },
        ],
        });
        logProgress(`Cloud LLM returned a repaired artifact for round ${repairCount}.`);
        parsed = JSON.parse(extractJsonPayload(content));
      }
    }

  return {
    mode: "analysis",
    experienceMode: `${mode}-browser-remote`,
    assistant: {
      role: "assistant",
      content: `MoonAP used your browser-connected LLM to generate a MoonBit artifact for ${mode}.${repairCount > 0 ? `\n\nrepair rounds: ${repairCount}` : ""}\n\n${summarizeArtifact(payload.artifact)}`,
    },
    artifact: {
      ...payload.artifact,
      adapter: payload.artifact?.adapter || "browser-remote-openai-compatible",
    },
    fileInfo,
    analysis,
  };
}

async function handleAttachedFastqPrompt(prompt) {
  if (!currentBrowserFile) {
    throw new Error("Attach a FastQ file first.");
  }
  if (!hasRemoteConfig()) {
    throw new Error("Attached-file analysis in chat mode needs a configured cloud LLM API. Configure LLM, or click SKILL and use the built-in FastQ workflow.");
  }
  const attachmentTask = inferAttachedTaskDescriptor(prompt, currentBrowserFile);
  if (!attachmentTask) {
    throw new Error("MoonAP could not infer a supported attached-file task from this prompt.");
  }

  currentFileInfo = attachmentTask.fileInfo;
  modeBadge.textContent = "mode: attached-fastq";
  experienceBadge.textContent = "workflow: attached-fastq -> moonbit-wasm";
  analysisOutput.textContent = "MoonAP is generating a MoonBit FastQ analyzer for the attached file...";
  logProgress(`Attached FastQ prompt detected for ${currentBrowserFile.name}.`);

  const payload = await requestBrowserRemoteArtifact(prompt, {
    modeOverride: attachmentTask.mode,
    fileInfoOverride: currentFileInfo,
    analysisOverride: null,
    extraRequirements: attachmentTask.extraRequirements,
    artifactValidator: attachmentTask.validateArtifact,
  });
  await executeAttachedTaskDescriptor(attachmentTask, prompt, payload);
}

async function requestBrowserRemoteChat(prompt) {
  logProgress("Calling the browser-connected cloud LLM for chat response.");
  const content = await browserCallRemoteModel({
    messages: [
      {
        role: "system",
        content: "You are MoonAP, a concise and practical assistant. Help in a chat style and guide users toward local-first analysis when files are involved.",
      },
      ...history.map((item) => ({ role: item.role, content: item.content })),
      { role: "user", content: prompt },
    ],
  });

  return {
    mode: "chat",
    experienceMode: "browser-remote-chat",
    assistant: {
      role: "assistant",
      content,
    },
    artifact: null,
    fileInfo: currentFileInfo,
    analysis: null,
  };
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
  populateArtifactPanel(payload.artifact, {
    benchmarkReport: payload.analysis?.benchmarkReport || latestBrowserAnalysis.benchmarkReport || "",
  });
  modeBadge.textContent = "mode: browser-analysis-wasm";
  experienceBadge.textContent = "workflow: browser-local-fastq -> moonbit-wasm";
  updateFastqActionState("artifact-ready");
  updatePipeline(latestWasmBase64 ? "build" : "artifact");
}

async function synthesizeFromBrowserAnalysis(prompt) {
  if (selectedMode === "fastq-agent") {
    if (!latestBrowserAnalysis) {
      throw new Error("Run Analyze In Browser before sending a FastQ request.");
    }
    return requestBrowserFastqArtifact(prompt, latestBrowserAnalysis);
  }

  if ((selectedMode === "moonbit-task" || selectedMode === "game-agent") && !hasRemoteConfig()) {
    throw new Error("This mode needs a configured cloud LLM API. Open the Skill Library for built-in skills, or add your API settings on the left.");
  }

  if (hasRemoteConfig()) {
    try {
      if (selectedMode === "moonbit-task" || selectedMode === "game-agent") {
        return await requestBrowserRemoteArtifact(prompt);
      }
      if (selectedMode === "chat" && /moonbit|wasm|webassembly|generate|workflow|code/i.test(prompt)) {
        return await requestBrowserRemoteArtifact(prompt);
      }
      return await requestBrowserRemoteChat(prompt);
    } catch (error) {
      addMessage("assistant", `Browser-side remote LLM failed, so MoonAP is retrying through the server path.\n\n${error.message}`);
    }
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

async function executeLatestWasm(auto = false) {
  if (!latestWasmBase64) return;
  runButton.disabled = true;
  runBadge.textContent = auto ? "wasm: auto-running" : "wasm: running";
  updatePipeline("run");
  logProgress(auto ? "Auto-running the generated Wasm artifact." : "Running the generated Wasm artifact.");
  try {
    const output = await runWasm(latestWasmBase64);
    const downloaded = maybeDownloadGeneratedOutputs(output, auto);
    if (downloaded.length) {
      renderGeneratedDownloads(downloaded);
      programOutput.textContent = [
        "MoonAP generated downloadable files from the Wasm app.",
        ...downloaded.map((item) => `- ${item}`),
        "",
        "The file content was not expanded in the UI.",
      ].join("\n");
    } else {
      programOutput.textContent = output || "(program completed with empty stdout)";
    }
    if (downloaded.length) {
      logProgress(`Wasm finished and produced downloadable file output: ${downloaded.join(", ")}.`);
      addMessage("assistant", `MoonAP downloaded generated file output from the Wasm app.\n\n${downloaded.map((item) => `- ${item}`).join("\n")}`);
    }
    if (!downloaded.length) {
      logProgress("Wasm finished and returned visible runtime output.");
    }
    runBadge.textContent = auto ? "wasm: auto-completed" : "wasm: completed";
    updatePipeline("run-complete");
  } catch (error) {
    programOutput.textContent = `runtime error: ${error.message}`;
    runBadge.textContent = "wasm: error";
    updatePipeline("build");
    logProgress(`Wasm runtime failed: ${error.message}`);
    throw error;
  } finally {
    runButton.disabled = false;
  }
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

  const missing = [
    "is_n_base",
    "is_gc_base",
    "is_sequence_state",
    "next_fastq_state",
    "accumulate_read_count",
    "accumulate_total_bases",
    "accumulate_n_bases",
    "accumulate_gc_bases",
    "update_longest_read",
    "update_shortest_read",
  ].filter((name) => typeof exports[name] !== "function");

  if (missing.length) {
    throw new Error(`The generated Wasm artifact does not expose FastQ analysis functions: ${missing.join(", ")}`);
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
  latestArtifact = null;
  latestGeneratedDownloads = [];
  downloadedArtifactSignature = "";
  progressLogEntries = [];
  renderProgressLog();
  analysisOutput.textContent = "No local analysis was run for this message.";
  renderGeneratedDownloads([]);
  artifactTitle.textContent = "No report app generated";
  artifactSummary.textContent = "Chat mode stays conversational. Switch to MoonBit Builder, FastQ Analyst, or Game Studio to produce executable MoonBit apps.";
  artifactWarning.textContent = "";
  codeOutput.textContent = "// report app generation is idle in chat mode";
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
  if (!latestBrowserAnalysis) {
    showInspector(false);
  }
}

async function sendPrompt(prompt) {
  logProgress(`Started request in mode ${selectedMode}.`);
  const payload = await synthesizeFromBrowserAnalysis(prompt);

  addMessage("assistant", payload.assistant.content);
  history.push({ role: "user", content: prompt });
  history.push({ role: "assistant", content: payload.assistant.content });
  currentFileInfo = payload.fileInfo || currentFileInfo;
  modeBadge.textContent = `mode: ${payload.mode || "chat"}`;
  experienceBadge.textContent = `workflow: ${payload.experienceMode || selectedMode}`;

  if (!payload.artifact) {
    adapterBadge.textContent = getLlmConfig().baseUrl ? "adapter: remote-chat" : "adapter: local-chat";
    logProgress("Completed as a chat response without a MoonBit artifact.");
    resetArtifactPanelForChat();
    setTaskStatus("Task completed. Ready for the next prompt.");
    return;
  }

  adapterBadge.textContent = `adapter: ${payload.artifact.adapter || "local-artifact"}`;
  logProgress(`Received MoonBit artifact "${payload.artifact.title || "Generated MoonBit Program"}".`);
  analysisOutput.textContent = payload.analysis?.summary || "No local analysis summary.";
  populateArtifactPanel(payload.artifact, payload.analysis);
  updatePipeline(latestWasmBase64 ? "build" : "artifact");

  if (latestWasmBase64 && selectedMode !== "fastq-agent") {
    try {
      await executeLatestWasm(true);
    } catch (error) {
      logProgress(`Auto-run after generation failed: ${error.message}`);
      addMessage("assistant", `MoonAP generated the Wasm app, but auto-run failed: ${error.message}`);
    }
  }

  setTaskStatus("Task completed. Ready for the next prompt.");
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
    sendButton.textContent = "Working...";
    modeBadge.textContent = "mode: sending";
    logProgress(`User submitted prompt: ${prompt}`);
    try {
      const fastqSampleRequest = parseFastqSampleRequest(prompt);
      if (fastqSampleRequest && !hasRemoteConfig()) {
        await handleFastqSampleRequest(prompt, fastqSampleRequest);
        return;
      }
      const attachedTask = currentBrowserFile ? inferAttachedTaskDescriptor(prompt, currentBrowserFile) : null;
      if (attachedTask) {
        if (!hasRemoteConfig()) {
          throw new Error("This attached-file task needs a configured cloud LLM API. If you want a ready-made path without LLM, click SKILL and use a built-in workflow.");
        }
        if (attachedTask.id === "fastq-analysis") {
          await handleAttachedFastqPrompt(prompt);
          return;
        }
        throw new Error(`MoonAP recognized an attached-file task (${attachedTask.id}), but that execution path is not implemented yet.`);
        return;
      }
      await sendPrompt(prompt);
    } catch (error) {
      logProgress(`Request failed: ${error.message}`);
      addMessage("assistant", `Request failed: ${error.message}`);
    modeBadge.textContent = "mode: error";
    adapterBadge.textContent = "adapter: error";
    runBadge.textContent = "wasm: failed";
    setTaskStatus(`Task failed: ${error.message}`);
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = "Send";
    }
  });

attachFileButton.addEventListener("click", () => {
  browserFileInput.click();
});

  browserFileInput.addEventListener("change", () => {
  currentBrowserFile = browserFileInput.files?.[0] || null;
  latestBrowserAnalysis = null;
  latestWasmBase64 = "";
  renderBrowserFileInfo(currentBrowserFile);
    updateFastqActionState(currentBrowserFile ? "ready-to-analyze" : "choose-file");
    analysisOutput.textContent = currentBrowserFile
      ? "File attached. Send a FastQ analysis prompt, or open the FastQ skill workflow if you want to run the built-in path."
      : "No local analysis yet.";
    if (currentBrowserFile) {
      logProgress(`Selected local browser file ${currentBrowserFile.name} (${currentBrowserFile.size} bytes).`);
    } else {
      setTaskStatus("Ready for the next prompt.");
    }
  });

analyzeBrowserFileButton.addEventListener("click", async () => {
  if (!currentBrowserFile) {
    addMessage("assistant", "Please choose a browser-local FastQ file first.");
    return;
  }

    analyzeBrowserFileButton.disabled = true;
    modeBadge.textContent = "mode: browser-analyzing";
    updateFastqActionState("analyzing");
    logProgress(`Starting browser-local FastQ analysis for ${currentBrowserFile.name}.`);
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
      logProgress(`Browser-local FastQ analysis completed for ${currentBrowserFile.name}.`);
    analysisOutput.textContent = result.summary;
    renderBenchmarkProfile(result.benchmarkProfile);
    renderBenchmarkReport(result.benchmarkReport);
    showInspector(true);
    addMessage("assistant", `MoonBit Wasm analyzed ${currentBrowserFile.name} in the browser.\n\n${result.summary}`);
    modeBadge.textContent = "mode: browser-analysis";
    experienceBadge.textContent = "workflow: browser-local-fastq";
    updateFastqActionState("analyzed");
    updatePipeline("build");
    } catch (error) {
      logProgress(`Browser-local FastQ analysis failed: ${error.message}`);
      addMessage("assistant", `Browser-local analysis failed: ${error.message}`);
    modeBadge.textContent = "mode: error";
    updateFastqActionState(currentBrowserFile ? "ready-to-analyze" : "choose-file");
  } finally {
    analyzeBrowserFileButton.disabled = false;
  }
});

  buildBrowserWasmButton.addEventListener("click", async () => {
    buildBrowserWasmButton.disabled = true;
    logProgress("Starting FastQ report app generation from the current browser analysis.");
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
      updateFastqActionState("artifact-ready");
    } catch (error) {
      logProgress(`FastQ report app generation failed: ${error.message}`);
      addMessage("assistant", `Browser-analysis Wasm build failed: ${error.message}`);
    modeBadge.textContent = "mode: error";
    updateFastqActionState(latestBrowserAnalysis ? "analyzed" : currentBrowserFile ? "ready-to-analyze" : "choose-file");
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
  updateFastqActionState("choose-file");
  analysisOutput.textContent = "No local analysis yet.";
  renderGeneratedDownloads([]);
  renderTaskKernelProtocol(null);
  renderBenchmarkProfile(null);
  renderBenchmarkReport("");
  showInspector(false);
  setTaskStatus("Ready for the next prompt.");
  addMessage("assistant", "Cleared the current local file context.");
});

saveSettingsButton.addEventListener("click", () => {
  saveLlmConfig();
  llmSettingsDialog.close();
  logProgress("Saved browser-local LLM API settings.");
  addMessage("assistant", "Saved the current LLM API settings for this browser.");
});

runButton.addEventListener("click", async () => {
  if (!latestWasmBase64) return;
  try {
    await executeLatestWasm(false);
  } catch (error) {
    programOutput.textContent = `runtime error: ${error.message}`;
  }
});

seedAnalysisButton.addEventListener("click", () => {
  setMode("fastq-agent");
  promptInput.value = "Please analyze this FastQ file, count N bases, compute the ratio, and generate a MoonBit demo program.";
  promptInput.focus();
});

document.querySelectorAll("[data-mode].rail-button, [data-mode].rail-brand").forEach((button) => {
  button.addEventListener("click", () => {
    setMode(button.dataset.mode || "chat");
    if ((button.dataset.mode || "chat") === "chat") {
      promptInput.focus();
    }
  });
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
    applyPreset(button.dataset.preset, true);
  });
});

surfaceTabs.forEach((button) => {
  button.addEventListener("click", () => {
    selectedSurface = button.dataset.surface || "chat";
    syncSurfaceTabs();
    if (selectedSurface === "chat") {
      setMode("chat");
      return;
    }
    if (selectedMode === "chat") {
      setMode("fastq-agent");
    }
  });
});

workbenchTabs.forEach((button) => {
  button.addEventListener("click", () => {
    selectedWorkbench = button.dataset.workbench || "results";
    syncWorkbenchTabs();
  });
});

openSkillLibraryButton.addEventListener("click", () => {
  skillLibraryDialog.showModal();
});

openSkillLibrarySecondaryButton.addEventListener("click", () => {
  skillLibraryDialog.showModal();
});

openSettingsButton.addEventListener("click", () => {
  llmSettingsDialog.showModal();
});

openSettingsButtonSecondary.addEventListener("click", () => {
  llmSettingsDialog.showModal();
});

closeSettingsButton.addEventListener("click", () => {
  llmSettingsDialog.close();
});

openInspectorButton.addEventListener("click", () => {
  showInspector(inspectorShell.classList.contains("hidden"));
});

if (openProgressButtonSecondary) {
  openProgressButtonSecondary.addEventListener("click", () => {
    openProgressInspector();
  });
}

if (quickSkillButton) {
  quickSkillButton.addEventListener("click", () => {
    skillLibraryDialog.showModal();
  });
}

if (quickApiButton) {
  quickApiButton.addEventListener("click", () => {
    llmSettingsDialog.showModal();
  });
}

closeSkillLibraryButton.addEventListener("click", () => {
  skillLibraryDialog.close();
});

skillLibraryGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-skill-id]");
  if (!button) return;
  const skill = BUILTIN_SKILLS.find((item) => item.id === button.dataset.skillId);
  if (!skill) return;
  setMode(skill.mode);
  promptInput.value = skill.prompt;
  promptInput.focus();
  skillLibraryDialog.close();
});

loadLlmConfig();
renderSkillLibrary();
setMode(selectedMode);
renderBrowserFileInfo(null);
updateFastqActionState("choose-file");
syncWorkbenchTabs();
resetArtifactPanelForChat();
syncEmptyState();
refreshHealth();
updateApiBanner();
showInspector(false);
renderProgressLog();
