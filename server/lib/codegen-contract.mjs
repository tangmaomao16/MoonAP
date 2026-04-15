import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT_DIR } from "./config.mjs";

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
  const moonapDir = path.join(ROOT_DIR, "moonap");
  const result = spawnSync("moon", ["run", "cmd/codegen_contract"], {
    cwd: moonapDir,
    encoding: "utf8",
    timeout: 5000,
    windowsHide: true,
  });
  const output = String(result.stdout || "").trim();
  return result.status === 0 && output ? output : FALLBACK_CODEGEN_CONTRACT;
}

export const MOONBIT_CODEGEN_CONTRACT = loadMoonBitCodegenContract();
