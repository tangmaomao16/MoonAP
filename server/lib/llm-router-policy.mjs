import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT_DIR } from "./config.mjs";

const FALLBACK_POLICY = {
  defaultProvider: "gemini",
  defaultCooldownMs: 30000,
  rateLimitCooldownMs: 3600000,
  networkCooldownMs: 120000,
  providers: [
    {
      key: "gemini",
      label: "Gemini",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
      defaultModel: "gemini-3-flash-preview",
      presetLabel: "Gemini provider loaded. Paste your Google AI Studio API key and save settings.",
      models: [
        { value: "gemini-3-flash-preview", label: "Gemini 3 Flash", recommended: true, priority: 100 },
        { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", recommended: false, priority: 80 },
        { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", recommended: false, priority: 70 },
      ],
    },
    {
      key: "siliconflow",
      label: "SiliconFlow",
      baseUrl: "https://api.siliconflow.cn/v1",
      defaultModel: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
      presetLabel: "SiliconFlow provider loaded. Paste your SiliconFlow API key and save settings.",
      models: [
        { value: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B", label: "DeepSeek R1 Distill Qwen 32B", recommended: true, priority: 85 },
        { value: "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B", label: "DeepSeek R1 Distill Qwen 14B", recommended: false, priority: 75 },
        { value: "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B", label: "DeepSeek R1 Distill Qwen 7B", recommended: false, priority: 60 },
      ],
    },
    {
      key: "zai",
      label: "Z.AI / GLM",
      baseUrl: "https://api.z.ai/api/paas/v4/",
      defaultModel: "glm-4.7-flash",
      presetLabel: "Z.AI provider loaded. Paste your Z.AI API key and save settings.",
      models: [
        { value: "glm-4.7-flash", label: "GLM 4.7 Flash", recommended: true, priority: 90 },
        { value: "glm-5.1", label: "GLM 5.1", recommended: false, priority: 88 },
      ],
    },
    {
      key: "openrouter",
      label: "OpenRouter",
      baseUrl: "https://openrouter.ai/api/v1",
      defaultModel: "openrouter/free",
      presetLabel: "OpenRouter provider loaded. Paste your OpenRouter API key and save settings.",
      models: [
        { value: "openrouter/free", label: "OpenRouter Free Router", recommended: true, priority: 40 },
      ],
    },
  ],
};

function modelFromMoonBit(model) {
  return {
    value: String(model?.value || "").trim(),
    label: String(model?.label || "").trim(),
    recommended: model?.recommended === true,
    priority: Number(model?.priority || 0),
  };
}

function providerFromMoonBit(provider) {
  return {
    key: String(provider?.key || "").trim(),
    label: String(provider?.label || "").trim(),
    baseUrl: String(provider?.base_url || "").trim(),
    defaultModel: String(provider?.default_model || "").trim(),
    presetLabel: String(provider?.preset_label || "").trim(),
    models: Array.isArray(provider?.models) ? provider.models.map(modelFromMoonBit).filter((model) => model.value) : [],
  };
}

function providersByKey(providers) {
  return Object.fromEntries(
    providers
      .filter((provider) => provider.key)
      .map((provider) => [
        provider.key,
        {
          label: provider.label,
          baseUrl: provider.baseUrl,
          defaultModel: provider.defaultModel,
          presetLabel: provider.presetLabel,
          models: provider.models,
        },
      ]),
  );
}

function policyFromMoonBit(policy) {
  const providers = Array.isArray(policy?.providers) ? policy.providers.map(providerFromMoonBit) : [];
  return {
    defaultProvider: String(policy?.default_provider || "gemini").trim(),
    defaultCooldownMs: Number(policy?.default_cooldown_ms || 30000),
    rateLimitCooldownMs: Number(policy?.rate_limit_cooldown_ms || 3600000),
    networkCooldownMs: Number(policy?.network_cooldown_ms || 120000),
    providers,
    providersByKey: providersByKey(providers),
  };
}

function loadMoonBitPolicy() {
  const moonapDir = path.join(ROOT_DIR, "moonap");
  const result = spawnSync("moon", ["run", "cmd/llm_router_policy"], {
    cwd: moonapDir,
    encoding: "utf8",
    timeout: 5000,
    windowsHide: true,
  });
  if (result.status !== 0 || !String(result.stdout || "").trim()) {
    return null;
  }
  return policyFromMoonBit(JSON.parse(String(result.stdout).trim()));
}

const LLM_ROUTER_POLICY = loadMoonBitPolicy() || {
  ...FALLBACK_POLICY,
  providersByKey: providersByKey(FALLBACK_POLICY.providers),
};

export function getLlmRouterPolicy() {
  return LLM_ROUTER_POLICY;
}
