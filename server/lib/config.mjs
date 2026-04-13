import path from "node:path";

export const ROOT_DIR = process.cwd();
export const TEMP_ROOT = path.join(ROOT_DIR, ".moonap-tmp");
export const PORT = Number(process.env.PORT || 3000);

export function getModelConfig() {
  return {
    baseUrl: process.env.OPENAI_BASE_URL || "",
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  };
}

export function resolveModelConfig(overrides = {}) {
  const fallback = getModelConfig();
  return {
    baseUrl: String(overrides.baseUrl || fallback.baseUrl || "").trim(),
    apiKey: String(overrides.apiKey || fallback.apiKey || "").trim(),
    model: String(overrides.model || fallback.model || "gpt-4.1-mini").trim(),
  };
}

export function useRemoteModel(overrides = {}) {
  const { baseUrl, apiKey } = resolveModelConfig(overrides);
  return Boolean(baseUrl && apiKey);
}
