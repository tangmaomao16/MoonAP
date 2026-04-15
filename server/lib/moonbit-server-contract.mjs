import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT_DIR } from "./config.mjs";

const FALLBACK_CONTRACT = {
  name: "MoonAP MoonBit-first server",
  runtime: "MoonBit owns server policy and contracts; Node remains a thin adapter.",
  staticRoot: "web",
  routes: [
    {
      method: "GET",
      path: "/api/health",
      category: "runtime",
      summary: "Expose server health and local MoonBit toolchain version.",
      moonbitOwned: false,
      requiresAdapter: true,
    },
    {
      method: "GET",
      path: "/api/server-contract",
      category: "moonbit-contract",
      summary: "Expose this MoonBit-owned server route contract.",
      moonbitOwned: true,
      requiresAdapter: true,
    },
    {
      method: "GET",
      path: "/api/llm-router-policy",
      category: "moonbit-policy",
      summary: "Expose cross-provider LLM routing policy authored in MoonBit.",
      moonbitOwned: true,
      requiresAdapter: true,
    },
    {
      method: "GET",
      path: "/api/task-router-policy",
      category: "moonbit-policy",
      summary: "Expose generic task routing policy authored in MoonBit.",
      moonbitOwned: true,
      requiresAdapter: true,
    },
    {
      method: "GET",
      path: "/api/file-analysis-policy",
      category: "moonbit-policy",
      summary: "Expose file type and analysis policy authored in MoonBit.",
      moonbitOwned: true,
      requiresAdapter: true,
    },
    {
      method: "GET",
      path: "/api/attachment-runtime-contract",
      category: "moonbit-contract",
      summary: "Expose generic browser-local attachment runtime expectations authored in MoonBit.",
      moonbitOwned: true,
      requiresAdapter: true,
    },
    {
      method: "GET",
      path: "/api/artifact-validation-policy",
      category: "moonbit-policy",
      summary: "Expose MoonBit-owned artifact validation and repair policy.",
      moonbitOwned: true,
      requiresAdapter: true,
    },
    {
      method: "POST",
      path: "/api/chat",
      category: "agent-orchestration",
      summary: "Run the MoonAP conversation, LLM routing, code generation, repair, and artifact compile flow.",
      moonbitOwned: false,
      requiresAdapter: true,
    },
    {
      method: "POST",
      path: "/api/files/inspect",
      category: "file-adapter",
      summary: "Inspect a local server-side file path using MoonBit-owned file policy.",
      moonbitOwned: false,
      requiresAdapter: true,
    },
    {
      method: "POST",
      path: "/api/files/analyze",
      category: "file-adapter",
      summary: "Analyze a local server-side file using MoonBit-owned file policy and JS adapter execution.",
      moonbitOwned: false,
      requiresAdapter: true,
    },
    {
      method: "POST",
      path: "/api/browser-analysis/artifact",
      category: "browser-local-analysis",
      summary: "Compile an artifact for browser-local file analysis without uploading browser file contents.",
      moonbitOwned: false,
      requiresAdapter: true,
    },
    {
      method: "POST",
      path: "/api/artifacts/compile",
      category: "compiler-adapter",
      summary: "Compile generated MoonBit source files to WebAssembly with strict or fallback behavior.",
      moonbitOwned: false,
      requiresAdapter: true,
    },
    {
      method: "GET",
      path: "/*",
      category: "static-web",
      summary: "Serve the MoonAP browser UI.",
      moonbitOwned: false,
      requiresAdapter: true,
    },
  ],
  adapterResponsibilities: [
    "HTTP request parsing and response streaming",
    "CORS and static file serving",
    "Browser API key storage remains in the browser, not on the server",
    "Filesystem access for explicit local server paths",
    "MoonBit compiler process execution",
    "Network calls to user-configured LLM providers when the browser path cannot be used",
  ],
  migrationOrder: [
    "Move all route policy, task policy, LLM policy, file policy, and codegen contracts to MoonBit",
    "Move request classification and validation rules to MoonBit",
    "Move local file analysis kernels to MoonBit-generated Wasm or MoonBit JS target",
    "Replace the Node HTTP adapter only after MoonBit has a stable server/runtime story for this deployment",
  ],
};

function routeFromMoonBit(route) {
  return {
    method: String(route?.http_method || route?.method || "").trim(),
    path: String(route?.path || "").trim(),
    category: String(route?.category || "").trim(),
    summary: String(route?.summary || "").trim(),
    moonbitOwned: route?.moonbit_owned === true,
    requiresAdapter: route?.requires_adapter === true,
  };
}

function contractFromMoonBit(contract) {
  return {
    name: String(contract?.name || FALLBACK_CONTRACT.name).trim(),
    runtime: String(contract?.runtime || FALLBACK_CONTRACT.runtime).trim(),
    staticRoot: String(contract?.static_root || FALLBACK_CONTRACT.staticRoot).trim(),
    routes: Array.isArray(contract?.routes)
      ? contract.routes.map(routeFromMoonBit).filter((route) => route.method && route.path)
      : [],
    adapterResponsibilities: Array.isArray(contract?.adapter_responsibilities)
      ? contract.adapter_responsibilities.map(String).filter(Boolean)
      : [],
    migrationOrder: Array.isArray(contract?.migration_order)
      ? contract.migration_order.map(String).filter(Boolean)
      : [],
  };
}

function loadMoonBitServerContract() {
  const moonapDir = path.join(ROOT_DIR, "moonap");
  const result = spawnSync("moon", ["run", "cmd/server_contract"], {
    cwd: moonapDir,
    encoding: "utf8",
    timeout: 5000,
    windowsHide: true,
  });
  if (result.status !== 0 || !String(result.stdout || "").trim()) {
    return null;
  }
  return contractFromMoonBit(JSON.parse(String(result.stdout).trim()));
}

const MOONBIT_SERVER_CONTRACT = loadMoonBitServerContract() || FALLBACK_CONTRACT;

export function getMoonBitServerContract() {
  return MOONBIT_SERVER_CONTRACT;
}
