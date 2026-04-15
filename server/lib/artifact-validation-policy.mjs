import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT_DIR } from "./config.mjs";

const FALLBACK_POLICY = {
  requiredTopLevelKeys: [
    "title",
    "summary",
    "moonbitCode",
    "sourceFiles",
    "projectManifest",
    "skills",
    "verificationGate",
    "taskKernelProtocol",
  ],
  requiredSourceFiles: ["cmd/main/main.mbt"],
  forbiddenSourcePatterns: [
    "print_string",
    "raw.trim().replace",
    " var ",
    "\nvar ",
    "\tvar ",
    "@lib.",
    "String.chars",
    ".chars()",
  ],
  warningSourcePatterns: ["Char::from_int", ".to_int().to_double()", "unsafe"],
  fastqCompatExports: [
    "is_n_base",
    "is_gc_base",
    "is_sequence_state",
    "next_fastq_state",
    "accumulate_read_count",
    "accumulate_total_bases",
    "accumulate_n_bases",
    "accumulate_gc_bases",
    "update_longest_read",
    "update_shortest_read",
  ],
  maxRemoteRepairRounds: 3,
  repairInstructions: [
    "Return only strict JSON; do not use Markdown fences.",
    "Always include sourceFiles and cmd/main/main.mbt.",
    "Use println for visible output; never use print_string.",
    "Use let for immutable bindings and avoid var syntax.",
    "Do not reference @lib or external package aliases unless matching package files exist.",
    "For file generation tasks, print only the generated file content or JSON bundle.",
    "For browser-local attachment tasks, prefer small exported numeric helpers or the generic init/ingest/finalize lifecycle.",
    "Keep MoonBit code simple, deterministic, and compile-first.",
  ],
};

function arrayOfStrings(value) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function policyFromMoonBit(policy) {
  return {
    requiredTopLevelKeys: arrayOfStrings(policy?.required_top_level_keys),
    requiredSourceFiles: arrayOfStrings(policy?.required_source_files),
    forbiddenSourcePatterns: arrayOfStrings(policy?.forbidden_source_patterns),
    warningSourcePatterns: arrayOfStrings(policy?.warning_source_patterns),
    fastqCompatExports: arrayOfStrings(policy?.fastq_compat_exports),
    maxRemoteRepairRounds: Number(policy?.max_remote_repair_rounds || FALLBACK_POLICY.maxRemoteRepairRounds),
    repairInstructions: arrayOfStrings(policy?.repair_instructions),
  };
}

function loadMoonBitPolicy() {
  const moonapDir = path.join(ROOT_DIR, "moonap");
  const result = spawnSync("moon", ["run", "cmd/artifact_validation_policy"], {
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

const ARTIFACT_VALIDATION_POLICY = loadMoonBitPolicy() || FALLBACK_POLICY;

export function getArtifactValidationPolicy() {
  return ARTIFACT_VALIDATION_POLICY;
}

export function validateArtifactShapeWithPolicy(artifact, expectedProtocol = null) {
  const policy = getArtifactValidationPolicy();
  if (!artifact?.moonbitCode || !String(artifact.moonbitCode).trim()) {
    throw new Error("Remote model response did not include a valid main MoonBit program.");
  }
  if (!Array.isArray(artifact.sourceFiles) || artifact.sourceFiles.length === 0) {
    throw new Error("Remote model response did not include sourceFiles.");
  }
  for (const requiredPath of policy.requiredSourceFiles) {
    if (!artifact.sourceFiles.some((file) => file.path === requiredPath)) {
      throw new Error(`Remote model response did not include ${requiredPath}.`);
    }
  }
  if (expectedProtocol && artifact.taskKernelProtocol?.protocolName !== expectedProtocol.protocolName) {
    throw new Error(`Remote model protocol mismatch: expected ${expectedProtocol.protocolName}.`);
  }

  const allSource = artifact.sourceFiles
    .map((file) => `${file.path}\n${file.content || ""}`)
    .join("\n\n");
  for (const pattern of policy.forbiddenSourcePatterns) {
    if (pattern && allSource.includes(pattern)) {
      throw new Error(`Remote model produced forbidden MoonBit source pattern: ${pattern}`);
    }
  }
}

export function getRepairInstructionsText() {
  return getArtifactValidationPolicy().repairInstructions.join("\n");
}
