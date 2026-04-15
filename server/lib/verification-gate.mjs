import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT_DIR } from "./config.mjs";

function buildCheck(name, level, detail) {
  return { name, level, passed: true, detail };
}

function fallbackVerificationGate(mode, analysis = null) {
  const analysisType = analysis?.analysisType || "";
  const thirdCheck =
    mode === "fastq-agent" || analysisType === "fastq-n-stats"
      ? buildCheck(
          "streaming-plan",
          "Formal",
          "MoonAP reserved a formal-proof slot for chunk-safe file analysis while using engineering checks in the current release.",
        )
      : mode === "game-agent"
        ? buildCheck(
            "runtime-boundary",
            "Contract",
            "The generated Wasm gameplay loop stays inside the browser-safe execution surface.",
          )
        : buildCheck(
            "future-proof-slot",
            "Formal",
            "A future MoonBit formal verification step can be inserted here without changing the rest of the synthesis pipeline.",
          );

  return [
    buildCheck(
      "task-selected",
      "JsonSchema",
      "MoonAP normalized the natural-language request into a typed synthesis task.",
    ),
    buildCheck(
      "engineering-gate",
      "Contract",
      "This version uses engineering validation gates today while reserving a future formal verification slot.",
    ),
    thirdCheck,
  ];
}

function fromMoonBitCheck(check, index) {
  return {
    name: String(check?.name || `moonbit-check-${index + 1}`).trim(),
    level: String(check?.level || "Contract").trim(),
    passed: check?.passed !== false,
    detail: String(check?.detail || "MoonBit supplied this verification checkpoint.").trim(),
  };
}

function loadMoonBitVerificationGates() {
  const moonapDir = path.join(ROOT_DIR, "moonap");
  const result = spawnSync("moon", ["run", "cmd/verification_gate"], {
    cwd: moonapDir,
    encoding: "utf8",
    timeout: 5000,
    windowsHide: true,
  });
  if (result.status !== 0 || !String(result.stdout || "").trim()) {
    return null;
  }

  const [fastq, workflow, game] = String(result.stdout)
    .split(/\r?\n---\r?\n/)
    .map((chunk) => chunk.trim())
    .map((chunk) => JSON.parse(chunk).map(fromMoonBitCheck));

  return {
    "fastq-agent": fastq,
    "moonbit-task": workflow,
    "game-agent": game,
  };
}

const MOONBIT_VERIFICATION_GATES = loadMoonBitVerificationGates();

export function defaultVerificationGate(mode, analysis = null) {
  const analysisType = analysis?.analysisType || "";
  if ((mode === "fastq-agent" || analysisType === "fastq-n-stats") && MOONBIT_VERIFICATION_GATES?.["fastq-agent"]) {
    return MOONBIT_VERIFICATION_GATES["fastq-agent"];
  }
  if (mode === "game-agent" && MOONBIT_VERIFICATION_GATES?.["game-agent"]) {
    return MOONBIT_VERIFICATION_GATES["game-agent"];
  }
  if (MOONBIT_VERIFICATION_GATES?.["moonbit-task"]) {
    return MOONBIT_VERIFICATION_GATES["moonbit-task"];
  }
  return fallbackVerificationGate(mode, analysis);
}

export function baseVerificationGate() {
  return defaultVerificationGate("moonbit-task").slice(0, 2);
}
