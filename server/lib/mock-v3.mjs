function contains(text, words) {
  return words.some((word) => text.includes(word));
}

function extractLastNumber(text, fallback) {
  const matches = text.match(/\d+/g);
  return matches && matches.length > 0 ? Number(matches[matches.length - 1]) : fallback;
}

function helloProgram(message) {
  return `fn main {\n  println("${message}")\n}`;
}

function sumProgram(limit) {
  return `fn sum_to(n : Int) -> Int {\n  let mut total = 0\n  let mut i = 1\n  while i <= n {\n    total = total + i\n    i = i + 1\n  }\n  total\n}\n\nfn main {\n  let n = ${limit}\n  println("sum(1.." + n.to_string() + ") = " + sum_to(n).to_string())\n}`;
}

function fastqDemoProgram() {
  return `fn count_n_bases(sequence : String) -> Int {\n  let mut total = 0\n  for char in sequence {\n    if char == 'N' || char == 'n' {\n      total = total + 1\n    }\n  }\n  total\n}\n\nfn main {\n  let sample = "AATTCCGGNNNNA"\n  let n_count = count_n_bases(sample)\n  println("sample sequence = " + sample)\n  println("N bases = " + n_count.to_string())\n  println("ratio = " + n_count.to_string() + "/" + sample.length().to_string())\n}`;
}

function csvDemoProgram() {
  return `fn split_count(line : String, delimiter : Char) -> Int {\n  let mut count = 1\n  for char in line {\n    if char == delimiter {\n      count = count + 1\n    }\n  }\n  count\n}\n\nfn main {\n  let header = "sample_id,group,score"\n  println("header = " + header)\n  println("column count = " + split_count(header, ',').to_string())\n}`;
}

function gameDemoProgram() {
  return `struct Player {\n  x : Int\n  score : Int\n}\n\nfn step(player : Player, tick : Int) -> Player {\n  let shift = if tick % 2 == 0 { 1 } else { 2 }\n  { x: player.x + shift, score: player.score + 10 }\n}\n\nfn main {\n  let mut player = { x: 0, score: 0 }\n  let mut tick = 0\n  while tick < 5 {\n    player = step(player, tick)\n    println("tick=" + tick.to_string() + " x=" + player.x.to_string() + " score=" + player.score.to_string())\n    tick = tick + 1\n  }\n  println("MoonAP game core ready for browser-side rendering integration.")\n}`;
}

function workflowProgram(prompt) {
  return `fn main {\n  println("MoonAP MoonBit task")\n  println("request = ${safePrompt(prompt)}")\n  println("next = compile to WebAssembly and run in the browser")\n}`;
}

function fastqSourceFiles() {
  return [
    {
      path: "cmd/main/main.mbt",
      content: `fn main {\n  let sample = "AATTCCGGNNNNA"\n  let n_count = count_n_bases(sample)\n  println("sample sequence = " + sample)\n  println("N bases = " + n_count.to_string())\n  println("ratio = " + n_count.to_string() + "/" + sample.length().to_string())\n}`,
    },
    {
      path: "cmd/main/fastq_stats.mbt",
      content: `fn count_n_bases(sequence : String) -> Int {\n  let mut total = 0\n  for char in sequence {\n    if char == 'N' || char == 'n' {\n      total = total + 1\n    }\n  }\n  total\n}`,
    },
  ];
}

function gameSourceFiles() {
  return [
    {
      path: "cmd/main/main.mbt",
      content: `fn main {\n  let mut player = { x: 0, score: 0 }\n  let mut tick = 0\n  while tick < 5 {\n    player = step(player, tick)\n    println("tick=" + tick.to_string() + " x=" + player.x.to_string() + " score=" + player.score.to_string())\n    tick = tick + 1\n  }\n  println("MoonAP game core ready for browser-side rendering integration.")\n}`,
    },
    {
      path: "cmd/main/game_state.mbt",
      content: `struct Player {\n  x : Int\n  score : Int\n}\n\nfn step(player : Player, tick : Int) -> Player {\n  let shift = if tick % 2 == 0 { 1 } else { 2 }\n  { x: player.x + shift, score: player.score + 10 }\n}`,
    },
  ];
}

function workflowSourceFiles(prompt) {
  return [
    {
      path: "cmd/main/main.mbt",
      content: `fn main {\n  let request = normalize_request("${safePrompt(prompt)}")\n  println("MoonAP MoonBit task")\n  println("request = " + request)\n  println("next = compile to WebAssembly and run in the browser")\n}`,
    },
    {
      path: "cmd/main/agent_spec.mbt",
      content: `fn normalize_request(raw : String) -> String {\n  raw.trim().replace(\"\\n\", \" \")\n}`,
    },
  ];
}

function buildProjectManifest({ packageName, entrypoint, projectFiles, skills, verificationGate }) {
  return {
    packageName,
    entrypoint,
    runtimeTarget: "wasm",
    projectFiles,
    skills,
    verificationGate,
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

function fastqManifest() {
  return buildProjectManifest({
    packageName: "moonap/fastq_n_ratio",
    entrypoint: "cmd/main/main.mbt",
    projectFiles: [
      { path: "moon.mod.json", purpose: "module metadata", language: "json", generated: true },
      { path: "moon.pkg", purpose: "package imports and options", language: "moonpkg", generated: true },
      { path: "cmd/main/main.mbt", purpose: "browser entrypoint", language: "moonbit", generated: true },
      { path: "src/fastq/parser.mbt", purpose: "streaming FastQ parsing", language: "moonbit", generated: true },
      { path: "src/fastq/stats.mbt", purpose: "N-base and quality statistics", language: "moonbit", generated: true },
      { path: "tests/fastq_stats_test.mbt", purpose: "analysis regression tests", language: "moonbit", generated: true },
    ],
    skills: [
      { name: "fastq-n-ratio", category: "bioinformatics", summary: "Counts N bases and computes their ratio over all observed bases.", reusable: true },
      { name: "chunk-stream-reader", category: "runtime", summary: "Streams local text data in chunks so GB-level files stay browser-friendly.", reusable: true },
    ],
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
      { path: "src/game/state.mbt", purpose: "gameplay state transitions", language: "moonbit", generated: true },
      { path: "src/game/loop.mbt", purpose: "browser loop integration contract", language: "moonbit", generated: true },
      { path: "tests/game_loop_test.mbt", purpose: "gameplay regression tests", language: "moonbit", generated: true },
    ],
    skills: [
      { name: "browser-dodge-loop", category: "gameplay", summary: "Provides a small dodge-loop suitable for browser rendering shells.", reusable: true },
      { name: "wasm-ui-bridge", category: "runtime", summary: "Connects MoonBit gameplay logic to browser-side drawing code.", reusable: true },
    ],
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
      { path: "src/agent/spec.mbt", purpose: "task spec normalization", language: "moonbit", generated: true },
      { path: "src/agent/context.mbt", purpose: "json context and session memory", language: "moonbit", generated: true },
      { path: "tests/workflow_test.mbt", purpose: "workflow regression tests", language: "moonbit", generated: true },
    ],
    skills: [
      { name: "task-spec-normalizer", category: "agent", summary: "Turns natural language requests into typed synthesis tasks.", reusable: true },
      { name: "context-json-store", category: "agent", summary: "Stores multi-turn state in MoonBit-friendly JSON structures.", reusable: true },
    ],
    verificationGate: [
      ...baseVerificationGate(),
      {
        name: "future-proof-slot",
        level: "Formal",
        passed: true,
        detail: "A future MoonBit formal verification step can be inserted here without changing the rest of the pipeline.",
      },
    ],
  });
}

function attachSynthesisMetadata(baseArtifact, manifest) {
  return {
    ...baseArtifact,
    projectManifest: manifest,
    skills: manifest.skills,
    verificationGate: manifest.verificationGate,
  };
}

function safePrompt(prompt) {
  return prompt.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
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
        ? `I also prepared a MoonBit artifact called "${artifact.title}" together with a project manifest, reusable skills, and a verification gate summary.`
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
    return attachSynthesisMetadata({
      title: "Browser Mini-Game Core",
      summary: "Generated a MoonBit gameplay core that can act as the logic layer for a browser mini-game compiled to WebAssembly.",
      moonbitCode: gameDemoProgram(),
      sourceFiles: gameSourceFiles(),
    }, gameManifest());
  }

  if (selectedMode === "moonbit-task") {
    return attachSynthesisMetadata({
      title: "MoonBit Workflow Starter",
      summary: "Generated a MoonBit-first starter program for the requested task so it can continue into the WebAssembly execution flow.",
      moonbitCode: workflowProgram(prompt),
      sourceFiles: workflowSourceFiles(prompt),
    }, workflowManifest());
  }

  if (analysis?.analysisType === "fastq-n-stats" || contains(normalized, ["fastq", ".fastq", ".fq", "n base"])) {
    return attachSynthesisMetadata({
      title: "FastQ N Base Analyzer Demo",
      summary: "Generated a MoonBit demo program that shows the core counting logic for N bases.",
      moonbitCode: fastqDemoProgram(),
      sourceFiles: fastqSourceFiles(),
    }, fastqManifest());
  }

  if (analysis?.analysisType === "csv-summary" || fileInfo?.detectedType === "csv" || contains(normalized, ["csv"])) {
    return attachSynthesisMetadata({
      title: "CSV Structure Demo",
      summary: "Generated a MoonBit demo program that illustrates simple CSV header analysis.",
      moonbitCode: csvDemoProgram(),
      sourceFiles: workflowSourceFiles(prompt),
    }, workflowManifest());
  }

  if (contains(normalized, ["hello", "greet"])) {
    return attachSynthesisMetadata({
      title: "Hello MoonBit",
      summary: "Generated a minimal runnable MoonBit program that prints a greeting.",
      moonbitCode: helloProgram("Hello from MoonBit and WebAssembly!"),
      sourceFiles: workflowSourceFiles("Hello from MoonBit and WebAssembly!"),
    }, workflowManifest());
  }

  if (contains(normalized, ["sum"])) {
    const n = extractLastNumber(normalized, 100);
    return attachSynthesisMetadata({
      title: "Sum Calculator",
      summary: "Generated a MoonBit program that adds numbers from 1 to the requested upper bound.",
      moonbitCode: sumProgram(n),
      sourceFiles: workflowSourceFiles(`sum to ${n}`),
    }, workflowManifest());
  }

  return attachSynthesisMetadata({
    title: "MoonBit Starter",
    summary: "Returned a safe starter program when the local generator did not match a more specific intent.",
    moonbitCode: `fn main {\n  println("MoonAP received: ${safePrompt(prompt)}")\n  println("Tip: provide a file path and ask for local analysis to trigger the Wasm workflow.")\n}`,
    sourceFiles: workflowSourceFiles(prompt),
  }, workflowManifest());
}
