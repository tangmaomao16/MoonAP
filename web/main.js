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

let history = [];
let latestWasmBase64 = "";

function addMessage(role, content) {
  const node = document.createElement("article");
  node.className = `message ${role}`;
  node.textContent = content;
  messages.appendChild(node);
  messages.scrollTop = messages.scrollHeight;
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

async function generate(prompt) {
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
    }),
  });

  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Unknown server error");
  }

  const { assistant, artifact } = payload;
  addMessage("assistant", assistant.content);
  history.push({ role: "user", content: prompt });
  history.push({ role: "assistant", content: assistant.content });

  artifactTitle.textContent = artifact.title;
  artifactSummary.textContent = artifact.summary;
  artifactWarning.textContent = artifact.warning;
  codeOutput.textContent = artifact.moonbitCode;
  buildLog.textContent = artifact.buildLog || "moon build finished without extra logs.";
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
  input.value = "请帮我写一个 MoonBit 程序，计算 1 到 20 的和，并输出结果。";
  input.focus();
});

addMessage(
  "assistant",
  "欢迎来到 MoonAP。你描述一个需求，我会生成 MoonBit 代码，编译成 WebAssembly，并让你在浏览器里直接运行它。",
);
