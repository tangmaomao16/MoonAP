pub enum TaskDomain {
  FastqAnalysis
  BrowserGame
  Utility
} derive(Eq, Debug, ToJson, FromJson)

///|
pub enum VerificationLevel {
  None
  JsonSchema
  Contract
  Formal
} derive(Eq, Debug, ToJson, FromJson)

///|
pub enum TaskKernelInputMode {
  StreamingText
  StreamingBytes
  WholeFileText
  WholeFileBytes
  Interactive
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct ChatMessage {
  role : String
  content : String
  timestamp : String
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct VerificationCheck {
  name : String
  level : VerificationLevel
  passed : Bool
  detail : String
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct ProjectFile {
  path : String
  purpose : String
  language : String
  generated : Bool
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct SkillRecord {
  name : String
  category : String
  summary : String
  reusable : Bool
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct BenchmarkProfile {
  scenario : String
  benchmark_tiers : Array[String]
  recommended_chunk_sizes : Array[String]
  evaluation_focus : Array[String]
  generated_source_file_count : Int
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct TaskKernelProtocol {
  protocol_name : String
  input_mode : TaskKernelInputMode
  state_type : String
  init_fn : String
  ingest_fn : String
  finalize_fn : String
  host_responsibilities : Array[String]
  kernel_responsibilities : Array[String]
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct SynthesisManifest {
  package_name : String
  entrypoint : String
  runtime_target : String
  project_files : Array[ProjectFile]
  skills : Array[SkillRecord]
  verification_gate : Array[VerificationCheck]
  benchmark_profile : BenchmarkProfile?
  task_kernel_protocol : TaskKernelProtocol?
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct TaskSpec {
  title : String
  user_goal : String
  domain : TaskDomain
  compile_to_wasm : Bool
  needs_browser_runtime : Bool
  needs_local_file_access : Bool
  verification_level : VerificationLevel
  required_capabilities : Array[String]
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct AgentContext {
  session_id : String
  messages : Array[ChatMessage]
  current_task : TaskSpec?
  verification_checks : Array[VerificationCheck]
  generated_files : Array[String]
  synthesis_manifest : SynthesisManifest?
  benchmark_profile : BenchmarkProfile?
} derive(Eq, Debug, ToJson, FromJson)

///|
pub fn new_context(session_id : String) -> AgentContext {
  {
    session_id,
    messages: [],
    current_task: None,
    verification_checks: [],
    generated_files: [],
    synthesis_manifest: None,
    benchmark_profile: None,
  }
}

///|
pub fn ChatMessage::new(
  role : String,
  content : String,
  timestamp : String,
) -> ChatMessage {
  { role, content, timestamp }
}

///|
pub fn VerificationCheck::new(
  name : String,
  level : VerificationLevel,
  passed : Bool,
  detail : String,
) -> VerificationCheck {
  { name, level, passed, detail }
}

///|
pub fn ProjectFile::new(
  path : String,
  purpose : String,
  language : String,
  generated : Bool,
) -> ProjectFile {
  { path, purpose, language, generated }
}

///|
pub fn SkillRecord::new(
  name : String,
  category : String,
  summary : String,
  reusable : Bool,
) -> SkillRecord {
  { name, category, summary, reusable }
}

///|
pub fn BenchmarkProfile::new(
  scenario : String,
  benchmark_tiers : Array[String],
  recommended_chunk_sizes : Array[String],
  evaluation_focus : Array[String],
  generated_source_file_count : Int,
) -> BenchmarkProfile {
  {
    scenario,
    benchmark_tiers,
    recommended_chunk_sizes,
    evaluation_focus,
    generated_source_file_count,
  }
}

///|
pub fn TaskKernelProtocol::new(
  protocol_name : String,
  input_mode : TaskKernelInputMode,
  state_type : String,
  init_fn : String,
  ingest_fn : String,
  finalize_fn : String,
  host_responsibilities : Array[String],
  kernel_responsibilities : Array[String],
) -> TaskKernelProtocol {
  {
    protocol_name,
    input_mode,
    state_type,
    init_fn,
    ingest_fn,
    finalize_fn,
    host_responsibilities,
    kernel_responsibilities,
  }
}

///|
pub fn SynthesisManifest::new(
  package_name : String,
  entrypoint : String,
  runtime_target : String,
  project_files : Array[ProjectFile],
  skills : Array[SkillRecord],
  verification_gate : Array[VerificationCheck],
  benchmark_profile : BenchmarkProfile?,
  task_kernel_protocol : TaskKernelProtocol?,
) -> SynthesisManifest {
  {
    package_name,
    entrypoint,
    runtime_target,
    project_files,
    skills,
    verification_gate,
    benchmark_profile,
    task_kernel_protocol,
  }
}

///|
pub fn TaskSpec::new(
  title : String,
  user_goal : String,
  domain : TaskDomain,
  compile_to_wasm : Bool,
  needs_browser_runtime : Bool,
  needs_local_file_access : Bool,
  verification_level : VerificationLevel,
  required_capabilities : Array[String],
) -> TaskSpec {
  {
    title,
    user_goal,
    domain,
    compile_to_wasm,
    needs_browser_runtime,
    needs_local_file_access,
    verification_level,
    required_capabilities,
  }
}

///|
pub fn AgentContext::push_message(
  self : AgentContext,
  message : ChatMessage,
) -> AgentContext {
  {
    session_id: self.session_id,
    messages: self.messages + [message],
    current_task: self.current_task,
    verification_checks: self.verification_checks,
    generated_files: self.generated_files,
    synthesis_manifest: self.synthesis_manifest,
    benchmark_profile: self.benchmark_profile,
  }
}

///|
pub fn AgentContext::set_task(self : AgentContext, task : TaskSpec) -> AgentContext {
  {
    session_id: self.session_id,
    messages: self.messages,
    current_task: Some(task),
    verification_checks: self.verification_checks,
    generated_files: self.generated_files,
    synthesis_manifest: self.synthesis_manifest,
    benchmark_profile: self.benchmark_profile,
  }
}

///|
pub fn AgentContext::record_check(
  self : AgentContext,
  check : VerificationCheck,
) -> AgentContext {
  {
    session_id: self.session_id,
    messages: self.messages,
    current_task: self.current_task,
    verification_checks: self.verification_checks + [check],
    generated_files: self.generated_files,
    synthesis_manifest: self.synthesis_manifest,
    benchmark_profile: self.benchmark_profile,
  }
}

///|
pub fn AgentContext::record_generated_file(
  self : AgentContext,
  path : String,
) -> AgentContext {
  {
    session_id: self.session_id,
    messages: self.messages,
    current_task: self.current_task,
    verification_checks: self.verification_checks,
    generated_files: self.generated_files + [path],
    synthesis_manifest: self.synthesis_manifest,
    benchmark_profile: self.benchmark_profile,
  }
}

///|
pub fn AgentContext::set_manifest(
  self : AgentContext,
  manifest : SynthesisManifest,
) -> AgentContext {
  {
    session_id: self.session_id,
    messages: self.messages,
    current_task: self.current_task,
    verification_checks: self.verification_checks,
    generated_files: self.generated_files,
    synthesis_manifest: Some(manifest),
    benchmark_profile: self.benchmark_profile,
  }
}

///|
pub fn AgentContext::set_benchmark_profile(
  self : AgentContext,
  profile : BenchmarkProfile,
) -> AgentContext {
  {
    session_id: self.session_id,
    messages: self.messages,
    current_task: self.current_task,
    verification_checks: self.verification_checks,
    generated_files: self.generated_files,
    synthesis_manifest: self.synthesis_manifest,
    benchmark_profile: Some(profile),
  }
}

///|
pub fn AgentContext::failed_check_count(self : AgentContext) -> Int {
  self.verification_checks.filter(check => !(check.passed)).length()
}

///|
pub fn AgentContext::ready_for_wasm(self : AgentContext) -> Bool {
  match self.current_task {
    Some(task) =>
      task.compile_to_wasm &&
      self.failed_check_count() == 0 &&
      self.generated_files.length() > 0
    None => false
  }
}

///|
pub fn AgentContext::to_pretty_json(self : AgentContext) -> String {
  self.to_json().stringify(indent=2)
}

///|
pub fn AgentContext::summary_lines(self : AgentContext) -> Array[String] {
  let task_line = match self.current_task {
    Some(task) => "task=" + task.title
    None => "task=(none)"
  }
  let ready_value = if self.ready_for_wasm() { "true" } else { "false" }
  let compile_line = "ready_for_wasm=" + ready_value
  let failed_line = "failed_checks=" + self.failed_check_count().to_string()
  [
    "session=" + self.session_id,
    task_line,
    "messages=" + self.messages.length().to_string(),
    failed_line,
    compile_line,
    "skills=" + self.synthesis_manifest.map(manifest => manifest.skills.length()).unwrap_or(0).to_string(),
    "benchmark=" + self.benchmark_profile.map(profile => profile.scenario).unwrap_or("(none)"),
  ]
}

///|
pub fn AgentContext::summary(self : AgentContext) -> String {
  self.summary_lines().iter().join("\n")
}

///|
pub fn fastq_demo_task() -> TaskSpec {
  TaskSpec::new(
    "FASTQ N-ratio analyzer",
    "Analyze a FASTQ file, count N bases, compute the ratio, and render a browser-friendly report.",
    FastqAnalysis,
    true,
    true,
    true,
    Formal,
    [
      "json-context",
      "fastq-streaming",
      "wasm-output",
      "browser-report",
    ],
  )
}

///|
pub fn browser_game_demo_task() -> TaskSpec {
  TaskSpec::new(
    "Canvas dodge mini-game",
    "Generate a small browser game in MoonBit that compiles to WebAssembly and runs inside the page.",
    BrowserGame,
    true,
    true,
    false,
    Contract,
    [
      "json-context",
      "game-state",
      "wasm-output",
      "browser-loop",
    ],
  )
}

///|
pub fn fastq_demo_manifest(task : TaskSpec) -> SynthesisManifest {
  let verification_gate = [
    VerificationCheck::new(
      "task-selected",
      JsonSchema,
      true,
      "The natural-language request has been normalized into a typed task.",
    ),
    VerificationCheck::new(
      "streaming-plan",
      Contract,
      true,
      "The generated analyzer is expected to process the file chunk by chunk instead of loading it all at once.",
    ),
    VerificationCheck::new(
      "formal-proof-slot",
      task.verification_level,
      true,
      "MoonAP reserved a formal verification slot for future MoonBit upgrades while using engineering checks today.",
    ),
  ]
  let benchmark_profile = BenchmarkProfile::new(
    "FastQ local analysis",
    ["0.1 GB", "1 GB", "5 GB"],
    ["4 MB", "8 MB", "16 MB"],
    ["memory peak", "chunk throughput", "total runtime", "output correctness"],
    3,
  )
  let task_kernel_protocol = TaskKernelProtocol::new(
    "moonap.fastq.streaming.v1",
    StreamingBytes,
    "FastqStreamingState",
    "init_state",
    "ingest_chunk",
    "finalize_report",
    [
      "open the local browser file and read it chunk by chunk",
      "copy each chunk into the MoonBit/Wasm bridge",
      "surface progress, benchmark metrics, and final report in the UI",
    ],
    [
      "keep FastQ carry-over state between chunks",
      "advance the four-line FastQ state machine",
      "accumulate read count, N count, GC count, and read-length statistics",
      "return a final analysis report that is safe to render in the browser",
    ],
  )
  SynthesisManifest::new(
    "moonap/fastq_n_ratio",
    "cmd/main/main.mbt",
    "wasm",
    [
      ProjectFile::new("moon.mod.json", "module metadata", "json", true),
      ProjectFile::new("moon.pkg", "package imports and options", "moonpkg", true),
      ProjectFile::new("cmd/main/main.mbt", "browser entrypoint and reporting", "moonbit", true),
      ProjectFile::new("cmd/main/fastq_stats.mbt", "N-base and GC statistics", "moonbit", true),
      ProjectFile::new("cmd/main/fastq_chunking.mbt", "chunk sizing guidance for benchmark runs", "moonbit", true),
    ],
    [
      SkillRecord::new(
        "fastq-n-ratio",
        "bioinformatics",
        "Counts N bases and computes their ratio over all observed bases.",
        true,
      ),
      SkillRecord::new(
        "chunk-stream-reader",
        "runtime",
      "Streams local text data in chunks so large files stay browser-friendly.",
        true,
      ),
    ],
    verification_gate,
    Some(benchmark_profile),
    Some(task_kernel_protocol),
  )
}

///|
pub fn browser_game_demo_manifest(task : TaskSpec) -> SynthesisManifest {
  let benchmark_profile = BenchmarkProfile::new(
    "browser mini-game synthesis",
    ["prototype", "playable", "competition-demo"],
    ["not-applicable"],
    ["gameplay loop stability", "wasm startup time", "browser-safe runtime surface"],
    3,
  )
  let task_kernel_protocol = TaskKernelProtocol::new(
    "moonap.browser.interactive.v1",
    Interactive,
    "GameRuntimeState",
    "init_state",
    "ingest_event",
    "finalize_frame",
    [
      "collect browser input events and timing information",
      "forward events into the MoonBit game kernel",
      "render the returned frame state in the browser shell",
    ],
    [
      "own gameplay state transitions",
      "apply player input and collision rules",
      "emit browser-safe frame summaries for rendering",
    ],
  )
  SynthesisManifest::new(
    "moonap/browser_game",
    "cmd/main/main.mbt",
    "wasm",
    [
      ProjectFile::new("moon.mod.json", "module metadata", "json", true),
      ProjectFile::new("moon.pkg", "package imports and options", "moonpkg", true),
      ProjectFile::new("cmd/main/main.mbt", "browser game entrypoint", "moonbit", true),
      ProjectFile::new("cmd/main/game_state.mbt", "gameplay state transitions", "moonbit", true),
      ProjectFile::new("cmd/main/game_loop.mbt", "browser tick loop contract", "moonbit", true),
    ],
    [
      SkillRecord::new(
        "browser-dodge-loop",
        "gameplay",
        "Provides a simple dodge-loop that can be rendered by the browser shell.",
        true,
      ),
      SkillRecord::new(
        "wasm-ui-bridge",
        "runtime",
        "Bridges MoonBit gameplay logic with browser-side presentation code.",
        true,
      ),
    ],
    [
      VerificationCheck::new(
        "task-selected",
        JsonSchema,
        true,
        "The game request has been normalized into a typed MoonBit synthesis task.",
      ),
      VerificationCheck::new(
        "input-boundaries",
        Contract,
        true,
        "The generated game loop stays inside the browser-safe runtime surface.",
      ),
      VerificationCheck::new(
        "formal-proof-slot",
        task.verification_level,
        true,
        "MoonAP reserved a future formal verification slot while shipping engineering validation today.",
      ),
    ],
    Some(benchmark_profile),
    Some(task_kernel_protocol),
  )
}

///|
pub fn build_demo_context(task : TaskSpec) -> AgentContext {
  let manifest = match task.domain {
    FastqAnalysis => fastq_demo_manifest(task)
    BrowserGame => browser_game_demo_manifest(task)
    Utility => fastq_demo_manifest(task)
  }
  let benchmark_profile = manifest.benchmark_profile.unwrap()
  new_context("demo-session")
  .push_message(
    ChatMessage::new(
      "system",
      "MoonAP should translate natural language into MoonBit, keep context in JSON, verify the plan, and only then compile to Wasm.",
      "2026-04-14T00:00:00Z",
    ),
  )
  .push_message(
    ChatMessage::new(
      "user",
      task.user_goal,
      "2026-04-14T00:00:05Z",
    ),
  )
  .set_task(task)
  .record_check(manifest.verification_gate[0])
  .record_check(manifest.verification_gate[1])
  .record_check(manifest.verification_gate[2])
  .record_generated_file("cmd/main/main.mbt")
  .record_generated_file(manifest.project_files[3].path)
  .record_generated_file(manifest.project_files[4].path)
  .set_manifest(manifest)
  .set_benchmark_profile(benchmark_profile)
}

///|
pub fn moonbit_agent_skill() -> String {
  [
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
  ].iter().join("\n")
}
