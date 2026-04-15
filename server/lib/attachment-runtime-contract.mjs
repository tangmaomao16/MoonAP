import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT_DIR } from "./config.mjs";

const FALLBACK_CONTRACT = {
  version: "moonap.attachment-runtime.v1",
  defaultLifecycle: ["init", "ingest", "finalize"],
  supportedFileTypes: ["fastq", "csv", "json", "text", "spreadsheet"],
  requiredExports: [],
  optionalCompatExports: [
    {
      name: "is_n_base",
      signature: "(code : Int) -> Int",
      required: false,
      summary: "FastQ compatibility helper for browser-local N-base counting.",
    },
  ],
  hostResponsibilities: [
    "Choose and read local browser files without uploading user data.",
    "Feed bytes or text chunks into the generated Wasm adapter.",
    "Validate small smoke tests before running large local files.",
  ],
  kernelResponsibilities: [
    "Keep file-specific parsing logic inside generated MoonBit code whenever practical.",
    "Export small stable functions for browser adapters when direct file handles are unavailable.",
  ],
};

function exportFromMoonBit(item) {
  return {
    name: String(item?.name || "").trim(),
    signature: String(item?.signature || "").trim(),
    required: item?.required === true,
    summary: String(item?.summary || "").trim(),
  };
}

function contractFromMoonBit(contract) {
  return {
    version: String(contract?.version || FALLBACK_CONTRACT.version).trim(),
    defaultLifecycle: Array.isArray(contract?.default_lifecycle) ? contract.default_lifecycle.map(String) : [],
    supportedFileTypes: Array.isArray(contract?.supported_file_types) ? contract.supported_file_types.map(String) : [],
    requiredExports: Array.isArray(contract?.required_exports) ? contract.required_exports.map(exportFromMoonBit).filter((item) => item.name) : [],
    optionalCompatExports: Array.isArray(contract?.optional_compat_exports) ? contract.optional_compat_exports.map(exportFromMoonBit).filter((item) => item.name) : [],
    hostResponsibilities: Array.isArray(contract?.host_responsibilities) ? contract.host_responsibilities.map(String).filter(Boolean) : [],
    kernelResponsibilities: Array.isArray(contract?.kernel_responsibilities) ? contract.kernel_responsibilities.map(String).filter(Boolean) : [],
  };
}

function loadMoonBitContract() {
  const moonapDir = path.join(ROOT_DIR, "moonap");
  const result = spawnSync("moon", ["run", "cmd/attachment_runtime_contract"], {
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

const ATTACHMENT_RUNTIME_CONTRACT = loadMoonBitContract() || FALLBACK_CONTRACT;

export function getAttachmentRuntimeContract() {
  return ATTACHMENT_RUNTIME_CONTRACT;
}
