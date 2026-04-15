import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT_DIR } from "./config.mjs";

const FALLBACK_MOONBIT_AGENT_SKILL = [
  "MoonBit 0.9 skill summary for code generation:",
  "- Target MoonBit v0.9 style and prefer simple, compile-first code.",
  "- Prefer a single-package project rooted at cmd/main unless multiple packages are truly needed.",
  "- In moon.pkg, use import { ... } for dependencies and options(...) for package options.",
  "- If extra package directories such as lib or runtime are used, each directory with .mbt files must be a valid package and imports must match those package names.",
  "- cmd/main/main.mbt must be the executable entrypoint for generated Wasm apps.",
  "- For structured agent state, prefer structs/enums with derive(FromJson, ToJson). Keep JSON layouts simple because advanced JSON layout tweaking is unstable.",
  "- derive(Show) is deprecated in MoonBit v0.9; prefer Debug-style debugging and simple explicit output.",
  "- Formal verification exists via proof_ensure and moon prove, but only include proof code when the user explicitly asks for it.",
  "- Prefer explicit, portable MoonBit code over clever syntax. Avoid risky package aliases or unsupported imports.",
  "- Generate code that is easy to compile to wasm and easy to inspect in small multi-file projects.",
].join("\n");

function loadMoonBitAgentSkill() {
  const moonapDir = path.join(ROOT_DIR, "moonap");
  const result = spawnSync("moon", ["run", "cmd/agent_skill"], {
    cwd: moonapDir,
    encoding: "utf8",
    timeout: 5000,
    windowsHide: true,
  });

  const output = String(result.stdout || "").trim();
  if (result.status === 0 && output) {
    return output;
  }
  return FALLBACK_MOONBIT_AGENT_SKILL;
}

export const MOONBIT_AGENT_SKILL = loadMoonBitAgentSkill();
