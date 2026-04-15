import { getMoonBitBootstrapSection } from "./moonbit-bootstrap.mjs";

const FALLBACK_POLICY = {
  defaultMode: "chat",
  modes: [
    {
      mode: "chat",
      label: "Chat",
      summary: "General MoonAP conversation and task planning.",
      systemPrompt: "The user is chatting with MoonAP in conversational mode.",
      artifactRequired: false,
      requiresFile: false,
      defaultAnalysis: "auto",
      fileTypes: [],
      promptKeywords: ["chat", "assistant", "moonap", "plan", "explain"],
    },
    {
      mode: "moonbit-task",
      label: "MoonBit Builder",
      summary: "Generate a MoonBit-first workflow that can compile to WebAssembly.",
      systemPrompt:
        "The user explicitly wants a MoonBit-first workflow. Generate a practical MoonBit program that is suitable for compilation to WebAssembly and browser execution when possible.",
      artifactRequired: true,
      requiresFile: false,
      defaultAnalysis: "auto",
      fileTypes: [],
      promptKeywords: ["moonbit", "webassembly", "wasm", "generate code", "compile"],
    },
    {
      mode: "fastq-agent",
      label: "FastQ Skill",
      summary: "A built-in bioinformatics skill for local FastQ file analysis.",
      systemPrompt:
        "The user selected a FastQ analysis skill. Keep the logic local-file-first and produce MoonBit code that supports the requested analysis.",
      artifactRequired: true,
      requiresFile: true,
      defaultAnalysis: "fastq-n-stats",
      fileTypes: ["fastq", "fq"],
      promptKeywords: ["fastq", ".fastq", ".fq", "n base", "n bases", "quality"],
    },
    {
      mode: "game-agent",
      label: "Game Studio",
      summary: "Generate browser mini-game logic in MoonBit for WebAssembly execution.",
      systemPrompt:
        "The user selected a browser mini-game skill. Produce MoonBit code that is compact, understandable, and suitable as a WebAssembly game prototype or gameplay core.",
      artifactRequired: true,
      requiresFile: false,
      defaultAnalysis: "auto",
      fileTypes: [],
      promptKeywords: ["game", "canvas", "arcade", "player", "enemy", "score"],
    },
  ],
  fileAnalysisKeywords: ["file", "analyze", "analysis", "count", "ratio", "quality", "csv", "json", "log", "stats", "inspect", "table", "excel"],
  artifactKeywords: ["moonbit", "webassembly", "wasm", "game", "generate code", "compile", "run in browser", "local file"],
};

function modeFromMoonBit(mode) {
  return {
    mode: String(mode?.mode || "").trim(),
    label: String(mode?.label || "").trim(),
    summary: String(mode?.summary || "").trim(),
    systemPrompt: String(mode?.system_prompt || "").trim(),
    artifactRequired: mode?.artifact_required === true,
    requiresFile: mode?.requires_file === true,
    defaultAnalysis: String(mode?.default_analysis || "auto").trim(),
    fileTypes: Array.isArray(mode?.file_types) ? mode.file_types.map(String) : [],
    promptKeywords: Array.isArray(mode?.prompt_keywords) ? mode.prompt_keywords.map(String) : [],
  };
}

function policyFromMoonBit(policy) {
  return {
    defaultMode: String(policy?.default_mode || "chat").trim(),
    modes: Array.isArray(policy?.modes) ? policy.modes.map(modeFromMoonBit).filter((mode) => mode.mode) : [],
    fileAnalysisKeywords: Array.isArray(policy?.file_analysis_keywords) ? policy.file_analysis_keywords.map(String) : [],
    artifactKeywords: Array.isArray(policy?.artifact_keywords) ? policy.artifact_keywords.map(String) : [],
  };
}

function loadMoonBitPolicy() {
  const policy = getMoonBitBootstrapSection("task_router");
  return policy ? policyFromMoonBit(policy) : null;
}

const TASK_ROUTER_POLICY = loadMoonBitPolicy() || FALLBACK_POLICY;

function includesAny(text, keywords) {
  const normalized = String(text || "").toLowerCase();
  return keywords.some((keyword) => normalized.includes(String(keyword || "").toLowerCase()));
}

export function getTaskRouterPolicy() {
  return TASK_ROUTER_POLICY;
}

export function getModePolicy(mode) {
  return TASK_ROUTER_POLICY.modes.find((item) => item.mode === mode) || TASK_ROUTER_POLICY.modes.find((item) => item.mode === TASK_ROUTER_POLICY.defaultMode);
}

export function normalizeTaskMode(mode) {
  const value = String(mode || "").trim().toLowerCase();
  return TASK_ROUTER_POLICY.modes.some((item) => item.mode === value) ? value : TASK_ROUTER_POLICY.defaultMode;
}

export function modeSystemPrompt(mode) {
  return getModePolicy(normalizeTaskMode(mode))?.systemPrompt || "The user is chatting with MoonAP.";
}

export function modeNeedsArtifact(mode, prompt) {
  const policy = getModePolicy(normalizeTaskMode(mode));
  return Boolean(policy?.artifactRequired) || includesAny(prompt, TASK_ROUTER_POLICY.artifactKeywords);
}

export function wantsFileAnalysis(prompt, fileInfo) {
  if (!fileInfo) return false;
  const type = String(fileInfo.detectedType || "").toLowerCase();
  if (TASK_ROUTER_POLICY.modes.some((mode) => mode.fileTypes.includes(type) && includesAny(prompt, mode.promptKeywords))) {
    return true;
  }
  return includesAny(prompt, TASK_ROUTER_POLICY.fileAnalysisKeywords);
}

export function requestedAnalysisFor(prompt, fileInfo, mode) {
  const normalizedMode = normalizeTaskMode(mode);
  const policy = getModePolicy(normalizedMode);
  const type = String(fileInfo?.detectedType || "").toLowerCase();

  if (policy?.defaultAnalysis && policy.defaultAnalysis !== "auto" && (policy.requiresFile || includesAny(prompt, policy.promptKeywords))) {
    return policy.defaultAnalysis;
  }

  const matchedFilePolicy = TASK_ROUTER_POLICY.modes.find((item) => item.fileTypes.includes(type) && includesAny(prompt, item.promptKeywords));
  return matchedFilePolicy?.defaultAnalysis && matchedFilePolicy.defaultAnalysis !== "auto"
    ? matchedFilePolicy.defaultAnalysis
    : "auto";
}
