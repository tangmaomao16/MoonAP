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
const filePathInput = document.getElementById("file-path-input");
const fileSummary = document.getElementById("file-summary");
const analysisOutput = document.getElementById("analysis-output");
const codeOutput = document.getElementById("code-output");
const programOutput = document.getElementById("program-output");
const buildLog = document.getElementById("build-log");
const artifactTitle = document.getElementById("artifact-title");
const artifactSummary = document.getElementById("artifact-summary");
const artifactWarning = document.getElementById("artifact-warning");
const modeBadge = document.getElementById("mode-badge");
const adapterBadge = document.getElementById("adapter-badge");
const runBadge = document.getElementById("run-badge");
const llmBaseUrl = document.getElementById("llm-base-url");
const llmApiKey = document.getElementById("llm-api-key");
const llmModel = document.getElementById("llm-model");

let history = [];
let latestWasmBase64 = "";
let currentFileInfo = null;

function addMessage(role, content) {
  const wrapper = document.createElement("article");
  wrapper.className = `message ${role}`;
  wrapper.textContent = content;
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
}

function getLlmConfig() {
  return {
    baseUrl: llmBaseUrl.value.trim(),
    apiKey: llmApiKey.value.trim(),
    model: llmModel.value.trim(),
  };
}

function saveLlmConfig() {
  localStorage.setItem("moonap.llm.baseUrl", llmBaseUrl.value);
  localStorage.setItem("moonap.llm.apiKey", llmApiKey.value);
  localStorage.setItem("moonap.llm.model", llmModel.value);
}

function loadLlmConfig() {
  llmBaseUrl.value = localStorage.getItem("moonap.llm.baseUrl") || "";
  llmApiKey.value = localStorage.getItem("moonap.llm.apiKey") || "";
  llmModel.value = localStorage.getItem("moonap.llm.model") || "";
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
    spectest: { print_char(value) { collected.push(String.fromCharCode(Number(value))); } },
  });
  if (typeof module.instance.exports._start !== "function") throw new Error("The generated wasm file does not export _start.");
  module.instance.exports._start();
  return collected.join("");
}

function resetArtifactPanelForChat() {
  analysisOutput.textContent = "No local analysis was run for this message.";
  artifactTitle.textContent = "No artifact generated";
  artifactSummary.textContent = "Chat mode stays conversational. Attach a local file and ask for analysis to trigger MoonBit and Wasm.";
  artifactWarning.textContent = "";
  codeOutput.textContent = "// artifact generation is idle in chat mode";
  buildLog.textContent = "No MoonBit build was run for this message.";
  programOutput.textContent = "waiting for wasm...";
  runButton.disabled = true;
  latestWasmBase64 = "";
  runBadge.textContent = "wasm: idle";
}

async function sendPrompt(prompt) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: prompt,
      history,
      filePath: filePathInput.value.trim(),
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
  buildLog.textContent = payload.artifact.buildLog || "moon build finished without extra logs.";
  latestWasmBase64 = payload.artifact.wasmBase64 || "";
  runButton.disabled = !latestWasmBase64;
  runBadge.textContent = latestWasmBase64 ? "wasm: ready" : "wasm: idle";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const prompt = promptInput.value.trim();
  if (!prompt) return;
  addMessage("user", prompt);
  promptInput.value = "";
  sendButton.disabled = true;
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
  addMessage("assistant", "Saved the current LLM settings for this browser.");
});

runButton.addEventListener("click", async () => {
  if (!latestWasmBase64) return;
  runButton.disabled = true;
  runBadge.textContent = "wasm: running";
  try {
    const output = await runWasm(latestWasmBase64);
    programOutput.textContent = output || "(program completed with empty stdout)";
    runBadge.textContent = "wasm: completed";
  } catch (error) {
    programOutput.textContent = `runtime error: ${error.message}`;
    runBadge.textContent = "wasm: error";
  } finally {
    runButton.disabled = false;
  }
});

seedChatButton.addEventListener("click", () => {
  promptInput.value = "Help me design a local-first workflow for large FastQ quality analysis.";
  promptInput.focus();
});

seedAnalysisButton.addEventListener("click", () => {
  promptInput.value = "Please analyze this FastQ file, count N bases, compute the ratio, and generate a MoonBit demo program.";
  promptInput.focus();
});

loadLlmConfig();
renderFileInfo(null);
resetArtifactPanelForChat();
addMessage("assistant", "MoonAP is ready. Chat normally here, or attach a local file and ask for analysis to trigger the MoonBit to Wasm workflow.");
