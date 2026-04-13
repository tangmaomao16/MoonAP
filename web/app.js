const form = document.getElementById("chat-form");
const input = document.getElementById("prompt-input");
const messages = document.getElementById("messages");
const codeOutput = document.getElementById("code-output");
const programOutput = document.getElementById("program-output");
const buildLog = document.getElementById("build-log");
const artifactTitle = document.getElementById("artifact-title");
const artifactSummary = document.getElementById("artifact-summary");
const artifactWarning = document.getElementById("artifact-warning");
const adapterBadge = document.getElementById("adapter-badge");
const runBadge = document.getElementById("run-badge");
const runButton = document.getElementById("run-button");
const seedButton = document.getElementById("seed-demo");
const sendButton = document.getElementById("send-button");
const filePathInput = document.getElementById("file-path-input");
const inspectFileButton = document.getElementById("inspect-file-button");
const fileSummary = document.getElementById("file-summary");
const analysisOutput = document.getElementById("analysis-output");

let history = [];
let latestWasmBase64 = "";
let currentFileInfo = null;

function addMessage(role, content) {
  const node = document.createElement("article");
  node.className = `message ${role}`;
  node.textContent = content;
  messages.appendChild(node);
  messages.scrollTop = messages.scrollHeight;
}

function renderFileInfo(fileInfo) {
  if (!fileInfo) {
    fileSummary.innerHTML = "<p>尚未选择文件。</p>";
    return;
  }

  fileSummary.innerHTML = `
    <p><strong>路径：</strong>${fileInfo.path}</p>
    <p><strong>类型：</strong>${fileInfo.detectedType}</p>
    <p><strong>大小：</strong>${fileInfo.sizeBytes} bytes</p>
    <p><strong>预览：</strong></p>
    <pre>${fileInfo.previewLines.join("\n") || "(empty preview)"}</pre>
  `;
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

async function inspectFile() {
  const filePath = filePathInput.value.trim();
  if (!filePath) {
    throw new Error("请先输入本地文件路径。");
  }

  inspectFileButton.disabled = true;
  const response = await fetch("/api/files/inspect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path: filePath }),
  });

  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Unable to inspect file.");
  }

  currentFileInfo = payload.fileInfo;
  renderFileInfo(currentFileInfo);
}

async function generate(prompt) {
  const filePath = filePathInput.value.trim();
  sendButton.disabled = true;
  runButton.disabled = true;
  adapterBadge.textContent = "adapter: generating";
  runBadge.textContent = "wasm: compiling";
  artifactWarning.textContent = "";

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: prompt,
      history,
      filePath,
    }),
  });

  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Unknown server error");
  }

  const { assistant, artifact, analysis, fileInfo } = payload;
  addMessage("assistant", assistant.content);
  history.push({ role: "user", content: prompt });
  history.push({ role: "assistant", content: assistant.content });

  currentFileInfo = fileInfo || currentFileInfo;
  renderFileInfo(currentFileInfo);

  artifactTitle.textContent = artifact.title;
  artifactSummary.textContent = artifact.summary;
  artifactWarning.textContent = artifact.warning;
  codeOutput.textContent = artifact.moonbitCode;
  buildLog.textContent = artifact.buildLog || "moon build finished without extra logs.";
  analysisOutput.textContent = analysis?.summary || "No local analysis was run for this request.";
  adapterBadge.textContent = `adapter: ${artifact.adapter}`;
  runBadge.textContent = "wasm: ready";
  latestWasmBase64 = artifact.wasmBase64;
  runButton.disabled = false;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const prompt = input.value.trim();
  if (!prompt) {
    return;
  }

  addMessage("user", prompt);
  input.value = "";
  programOutput.textContent = "waiting for wasm...";

  try {
    await generate(prompt);
  } catch (error) {
    addMessage("assistant", `生成失败：${error.message}`);
    adapterBadge.textContent = "adapter: error";
    runBadge.textContent = "wasm: failed";
  } finally {
    sendButton.disabled = false;
  }
});

inspectFileButton.addEventListener("click", async () => {
  try {
    await inspectFile();
    addMessage(
      "assistant",
      `我已经读取文件信息：${currentFileInfo.path}。现在你可以继续要求我做 FastQ、CSV、JSON 或通用文本分析。`,
    );
  } catch (error) {
    addMessage("assistant", `读取文件失败：${error.message}`);
  } finally {
    inspectFileButton.disabled = false;
  }
});

runButton.addEventListener("click", async () => {
  if (!latestWasmBase64) {
    return;
  }

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

seedButton.addEventListener("click", () => {
  input.value = "请统计这个 FastQ 文件中 N 碱基的个数和比例，并给我一段对应的 MoonBit 示例程序。";
  input.focus();
});

addMessage(
  "assistant",
  "欢迎来到 MoonAP。你可以先填入一个本地文件路径读取上下文，然后用自然语言让我做真实分析，并生成对应的 MoonBit / Wasm 演示程序。",
);
