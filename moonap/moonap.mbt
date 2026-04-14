///|
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
} derive(Eq, Debug, ToJson, FromJson)

///|
pub fn new_context(session_id : String) -> AgentContext {
  {
    session_id,
    messages: [],
    current_task: None,
    verification_checks: [],
    generated_files: [],
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
pub fn build_demo_context(task : TaskSpec) -> AgentContext {
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
  .record_check(
    VerificationCheck::new(
      "task-selected",
      JsonSchema,
      true,
      "The natural-language request has been normalized into a typed task.",
    ),
  )
  .record_check(
    VerificationCheck::new(
      "verification-policy",
      task.verification_level,
      true,
      "MoonAP attached a verification strategy before code generation.",
    ),
  )
  .record_generated_file("cmd/main/main.mbt")
}
