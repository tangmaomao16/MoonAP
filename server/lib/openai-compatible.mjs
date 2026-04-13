import { getModelConfig } from "./config.mjs";

function extractJson(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced) {
    return fenced[1];
  }

  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    return objectMatch[0];
  }

  return text;
}

export async function generateWithOpenAI(prompt, history) {
  const { baseUrl, apiKey, model } = getModelConfig();
  const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;
  const messages = [
    {
      role: "system",
      content: [
        "You are MoonAP, an expert MoonBit code generator.",
        "Return strict JSON with keys: title, summary, moonbitCode.",
        "moonbitCode must be complete and compile as cmd/main/main.mbt.",
        "Always produce a runnable MoonBit program with fn main { ... }.",
        "Prefer console output programs that work well in WebAssembly.",
        "Do not wrap the JSON in prose.",
      ].join(" "),
    },
    ...history.map((item) => ({
      role: item.role,
      content: item.content,
    })),
    {
      role: "user",
      content: prompt,
    },
  ];

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages,
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

  const parsed = JSON.parse(extractJson(content));
  if (!parsed.moonbitCode) {
    throw new Error("Remote model response did not include moonbitCode.");
  }

  return {
    title: parsed.title || "Generated MoonBit Program",
    summary: parsed.summary || "使用远端模型生成的 MoonBit 程序。",
    moonbitCode: parsed.moonbitCode,
  };
}
