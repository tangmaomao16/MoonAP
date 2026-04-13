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

export async function generateMoonBitProgram(prompt, history = [], llmConfig = {}) {
  const content = await callChatCompletions({
    llmConfig,
    responseFormat: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are MoonAP, an expert MoonBit code generator. Return strict JSON with keys: title, summary, moonbitCode. moonbitCode must compile as cmd/main/main.mbt and include fn main { ... }.",
      },
      ...history.map((item) => ({ role: item.role, content: item.content })),
      { role: "user", content: prompt },
    ],
  });

  const parsed = JSON.parse(extractJson(content));
  if (!parsed.moonbitCode) {
    throw new Error("Remote model response did not include moonbitCode.");
  }

  return {
    title: parsed.title || "Generated MoonBit Program",
    summary: parsed.summary || "Generated MoonBit code from the remote model.",
    moonbitCode: parsed.moonbitCode,
  };
}
