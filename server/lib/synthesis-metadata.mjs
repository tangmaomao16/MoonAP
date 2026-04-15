import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT_DIR } from "./config.mjs";
import { getTaskKernelProtocol } from "./task-kernel-protocol.mjs";
import { defaultVerificationGate } from "./verification-gate.mjs";

function projectFileFromMoonBit(file) {
  return {
    path: String(file?.path || "").trim(),
    purpose: String(file?.purpose || "").trim(),
    language: String(file?.language || "").trim(),
    generated: file?.generated !== false,
  };
}

function skillFromMoonBit(skill) {
  return {
    name: String(skill?.name || "").trim(),
    category: String(skill?.category || "").trim(),
    summary: String(skill?.summary || "").trim(),
    reusable: skill?.reusable !== false,
  };
}

function inputModeFromMoonBit(value) {
  return String(value || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

function protocolFromMoonBit(protocol) {
  if (!protocol || typeof protocol !== "object") return null;
  return {
    protocolName: String(protocol.protocol_name || "").trim(),
    inputMode: inputModeFromMoonBit(protocol.input_mode),
    stateType: String(protocol.state_type || "").trim(),
    initFn: String(protocol.init_fn || "").trim(),
    ingestFn: String(protocol.ingest_fn || "").trim(),
    finalizeFn: String(protocol.finalize_fn || "").trim(),
    hostResponsibilities: Array.isArray(protocol.host_responsibilities) ? protocol.host_responsibilities : [],
    kernelResponsibilities: Array.isArray(protocol.kernel_responsibilities) ? protocol.kernel_responsibilities : [],
  };
}

function verificationFromMoonBit(check, index) {
  return {
    name: String(check?.name || `moonbit-check-${index + 1}`).trim(),
    level: String(check?.level || "Contract").trim(),
    passed: check?.passed !== false,
    detail: String(check?.detail || "MoonBit supplied this verification checkpoint.").trim(),
  };
}

function manifestFromMoonBit(manifest) {
  return {
    packageName: String(manifest?.package_name || "moonap/workflow_task").trim(),
    entrypoint: String(manifest?.entrypoint || "cmd/main/main.mbt").trim(),
    runtimeTarget: String(manifest?.runtime_target || "wasm").trim(),
    projectFiles: Array.isArray(manifest?.project_files) ? manifest.project_files.map(projectFileFromMoonBit) : [],
    skills: Array.isArray(manifest?.skills) ? manifest.skills.map(skillFromMoonBit) : [],
    verificationGate: Array.isArray(manifest?.verification_gate) ? manifest.verification_gate.map(verificationFromMoonBit) : [],
    taskKernelProtocol: protocolFromMoonBit(manifest?.task_kernel_protocol),
  };
}

function benchmarkFromMoonBit(profile) {
  return {
    scenario: String(profile?.scenario || "MoonBit workflow synthesis").trim(),
    benchmarkTiers: Array.isArray(profile?.benchmark_tiers) ? profile.benchmark_tiers : ["0.1 GB", "1 GB", "5 GB"],
    recommendedChunkSizes: Array.isArray(profile?.recommended_chunk_sizes) ? profile.recommended_chunk_sizes : ["not applicable"],
    evaluationFocus: Array.isArray(profile?.evaluation_focus) ? profile.evaluation_focus : ["build success"],
    generatedFileCount: Number(profile?.generated_source_file_count || 0),
  };
}

function buildProjectManifest({ packageName, entrypoint, projectFiles, skills, verificationGate, taskKernelProtocol = null }) {
  return {
    packageName,
    entrypoint,
    runtimeTarget: "wasm",
    projectFiles,
    skills,
    verificationGate,
    taskKernelProtocol,
  };
}

function fallbackMetadata(mode, analysis = null) {
  const verificationGate = defaultVerificationGate(mode, analysis);
  const taskKernelProtocol = getTaskKernelProtocol(mode);

  if (mode === "game-agent") {
    return {
      projectManifest: buildProjectManifest({
        packageName: "moonap/browser_game",
        entrypoint: "cmd/main/main.mbt",
        projectFiles: [
          { path: "moon.mod.json", purpose: "module metadata", language: "json", generated: true },
          { path: "moon.pkg", purpose: "package imports and options", language: "moonpkg", generated: true },
          { path: "cmd/main/main.mbt", purpose: "browser game entrypoint", language: "moonbit", generated: true },
          { path: "cmd/main/game_state.mbt", purpose: "gameplay state transitions", language: "moonbit", generated: true },
          { path: "cmd/main/game_loop.mbt", purpose: "frame summary and loop helpers", language: "moonbit", generated: true },
        ],
        skills: [
          { name: "browser-dodge-loop", category: "gameplay", summary: "Provides a small dodge-loop suitable for browser rendering shells.", reusable: true },
          { name: "wasm-ui-bridge", category: "runtime", summary: "Connects MoonBit gameplay logic to browser-side drawing code.", reusable: true },
        ],
        verificationGate,
        taskKernelProtocol,
      }),
      benchmarkProfile: {
        scenario: "browser mini-game synthesis",
        benchmarkTiers: ["prototype", "playable", "competition-demo"],
        recommendedChunkSizes: ["not applicable"],
        evaluationFocus: ["gameplay loop stability", "wasm startup time", "browser-safe runtime surface"],
        generatedFileCount: 3,
      },
    };
  }

  if (mode === "fastq-agent" || analysis?.analysisType === "fastq-n-stats") {
    return {
      projectManifest: buildProjectManifest({
        packageName: "moonap/fastq_n_ratio",
        entrypoint: "cmd/main/main.mbt",
        projectFiles: [
          { path: "moon.mod.json", purpose: "module metadata", language: "json", generated: true },
          { path: "moon.pkg", purpose: "package imports and options", language: "moonpkg", generated: true },
          { path: "cmd/main/main.mbt", purpose: "browser entrypoint and reporting", language: "moonbit", generated: true },
          { path: "cmd/main/fastq_stats.mbt", purpose: "N-base counting and ratio summarization", language: "moonbit", generated: true },
          { path: "cmd/main/fastq_chunking.mbt", purpose: "chunk sizing guidance for local GB-scale analysis", language: "moonbit", generated: true },
          { path: "cmd/main/fastq_wasm_runtime.mbt", purpose: "Wasm-exported FastQ state machine helpers", language: "moonbit", generated: true },
        ],
        skills: [
          { name: "fastq-n-ratio", category: "bioinformatics", summary: "Counts N bases and computes their ratio over all observed bases.", reusable: true },
          { name: "chunk-stream-reader", category: "runtime", summary: "Streams local text data in chunks so GB-level files stay browser-friendly.", reusable: true },
        ],
        verificationGate,
        taskKernelProtocol,
      }),
      benchmarkProfile: {
        scenario: "FastQ local analysis",
        benchmarkTiers: ["0.1 GB", "1 GB", "5 GB"],
        recommendedChunkSizes: ["4 MB", "8 MB", "16 MB"],
        evaluationFocus: ["memory peak", "chunk throughput", "total runtime", "output correctness"],
        generatedFileCount: 4,
      },
    };
  }

  return {
    projectManifest: buildProjectManifest({
      packageName: "moonap/workflow_task",
      entrypoint: "cmd/main/main.mbt",
      projectFiles: [
        { path: "moon.mod.json", purpose: "module metadata", language: "json", generated: true },
        { path: "moon.pkg", purpose: "package imports and options", language: "moonpkg", generated: true },
        { path: "cmd/main/main.mbt", purpose: "workflow entrypoint", language: "moonbit", generated: true },
        { path: "cmd/main/agent_spec.mbt", purpose: "task spec normalization", language: "moonbit", generated: true },
        { path: "cmd/main/session_context.mbt", purpose: "session label and lightweight context tracking", language: "moonbit", generated: true },
      ],
      skills: [
        { name: "task-spec-normalizer", category: "agent", summary: "Turns natural language requests into typed synthesis tasks.", reusable: true },
        { name: "context-json-store", category: "agent", summary: "Stores multi-turn state in MoonBit-friendly JSON structures.", reusable: true },
      ],
      verificationGate,
      taskKernelProtocol,
    }),
    benchmarkProfile: {
      scenario: "MoonBit workflow synthesis",
      benchmarkTiers: ["prototype", "usable", "competition-demo"],
      recommendedChunkSizes: ["not applicable"],
      evaluationFocus: ["project completeness", "reusable skills", "build success", "explainability"],
      generatedFileCount: 3,
    },
  };
}

function loadMoonBitMetadata() {
  const moonapDir = path.join(ROOT_DIR, "moonap");
  const result = spawnSync("moon", ["run", "cmd/synthesis_metadata"], {
    cwd: moonapDir,
    encoding: "utf8",
    timeout: 5000,
    windowsHide: true,
  });
  if (result.status !== 0 || !String(result.stdout || "").trim()) {
    return null;
  }

  const [fastq, workflow, game] = String(result.stdout)
    .split(/\r?\n===\r?\n/)
    .map((entry) => {
      const [manifest, benchmark] = entry.split(/\r?\n---\r?\n/).map((chunk) => JSON.parse(chunk.trim()));
      return {
        projectManifest: manifestFromMoonBit(manifest),
        benchmarkProfile: benchmarkFromMoonBit(benchmark),
      };
    });

  return {
    "fastq-agent": fastq,
    "moonbit-task": workflow,
    "game-agent": game,
  };
}

function selectMetadataMode(mode, fileInfo, analysis) {
  if (mode === "game-agent") return "game-agent";
  if (mode === "fastq-agent" || analysis?.analysisType === "fastq-n-stats" || fileInfo?.detectedType === "fastq") {
    return "fastq-agent";
  }
  return "moonbit-task";
}

function enrichBenchmarkProfile(profile, fileInfo, analysis = null, generatedFileCount = null) {
  return {
    ...profile,
    currentInput: fileInfo ? `${fileInfo.path} (${fileInfo.sizeBytes} bytes)` : "No local file attached yet",
    benchmarkTiers: analysis?.benchmarkPlan?.benchmarkTiers || profile.benchmarkTiers,
    recommendedChunkSizes: analysis?.benchmarkPlan?.recommendedChunkSizes || profile.recommendedChunkSizes,
    evaluationFocus: analysis?.benchmarkPlan?.evaluationFocus || profile.evaluationFocus,
    generatedFileCount: generatedFileCount ?? profile.generatedFileCount,
    metricsSnapshot: analysis?.metrics
      ? {
          readCount: analysis.metrics.readCount || 0,
          totalBases: analysis.metrics.totalBases || 0,
          averageReadLength: analysis.metrics.averageReadLength || 0,
          nRatio: analysis.metrics.nRatio || 0,
          gcRatio: analysis.metrics.gcRatio || 0,
        }
      : null,
    estimatedChunksAtCurrentSize: analysis?.benchmarkPlan?.estimatedChunksAtCurrentSize || 0,
  };
}

const MOONBIT_SYNTHESIS_METADATA = loadMoonBitMetadata();

export function synthesisMetadataFor(mode, fileInfo = null, analysis = null, options = {}) {
  const selectedMode = selectMetadataMode(mode, fileInfo, analysis);
  const base = MOONBIT_SYNTHESIS_METADATA?.[selectedMode] || fallbackMetadata(selectedMode, analysis);
  const projectManifest = {
    ...base.projectManifest,
    verificationGate: base.projectManifest.verificationGate?.length
      ? base.projectManifest.verificationGate
      : defaultVerificationGate(selectedMode, analysis),
    taskKernelProtocol: base.projectManifest.taskKernelProtocol || getTaskKernelProtocol(selectedMode),
  };
  const generatedFileCount = options.generatedFileCount ?? Math.max(0, projectManifest.projectFiles.length - 2);
  return {
    projectManifest,
    benchmarkProfile: enrichBenchmarkProfile(base.benchmarkProfile, fileInfo, analysis, generatedFileCount),
  };
}
