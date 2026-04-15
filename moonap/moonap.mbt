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
pub struct TaskModePolicy {
  mode : String
  label : String
  summary : String
  system_prompt : String
  artifact_required : Bool
  requires_file : Bool
  default_analysis : String
  file_types : Array[String]
  prompt_keywords : Array[String]
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct TaskRouterPolicy {
  default_mode : String
  modes : Array[TaskModePolicy]
  file_analysis_keywords : Array[String]
  artifact_keywords : Array[String]
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct LlmModelPolicy {
  value : String
  label : String
  recommended : Bool
  priority : Int
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct LlmProviderPolicy {
  key : String
  label : String
  base_url : String
  default_model : String
  preset_label : String
  models : Array[LlmModelPolicy]
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct LlmRouterPolicy {
  default_provider : String
  default_cooldown_ms : Int
  rate_limit_cooldown_ms : Int
  network_cooldown_ms : Int
  providers : Array[LlmProviderPolicy]
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct FileTypePolicy {
  detected_type : String
  label : String
  extensions : Array[String]
  default_analysis : String
  streaming_preferred : Bool
  supported_now : Bool
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct AnalysisPolicy {
  analysis_type : String
  label : String
  summary : String
  benchmark_tiers : Array[String]
  recommended_chunk_sizes : Array[String]
  evaluation_focus : Array[String]
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct FileAnalysisPolicy {
  max_preview_bytes : Int
  max_preview_lines : Int
  file_types : Array[FileTypePolicy]
  analyses : Array[AnalysisPolicy]
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
pub fn TaskModePolicy::new(
  mode : String,
  label : String,
  summary : String,
  system_prompt : String,
  artifact_required : Bool,
  requires_file : Bool,
  default_analysis : String,
  file_types : Array[String],
  prompt_keywords : Array[String],
) -> TaskModePolicy {
  {
    mode,
    label,
    summary,
    system_prompt,
    artifact_required,
    requires_file,
    default_analysis,
    file_types,
    prompt_keywords,
  }
}

///|
pub fn TaskRouterPolicy::new(
  default_mode : String,
  modes : Array[TaskModePolicy],
  file_analysis_keywords : Array[String],
  artifact_keywords : Array[String],
) -> TaskRouterPolicy {
  {
    default_mode,
    modes,
    file_analysis_keywords,
    artifact_keywords,
  }
}

///|
pub fn LlmModelPolicy::new(
  value : String,
  label : String,
  recommended : Bool,
  priority : Int,
) -> LlmModelPolicy {
  { value, label, recommended, priority }
}

///|
pub fn LlmProviderPolicy::new(
  key : String,
  label : String,
  base_url : String,
  default_model : String,
  preset_label : String,
  models : Array[LlmModelPolicy],
) -> LlmProviderPolicy {
  { key, label, base_url, default_model, preset_label, models }
}

///|
pub fn LlmRouterPolicy::new(
  default_provider : String,
  default_cooldown_ms : Int,
  rate_limit_cooldown_ms : Int,
  network_cooldown_ms : Int,
  providers : Array[LlmProviderPolicy],
) -> LlmRouterPolicy {
  {
    default_provider,
    default_cooldown_ms,
    rate_limit_cooldown_ms,
    network_cooldown_ms,
    providers,
  }
}

///|
pub fn FileTypePolicy::new(
  detected_type : String,
  label : String,
  extensions : Array[String],
  default_analysis : String,
  streaming_preferred : Bool,
  supported_now : Bool,
) -> FileTypePolicy {
  {
    detected_type,
    label,
    extensions,
    default_analysis,
    streaming_preferred,
    supported_now,
  }
}

///|
pub fn AnalysisPolicy::new(
  analysis_type : String,
  label : String,
  summary : String,
  benchmark_tiers : Array[String],
  recommended_chunk_sizes : Array[String],
  evaluation_focus : Array[String],
) -> AnalysisPolicy {
  {
    analysis_type,
    label,
    summary,
    benchmark_tiers,
    recommended_chunk_sizes,
    evaluation_focus,
  }
}

///|
pub fn FileAnalysisPolicy::new(
  max_preview_bytes : Int,
  max_preview_lines : Int,
  file_types : Array[FileTypePolicy],
  analyses : Array[AnalysisPolicy],
) -> FileAnalysisPolicy {
  { max_preview_bytes, max_preview_lines, file_types, analyses }
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
pub fn workflow_demo_task() -> TaskSpec {
  TaskSpec::new(
    "MoonBit workflow task",
    "Turn a natural-language request into a small MoonBit workflow that can compile to WebAssembly.",
    Utility,
    true,
    true,
    false,
    Contract,
    [
      "json-context",
      "task-normalization",
      "wasm-output",
      "browser-report",
    ],
  )
}

///|
pub fn fastq_demo_manifest(_task : TaskSpec) -> SynthesisManifest {
  let benchmark_profile = BenchmarkProfile::new(
    "FastQ local analysis",
    ["0.1 GB", "1 GB", "5 GB"],
    ["4 MB", "8 MB", "16 MB"],
    ["memory peak", "chunk throughput", "total runtime", "output correctness"],
    4,
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
      ProjectFile::new("cmd/main/fastq_wasm_runtime.mbt", "Wasm-exported FastQ state machine helpers", "moonbit", true),
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
    verification_gate_for_mode("fastq-agent", "fastq-n-stats"),
    Some(benchmark_profile),
    Some(fastq_task_kernel_protocol()),
  )
}

///|
pub fn browser_game_demo_manifest(_task : TaskSpec) -> SynthesisManifest {
  let benchmark_profile = BenchmarkProfile::new(
    "browser mini-game synthesis",
    ["prototype", "playable", "competition-demo"],
    ["not applicable"],
    ["gameplay loop stability", "wasm startup time", "browser-safe runtime surface"],
    3,
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
    verification_gate_for_mode("game-agent", ""),
    Some(benchmark_profile),
    Some(game_task_kernel_protocol()),
  )
}

///|
pub fn workflow_demo_manifest(_task : TaskSpec) -> SynthesisManifest {
  let benchmark_profile = BenchmarkProfile::new(
    "MoonBit workflow synthesis",
    ["prototype", "usable", "competition-demo"],
    ["not applicable"],
    ["project completeness", "reusable skills", "build success", "explainability"],
    3,
  )
  SynthesisManifest::new(
    "moonap/workflow_task",
    "cmd/main/main.mbt",
    "wasm",
    [
      ProjectFile::new("moon.mod.json", "module metadata", "json", true),
      ProjectFile::new("moon.pkg", "package imports and options", "moonpkg", true),
      ProjectFile::new("cmd/main/main.mbt", "workflow entrypoint", "moonbit", true),
      ProjectFile::new("cmd/main/agent_spec.mbt", "task spec normalization", "moonbit", true),
      ProjectFile::new("cmd/main/session_context.mbt", "session label and lightweight context tracking", "moonbit", true),
    ],
    [
      SkillRecord::new(
        "task-spec-normalizer",
        "agent",
        "Turns natural language requests into typed synthesis tasks.",
        true,
      ),
      SkillRecord::new(
        "context-json-store",
        "agent",
        "Stores multi-turn state in MoonBit-friendly JSON structures.",
        true,
      ),
    ],
    verification_gate_for_mode("moonbit-task", ""),
    Some(benchmark_profile),
    Some(workflow_task_kernel_protocol()),
  )
}

///|
pub fn fastq_task_kernel_protocol() -> TaskKernelProtocol {
  TaskKernelProtocol::new(
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
}

///|
pub fn workflow_task_kernel_protocol() -> TaskKernelProtocol {
  TaskKernelProtocol::new(
    "moonap.workflow.whole-file.v1",
    WholeFileText,
    "WorkflowTaskState",
    "init_state",
    "ingest_input",
    "finalize_result",
    [
      "collect the user's task input and selected files",
      "pass normalized text or bytes into the MoonBit kernel",
      "render the final result and generated artifacts",
    ],
    [
      "normalize task state",
      "process task-specific input",
      "return a final result for browser rendering",
    ],
  )
}

///|
pub fn game_task_kernel_protocol() -> TaskKernelProtocol {
  TaskKernelProtocol::new(
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
}

///|
pub fn task_kernel_protocol_for_mode(mode : String) -> TaskKernelProtocol? {
  match mode {
    "fastq-agent" => Some(fastq_task_kernel_protocol())
    "game-agent" => Some(game_task_kernel_protocol())
    "moonbit-task" => Some(workflow_task_kernel_protocol())
    _ => None
  }
}

///|
pub fn task_kernel_protocol_json_for_mode(mode : String) -> String {
  match task_kernel_protocol_for_mode(mode) {
    Some(protocol) => protocol.to_json().stringify(indent=2)
    None => "null"
  }
}

///|
pub fn verification_gate_for_mode(mode : String, analysis_type : String) -> Array[VerificationCheck] {
  let third_check = if mode == "fastq-agent" || analysis_type == "fastq-n-stats" {
    VerificationCheck::new(
      "streaming-plan",
      Formal,
      true,
      "MoonAP reserved a formal-proof slot for chunk-safe file analysis while using engineering checks in the current release.",
    )
  } else if mode == "game-agent" {
    VerificationCheck::new(
      "runtime-boundary",
      Contract,
      true,
      "The generated Wasm gameplay loop stays inside the browser-safe execution surface.",
    )
  } else {
    VerificationCheck::new(
      "future-proof-slot",
      Formal,
      true,
      "A future MoonBit formal verification step can be inserted here without changing the rest of the synthesis pipeline.",
    )
  }
  [
    VerificationCheck::new(
      "task-selected",
      JsonSchema,
      true,
      "MoonAP normalized the natural-language request into a typed synthesis task.",
    ),
    VerificationCheck::new(
      "engineering-gate",
      Contract,
      true,
      "This version uses engineering validation gates today while reserving a future formal verification slot.",
    ),
    third_check,
  ]
}

///|
pub fn verification_gate_json_for_mode(mode : String, analysis_type : String) -> String {
  verification_gate_for_mode(mode, analysis_type).to_json().stringify(indent=2)
}

///|
pub fn synthesis_manifest_for_mode(mode : String, analysis_type : String) -> SynthesisManifest {
  if mode == "fastq-agent" || analysis_type == "fastq-n-stats" {
    fastq_demo_manifest(fastq_demo_task())
  } else if mode == "game-agent" {
    browser_game_demo_manifest(browser_game_demo_task())
  } else {
    workflow_demo_manifest(workflow_demo_task())
  }
}

///|
pub fn synthesis_manifest_json_for_mode(mode : String, analysis_type : String) -> String {
  synthesis_manifest_for_mode(mode, analysis_type).to_json().stringify(indent=2)
}

///|
pub fn benchmark_profile_json_for_mode(mode : String, analysis_type : String) -> String {
  synthesis_manifest_for_mode(mode, analysis_type)
  .benchmark_profile
  .unwrap()
  .to_json()
  .stringify(indent=2)
}

///|
pub fn task_router_policy() -> TaskRouterPolicy {
  TaskRouterPolicy::new(
    "chat",
    [
      TaskModePolicy::new(
        "chat",
        "Chat",
        "General MoonAP conversation and task planning.",
        "The user is chatting with MoonAP in conversational mode.",
        false,
        false,
        "auto",
        [],
        ["chat", "assistant", "moonap", "plan", "explain"],
      ),
      TaskModePolicy::new(
        "moonbit-task",
        "MoonBit Builder",
        "Generate a MoonBit-first workflow that can compile to WebAssembly.",
        "The user explicitly wants a MoonBit-first workflow. Generate a practical MoonBit program that is suitable for compilation to WebAssembly and browser execution when possible.",
        true,
        false,
        "auto",
        [],
        ["moonbit", "webassembly", "wasm", "generate code", "compile"],
      ),
      TaskModePolicy::new(
        "fastq-agent",
        "FastQ Skill",
        "A built-in bioinformatics skill for local FastQ file analysis.",
        "The user selected a FastQ analysis skill. Keep the logic local-file-first and produce MoonBit code that supports the requested analysis.",
        true,
        true,
        "fastq-n-stats",
        ["fastq", "fq"],
        ["fastq", ".fastq", ".fq", "n base", "n bases", "quality"],
      ),
      TaskModePolicy::new(
        "game-agent",
        "Game Studio",
        "Generate browser mini-game logic in MoonBit for WebAssembly execution.",
        "The user selected a browser mini-game skill. Produce MoonBit code that is compact, understandable, and suitable as a WebAssembly game prototype or gameplay core.",
        true,
        false,
        "auto",
        [],
        ["game", "canvas", "arcade", "player", "enemy", "score"],
      ),
    ],
    [
      "file",
      "analyze",
      "analysis",
      "count",
      "ratio",
      "quality",
      "csv",
      "json",
      "log",
      "stats",
      "inspect",
      "table",
      "excel",
    ],
    [
      "moonbit",
      "webassembly",
      "wasm",
      "game",
      "generate code",
      "compile",
      "run in browser",
      "local file",
    ],
  )
}

///|
pub fn task_router_policy_json() -> String {
  task_router_policy().to_json().stringify(indent=2)
}

///|
pub fn llm_router_policy() -> LlmRouterPolicy {
  LlmRouterPolicy::new(
    "gemini",
    30000,
    3600000,
    120000,
    [
      LlmProviderPolicy::new(
        "gemini",
        "Gemini",
        "https://generativelanguage.googleapis.com/v1beta/openai/",
        "gemini-3-flash-preview",
        "Gemini provider loaded. Paste your Google AI Studio API key and save settings.",
        [
          LlmModelPolicy::new("gemini-3-flash-preview", "Gemini 3 Flash", true, 100),
          LlmModelPolicy::new("gemini-2.5-flash", "Gemini 2.5 Flash", false, 80),
          LlmModelPolicy::new("gemini-2.5-pro", "Gemini 2.5 Pro", false, 70),
        ],
      ),
      LlmProviderPolicy::new(
        "siliconflow",
        "SiliconFlow",
        "https://api.siliconflow.cn/v1",
        "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
        "SiliconFlow provider loaded. Paste your SiliconFlow API key and save settings.",
        [
          LlmModelPolicy::new(
            "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
            "DeepSeek R1 Distill Qwen 32B",
            true,
            85,
          ),
          LlmModelPolicy::new(
            "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
            "DeepSeek R1 Distill Qwen 14B",
            false,
            75,
          ),
          LlmModelPolicy::new(
            "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
            "DeepSeek R1 Distill Qwen 7B",
            false,
            60,
          ),
        ],
      ),
      LlmProviderPolicy::new(
        "zai",
        "Z.AI / GLM",
        "https://api.z.ai/api/paas/v4/",
        "glm-4.7-flash",
        "Z.AI provider loaded. Paste your Z.AI API key and save settings.",
        [
          LlmModelPolicy::new("glm-4.7-flash", "GLM 4.7 Flash", true, 90),
          LlmModelPolicy::new("glm-5.1", "GLM 5.1", false, 88),
        ],
      ),
      LlmProviderPolicy::new(
        "openrouter",
        "OpenRouter",
        "https://openrouter.ai/api/v1",
        "openrouter/free",
        "OpenRouter provider loaded. Paste your OpenRouter API key and save settings.",
        [
          LlmModelPolicy::new("openrouter/free", "OpenRouter Free Router", true, 40),
        ],
      ),
    ],
  )
}

///|
pub fn llm_router_policy_json() -> String {
  llm_router_policy().to_json().stringify(indent=2)
}

///|
pub fn file_analysis_policy() -> FileAnalysisPolicy {
  FileAnalysisPolicy::new(
    4096,
    12,
    [
      FileTypePolicy::new(
        "fastq",
        "FastQ sequencing reads",
        [".fastq", ".fq"],
        "fastq-n-stats",
        true,
        true,
      ),
      FileTypePolicy::new(
        "csv",
        "CSV table",
        [".csv"],
        "csv-summary",
        true,
        true,
      ),
      FileTypePolicy::new(
        "json",
        "JSON document",
        [".json"],
        "json-summary",
        false,
        true,
      ),
      FileTypePolicy::new(
        "text",
        "Text or log file",
        [".txt", ".log", ".tsv"],
        "text-summary",
        true,
        true,
      ),
      FileTypePolicy::new(
        "spreadsheet",
        "Spreadsheet table",
        [".xlsx", ".xls"],
        "spreadsheet-summary",
        false,
        false,
      ),
    ],
    [
      AnalysisPolicy::new(
        "fastq-n-stats",
        "FastQ N-base statistics",
        "Count reads, total bases, N bases, GC bases, and read-length statistics.",
        ["0.1 GB", "1 GB", "5 GB"],
        ["4 MB", "8 MB", "16 MB"],
        ["memory peak", "chunk throughput", "total runtime", "output correctness"],
      ),
      AnalysisPolicy::new(
        "csv-summary",
        "CSV structure summary",
        "Detect header columns and estimate row count.",
        ["small", "medium", "large"],
        ["4 MB"],
        ["schema summary accuracy", "row count", "build success"],
      ),
      AnalysisPolicy::new(
        "json-summary",
        "JSON structure summary",
        "Detect top-level JSON structure without uploading local data.",
        ["small", "medium", "large"],
        ["not applicable"],
        ["structure accuracy", "safe preview", "build success"],
      ),
      AnalysisPolicy::new(
        "text-summary",
        "Text/log summary",
        "Count lines and summarize preview size.",
        ["small", "medium", "large"],
        ["4 MB", "8 MB"],
        ["line count", "preview accuracy", "build success"],
      ),
      AnalysisPolicy::new(
        "spreadsheet-summary",
        "Spreadsheet summary",
        "Planned XLSX/XLS table analysis skill for finance and office workflows.",
        ["small", "medium", "large"],
        ["not applicable"],
        ["sheet detection", "column typing", "filter correctness"],
      ),
    ],
  )
}

///|
pub fn file_analysis_policy_json() -> String {
  file_analysis_policy().to_json().stringify(indent=2)
}

///|
pub fn build_demo_context(task : TaskSpec) -> AgentContext {
  let manifest = match task.domain {
    FastqAnalysis => fastq_demo_manifest(task)
    BrowserGame => browser_game_demo_manifest(task)
    Utility => workflow_demo_manifest(task)
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

///|
pub fn moonbit_codegen_contract() -> String {
  [
    "Return strict JSON with keys: title, summary, moonbitCode, sourceFiles, projectManifest, skills, verificationGate, taskKernelProtocol.",
    "sourceFiles is required and must be an array of { path, content } objects.",
    "cmd/main/main.mbt must exist in sourceFiles.",
    "Prefer a single-package project rooted at cmd/main whenever possible.",
    "If extra package directories such as lib or runtime are created, each directory with .mbt files must be a valid MoonBit package and imports must match those directory names.",
    "Do not reference packages like @lib unless matching source files exist in that package directory.",
    "For workflow and utility tasks, prefer 2-3 small source files instead of a single giant file.",
    "Put reusable logic in helper files under cmd/main and make main.mbt call those helpers.",
    "The generated program must print a visible result to stdout when the wasm entrypoint runs.",
    "Use println for normal visible output. Do not use print_string.",
    "For downloadable file generation tasks, build the full output string or JSON bundle and print it once at the end with println.",
    "Avoid random-number APIs or numeric reinterpret tricks unless absolutely required. Prefer deterministic generation from the record index.",
    "moonbitCode must still be present and match the main entry program.",
    "projectManifest must describe the synthesized multi-file MoonBit project.",
    "verificationGate must be an array of checks with name, level, passed, detail.",
    "skills must be an array of reusable skill records.",
    "Optional key: generatedDownloads. Use it when the task should create downloadable files from Wasm output.",
    "taskKernelProtocol must be present and must match the requested protocol exactly when one is provided.",
    "Generate MoonBit code that follows the protocol lifecycle: init -> ingest -> finalize.",
    "Prefer simple MoonBit 0.9-compatible code. Avoid StringView replace calls such as raw.trim().replace(...); use raw.trim().to_string() or other clearly compatible forms.",
    "Do not return markdown fences or explanations outside the JSON object.",
  ].iter().join("\n")
}
