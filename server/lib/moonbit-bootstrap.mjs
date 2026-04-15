import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT_DIR } from "./config.mjs";

let cachedBootstrap = null;

export function getMoonBitServerBootstrap() {
  if (cachedBootstrap) return cachedBootstrap;
  const moonapDir = path.join(ROOT_DIR, "moonap");
  const result = spawnSync("moon", ["run", "cmd/server_bootstrap"], {
    cwd: moonapDir,
    encoding: "utf8",
    timeout: 8000,
    windowsHide: true,
  });
  if (result.status !== 0 || !String(result.stdout || "").trim()) {
    return null;
  }
  cachedBootstrap = JSON.parse(String(result.stdout).trim());
  return cachedBootstrap;
}

export function getMoonBitBootstrapSection(name) {
  return getMoonBitServerBootstrap()?.[name] || null;
}
