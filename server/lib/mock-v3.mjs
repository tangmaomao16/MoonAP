import {
  fastqTaskKernelProtocol,
  workflowTaskKernelProtocol,
  gameTaskKernelProtocol,
} from "./task-kernel-protocol.mjs";

function contains(text, words) {
  return words.some((word) => text.includes(word));
}

function extractLastNumber(text, fallback) {
  const matches = text.match(/\d+/g);
  return matches && matches.length > 0 ? Number(matches[matches.length - 1]) : fallback;
}

function safePrompt(prompt) {
  return String(prompt || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function helloProgram(message) {
  return `fn main {\n  println("${message}")\n}`;
}

function sumProgram(limit) {
  return `fn sum_to(n : Int) -> Int {\n  let mut total = 0\n  let mut i = 1\n  while i <= n {\n    total = total + i\n    i = i + 1\n  }\n  total\n}\n\nfn main {\n  let n = ${limit}\n  println("sum(1.." + n.to_string() + ") = " + sum_to(n).to_string())\n}`;
}

function fastqDemoProgram(analysis = null, fileInfo = null) {
  const fileLabel = safePrompt(fileInfo?.path || "browser-local.fastq");
  const totalBases = analysis?.metrics?.totalBases || 13;
  const nBases = analysis?.metrics?.nBases || 4;
  const readCount = analysis?.metrics?.readCount || 1;
  const averageReadLength = Number(analysis?.metrics?.averageReadLength || 13).toFixed(2);
  const chunkLabel = analysis?.benchmarkPlan?.recommendedChunkSizes?.[0] || "8 MB";
  const nRatioPercent = (((nBases / (totalBases || 1)) * 100)).toFixed(4);
  return `fn format_percent(value : String) -> String {\n  value + "%"\n}\n\nfn main {\n  let file_label = "${fileLabel}"\n  let read_count = ${readCount}\n  let total_bases = ${totalBases}\n  let n_bases = ${nBases}\n  let average_read_length = "${averageReadLength}"\n  let n_ratio = "${nRatioPercent}"\n  println("MoonAP FastQ Wasm report")\n  println("file = " + file_label)\n  println("reads = " + read_count.to_string())\n  println("total bases = " + total_bases.to_string())\n  println("N bases = " + n_bases.to_string())\n  println("N ratio = " + format_percent(n_ratio))\n  println("average read length = " + average_read_length)\n  println("recommended chunk = ${chunkLabel}")\n}`;
}

function csvDemoProgram() {
  return `fn split_count(line : String, delimiter : Char) -> Int {\n  let mut count = 1\n  for char in line {\n    if char == delimiter {\n      count = count + 1\n    }\n  }\n  count\n}\n\nfn main {\n  let header = "sample_id,group,score"\n  println("header = " + header)\n  println("column count = " + split_count(header, ',').to_string())\n}`;
}

function gameDemoProgram() {
  return `struct Player {\n  x : Int\n  score : Int\n}\n\nfn initial_player() -> Player {\n  { x: 0, score: 0 }\n}\n\nfn step(player : Player, tick : Int) -> Player {\n  let shift = if tick % 2 == 0 { 1 } else { 2 }\n  { x: player.x + shift, score: player.score + 10 }\n}\n\nfn frame_summary(player : Player, tick : Int) -> String {\n  "tick=" + tick.to_string() + " x=" + player.x.to_string() + " score=" + player.score.to_string()\n}\n\nfn main {\n  let mut player = initial_player()\n  let mut tick = 0\n  while tick < 5 {\n    player = step(player, tick)\n    println(frame_summary(player, tick))\n    tick = tick + 1\n  }\n  println("MoonAP game core ready for browser-side rendering integration.")\n}`;
}

function workflowProgram(prompt) {
  return `fn normalize_request(raw : String) -> String {\n  raw.trim().replace("\\n", " ")\n}\n\nfn session_label(request : String) -> String {\n  "moonap-session:" + request.length().to_string()\n}\n\nfn main {\n  let request = normalize_request("${safePrompt(prompt)}")\n  let session = session_label(request)\n  println("MoonAP MoonBit task")\n  println("request = " + request)\n  println("session = " + session)\n  println("next = compile to WebAssembly and run in the browser")\n}`;
}

function fastqSourceFiles(analysis = null, fileInfo = null) {
  const fileLabel = safePrompt(fileInfo?.path || "browser-local.fastq");
  const totalBases = analysis?.metrics?.totalBases || 13;
  const nBases = analysis?.metrics?.nBases || 4;
  const gcBases = analysis?.metrics?.gcBases || 2;
  const readCount = analysis?.metrics?.readCount || 1;
  const averageReadLength = Number(analysis?.metrics?.averageReadLength || 13).toFixed(2);
  const chunkLabel = analysis?.benchmarkPlan?.recommendedChunkSizes?.[0] || "8 MB";
  const nRatioPercent = (((nBases / (totalBases || 1)) * 100)).toFixed(4);

  return [
    {
      path: "cmd/main/main.mbt",
      content: `fn main {\n  let report = build_report()\n  println("MoonAP FastQ Wasm report")\n  println("file = ${fileLabel}")\n  println("reads = " + report.read_count.to_string())\n  println("total bases = " + report.total_bases.to_string())\n  println("N bases = " + report.n_bases.to_string())\n  println("GC bases = " + report.gc_bases.to_string())\n  println("N ratio = " + report.n_ratio_label)\n  println("average read length = " + report.average_read_length_label)\n  println("recommended chunk = " + recommended_chunk_label())\n}`,
    },
    {
      path: "cmd/main/fastq_stats.mbt",
      content: `struct FastqReport {\n  read_count : Int\n  total_bases : Int\n  n_bases : Int\n  gc_bases : Int\n  n_ratio_label : String\n  average_read_length_label : String\n}\n\npub fn build_report() -> FastqReport {\n  {\n    read_count: ${readCount},\n    total_bases: ${totalBases},\n    n_bases: ${nBases},\n    gc_bases: ${gcBases},\n    n_ratio_label: "${nRatioPercent}%",\n    average_read_length_label: "${averageReadLength}",\n  }\n}`,
    },
    {
      path: "cmd/main/fastq_chunking.mbt",
      content: `pub fn recommended_chunk_label() -> String {\n  "${chunkLabel}"\n}`,
    },
    {
      path: "cmd/main/fastq_wasm_runtime.mbt",
      content: `pub fn is_n_base(code : Int) -> Int {\n  if code == 78 || code == 110 {\n    1\n  } else {\n    0\n  }\n}\n\npub fn is_gc_base(code : Int) -> Int {\n  if code == 71 || code == 103 || code == 67 || code == 99 {\n    1\n  } else {\n    0\n  }\n}\n\npub fn is_sequence_line(line_index : Int) -> Int {\n  if line_index % 4 == 1 {\n    1\n  } else {\n    0\n  }\n}\n\npub fn is_sequence_state(state : Int) -> Int {\n  if state == 1 {\n    1\n  } else {\n    0\n  }\n}\n\npub fn next_fastq_state(state : Int) -> Int {\n  (state + 1) % 4\n}\n\npub fn accumulate_read_count(total : Int, state : Int) -> Int {\n  total + is_sequence_state(state)\n}\n\npub fn accumulate_total_bases(total : Int, code : Int) -> Int {\n  if code == 10 || code == 13 {\n    total\n  } else {\n    total + 1\n  }\n}\n\npub fn accumulate_n_bases(total : Int, code : Int) -> Int {\n  total + is_n_base(code)\n}\n\npub fn accumulate_gc_bases(total : Int, code : Int) -> Int {\n  total + is_gc_base(code)\n}\n\npub fn update_longest_read(current : Int, read_length : Int) -> Int {\n  if read_length > current {\n    read_length\n  } else {\n    current\n  }\n}\n\npub fn update_shortest_read(current : Int, read_length : Int) -> Int {\n  if current == 0 || read_length < current {\n    read_length\n  } else {\n    current\n  }\n}`,
    },
  ];
}

function gameSourceFiles() {
  return [
    {
      path: "cmd/main/main.mbt",
      content: `fn main {\n  let mut player = initial_player()\n  let mut tick = 0\n  while tick < 5 {\n    player = step(player, tick)\n    println(frame_summary(player, tick))\n    tick = tick + 1\n  }\n  println("MoonAP game core ready for browser-side rendering integration.")\n}`,
    },
    {
      path: "cmd/main/game_state.mbt",
      content: `struct Player {\n  x : Int\n  score : Int\n}\n\nfn initial_player() -> Player {\n  { x: 0, score: 0 }\n}\n\nfn step(player : Player, tick : Int) -> Player {\n  let shift = if tick % 2 == 0 { 1 } else { 2 }\n  { x: player.x + shift, score: player.score + 10 }\n}`,
    },
    {
      path: "cmd/main/game_loop.mbt",
      content: `fn frame_summary(player : Player, tick : Int) -> String {\n  "tick=" + tick.to_string() + " x=" + player.x.to_string() + " score=" + player.score.to_string()\n}`,
    },
  ];
}

function workflowSourceFiles(prompt) {
  return [
    {
      path: "cmd/main/main.mbt",
      content: `fn main {\n  let request = normalize_request("${safePrompt(prompt)}")\n  let session = session_label(request)\n  println("MoonAP MoonBit task")\n  println("request = " + request)\n  println("session = " + session)\n  println("next = compile to WebAssembly and run in the browser")\n}`,
    },
    {
      path: "cmd/main/agent_spec.mbt",
      content: `fn normalize_request(raw : String) -> String {\n  raw.trim().replace("\\n", " ")\n}`,
    },
    {
      path: "cmd/main/session_context.mbt",
      content: `fn session_label(request : String) -> String {\n  "moonap-session:" + request.length().to_string()\n}`,
    },
  ];
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

function baseVerificationGate() {
  return [
    {
      name: "task-selected",
      level: "JsonSchema",
      passed: true,
      detail: "MoonAP normalized the natural-language request into a typed synthesis task.",
    },
    {
      name: "engineering-gate",
      level: "Contract",
      passed: true,
      detail: "This version uses engineering validation gates today while reserving a future formal verification slot.",
    },
  ];
}

function buildBenchmarkProfile({ scenario, fileInfo, generatedFileCount, chunkSizes, focus, analysis = null }) {
  return {
    scenario,
    currentInput: fileInfo ? `${fileInfo.path} (${fileInfo.sizeBytes} bytes)` : "No local file attached yet",
    benchmarkTiers: analysis?.benchmarkPlan?.benchmarkTiers || ["0.1 GB", "1 GB", "5 GB"],
    recommendedChunkSizes: analysis?.benchmarkPlan?.recommendedChunkSizes || chunkSizes,
    evaluationFocus: analysis?.benchmarkPlan?.evaluationFocus || focus,
    generatedFileCount,
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

function fastqManifest() {
  return buildProjectManifest({
    packageName: "moonap/fastq_n_ratio",
    entrypoint: "cmd/main/main.mbt",
    projectFiles: [
      { path: "moon.mod.json", purpose: "module metadata", language: "json", generated: true },
      { path: "moon.pkg", purpose: "package imports and options", language: "moonpkg", generated: true },
      { path: "cmd/main/main.mbt", purpose: "browser entrypoint and reporting", language: "moonbit", generated: true },
      { path: "cmd/main/fastq_stats.mbt", purpose: "N-base counting and ratio summarization", language: "moonbit", generated: true },
      { path: "cmd/main/fastq_chunking.mbt", purpose: "chunk sizing guidance for local GB-scale analysis", language: "moonbit", generated: true },
      { path: "cmd/main/fastq_wasm_runtime.mbt", purpose: "Wasm-exported FastQ state machine and byte classification helpers", language: "moonbit", generated: true },
    ],
    skills: [
      { name: "fastq-n-ratio", category: "bioinformatics", summary: "Counts N bases and computes their ratio over all observed bases.", reusable: true },
      { name: "chunk-stream-reader", category: "runtime", summary: "Streams local text data in chunks so GB-level files stay browser-friendly.", reusable: true },
    ],
    taskKernelProtocol: fastqTaskKernelProtocol(),
    verificationGate: [
      ...baseVerificationGate(),
      {
        name: "streaming-plan",
        level: "Formal",
        passed: true,
        detail: "MoonAP reserved a formal-proof slot for chunk-safe analysis logic once the MoonBit verification stack is more stable.",
      },
    ],
  });
}

function gameManifest() {
  return buildProjectManifest({
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
    taskKernelProtocol: gameTaskKernelProtocol(),
    verificationGate: [
      ...baseVerificationGate(),
      {
        name: "runtime-boundary",
        level: "Contract",
        passed: true,
        detail: "The generated game loop stays inside the browser-safe Wasm execution surface.",
      },
    ],
  });
}

function workflowManifest() {
  return buildProjectManifest({
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
    taskKernelProtocol: workflowTaskKernelProtocol(),
    verificationGate: [
      ...baseVerificationGate(),
      {
        name: "future-proof-slot",
        level: "Formal",
        passed: true,
        detail: "A future MoonBit formal verification step can be inserted here without changing the rest of the synthesis pipeline.",
      },
    ],
  });
}

function attachSynthesisMetadata(baseArtifact, manifest, benchmarkProfile) {
  return {
    ...baseArtifact,
    projectManifest: manifest,
    skills: manifest.skills,
    verificationGate: manifest.verificationGate,
    benchmarkProfile,
    taskKernelProtocol: manifest.taskKernelProtocol || null,
  };
}

export function generateMockChatReply(prompt, context = {}) {
  const fileInfo = context.fileInfo || null;
  const analysis = context.analysis || null;
  const selectedMode = context.selectedMode || "chat";
  const artifact = context.artifact || null;
  const normalized = prompt.toLowerCase();

  if (analysis) {
    return [
      fileInfo ? `I analyzed the local file ${fileInfo.path}.` : "I completed a local file analysis.",
      "",
      analysis.summary,
      "",
      artifact
        ? `I also prepared a MoonBit artifact called "${artifact.title}" together with a project manifest, reusable skills, source files, and a verification gate summary.`
        : "If you want, I can next refine the analysis logic or produce a more specialized MoonBit example.",
    ].join("\n");
  }

  if (fileInfo) {
    return `I loaded the local file context for ${fileInfo.path}. You can now ask for FastQ quality stats, CSV structure checks, JSON inspection, or a custom local analysis workflow.`;
  }

  if (selectedMode === "fastq-agent") {
    return "FastQ analyst mode is active. Attach a local FASTQ file path and I will generate MoonBit-assisted analysis plus an optional Wasm runnable artifact.";
  }

  if (selectedMode === "game-agent") {
    return "Game studio mode is active. Describe the gameplay loop you want, and I will prepare MoonBit code that can be compiled to WebAssembly for browser execution.";
  }

  if (selectedMode === "moonbit-task") {
    return "MoonBit builder mode is active. Describe the task you want automated, and I will focus on generating MoonBit code suitable for WebAssembly execution.";
  }

  if (contains(normalized, ["chatgpt", "assistant", "moonap"])) {
    return "MoonAP is ready for chat. When you add a local file path and ask for analysis, it will switch into the MoonBit -> WebAssembly -> browser execution workflow.";
  }

  return "I can chat normally, help design an analysis workflow, or switch into local file analysis mode when you provide a file path.";
}

export function generateMockMoonBit(prompt, context = {}) {
  const normalized = prompt.toLowerCase();
  const fileInfo = context.fileInfo || null;
  const analysis = context.analysis || null;
  const selectedMode = context.selectedMode || "chat";

  if (selectedMode === "game-agent" || contains(normalized, ["game", "小游戏", "canvas", "arcade"])) {
    const sourceFiles = gameSourceFiles();
    return attachSynthesisMetadata({
      title: "Browser Mini-Game Core",
      summary: "Generated a MoonBit gameplay core that can act as the logic layer for a browser mini-game compiled to WebAssembly.",
      moonbitCode: gameDemoProgram(),
      sourceFiles,
    }, gameManifest(), buildBenchmarkProfile({
      scenario: "browser mini-game synthesis",
      fileInfo,
      generatedFileCount: sourceFiles.length,
      chunkSizes: ["not applicable"],
      focus: ["gameplay loop stability", "wasm startup time", "browser-safe runtime surface"],
      analysis,
    }));
  }

  if (selectedMode === "moonbit-task") {
    const sourceFiles = workflowSourceFiles(prompt);
    return attachSynthesisMetadata({
      title: "MoonBit Workflow Starter",
      summary: "Generated a MoonBit-first starter program for the requested task so it can continue into the WebAssembly execution flow.",
      moonbitCode: workflowProgram(prompt),
      sourceFiles,
    }, workflowManifest(), buildBenchmarkProfile({
      scenario: "MoonBit workflow synthesis",
      fileInfo,
      generatedFileCount: sourceFiles.length,
      chunkSizes: ["not applicable"],
      focus: ["project completeness", "reusable skills", "build success", "explainability"],
      analysis,
    }));
  }

  if (analysis?.analysisType === "fastq-n-stats" || contains(normalized, ["fastq", ".fastq", ".fq", "n base"])) {
    const sourceFiles = fastqSourceFiles(analysis, fileInfo);
    return attachSynthesisMetadata({
      title: "FastQ N Base Analyzer Demo",
      summary: "Generated a MoonBit demo program that shows the core counting logic for N bases and exposes Wasm helpers for browser-side verification.",
      moonbitCode: fastqDemoProgram(analysis, fileInfo),
      sourceFiles,
      wasmExports: ["is_n_base", "is_gc_base", "is_sequence_line", "is_sequence_state", "next_fastq_state", "accumulate_read_count", "accumulate_total_bases", "accumulate_n_bases", "accumulate_gc_bases", "update_longest_read", "update_shortest_read"],
    }, fastqManifest(), buildBenchmarkProfile({
      scenario: "FastQ local analysis",
      fileInfo,
      generatedFileCount: sourceFiles.length,
      chunkSizes: ["4 MB", "8 MB", "16 MB"],
      focus: ["memory peak", "chunk throughput", "total runtime", "output correctness"],
      analysis,
    }));
  }

  if (analysis?.analysisType === "csv-summary" || fileInfo?.detectedType === "csv" || contains(normalized, ["csv"])) {
    const sourceFiles = workflowSourceFiles(prompt);
    return attachSynthesisMetadata({
      title: "CSV Structure Demo",
      summary: "Generated a MoonBit demo program that illustrates simple CSV header analysis.",
      moonbitCode: csvDemoProgram(),
      sourceFiles,
    }, workflowManifest(), buildBenchmarkProfile({
      scenario: "local structured data analysis",
      fileInfo,
      generatedFileCount: sourceFiles.length,
      chunkSizes: ["4 MB"],
      focus: ["schema summary accuracy", "build success", "explainability"],
      analysis,
    }));
  }

  if (contains(normalized, ["hello", "greet"])) {
    const sourceFiles = workflowSourceFiles("Hello from MoonBit and WebAssembly!");
    return attachSynthesisMetadata({
      title: "Hello MoonBit",
      summary: "Generated a minimal runnable MoonBit program that prints a greeting.",
      moonbitCode: helloProgram("Hello from MoonBit and WebAssembly!"),
      sourceFiles,
    }, workflowManifest(), buildBenchmarkProfile({
      scenario: "MoonBit workflow synthesis",
      fileInfo,
      generatedFileCount: sourceFiles.length,
      chunkSizes: ["not applicable"],
      focus: ["build success", "starter project completeness"],
      analysis,
    }));
  }

  if (contains(normalized, ["sum"])) {
    const n = extractLastNumber(normalized, 100);
    const sourceFiles = workflowSourceFiles(`sum to ${n}`);
    return attachSynthesisMetadata({
      title: "Sum Calculator",
      summary: "Generated a MoonBit program that adds numbers from 1 to the requested upper bound.",
      moonbitCode: sumProgram(n),
      sourceFiles,
    }, workflowManifest(), buildBenchmarkProfile({
      scenario: "MoonBit workflow synthesis",
      fileInfo,
      generatedFileCount: sourceFiles.length,
      chunkSizes: ["not applicable"],
      focus: ["build success", "starter project completeness"],
      analysis,
    }));
  }

  const sourceFiles = workflowSourceFiles(prompt);
  return attachSynthesisMetadata({
    title: "MoonBit Starter",
    summary: "Returned a safe starter program when the local generator did not match a more specific intent.",
    moonbitCode: `fn main {\n  println("MoonAP received: ${safePrompt(prompt)}")\n  println("Tip: provide a file path and ask for local analysis to trigger the Wasm workflow.")\n}`,
    sourceFiles,
  }, workflowManifest(), buildBenchmarkProfile({
    scenario: "MoonBit workflow synthesis",
    fileInfo,
    generatedFileCount: sourceFiles.length,
    chunkSizes: ["not applicable"],
    focus: ["build success", "starter project completeness"],
    analysis,
  }));
}







