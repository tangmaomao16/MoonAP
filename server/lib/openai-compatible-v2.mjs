import { resolveModelConfig } from "./config.mjs";

function extractJson(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1];
  const objectMatch = text.match(/\{[\s\S]*\}/);
  return objectMatch ? objectMatch[0] : text;
}

async function callChatCompletions({ messages, llmConfig, responseFormat }) {
  const { baseUrl, apiKey, model } = resolveModelConfig(llmConfig);
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
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
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Remote model returned an empty response.");
  }
  return content;
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
    "moonbitCode must still be present and match the main entry program.",
    "projectManifest must describe the synthesized multi-file MoonBit project.",
    "taskKernelProtocol must be present and must match the requested protocol exactly when one is provided.",
    "Generate MoonBit code that follows the protocol lifecycle: init -> ingest -> finalize.",
    "Do not return markdown fences or explanations outside the JSON object.",
    protocolBlock,
  ].join("\n");
}

export async function generateTextReply(prompt, history = [], llmConfig = {}) {
  const content = await callChatCompletions({
    llmConfig,
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
  const content = await callChatCompletions({
    llmConfig,
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

  const parsed = JSON.parse(extractJson(content));
  if (!parsed.moonbitCode) {
    throw new Error("Remote model response did not include moonbitCode.");
  }
  if (!Array.isArray(parsed.sourceFiles) || parsed.sourceFiles.length === 0) {
    throw new Error("Remote model response did not include sourceFiles.");
  }
  if (!parsed.taskKernelProtocol || typeof parsed.taskKernelProtocol !== "object") {
    throw new Error("Remote model response did not include taskKernelProtocol.");
  }

  return {
    title: parsed.title || "Generated MoonBit Program",
    summary: parsed.summary || "Generated MoonBit code from the remote model.",
    moonbitCode: parsed.moonbitCode,
    sourceFiles: Array.isArray(parsed.sourceFiles) ? parsed.sourceFiles : undefined,
    projectManifest: parsed.projectManifest && typeof parsed.projectManifest === "object" ? parsed.projectManifest : undefined,
    skills: Array.isArray(parsed.skills) ? parsed.skills : undefined,
    verificationGate: Array.isArray(parsed.verificationGate) ? parsed.verificationGate : undefined,
    taskKernelProtocol: parsed.taskKernelProtocol && typeof parsed.taskKernelProtocol === "object" ? parsed.taskKernelProtocol : undefined,
  };
}
