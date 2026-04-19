///|
pub struct ServerHealth {
  ok : Bool
  name : String
  server : String
  moonbit_owned : Bool
  version : String
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct ServerRoute {
  http_method : String
  path : String
  category : String
  summary : String
  moonbit_owned : Bool
  adapter_required : Bool
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct LlmModel {
  provider : String
  model : String
  label : String
  priority : Int
  enabled_by_default : Bool
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct LlmRouterPolicy {
  default_provider : String
  browser_keys_only : Bool
  rate_limit_cooldown_ms : Int
  network_cooldown_ms : Int
  models : Array[LlmModel]
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct FilePreviewPolicy {
  max_preview_bytes : Int
  max_preview_lines : Int
  send_large_file_contents_to_llm : Bool
  supported_types : Array[String]
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct LargeFilePolicy {
  default_chunk_size_bytes : Int
  max_file_size_label : String
  browser_local_streaming : Bool
  uploaded_bytes_default : Int
  llm_receives_file_contents : Bool
  progress_events : Array[String]
  supported_streaming_types : Array[String]
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct SyntheticDataPolicy {
  llm_outputs_recipe_only : Bool
  generator_runs_local : Bool
  default_seed : Int
  planned_generators : Array[String]
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct TaskKernelProtocol {
  name : String
  lifecycle : Array[String]
  input_modes : Array[String]
  result_shape : String
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct FormalVerificationPolicy {
  available_in_moonbit_version : String
  enabled_by_default : Bool
  user_toggle_label : String
  pipeline_position : String
  planned_command : String
  proof_artifacts : Array[String]
  contract_features : Array[String]
  fallback_when_disabled : String
  status : String
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct ArtifactPipelineStep {
  name : String
  phase : String
  enabled_by_default : Bool
  user_configurable : Bool
  summary : String
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct SkillSummary {
  name : String
  label : String
  input_types : Array[String]
  protocol : String
  first_demo : Bool
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct SkillParameter {
  name : String
  label : String
  value_kind : String
  default_value : String
  required : Bool
  allowed_values : Array[String]
  summary : String
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct SkillRuntime {
  kind : String
  compile_target : String
  protocol : String
  program_dir : String
  browser_local : Bool
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct SkillPrivacy {
  file_contents_stay_local : Bool
  llm_receives_file_contents : Bool
  llm_receives_metadata : Bool
  user_approval_required_for_upload : Bool
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct SkillManifest {
  schema_version : String
  id : String
  name : String
  domain : String
  category_path : String
  summary : String
  description_file : String
  program_dir : String
  input_types : Array[String]
  parameters : Array[SkillParameter]
  runtime : SkillRuntime
  privacy : SkillPrivacy
  llm_required : Bool
  anthropic_skill_compatible : Bool
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct SkillHubIndex {
  schema_version : String
  name : String
  url : String
  layout : String
  skills : Array[SkillManifest]
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct EffectiveSkillParameter {
  name : String
  value : String
  default_used : Bool
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct SkillRunPlan {
  skill_id : String
  source : String
  program_dir : String
  compile_target : String
  protocol : String
  browser_local : Bool
  effective_parameters : Array[EffectiveSkillParameter]
  optional_pipeline_steps : Array[ArtifactPipelineStep]
  next_step : String
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct PersonalSkillSetPolicy {
  name : String
  default_root : String
  mirrors_hub_layout : Bool
  save_generated_skills : Bool
  validation_required : Bool
  install_sources : Array[String]
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct MoonApAppState {
  tagline : String
  llm_status : String
  work_mode : String
  chat_enabled : Bool
  skill_enabled : Bool
  public_skill_hub_url : String
  personal_skill_set : PersonalSkillSetPolicy
  formal_verification : FormalVerificationPolicy
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct ServerPolicies {
  routes : Array[ServerRoute]
  llm_router : LlmRouterPolicy
  file_preview : FilePreviewPolicy
  task_kernel : TaskKernelProtocol
  artifact_pipeline : Array[ArtifactPipelineStep]
  formal_verification : FormalVerificationPolicy
  large_file : LargeFilePolicy
  synthetic_data : SyntheticDataPolicy
  skills : Array[SkillSummary]
  skill_hub : SkillHubIndex
  personal_skill_set : PersonalSkillSetPolicy
} derive(Eq, Debug, ToJson, FromJson)

///|
fn is_path_separator_char(ch : Char) -> Bool {
  ch == '/' || ch == '\\'
}

///|
fn string_has_path_separator_at(path : String, index : Int) -> Bool {
  match path.get_char(index) {
    Some(ch) => is_path_separator_char(ch)
    None => false
  }
}

///|
fn legacy_last_path_segment(path : String) -> String {
  let mut end = path.length()
  while end > 0 && string_has_path_separator_at(path, end - 1) {
    end = end - 1
  }
  if end == 0 {
    return ""
  }
  let mut start = end
  while start > 0 && !string_has_path_separator_at(path, start - 1) {
    start = start - 1
  }
  path[start:end].to_string()
}

///|
fn legacy_normalize_virtual_path(path : String) -> String {
  let mut normalized = ""
  let mut previous_was_separator = false
  for ch in path {
    if is_path_separator_char(ch) {
      if !previous_was_separator {
        normalized = normalized + "/"
        previous_was_separator = true
      }
    } else {
      normalized = normalized + ch.to_string()
      previous_was_separator = false
    }
  }
  let mut start = 0
  let mut end = normalized.length()
  while start < end && string_has_path_separator_at(normalized, start) {
    start = start + 1
  }
  while end > start && string_has_path_separator_at(normalized, end - 1) {
    end = end - 1
  }
  normalized[start:end].to_string()
}

///|
pub fn normalize_virtual_path(path : String) -> String {
  let trimmed = path.trim().to_string()
  if trimmed == "" {
    return ""
  }
  let parsed = @path.Path::parse(trimmed) catch {
    _ => return legacy_normalize_virtual_path(trimmed)
  }
  let parts : Array[String] = []
  for part in parsed.directory() {
    parts.push(part)
  }
  match parsed.file() {
    Some(file) => parts.push(file.to_string())
    None => ()
  }
  let normalized = parts.join("/")
  if parsed.prefix() == "/" {
    if normalized == "" {
      "/"
    } else {
      "/" + normalized
    }
  } else {
    normalized
  }
}

///|
pub fn path_last_segment(path : String) -> String {
  let trimmed = path.trim().to_string()
  if trimmed == "" {
    return ""
  }
  let parsed = @path.Path::parse(trimmed) catch {
    _ => return legacy_last_path_segment(trimmed)
  }
  match parsed.file() {
    Some(file) => file.to_string()
    None => {
      let directory = parsed.directory()
      if directory.length() == 0 {
        legacy_last_path_segment(trimmed)
      } else {
        directory[directory.length() - 1]
      }
    }
  }
}

///|
pub struct AgentMessage {
  role : String
  content : String
  timestamp : String
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct FileAttachment {
  name : String
  size_bytes : Int
  detected_type : String
  privacy_level : String
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct AgentSessionContext {
  session_id : String
  selected_mode : String
  active_skill : String
  messages : Array[AgentMessage]
  attachments : Array[FileAttachment]
  llm_receives_file_contents : Bool
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct PromptPlan {
  system_identity : String
  user_intent : String
  target_language : String
  artifact_required : Bool
  privacy_rule : String
  formal_verification_requested : Bool
  kernel_protocol : TaskKernelProtocol
  active_skill : String
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct ArtifactCompileReport {
  ok : Bool
  stage : String
  command : String
  cwd : String
  source_path : String
  wasm_path : String
  exit_code : Int
  source_bytes : Int
  output : String
  note : String
  summary_kind : String
  primary_file : String
  primary_line : Int
  summary_excerpt : String
  likely_cause : String
  repair_hint : String
  trimmed_output : String
} derive(Eq, Debug, ToJson, FromJson)

///|
pub struct CompileErrorSummary {
  kind : String
  primary_file : String
  primary_line : Int
  excerpt : String
  likely_cause : String
  repair_hint : String
  trimmed_output : String
} derive(Eq, Debug, ToJson, FromJson)

///|
pub fn health() -> ServerHealth {
  {
    ok: true,
    name: "MoonAP",
    server: "MoonBit-first minimal server",
    moonbit_owned: true,
    version: "0.1.0",
  }
}

///|
pub fn health_json() -> String {
  health().to_json().stringify(indent=2)
}

///|
pub fn async_runtime_marker() -> Int64 {
  @async.now()
}

///|
pub async fn artifact_compile_probe(
  source : String,
  formal_verification? : Bool = false,
) -> ArtifactCompileReport {
  let trimmed = source.trim()
  guard trimmed != "" else {
    return {
      ok: false,
      stage: "compile-input",
      command: "moon build cmd/main --target wasm-gc",
      cwd: "",
      source_path: "",
      wasm_path: "",
      exit_code: -1,
      source_bytes: 0,
      output: "MoonAP received empty MoonBit source.",
      note: "Capture real MoonBit source first, then run compile probe.",
      summary_kind: "compile-input",
      primary_file: "",
      primary_line: 0,
      summary_excerpt: "MoonAP received empty MoonBit source.",
      likely_cause: "The LLM response was empty or did not contain source code.",
      repair_hint: "Return only valid cmd/main/main.mbt source before running the compile probe again.",
      trimmed_output: "MoonAP received empty MoonBit source.",
    }
  }
  let cwd = @fs.tmpdir(prefix="moonap_compile")
  let cmd_dir = cwd + "/cmd/main"
  @fs.mkdir(cmd_dir, permission=0o755, recursive=true)
  let mod_json = "{\"name\":\"moonap/compile_probe\",\"version\":\"0.1.0\",\"deps\":{}}"
  let pkg_text = "options(\n  \"is-main\": true,\n)\n"
  let source_path = cmd_dir + "/main.mbt"
  @fs.write_file(cwd + "/moon.mod.json", mod_json, create=0o644)
  @fs.write_file(cmd_dir + "/moon.pkg", pkg_text, create=0o644)
  @fs.write_file(source_path, trimmed + "\n", create=0o644)
  let (fmt_exit_code, fmt_output) = @process.collect_output_merged(
    "moon",
    ["fmt"],
    cwd~,
  )
  let command = "moon build cmd/main --target wasm-gc"
  let (exit_code, output) = @process.collect_output_merged(
    "moon",
    ["build", "cmd/main", "--target", "wasm-gc"],
    cwd~,
  )
  let full_output = if fmt_exit_code == 0 || fmt_output.text() == "" {
    output.text()
  } else {
    "moon fmt pre-pass failed (build still ran):\n" +
    fmt_output.text() +
    "\n\nmoon build output:\n" +
    output.text()
  }
  let wasm_path = cwd + "/_build/wasm-gc/debug/build/cmd/main/main.wasm"
  let ok = exit_code == 0 && @fs.exists(wasm_path)
  let summary = summarize_compile_output(full_output)
  {
    ok,
    stage: if ok {
      "moonbit-wasm-compile"
    } else {
      "compile-failed"
    },
    command,
    cwd,
    source_path,
    wasm_path: if ok {
      wasm_path
    } else {
      ""
    },
    exit_code,
    source_bytes: trimmed.length(),
    output: full_output,
    note: if formal_verification {
      "Formal verification remains reserved. Compile probe ran without moon prove."
    } else {
      "Compile probe only. Browser-local runtime execution is still pending."
    },
    summary_kind: if ok {
      "none"
    } else {
      summary.kind
    },
    primary_file: if ok {
      ""
    } else {
      summary.primary_file
    },
    primary_line: if ok {
      0
    } else {
      summary.primary_line
    },
    summary_excerpt: if ok {
      ""
    } else {
      summary.excerpt
    },
    likely_cause: if ok {
      ""
    } else {
      summary.likely_cause
    },
    repair_hint: if ok {
      ""
    } else {
      summary.repair_hint
    },
    trimmed_output: if ok {
      trim_compile_output(output.text())
    } else {
      summary.trimmed_output
    },
  }
}

///|
pub async fn artifact_compile_probe_json(
  source : String,
  formal_verification? : Bool = false,
) -> String {
  artifact_compile_probe(source, formal_verification~)
  .to_json()
  .stringify(indent=2)
}

///|
pub fn extract_moonbit_source(response : String) -> String {
  let trimmed = response.trim().to_string()
  if trimmed == "" {
    return ""
  }
  let patterns = [
    ["FILE: cmd/main/main.mbt", "END_FILE"],
    ["<moonbit-file path=\"cmd/main/main.mbt\">", "</moonbit-file>"],
    ["```moonbit", "```"],
    ["```mbt", "```"],
    ["```", "```"],
  ]
  for pattern in patterns {
    let start_marker = pattern[0]
    let end_marker = pattern[1]
    let extracted = extract_between_markers(trimmed, start_marker, end_marker)
    if extracted != "" {
      return extracted
    }
  }
  trimmed
}

///|
fn extract_between_markers(
  text : String,
  start_marker : String,
  end_marker : String,
) -> String {
  guard text.find(start_marker) is Some(start_index) else { return "" }
  let after_start = text[start_index + start_marker.length():]
    .to_string()
    .trim()
    .to_string()
  if after_start == "" {
    return ""
  }
  guard after_start.find(end_marker) is Some(end_index) else { return "" }
  after_start[:end_index].to_string().trim().to_string()
}

///|
pub fn summarize_compile_output(output : String) -> CompileErrorSummary {
  let trimmed_output = trim_compile_output(output)
  let excerpt = first_relevant_compile_line(trimmed_output)
  let kind = classify_compile_output(trimmed_output)
  {
    kind,
    primary_file: find_primary_file(trimmed_output),
    primary_line: find_primary_line(trimmed_output),
    excerpt,
    likely_cause: likely_cause_for_error_kind(kind),
    repair_hint: repair_hint_for_error_kind(kind),
    trimmed_output,
  }
}

///|
fn trim_compile_output(output : String) -> String {
  let kept : Array[String] = []
  let mut count = 0
  for raw in output.replace_all(old="\r\n", new="\n").split("\n") {
    let line = raw.trim().to_string()
    if line == "" {
      continue
    }
    if count < 24 {
      kept.push(line)
    }
    count = count + 1
  }
  let joined = kept.iter().join("\n")
  if joined.length() > 1800 {
    joined[:1800].to_string() + "\n...(truncated)"
  } else if joined == "" {
    "Compiler produced no output."
  } else {
    joined
  }
}

///|
fn first_relevant_compile_line(output : String) -> String {
  for line in output.split("\n") {
    let lowered = line.to_lower()
    if lowered.contains("error") ||
      lowered.contains("failed") ||
      lowered.contains("unknown") ||
      lowered.contains("invalid") {
      return line.to_string()
    }
  }
  for line in output.split("\n") {
    if line.trim() != "" {
      return line.trim().to_string()
    }
  }
  "Compiler produced no output."
}

///|
fn classify_compile_output(output : String) -> String {
  let lowered = output.to_lower()
  if contains_non_code_reasoning(lowered) {
    "non-code-response"
  } else if lowered.contains("cannot be implicitly ignored") ||
    lowered.contains("explicitly ignore it") {
    "ignored-value-error"
  } else if lowered.contains("moon.pkg") ||
    lowered.contains("moon.mod.json") ||
    (lowered.contains("package") && lowered.contains("invalid")) {
    "project-config-error"
  } else if lowered.contains("parse error") ||
    lowered.contains("syntax") ||
    lowered.contains("unexpected token") {
    "syntax-error"
  } else if lowered.contains("unknown") ||
    lowered.contains("undefined") ||
    lowered.contains("unbound") {
    "name-resolution-error"
  } else if lowered.contains("type mismatch") ||
    lowered.contains("type error") ||
    (lowered.contains("expected") && lowered.contains("but got")) {
    "type-error"
  } else if lowered.contains("import") ||
    lowered.contains("cannot find package") ||
    lowered.contains("package not found") {
    "import-dependency-error"
  } else if lowered.contains("wasm") ||
    lowered.contains("native") ||
    lowered.contains("unsupported target") {
    "target-runtime-error"
  } else {
    "compiler-error"
  }
}

///|
fn contains_non_code_reasoning(lowered : String) -> Bool {
  lowered.contains("okay, i need to generate") ||
  lowered.contains("the user has provided specific instructions") ||
  lowered.contains("first, the program should") ||
  lowered.contains("i should break down the tasks") ||
  lowered.contains("finally, i'll") ||
  lowered.contains("now, i'll write the code accordingly") ||
  lowered.contains("no markdown or extra comments") ||
  lowered.contains("please repair only what is needed")
}

///|
fn likely_cause_for_error_kind(kind : String) -> String {
  match kind {
    "non-code-response" =>
      "The model returned reasoning or explanation text instead of pure MoonBit source code."
    "ignored-value-error" =>
      "The program leaves a non-Unit value as a bare expression in fn main, so MoonBit rejects it unless you return it intentionally or wrap it with ignore(...)."
    "project-config-error" =>
      "The generated MoonBit file or package layout does not match the current MoonBit 0.9 project conventions."
    "syntax-error" =>
      "The generated source uses invalid MoonBit syntax or block structure."
    "name-resolution-error" =>
      "The generated source references identifiers or helpers that were never defined."
    "type-error" =>
      "The generated source compiles structurally, but values or function signatures do not line up."
    "import-dependency-error" =>
      "The generated source assumes packages or imports that are not available in the current compile probe project."
    "target-runtime-error" =>
      "The generated source is not compatible with the current wasm-gc compile target."
    _ =>
      "The generated source hit a compiler error that still needs manual classification."
  }
}

///|
fn repair_hint_for_error_kind(kind : String) -> String {
  match kind {
    "non-code-response" =>
      "Strip all reasoning text and return only valid cmd/main/main.mbt code with no markdown fences or explanations."
    "ignored-value-error" =>
      "If fn main contains a bare expression that returns String or another non-Unit value, wrap it with ignore(...) or bind it to let _ = ... without changing the task behavior."
    "project-config-error" =>
      "Keep the output to cmd/main/main.mbt only and avoid inventing extra project files or package declarations."
    "syntax-error" =>
      "Rewrite the source using current MoonBit block style and only valid MoonBit 0.9 syntax."
    "name-resolution-error" =>
      "Define missing helpers locally inside cmd/main/main.mbt and avoid references to undeclared names."
    "type-error" =>
      "Align helper function signatures, return values, and local variable types before changing overall structure."
    "import-dependency-error" =>
      "Remove unsupported imports and keep the program self-contained inside cmd/main/main.mbt."
    "target-runtime-error" =>
      "Prefer simple pure functions and avoid APIs that are not safe for wasm-gc."
    _ =>
      "Make the smallest possible edit that addresses the first compiler error, then compile again."
  }
}

///|
fn find_primary_file(output : String) -> String {
  for line in output.split("\n") {
    if line.contains("moon.pkg") {
      return "cmd/main/moon.pkg"
    }
    if line.contains("moon.mod.json") {
      return "moon.mod.json"
    }
    if line.contains("main.mbt") {
      return "cmd/main/main.mbt"
    }
  }
  ""
}

///|
fn find_primary_line(output : String) -> Int {
  for line in output.split("\n") {
    let markers = ["main.mbt:", "moon.pkg:", "moon.mod.json:"]
    for marker in markers {
      if line.contains(marker) {
        guard line.find(marker) is Some(index) else { continue }
        let after = line[index + marker.length():].to_string()
        let digits = take_leading_digits(after)
        if digits != "" {
          return @string.parse_int(digits) catch { _ => 0 }
        }
      }
    }
  }
  0
}

///|
fn take_leading_digits(text : String) -> String {
  let mut end = 0
  for char in text {
    if char >= '0' && char <= '9' {
      end = end + 1
    } else {
      break
    }
  }
  if end == 0 {
    ""
  } else {
    text[:end].to_string()
  }
}

///|
pub fn route_table() -> Array[ServerRoute] {
  [
    route(
      "GET", "/", "static-web", "Serve the MoonAP browser workspace.", false, true,
    ),
    route(
      "GET", "/api/health", "runtime", "Return MoonAP server health generated by MoonBit.",
      true, true,
    ),
    route(
      "GET", "/api/policies", "policy", "Return MoonBit-owned route, LLM, file, task, and skill policies.",
      true, true,
    ),
    route(
      "GET", "/api/formal-verification", "verification", "Return the reserved MoonBit formal verification policy for generated artifacts.",
      true, true,
    ),
    route(
      "GET", "/api/large-file-policy", "privacy-runtime", "Return browser-local large-file streaming defaults.",
      true, true,
    ),
    route(
      "GET", "/api/app-state", "app", "Return MoonAP entry state for LLM setup and SKILL-only fallback.",
      true, true,
    ),
    route(
      "GET", "/api/skills", "skill-hub", "Return built-in MoonAP-SKILL-Hub manifests.",
      true, true,
    ),
    route(
      "GET", "/api/personal-skill-set", "skill-hub", "Return the local Personal-MoonAP-SKILL-Set policy.",
      true, true,
    ),
    route(
      "GET", "/api/experiments/free-llm-moonbit/results.json", "experiments", "Return the persisted raw experiment JSON for free LLM MoonBit evaluation.",
      true, true,
    ),
    route(
      "GET", "/api/experiments/free-llm-moonbit/results.md", "experiments", "Return the persisted markdown summary for free LLM MoonBit evaluation.",
      true, true,
    ),
    route(
      "GET", "/api/logs/moonap-runtime.log", "runtime", "Return the local MoonAP runtime log written during browser and compile flows.",
      true, true,
    ),
    route(
      "GET", "/api/skills/run-plan", "skill-runtime", "Return a default-parameter browser-local run plan for a selected SKILL.",
      true, true,
    ),
    route(
      "POST", "/api/agent/context", "agent", "Normalize browser chat input into MoonBit-owned AgentSessionContext JSON.",
      true, true,
    ),
    route(
      "POST", "/api/agent/route", "agent", "Return a small task routing decision for the current user intent.",
      true, true,
    ),
    route(
      "POST", "/api/prompt/build", "codegen", "Build the MoonBit code generation prompt plan.",
      true, true,
    ),
    route(
      "POST", "/api/llm/complete", "llm-adapter", "Reserved for future server-side LLM fallback; browser keys stay local first.",
      false, true,
    ),
    route(
      "POST", "/api/experiments/free-llm-moonbit/results.json", "experiments", "Persist raw experiment JSON snapshots for free LLM MoonBit evaluation.",
      true, true,
    ),
    route(
      "POST", "/api/experiments/free-llm-moonbit/results.md", "experiments", "Persist markdown experiment summaries for free LLM MoonBit evaluation.",
      true, true,
    ),
    route(
      "POST", "/api/logs/moonap-runtime.log", "runtime", "Append a local MoonAP runtime log entry for browser-driven testing and debugging.",
      true, true,
    ),
    route(
      "POST", "/api/artifact/compile", "compiler-adapter", "Run a native MoonBit compile probe against captured source and return the real compiler result.",
      false, true,
    ),
    route(
      "POST", "/api/artifact/repair", "codegen", "Reserved for compile-error repair prompts.",
      true, true,
    ),
    route(
      "POST", "/api/task/execute", "browser-runtime", "Reserved for browser-local Wasm task execution metadata.",
      false, true,
    ),
  ]
}

///|
fn route(
  http_method : String,
  path : String,
  category : String,
  summary : String,
  moonbit_owned : Bool,
  adapter_required : Bool,
) -> ServerRoute {
  { http_method, path, category, summary, moonbit_owned, adapter_required }
}

///|
pub fn policies() -> ServerPolicies {
  {
    routes: route_table(),
    llm_router: llm_router_policy(),
    file_preview: file_preview_policy(),
    task_kernel: generic_task_kernel_protocol(),
    artifact_pipeline: artifact_pipeline(),
    formal_verification: formal_verification_policy(),
    large_file: large_file_policy(),
    synthetic_data: synthetic_data_policy(),
    skills: skill_registry(),
    skill_hub: builtin_skill_hub(),
    personal_skill_set: personal_skill_set_policy(),
  }
}

///|
pub fn policies_json() -> String {
  policies().to_json().stringify(indent=2)
}

///|
pub fn artifact_pipeline() -> Array[ArtifactPipelineStep] {
  [
    pipeline_step(
      "intent-route", "agent", true, false, "Route the user request to chat, SKILL, or generated MoonBit artifact work.",
    ),
    pipeline_step(
      "moonbit-codegen", "llm", true, false, "Generate constrained MoonBit source and metadata from a validated AgentAction.",
    ),
    pipeline_step(
      "moonbit-formal-verification", "verification", false, true, "Future optional moon prove step after LLM code generation and before Wasm compilation.",
    ),
    pipeline_step(
      "moonbit-wasm-compile", "compiler", true, false, "Compile the validated MoonBit program to WebAssembly.",
    ),
    pipeline_step(
      "browser-local-run", "runtime", true, false, "Run the Wasm artifact in the user's browser against local files.",
    ),
  ]
}

///|
fn pipeline_step(
  name : String,
  phase : String,
  enabled_by_default : Bool,
  user_configurable : Bool,
  summary : String,
) -> ArtifactPipelineStep {
  { name, phase, enabled_by_default, user_configurable, summary }
}

///|
pub fn formal_verification_policy() -> FormalVerificationPolicy {
  {
    available_in_moonbit_version: "0.9",
    enabled_by_default: false,
    user_toggle_label: "Try MoonBit formal verification before Wasm compile",
    pipeline_position: "after LLM MoonBit code generation, before WebAssembly compilation",
    planned_command: "moon prove",
    proof_artifacts: ["*.mbt", "*.mbtp"],
    contract_features: [
      "proof_requires", "proof_ensures", "proof_invariant", "proof_assert", "predicate definitions in .mbtp files",
    ],
    fallback_when_disabled: "Run normal MoonBit compile, tests, and browser-local runtime checks.",
    status: "reserved_optional_not_implemented",
  }
}

///|
pub fn formal_verification_policy_json() -> String {
  formal_verification_policy().to_json().stringify(indent=2)
}

///|
pub fn large_file_policy() -> LargeFilePolicy {
  {
    default_chunk_size_bytes: 4194304,
    max_file_size_label: "GB-scale browser-local files",
    browser_local_streaming: true,
    uploaded_bytes_default: 0,
    llm_receives_file_contents: false,
    progress_events: ["queued", "reading", "counting", "done", "failed"],
    supported_streaming_types: ["fastq", "fq", "csv", "tsv"],
  }
}

///|
pub fn large_file_policy_json() -> String {
  large_file_policy().to_json().stringify(indent=2)
}

///|
pub fn synthetic_data_policy() -> SyntheticDataPolicy {
  {
    llm_outputs_recipe_only: true,
    generator_runs_local: true,
    default_seed: 42,
    planned_generators: [
      "research.bioinformatics.fastq-generator", "finance.accounting.finance-csv-generator",
    ],
  }
}

///|
pub fn llm_router_policy() -> LlmRouterPolicy {
  {
    default_provider: "openai",
    browser_keys_only: true,
    rate_limit_cooldown_ms: 900000,
    network_cooldown_ms: 120000,
    models: [
      model("openai", "gpt-5.4", "OpenAI GPT-5.4 (LLM-sim)", 5, true),
      model(
        "nvidia", "meta/llama-4-maverick-17b-128e-instruct", "NVIDIA Llama 4 Maverick 17B 128E Instruct",
        10, true,
      ),
      model("zai", "glm-5.1", "GLM 5.1", 20, true),
      model(
        "gemini", "gemini-3-flash-preview", "Gemini 3 Flash Preview", 30, false,
      ),
      model(
        "gemini", "gemini-3.1-flash-lite-preview", "Gemini 3.1 Flash Lite Preview",
        40, false,
      ),
      model("gemini", "gemini-2.5-flash", "Gemini 2.5 Flash", 50, false),
      model(
        "gemini", "gemini-2.5-flash-lite", "Gemini 2.5 Flash Lite", 60, false,
      ),
      model("gemini", "gemini-2-flash", "Gemini 2 Flash", 70, false),
      model("gemini", "gemini-2-flash-lite", "Gemini 2 Flash Lite", 75, false),
      model("zai", "glm-5", "GLM 5", 80, false),
      model("zai", "glm-5-turbo", "GLM 5 Turbo", 90, false),
      model("zai", "glm-4.7", "GLM 4.7", 100, false),
      model("zai", "glm-4.7-flash", "GLM 4.7 Flash", 105, false),
      model("zai", "glm-4.7-flashx", "GLM 4.7 FlashX", 108, false),
      model("zai", "glm-4.6", "GLM 4.6", 110, false),
      model("zai", "glm-4.5-air", "GLM 4.5 Air", 120, false),
      model("zai", "glm-4.5-airx", "GLM 4.5 AirX", 130, false),
      model("zai", "glm-4-long", "GLM 4 Long", 135, false),
      model("zai", "glm-4-flashx-250414", "GLM 4 FlashX 250414", 138, false),
      model(
        "siliconflow", "THUDM/glm-4-9b-chat", "THUDM GLM-4-9B Chat", 160, false,
      ),
      model(
        "siliconflow", "Qwen/Qwen2-7B-Instruct", "Qwen2 7B Instruct", 170, false,
      ),
      model(
        "siliconflow", "internlm/internlm2_5-7b-chat", "InternLM2.5 7B Chat", 180,
        false,
      ),
      model(
        "siliconflow", "mistralai/Mistral-7B-Instruct-v0.2", "Mistral 7B Instruct v0.2",
        190, false,
      ),
      model("siliconflow", "THUDM/chatglm3-6b", "ChatGLM3 6B", 200, false),
      model(
        "nvidia", "qwen/qwen2.5-coder-32b-instruct", "NVIDIA Qwen2.5 Coder 32B Instruct",
        210, false,
      ),
      model(
        "nvidia", "meta/llama-4-scout-17b-16e-instruct", "NVIDIA Llama 4 Scout 17B 16E Instruct",
        220, false,
      ),
      model(
        "nvidia", "meta/llama-3.3-70b-instruct", "NVIDIA Llama 3.3 70B Instruct",
        230, false,
      ),
      model(
        "openrouter", "qwen/qwen3-coder:free", "OpenRouter Qwen3 Coder Free", 230,
        false,
      ),
      model(
        "openrouter", "nvidia/nemotron-3-super-120b-a12b:free", "OpenRouter Nemotron 3 Super Free",
        240, false,
      ),
      model(
        "openrouter", "openrouter/free", "OpenRouter Free Router", 250, false,
      ),
    ],
  }
}

///|
fn model(
  provider : String,
  model : String,
  label : String,
  priority : Int,
  enabled_by_default : Bool,
) -> LlmModel {
  { provider, model, label, priority, enabled_by_default }
}

///|
pub fn file_preview_policy() -> FilePreviewPolicy {
  {
    max_preview_bytes: 4096,
    max_preview_lines: 12,
    send_large_file_contents_to_llm: false,
    supported_types: ["fastq", "csv", "xlsx", "json", "log", "text"],
  }
}

///|
pub fn generic_task_kernel_protocol() -> TaskKernelProtocol {
  {
    name: "moonap.task-kernel.v1",
    lifecycle: ["init", "ingest", "finalize"],
    input_modes: [
      "whole-file-text", "streaming-text", "streaming-bytes", "structured-rows",
      "interactive-events",
    ],
    result_shape: "TaskResult { direct_answer, result_kind, details_markdown, metrics_json }",
  }
}

///|
pub fn skill_registry() -> Array[SkillSummary] {
  [
    skill(
      "fastq",
      "FastQ local analysis",
      ["fastq", "fq"],
      "streaming-bytes",
      true,
    ),
    skill(
      "fastq-generator",
      "FastQ synthetic data generator",
      ["fastq", "synthetic"],
      "local-generation",
      false,
    ),
    skill("csv", "CSV local analysis", ["csv"], "structured-rows", false),
    skill(
      "spreadsheet",
      "Spreadsheet analysis",
      ["xlsx", "xls"],
      "structured-rows",
      false,
    ),
    skill("json", "JSON inspection", ["json"], "whole-file-text", false),
    skill(
      "game",
      "Browser mini game",
      ["interactive"],
      "interactive-events",
      false,
    ),
  ]
}

///|
pub fn app_state() -> MoonApAppState {
  {
    tagline: "MoonAP: MoonBit Agent Playground.\nTell, what APP you want to build. Or, directly use an existing SKILL.",
    llm_status: "not_configured",
    work_mode: "skill_only_until_llm_is_valid",
    chat_enabled: false,
    skill_enabled: true,
    public_skill_hub_url: public_skill_hub_url(),
    personal_skill_set: personal_skill_set_policy(),
    formal_verification: formal_verification_policy(),
  }
}

///|
pub fn app_state_json() -> String {
  app_state().to_json().stringify(indent=2)
}

///|
pub fn public_skill_hub_url() -> String {
  "https://github.com/tangmaomao16/MoonAP-MB-server/tree/main/MoonAP-SKILL-Hub"
}

///|
pub fn personal_skill_set_policy() -> PersonalSkillSetPolicy {
  {
    name: "Personal-MoonAP-SKILL-Set",
    default_root: "%USERPROFILE%/MoonAP/Personal-MoonAP-SKILL-Set",
    mirrors_hub_layout: true,
    save_generated_skills: true,
    validation_required: true,
    install_sources: [
      "MoonAP-SKILL-Hub", "LLM-generated MoonBit artifact after compile and runtime validation",
      "User-imported Anthropic-style skill folder",
    ],
  }
}

///|
pub fn personal_skill_set_json() -> String {
  personal_skill_set_policy().to_json().stringify(indent=2)
}

///|
pub fn builtin_skill_hub() -> SkillHubIndex {
  {
    schema_version: "moonap.skill-hub.v1",
    name: "MoonAP-SKILL-Hub",
    url: public_skill_hub_url(),
    layout: "domain/category/skill-folder with SKILL.md, moonap.skill.json, and program/",
    skills: builtin_skill_manifests(),
  }
}

///|
pub fn builtin_skill_hub_json() -> String {
  builtin_skill_hub().to_json().stringify(indent=2)
}

///|
pub fn builtin_skill_manifests() -> Array[SkillManifest] {
  [
    fastq_base_counter_manifest(),
    fastq_generator_manifest(),
    moonbit_fastq_generator_manifest(),
    finance_excel_max_amount_manifest(),
    gomoku_manifest(),
  ]
}

///|
fn fastq_base_counter_manifest() -> SkillManifest {
  skill_manifest(
    "research.bioinformatics.fastq-base-counter",
    "FastQ Base Counter",
    "research",
    "research/bioinformatics/fastq-base-counter",
    "Count a selected base in browser-local FastQ data without sending file contents to the LLM.",
    ["fastq", "fq"],
    [
      skill_parameter(
        "target_base",
        "Target base",
        "select",
        "N",
        true,
        ["A", "C", "G", "T", "N"],
        "Base to count. Defaults to N for quality-control workflows.",
      ),
    ],
    "streaming-bytes",
  )
}

///|
fn fastq_generator_manifest() -> SkillManifest {
  skill_manifest(
    "research.bioinformatics.fastq-generator",
    "FastQ Generator",
    "research",
    "research/bioinformatics/fastq-generator",
    "Generate deterministic browser-local synthetic FastQ data from a compact recipe instead of LLM output tokens.",
    ["synthetic", "fastq"],
    [
      skill_parameter(
        "read_count",
        "Read count",
        "int",
        "10000",
        true,
        [],
        "Number of synthetic reads to generate.",
      ),
      skill_parameter(
        "read_length",
        "Read length",
        "int",
        "150",
        true,
        [],
        "Bases per read.",
      ),
      skill_parameter(
        "n_rate",
        "N rate",
        "float",
        "0.01",
        true,
        [],
        "Approximate fraction of bases emitted as N.",
      ),
      skill_parameter(
        "random_seed",
        "Random seed",
        "int",
        "42",
        true,
        [],
        "Seed for deterministic benchmark data.",
      ),
    ],
    "local-generation",
  )
}

///|
fn moonbit_fastq_generator_manifest() -> SkillManifest {
  skill_manifest(
    "research.moonbit.fastq-generator",
    "MoonBit FastQ Generator",
    "research",
    "research/moonbit/fastq-generator",
    "Ask the active LLM route to generate a MoonBit FastQ generator program, then run a real compile probe.",
    ["moonbit", "fastq", "synthetic"],
    [
      skill_parameter(
        "read_count",
        "Read count",
        "int",
        "10000",
        true,
        [],
        "Default number of synthetic reads in the generated MoonBit source.",
      ),
      skill_parameter(
        "read_length",
        "Read length",
        "int",
        "150",
        true,
        [],
        "Default bases per read in the generated MoonBit source.",
      ),
      skill_parameter(
        "n_rate_per_mille",
        "N rate per mille",
        "int",
        "10",
        true,
        [],
        "Default approximate N frequency, expressed per mille to avoid float-heavy code.",
      ),
      skill_parameter(
        "random_seed",
        "Random seed",
        "int",
        "42",
        true,
        [],
        "Deterministic seed for the generated MoonBit source.",
      ),
    ],
    "llm-moonbit-codegen",
  )
}

///|
fn finance_excel_max_amount_manifest() -> SkillManifest {
  skill_manifest(
    "finance.accounting.excel-max-amount-row",
    "Excel Max Amount Row",
    "finance",
    "finance/accounting/excel-max-amount-row",
    "Find the row with the maximum value in an amount column from browser-local spreadsheet data.",
    ["xlsx", "xls", "csv"],
    [
      skill_parameter(
        "amount_column",
        "Amount column",
        "column-name",
        "amount",
        true,
        [],
        "Column used for numeric comparison.",
      ),
      skill_parameter(
        "operation",
        "Operation",
        "select",
        "max_row",
        true,
        ["max_row"],
        "Default operation extracts the row with the largest amount.",
      ),
    ],
    "structured-rows",
  )
}

///|
fn gomoku_manifest() -> SkillManifest {
  skill_manifest(
    "games.board-games.gomoku",
    "Gomoku",
    "games",
    "games/board-games/gomoku",
    "Run a browser-local Gomoku game compiled from MoonBit.",
    ["interactive"],
    [
      skill_parameter(
        "play_mode",
        "Play mode",
        "select",
        "single_player",
        true,
        ["single_player", "two_player"],
        "Single player mode is the default for first-time users.",
      ),
      skill_parameter(
        "board_size",
        "Board size",
        "int",
        "15",
        true,
        ["15", "19"],
        "Default board size follows common Gomoku play.",
      ),
    ],
    "interactive-events",
  )
}

///|
fn skill_manifest(
  id : String,
  name : String,
  domain : String,
  category_path : String,
  summary : String,
  input_types : Array[String],
  parameters : Array[SkillParameter],
  protocol : String,
) -> SkillManifest {
  {
    schema_version: "moonap.skill.v1",
    id,
    name,
    domain,
    category_path,
    summary,
    description_file: "SKILL.md",
    program_dir: "program",
    input_types,
    parameters,
    runtime: {
      kind: "moonbit",
      compile_target: "wasm-gc",
      protocol,
      program_dir: "program",
      browser_local: true,
    },
    privacy: {
      file_contents_stay_local: true,
      llm_receives_file_contents: false,
      llm_receives_metadata: true,
      user_approval_required_for_upload: true,
    },
    llm_required: false,
    anthropic_skill_compatible: true,
  }
}

///|
fn skill_parameter(
  name : String,
  label : String,
  value_kind : String,
  default_value : String,
  required : Bool,
  allowed_values : Array[String],
  summary : String,
) -> SkillParameter {
  { name, label, value_kind, default_value, required, allowed_values, summary }
}

///|
pub fn skill_run_plan_json(skill_hint : String) -> String {
  let manifest = skill_manifest_for_hint(skill_hint)
  let params = manifest.parameters.map(fn(param) {
    { name: param.name, value: param.default_value, default_used: true }
  })
  {
    skill_id: manifest.id,
    source: "MoonAP-SKILL-Hub",
    program_dir: manifest.category_path + "/" + manifest.program_dir,
    compile_target: manifest.runtime.compile_target,
    protocol: manifest.runtime.protocol,
    browser_local: manifest.runtime.browser_local,
    effective_parameters: params,
    optional_pipeline_steps: [artifact_pipeline()[2]],
    next_step: "Compile the MoonBit program to WebAssembly and run it in the browser with local files.",
  }
  .to_json()
  .stringify(indent=2)
}

///|
fn skill_manifest_for_hint(skill_hint : String) -> SkillManifest {
  let lower = skill_hint.to_lower()
  if lower.contains("finance") ||
    lower.contains("excel") ||
    lower.contains("spreadsheet") {
    finance_excel_max_amount_manifest()
  } else if lower.contains("generator") || lower.contains("synthetic") {
    fastq_generator_manifest()
  } else if lower.contains("gomoku") || lower.contains("game") {
    gomoku_manifest()
  } else {
    fastq_base_counter_manifest()
  }
}

///|
fn skill(
  name : String,
  label : String,
  input_types : Array[String],
  protocol : String,
  first_demo : Bool,
) -> SkillSummary {
  { name, label, input_types, protocol, first_demo }
}

///|
pub fn normalize_agent_context(
  session_id : String,
  user_input : String,
  selected_mode : String,
  file_name : String,
  file_size : Int,
  detected_type : String,
  timestamp : String,
) -> AgentSessionContext {
  let skill_name = choose_skill(user_input, detected_type)
  let attachments = if file_name == "" {
    []
  } else {
    [
      {
        name: file_name,
        size_bytes: file_size,
        detected_type,
        privacy_level: "metadata-only",
      },
    ]
  }
  {
    session_id,
    selected_mode,
    active_skill: skill_name,
    messages: [{ role: "user", content: user_input, timestamp }],
    attachments,
    llm_receives_file_contents: false,
  }
}

///|
pub fn normalize_agent_context_json(
  session_id : String,
  user_input : String,
  selected_mode : String,
  file_name : String,
  file_size : Int,
  detected_type : String,
  timestamp : String,
) -> String {
  normalize_agent_context(
    session_id, user_input, selected_mode, file_name, file_size, detected_type, timestamp,
  )
  .to_json()
  .stringify(indent=2)
}

///|
pub fn route_agent_json(user_input : String, detected_type : String) -> String {
  let skill_name = choose_skill(user_input, detected_type)
  let needs_artifact = skill_name != "chat"
  let plan = {
    system_identity: "MoonAP turns natural language into MoonBit task kernels that compile to WebAssembly.",
    user_intent: user_input,
    target_language: "MoonBit 0.9",
    artifact_required: needs_artifact,
    privacy_rule: "Only send user intent and file metadata to the LLM unless the user explicitly opts in.",
    formal_verification_requested: false,
    kernel_protocol: generic_task_kernel_protocol(),
    active_skill: skill_name,
  }
  plan.to_json().stringify(indent=2)
}

///|
pub fn build_prompt_plan_json(
  user_input : String,
  detected_type : String,
) -> String {
  route_agent_json(user_input, detected_type)
}

///|
pub fn choose_skill(user_input : String, detected_type : String) -> String {
  let lower = user_input.to_lower()
  if detected_type == "fastq" ||
    detected_type == "fq" ||
    lower.contains("fastq") {
    "fastq"
  } else if detected_type == "csv" || lower.contains("csv") {
    "csv"
  } else if detected_type == "xlsx" ||
    detected_type == "xls" ||
    lower.contains("excel") {
    "spreadsheet"
  } else if detected_type == "json" || lower.contains("json") {
    "json"
  } else if lower.contains("game") || lower.contains("browser mini game") {
    "game"
  } else {
    "chat"
  }
}
