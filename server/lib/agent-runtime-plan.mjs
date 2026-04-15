import { getTaskKernelProtocol } from "./task-kernel-protocol.mjs";
import {
  modeNeedsArtifact,
  modeSystemPrompt,
  normalizeTaskMode,
  requestedAnalysisFor,
  wantsFileAnalysis,
} from "./task-router-policy.mjs";

function toPromptLower(prompt) {
  return String(prompt || "").toLowerCase();
}

function notePlanSource() {
  return [
    "MoonBit owns task classification, artifact routing, and requested analysis selection.",
    "The JS layer is now only adapting browser/server I/O, LLM network calls, and MoonBit compiler execution.",
  ];
}

export function buildAgentRuntimePlan({ prompt, selectedMode = "chat", fileInfo = null }) {
  const normalizedMode = normalizeTaskMode(selectedMode);
  const promptLower = toPromptLower(prompt);
  const hasFile = Boolean(fileInfo);
  const fileType = String(fileInfo?.detectedType || "").toLowerCase();
  const needsFileAnalysis = hasFile && (normalizedMode === "fastq-agent" || wantsFileAnalysis(promptLower, fileInfo));
  const needsArtifact = needsFileAnalysis || modeNeedsArtifact(normalizedMode, promptLower);
  const requestedAnalysis = needsFileAnalysis
    ? requestedAnalysisFor(promptLower, fileInfo, normalizedMode)
    : "auto";

  return {
    normalizedMode,
    experienceMode: normalizedMode,
    needsFileAnalysis,
    needsArtifact,
    requestedAnalysis,
    systemPrompt: modeSystemPrompt(normalizedMode),
    taskKernelProtocol: getTaskKernelProtocol(normalizedMode),
    fileType,
    hasFile,
    adapterNotes: notePlanSource(),
  };
}
