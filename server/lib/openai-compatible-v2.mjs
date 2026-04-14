import { resolveModelConfig } from "./config.mjs";

const RETRYABLE_REMOTE_CODES = ["1234", "1312"];
const ZAI_GENERAL_ENDPOINT = "https://api.z.ai/api/paas/v4/";
const ZAI_CODING_ENDPOINT = "https://api.z.ai/api/coding/paas/v4/";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeBaseUrl(baseUrl) {
  return String(baseUrl || "").trim().replace(/\/?$/, "/");
}

function selectBaseUrl(baseUrl, purpose = "chat") {
  const normalized = normalizeBaseUrl(baseUrl);
  if (!normalized) return normalized;
  if (purpose === "codegen" && normalized === ZAI_GENERAL_ENDPOINT) {
    return ZAI_CODING_ENDPOINT;
  }
  return normalized;
}

function parseRemoteErrorMessage(message) {
  const text = String(message || "");
  const codeMatch = text.match(/"code":"?(\d+)"?/);
  return {
    message: text,
    code: codeMatch?.[1] || "",
  };
}

function extractJson(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1];
  const objectMatch = text.match(/\{[\s\S]*\}/);
  return objectMatch ? objectMatch[0] : text;
}

function normalizeMessageContent(content) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item.text === "string") return item.text;
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }

  return String(content || "").trim();
}

async function requestChatCompletions({ messages, llmConfig, responseFormat, purpose = "chat" }) {
  const { baseUrl, apiKey, model } = resolveModelConfig(llmConfig);
  const resolvedBaseUrl = selectBaseUrl(baseUrl, purpose);
  const response = await fetch(`${resolvedBaseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages,
      ...(responseFormat ? { response_format: responseFormat } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(`Remote model request failed: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json();
  const content = normalizeMessageContent(payload?.choices?.[0]?.message?.content);
  if (!content) {
    throw new Error("Remote model returned an empty response.");
  }
  return content;
}

async function callChatCompletions({ messages, llmConfig, responseFormat, purpose = "chat" }) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await requestChatCompletions({ messages, llmConfig, responseFormat, purpose });
    } catch (error) {
      const { message, code } = parseRemoteErrorMessage(error instanceof Error ? error.message : String(error));
      const likelyFormatIssue =
        Boolean(responseFormat) &&
        (message.includes("response_format") ||
          message.includes("json_object") ||
          message.includes("400") ||
          message.includes("422"));

      if (likelyFormatIssue) {
        return requestChatCompletions({ messages, llmConfig, responseFormat: null, purpose });
      }

      const retryable = RETRYABLE_REMOTE_CODES.includes(code);
      if (!retryable || attempt === 2) {
        throw error;
      }

      await sleep(600 * (attempt + 1));
    }
  }
}

function sanitizeFilePath(value, fallback = "cmd/main/main.mbt") {
  const raw = String(value || "").replaceAll("\\", "/").trim();
  if (!raw || raw.startsWith("/") || raw.includes("..")) {
    return fallback;
  }
  return raw;
}

function normalizeSourceFiles(sourceFiles, fallbackMain) {
  const normalized = [];
  const seen = new Set();

  for (const file of Array.isArray(sourceFiles) ? sourceFiles : []) {
    if (!file || typeof file !== "object") continue;
    const path = sanitizeFilePath(file.path, "");
    const content = typeof file.content === "string" ? file.content : "";
    if (!path || !content.trim()) continue;
    if (seen.has(path)) continue;
    seen.add(path);
    normalized.push({ path, content });
  }

  const mainIndex = normalized.findIndex((file) => file.path === "cmd/main/main.mbt");
  if (mainIndex === -1) {
    normalized.unshift({ path: "cmd/main/main.mbt", content: fallbackMain });
  } else if (!normalized[mainIndex].content.trim() && fallbackMain.trim()) {
    normalized[mainIndex].content = fallbackMain;
  }

  return normalized;
}

function normalizeVerificationGate(checks) {
  return (Array.isArray(checks) ? checks : [])
    .filter((check) => check && typeof check === "object")
    .map((check, index) => ({
      name: String(check.name || `remote-check-${index + 1}`).trim(),
      level: String(check.level || "Contract").trim(),
      passed: check.passed !== false,
      detail: String(check.detail || "Remote model supplied this validation checkpoint.").trim(),
    }));
}

function normalizeSkills(skills) {
  return (Array.isArray(skills) ? skills : [])
    .filter((skill) => skill && typeof skill === "object")
    .map((skill) => ({
      name: String(skill.name || "generated-skill").trim(),
      category: String(skill.category || "agent").trim(),
      summary: String(skill.summary || "Generated by the remote MoonAP model.").trim(),
      reusable: skill.reusable !== false,
    }));
}

function normalizeTaskKernelProtocol(protocol, expectedProtocol) {
  const source = protocol && typeof protocol === "object" ? protocol : {};
  if (!expectedProtocol) {
    return Object.keys(source).length > 0 ? {
      protocolName: String(source.protocolName || "moonap.workflow.whole-file.v1").trim(),
      inputMode: String(source.inputMode || "whole-file-text").trim(),
      stateType: String(source.stateType || "WorkflowTaskState").trim(),
      initFn: String(source.initFn || "init_state").trim(),
      ingestFn: String(source.ingestFn || "ingest_input").trim(),
      finalizeFn: String(source.finalizeFn || "finalize_result").trim(),
      hostResponsibilities: Array.isArray(source.hostResponsibilities) ? source.hostResponsibilities.map((item) => String(item).trim()).filter(Boolean) : [],
      kernelResponsibilities: Array.isArray(source.kernelResponsibilities) ? source.kernelResponsibilities.map((item) => String(item).trim()).filter(Boolean) : [],
    } : null;
  }

  return {
    ...expectedProtocol,
    hostResponsibilities: Array.isArray(source.hostResponsibilities) && source.hostResponsibilities.length > 0
      ? source.hostResponsibilities.map((item) => String(item).trim()).filter(Boolean)
      : expectedProtocol.hostResponsibilities,
    kernelResponsibilities: Array.isArray(source.kernelResponsibilities) && source.kernelResponsibilities.length > 0
      ? source.kernelResponsibilities.map((item) => String(item).trim()).filter(Boolean)
      : expectedProtocol.kernelResponsibilities,
  };
}

function buildProjectManifest(sourceFiles, projectManifest, verificationGate, skills, taskKernelProtocol) {
  const manifest = projectManifest && typeof projectManifest === "object" ? projectManifest : {};
  const projectFiles = sourceFiles.map((file) => ({
    path: file.path,
    purpose: file.path === "cmd/main/main.mbt" ? "entrypoint" : "generated source file",
    language: file.path.endsWith(".mbt") ? "moonbit" : file.path.endsWith(".json") ? "json" : "text",
    generated: true,
  }));

  return {
    packageName: String(manifest.packageName || "moonap/generated_remote").trim(),
    entrypoint: String(manifest.entrypoint || "cmd/main/main.mbt").trim(),
    runtimeTarget: String(manifest.runtimeTarget || "wasm").trim(),
    projectFiles,
    verificationGate,
    skills,
    taskKernelProtocol,
  };
}

function coerceRemoteArtifact(parsed, expectedProtocol = null) {
  const fallbackMain = typeof parsed?.moonbitCode === "string" && parsed.moonbitCode.trim()
    ? parsed.moonbitCode
    : "fn main {\n  println(\"MoonAP generated a placeholder program\")\n}";

  const sourceFiles = normalizeSourceFiles(parsed?.sourceFiles, fallbackMain);
  const mainFile = sourceFiles.find((file) => file.path === "cmd/main/main.mbt");
  const moonbitCode = mainFile?.content || fallbackMain;
  const verificationGate = normalizeVerificationGate(parsed?.verificationGate);
  const skills = normalizeSkills(parsed?.skills);
  const taskKernelProtocol = normalizeTaskKernelProtocol(parsed?.taskKernelProtocol, expectedProtocol);
  const projectManifest = buildProjectManifest(sourceFiles, parsed?.projectManifest, verificationGate, skills, taskKernelProtocol);

  return {
    title: String(parsed?.title || "Generated MoonBit Program").trim(),
    summary: String(parsed?.summary || "Generated MoonBit code from the remote model.").trim(),
    moonbitCode,
    sourceFiles,
    projectManifest,
    skills,
    verificationGate,
    taskKernelProtocol,
  };
}

function validateRemoteArtifact(artifact, expectedProtocol = null) {
  if (!artifact.moonbitCode || !artifact.moonbitCode.trim()) {
    throw new Error("Remote model response did not include a valid main MoonBit program.");
  }
  if (!Array.isArray(artifact.sourceFiles) || artifact.sourceFiles.length === 0) {
    throw new Error("Remote model response did not include sourceFiles.");
  }
  if (!artifact.sourceFiles.some((file) => file.path === "cmd/main/main.mbt")) {
    throw new Error("Remote model response did not include cmd/main/main.mbt.");
  }
  if (expectedProtocol && artifact.taskKernelProtocol?.protocolName !== expectedProtocol.protocolName) {
    throw new Error(`Remote model protocol mismatch: expected ${expectedProtocol.protocolName}.`);
  }
}

function buildProtocolAwareSystemPrompt(protocol = null) {
  const requiredKeys = [
    "title",
    "summary",
    "moonbitCode",
    "sourceFiles",
    "projectManifest",
    "skills",
    "verificationGate",
    "taskKernelProtocol",
  ];

  const protocolBlock = protocol
    ? [
        `Target task kernel protocol: ${protocol.protocolName}`,
        `input mode: ${protocol.inputMode}`,
        `state type: ${protocol.stateType}`,
        `init function: ${protocol.initFn}`,
        `ingest function: ${protocol.ingestFn}`,
        `finalize function: ${protocol.finalizeFn}`,
        `host responsibilities: ${protocol.hostResponsibilities.join("; ")}`,
        `kernel responsibilities: ${protocol.kernelResponsibilities.join("; ")}`,
      ].join("\n")
    : "No explicit task kernel protocol was provided. Use a whole-file MoonBit workflow artifact.";

  return [
    "You are MoonAP, an expert MoonBit code generator.",
    `Return strict JSON with keys: ${requiredKeys.join(", ")}.`,
    "sourceFiles is required and must be an array of { path, content } objects.",
    "cmd/main/main.mbt must exist in sourceFiles.",
    "Prefer a single-package project rooted at cmd/main whenever possible.",
    "If you create extra package directories such as lib or runtime, each directory with .mbt files must be a valid MoonBit package and imports must match those directory names.",
    "Do not reference packages like @lib unless matching source files exist in that package directory.",
    "moonbitCode must still be present and match the main entry program.",
    "projectManifest must describe the synthesized multi-file MoonBit project.",
    "verificationGate must be an array of checks with name, level, passed, detail.",
    "skills must be an array of reusable skill records.",
    "taskKernelProtocol must be present and must match the requested protocol exactly when one is provided.",
    "Generate MoonBit code that follows the protocol lifecycle: init -> ingest -> finalize.",
    "Prefer simple MoonBit 0.9-compatible code. Avoid StringView replace calls such as raw.trim().replace(...); use raw.trim().to_string() or other clearly compatible forms.",
    "Do not return markdown fences or explanations outside the JSON object.",
    protocolBlock,
  ].join("\n");
}

function buildRepairPrompt(content, error, protocol = null) {
  return [
    "Repair the previous MoonAP JSON response.",
    "Return only strict JSON.",
    `Problem: ${error.message}`,
    protocol ? `Required protocol: ${protocol.protocolName}` : "No explicit protocol required.",
    "Previous response:",
    content,
  ].join("\n\n");
}

async function requestMoonBitArtifact(prompt, history, llmConfig, protocol = null) {
  return callChatCompletions({
    llmConfig,
    purpose: "codegen",
    responseFormat: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: buildProtocolAwareSystemPrompt(protocol),
      },
      ...history.map((item) => ({ role: item.role, content: item.content })),
      { role: "user", content: prompt },
    ],
  });
}

export async function generateTextReply(prompt, history = [], llmConfig = {}) {
  const content = await callChatCompletions({
    llmConfig,
    purpose: "chat",
    messages: [
      {
        role: "system",
        content:
          "You are MoonAP, a concise and practical assistant. Help in a chat style, and guide users toward local-first analysis when files are involved.",
      },
      ...history.map((item) => ({ role: item.role, content: item.content })),
      { role: "user", content: prompt },
    ],
  });
  return String(content).trim();
}

export async function generateMoonBitProgram(prompt, history = [], llmConfig = {}, protocol = null) {
  let content = await requestMoonBitArtifact(prompt, history, llmConfig, protocol);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const parsed = JSON.parse(extractJson(content));
      const artifact = coerceRemoteArtifact(parsed, protocol);
      validateRemoteArtifact(artifact, protocol);
      return artifact;
    } catch (error) {
      if (attempt === 1) {
        throw error;
      }

      content = await callChatCompletions({
        llmConfig,
        purpose: "codegen",
        responseFormat: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: buildProtocolAwareSystemPrompt(protocol),
          },
          {
            role: "user",
            content: buildRepairPrompt(content, error instanceof Error ? error : new Error(String(error)), protocol),
          },
        ],
      });
    }
  }

  throw new Error("Remote model repair loop did not return a valid MoonBit artifact.");
}
