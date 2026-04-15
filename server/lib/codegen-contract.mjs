import { getMoonBitBootstrapSection } from "./moonbit-bootstrap.mjs";

const FALLBACK_CODEGEN_CONTRACT = [
  "Return strict JSON with keys: title, summary, moonbitCode, sourceFiles, projectManifest, skills, verificationGate, taskKernelProtocol.",
  "sourceFiles is required and must be an array of { path, content } objects.",
  "cmd/main/main.mbt must exist in sourceFiles.",
  "Prefer a single-package project rooted at cmd/main whenever possible.",
  "Do not reference packages like @lib unless matching source files exist in that package directory.",
  "Use println for normal visible output. Do not use print_string.",
  "taskKernelProtocol must be present and must match the requested protocol exactly when one is provided.",
  "Do not return markdown fences or explanations outside the JSON object.",
].join("\n");

function loadMoonBitCodegenContract() {
  return String(getMoonBitBootstrapSection("codegen_contract") || "").trim() || FALLBACK_CODEGEN_CONTRACT;
}

export const MOONBIT_CODEGEN_CONTRACT = loadMoonBitCodegenContract();
