///|
async fn main {
  let session_dir = initialize_runtime_session()
  println("MoonAP native MoonBit server starting at http://127.0.0.1:3000")
  println("MoonAP runtime session: " + session_dir)
  let server = @http.Server::new(@socket.Addr::parse("127.0.0.1:3000"))
  server.run_forever((request, body, conn) => moonap_server(request, body, conn))
}

///|
async fn moonap_server(
  request : @http.Request,
  body : &@io.Reader,
  conn : @http.ServerConnection,
) -> Unit {
  let path = request.path
  if request.meth == Get && (path == "/" || path == "/index.html") {
    send_html(conn, web_index_html())
  } else if request.meth == Get &&
    (path.contains("/app.js") || path.contains("/app-live.js")) &&
    !path.contains(".map") {
    serve_static_file(
      conn,
      served_web_js_path(),
      "application/javascript; charset=utf-8",
    )
  } else if request.meth == Get && path == "/style.css" {
    send_css(conn, web_style_css())
  } else if request.meth == Get && path == "/api/health" {
    send_json(conn, 200, @core.health_json())
  } else if request.meth == Get && path == "/api/policies" {
    send_json(conn, 200, @core.policies_json())
  } else if request.meth == Get && path == "/api/formal-verification" {
    send_json(conn, 200, @core.formal_verification_policy_json())
  } else if request.meth == Get && path == "/api/large-file-policy" {
    send_json(conn, 200, @core.large_file_policy_json())
  } else if request.meth == Get && path == "/api/app-state" {
    send_json(conn, 200, @core.app_state_json())
  } else if request.meth == Get && path == "/api/skills" {
    send_json(conn, 200, @core.builtin_skill_hub_json())
  } else if request.meth == Get && path == "/api/personal-skill-set" {
    send_json(conn, 200, @core.personal_skill_set_json())
  } else if request.meth == Get &&
    path == "/api/experiments/free-llm-moonbit/results.json" {
    send_text(
      conn,
      200,
      read_text_or_default(
        "artifacts/moonbit-eval-results.json", "{\n  \"experiment_name\": \"Free LLM models ability of generating MoonBit code\",\n  \"status\": \"draft\"\n}\n",
      ),
      "application/json; charset=utf-8",
    )
  } else if request.meth == Get &&
    path == "/api/experiments/free-llm-moonbit/results.md" {
    send_text(
      conn,
      200,
      read_text_or_default(
        "docs/experiments/free-llm-moonbit/results.md", "# Free LLM models ability of generating MoonBit code\n\nNo experiment results recorded yet.\n",
      ),
      "text/markdown; charset=utf-8",
    )
  } else if request.meth == Get && path == "/api/logs/moonap-runtime.log" {
    send_text(
      conn,
      200,
      read_text_or_default(runtime_log_path(), "MoonAP runtime log is empty.\n"),
      "text/plain; charset=utf-8",
    )
  } else if request.meth == Get && path == "/api/codex-threads-dev/manifest" {
    send_json(conn, 200, codex_threads_dev_manifest_json())
  } else if request.meth == Get && path == "/api/codex-threads-dev/coordination" {
    send_json(conn, 200, codex_threads_dev_coordination_json())
  } else if request.meth == Get && path == "/api/llm-sim/latest-request" {
    send_text(
      conn,
      200,
      latest_llm_sim_request_json_or_default(),
      "application/json; charset=utf-8",
    )
  } else if request.meth == Get && path == "/api/llm-sim/latest-response" {
    send_json(conn, 200, latest_llm_sim_response_status_json())
  } else if request.meth == Get && path == "/api/runtime-exec/latest-request" {
    send_text(
      conn,
      200,
      read_text_or_default(
        runtime_exec_root() + "/latest-request.json",
        "{\n  \"status\": \"empty\"\n}\n",
      ),
      "application/json; charset=utf-8",
    )
  } else if request.meth == Get && path == "/api/runtime-exec/latest-result" {
    send_text(
      conn,
      200,
      read_text_or_default(
        runtime_exec_root() + "/latest-result.json",
        "{\n  \"status\": \"empty\"\n}\n",
      ),
      "application/json; charset=utf-8",
    )
  } else if request.meth == Get &&
    path.has_prefix("/api/runtime-exec/request-artifact") {
    serve_runtime_exec_request_artifact(conn, path)
  } else if request.meth == Get && path == "/api/skill-export/save-decision" {
    send_text(
      conn,
      200,
      read_text_or_default(
        skill_export_root() + "/save-decision.json",
        "{\n  \"status\": \"unset\"\n}\n",
      ),
      "application/json; charset=utf-8",
    )
  } else if request.meth == Get && path == "/api/human-sim/latest-action" {
    send_text(
      conn,
      200,
      read_text_or_default(
        human_sim_state_dir() + "/latest-action.json",
        "{}\n",
      ),
      "application/json; charset=utf-8",
    )
  } else if request.meth == Get && path == "/api/human-sim/latest-feedback" {
    send_text(
      conn,
      200,
      read_text_or_default(
        human_sim_state_dir() + "/latest-feedback.md",
        "# latest-feedback\n\nNo human-sim feedback has been recorded yet.\n",
      ),
      "text/markdown; charset=utf-8",
    )
  } else if request.meth == Get && path == "/api/human-sim/latest-intent" {
    send_text(
      conn,
      200,
      read_text_or_default(
        human_sim_state_dir() + "/latest-intent.json",
        "{\n  \"status\": \"empty\"\n}\n",
      ),
      "application/json; charset=utf-8",
    )
  } else if request.meth == Post && path == "/api/human-sim/actions" {
    let payload = body.read_all().text()
    persist_human_sim_payload(
      conn, "actions", payload, "application/json; charset=utf-8",
    )
  } else if request.meth == Post && path == "/api/human-sim/feedback" {
    let payload = body.read_all().text()
    persist_human_sim_payload(
      conn, "feedback", payload, "text/markdown; charset=utf-8",
    )
  } else if request.meth == Post && path == "/api/human-sim/intent-status" {
    let payload = body.read_all().text()
    persist_human_sim_intent_status(
      conn, payload, "application/json; charset=utf-8",
    )
  } else if request.meth == Post &&
    path == "/api/human-sim/dispatch-latest-intent" {
    dispatch_latest_human_sim_intent(conn)
  } else if request.meth == Post &&
    path == "/api/llm-sim/process-latest-response" {
    process_latest_llm_sim_response(conn)
  } else if request.meth == Post && path == "/api/runtime-exec/register-ready" {
    let payload = body.read_all().text()
    persist_runtime_ready_registration(conn, payload)
  } else if request.meth == Post && path == "/api/task/execute" {
    let payload = body.read_all().text()
    persist_runtime_execution_result(conn, payload)
  } else if request.meth == Post && path == "/api/skill-export/save-decision" {
    let payload = body.read_all().text()
    persist_skill_save_decision(conn, payload)
  } else if request.meth == Get && path.contains("/api/skills/run-plan") {
    let skill_hint = if path.contains("finance") || path.contains("excel") {
      "finance excel"
    } else if path.contains("generator") || path.contains("synthetic") {
      "fastq generator"
    } else if path.contains("gomoku") || path.contains("game") {
      "gomoku game"
    } else {
      "fastq"
    }
    send_json(conn, 200, @core.skill_run_plan_json(skill_hint))
  } else if request.meth == Get && path.contains("/api/agent/context") {
    let user_input = if path.contains("game") {
      "make a browser game"
    } else if path.contains("csv") {
      "analyze csv"
    } else if path.contains("xlsx") || path.contains("excel") {
      "analyze excel"
    } else if path.contains("json") {
      "inspect json"
    } else if path.contains("fastq") || path.contains("fq") {
      "count N bases in FastQ"
    } else {
      "chat"
    }
    let detected_type = if path.contains("fastq") || path.contains("fq") {
      "fastq"
    } else if path.contains("csv") {
      "csv"
    } else if path.contains("xlsx") || path.contains("excel") {
      "xlsx"
    } else if path.contains("json") {
      "json"
    } else {
      ""
    }
    send_json(
      conn,
      200,
      @core.normalize_agent_context_json(
        "native-demo", user_input, "moonbit-task", detected_type, 0, detected_type,
        "2026-04-15T00:00:00Z",
      ),
    )
  } else if request.meth == Get &&
    (path.contains("/api/agent/route") || path.contains("/api/prompt/build")) {
    send_json(conn, 200, @core.route_agent_json(path, ""))
  } else if request.meth == Post && path.contains("/api/artifact/compile") {
    let source = body.read_all().text()
    send_json(
      conn,
      200,
      @core.artifact_compile_probe_json(
        source,
        formal_verification=path.contains("formal=1"),
      ),
    )
  } else if request.meth == Post && path == "/api/llm/proxy" {
    let spec = body.read_all().text()
    try {
      let (status, payload) = proxy_llm_post(spec)
      send_text(conn, status, payload, "application/json; charset=utf-8")
    } catch {
      err => {
        let (status, payload) = proxy_error_payload(
          500,
          "MoonAP local LLM proxy crashed before sending a response.",
          "",
          err.to_string(),
        )
        send_text(conn, status, payload, "application/json; charset=utf-8")
      }
    }
  } else if request.meth == Post &&
    path == "/api/experiments/free-llm-moonbit/results.json" {
    let payload = body.read_all().text()
    persist_experiment_text(
      conn, "artifacts", "artifacts/moonbit-eval-results.json", payload, "application/json; charset=utf-8",
    )
  } else if request.meth == Post &&
    path == "/api/experiments/free-llm-moonbit/results.md" {
    let payload = body.read_all().text()
    persist_experiment_text(
      conn, "docs/experiments/free-llm-moonbit", "docs/experiments/free-llm-moonbit/results.md",
      payload, "text/markdown; charset=utf-8",
    )
  } else if request.meth == Post && path == "/api/logs/moonap-runtime.log" {
    let payload = body.read_all().text()
    append_runtime_log(
      conn,
      runtime_log_directory(),
      runtime_log_path(),
      payload,
      "text/plain; charset=utf-8",
    )
  } else {
    send_text(
      conn,
      if request.meth == Get || request.meth == Post {
        404
      } else {
        405
      },
      if request.meth == Get || request.meth == Post {
        "Not Found"
      } else {
        "Method Not Allowed"
      },
      "text/plain; charset=utf-8",
    )
  }
}

///|
async fn initialize_runtime_session() -> String {
  let run_id = "run-" + @core.async_runtime_marker().to_string()
  let root = "logs/runs/" + run_id
  let llm_root = root + "/llm-sim"
  let human_root = root + "/human-sim"
  let runtime_exec_root = root + "/runtime-exec"
  let skill_export_root = root + "/skill-export"
  ensure_directory("logs")
  ensure_directory("logs/runs")
  ensure_directory(root)
  ensure_directory(llm_root + "/inbox")
  ensure_directory(llm_root + "/outbox")
  ensure_directory(llm_root + "/state")
  ensure_directory(human_root + "/actions")
  ensure_directory(human_root + "/observations")
  ensure_directory(human_root + "/feedback")
  ensure_directory(human_root + "/state")
  ensure_directory(runtime_exec_root)
  ensure_directory(skill_export_root)
  ensure_directory(skill_export_root + "/program")
  let runtime_log = root + "/moonap-runtime.log"
  let manifest = "{\n" +
    "  \"run_id\": " +
    json_string(run_id) +
    ",\n" +
    "  \"root\": " +
    json_string(root) +
    ",\n" +
    "  \"runtime_log\": " +
    json_string(runtime_log) +
    ",\n" +
    "  \"llm_sim_root\": " +
    json_string(llm_root) +
    ",\n" +
    "  \"human_sim_root\": " +
    json_string(human_root) +
    ",\n" +
    "  \"runtime_exec_root\": " +
    json_string(runtime_exec_root) +
    ",\n" +
    "  \"skill_export_root\": " +
    json_string(skill_export_root) +
    "\n" +
    "}\n"
  @fs.write_file("logs/current-run-dir.txt", root + "\n", create=0o644)
  @fs.write_file("logs/current-run.json", manifest, create=0o644)
  @fs.write_file(
    runtime_log,
    "{\"ts\":" +
    json_string(run_id) +
    ",\"kind\":\"server\",\"label\":\"session-start\",\"text\":\"MoonAP runtime session initialized.\"}\n",
    create=0o644,
  )
  root
}

///|
async fn ensure_directory(path : String) -> Unit {
  if path != "" && !@fs.exists(path) {
    @fs.mkdir(path, recursive=true, permission=0o755)
  }
}

///|
async fn current_runtime_dir() -> String {
  let path = "logs/current-run-dir.txt"
  if @fs.exists(path) {
    let text = @fs.read_file(path).text().trim().to_string()
    if text != "" {
      return text
    }
  }
  "logs"
}

///|
async fn runtime_log_directory() -> String {
  current_runtime_dir()
}

///|
async fn runtime_log_path() -> String {
  current_runtime_dir() + "/moonap-runtime.log"
}

///|
async fn llm_sim_root() -> String {
  current_runtime_dir() + "/llm-sim"
}

///|
async fn llm_sim_inbox_dir() -> String {
  llm_sim_root() + "/inbox"
}

///|
async fn llm_sim_outbox_dir() -> String {
  llm_sim_root() + "/outbox"
}

///|
async fn llm_sim_state_dir() -> String {
  llm_sim_root() + "/state"
}

///|
async fn human_sim_root() -> String {
  current_runtime_dir() + "/human-sim"
}

///|
async fn human_sim_actions_dir() -> String {
  human_sim_root() + "/actions"
}

///|
async fn human_sim_feedback_dir() -> String {
  human_sim_root() + "/feedback"
}

///|
async fn human_sim_observations_dir() -> String {
  human_sim_root() + "/observations"
}

///|
async fn human_sim_state_dir() -> String {
  human_sim_root() + "/state"
}

///|
async fn runtime_exec_root() -> String {
  current_runtime_dir() + "/runtime-exec"
}

///|
fn built_web_js_path() -> String {
  "_build/js/debug/build/cmd/web_app/web_app.js"
}

///|
fn committed_web_js_path() -> String {
  "web/app-live.js"
}

///|
async fn served_web_js_path() -> String {
  if @fs.exists(built_web_js_path()) {
    built_web_js_path()
  } else {
    committed_web_js_path()
  }
}

///|
async fn runtime_exec_requests_dir() -> String {
  runtime_exec_root() + "/requests"
}

///|
async fn skill_export_root() -> String {
  current_runtime_dir() + "/skill-export"
}

///|
async fn read_text_or_default(path : String, fallback : String) -> String {
  if @fs.exists(path) {
    @fs.read_file(path).text()
  } else {
    fallback
  }
}

///|
async fn latest_llm_sim_request_text_path() -> String {
  read_text_or_default(llm_sim_state_dir() + "/latest-request.txt", "")
  .trim()
  .to_string()
}

///|
fn llm_sim_request_json_path_from_text_path(
  request_text_path : String,
) -> String {
  if request_text_path == "" {
    ""
  } else {
    request_text_path.replace_all(old=".txt", new=".json")
  }
}

///|
async fn latest_llm_sim_request_json_or_default() -> String {
  let request_text_path = latest_llm_sim_request_text_path()
  if request_text_path == "" {
    "{\n  \"status\": \"empty\"\n}\n"
  } else {
    let request_json_path = llm_sim_request_json_path_from_text_path(
      request_text_path,
    )
    read_text_or_default(
      request_json_path,
      "{\n  \"status\": \"missing-request-json\",\n  \"request_text_path\": " +
      json_string(request_text_path) +
      "\n}\n",
    )
  }
}

///|
async fn latest_llm_sim_response_status_json() -> String {
  let request_json = latest_llm_sim_request_json_or_default()
  let request_id = extract_json_string_field(request_json, "request_id")
  let response_path = extract_json_string_field(request_json, "reply_path")
  let error_path = extract_json_string_field(request_json, "error_path")
  if request_id == "" {
    return "{\n  \"ok\": false,\n  \"status\": \"empty\"\n}\n"
  }
  let response_exists = response_path != "" && @fs.exists(response_path)
  let error_exists = error_path != "" && @fs.exists(error_path)
  "{\n" +
  "  \"ok\": " +
  bool_json(response_exists) +
  ",\n" +
  "  \"request_id\": " +
  json_string(request_id) +
  ",\n" +
  "  \"status\": " +
  json_string(
    if response_exists {
      "response-ready"
    } else if error_exists {
      "error-ready"
    } else {
      "pending"
    },
  ) +
  ",\n" +
  "  \"response_path\": " +
  json_string(response_path) +
  ",\n" +
  "  \"error_path\": " +
  json_string(error_path) +
  "\n" +
  "}\n"
}

///|
fn bool_json(value : Bool) -> String {
  if value {
    "true"
  } else {
    "false"
  }
}

///|
fn json_message(role : String, content : String) -> String {
  "{\n" +
  "  \"role\": " +
  json_string(role) +
  ",\n" +
  "  \"content\": " +
  json_string(content) +
  "\n" +
  "}"
}

///|
fn append_json_message_array(
  history_json : String,
  role : String,
  content : String,
) -> String {
  let trimmed = history_json.trim().to_string()
  let message = json_message(role, content)
  if trimmed == "" || trimmed == "[]" {
    "[\n" + message + "\n]"
  } else if trimmed.has_prefix("[") && trimmed.has_suffix("]") {
    let inner = trimmed[1:trimmed.length() - 1].trim().to_string()
    if inner == "" {
      "[\n" + message + "\n]"
    } else {
      "[\n" + inner + ",\n" + message + "\n]"
    }
  } else {
    "[\n" + json_message("user", trimmed) + ",\n" + message + "\n]"
  }
}

///|
async fn persist_experiment_text(
  conn : @http.ServerConnection,
  directory : String,
  path : String,
  payload : String,
  content_type : String,
) -> Unit {
  if directory != "" && !@fs.exists(directory) {
    @fs.mkdir(directory, recursive=true, permission=0o755)
  }
  @fs.write_file(path, payload, create=0o644)
  send_text(conn, 200, payload, content_type)
}

///|
async fn append_runtime_log(
  conn : @http.ServerConnection,
  directory : String,
  path : String,
  payload : String,
  content_type : String,
) -> Unit {
  if directory != "" && !@fs.exists(directory) {
    @fs.mkdir(directory, recursive=true, permission=0o755)
  }
  let existing = if @fs.exists(path) { @fs.read_file(path).text() } else { "" }
  let next = existing + payload
  @fs.write_file(path, next, create=0o644)
  send_text(conn, 200, payload, content_type)
}

///|
async fn persist_human_sim_payload(
  conn : @http.ServerConnection,
  channel : String,
  payload : String,
  content_type : String,
) -> Unit {
  let directory = if channel == "actions" {
    human_sim_actions_dir()
  } else {
    human_sim_feedback_dir()
  }
  let latest_suffix = if content_type.contains("json") {
    ".json"
  } else if channel == "actions" {
    ".txt"
  } else {
    ".md"
  }
  let state_path = if channel == "actions" {
    human_sim_state_dir() + "/latest-action" + latest_suffix
  } else {
    human_sim_state_dir() + "/latest-feedback" + latest_suffix
  }
  ensure_directory(directory)
  ensure_directory(human_sim_state_dir())
  let extension = if channel == "actions" { ".json" } else { latest_suffix }
  let normalized_payload = if channel == "actions" {
    normalize_human_sim_action_payload(payload)
  } else {
    payload
  }
  let path = directory +
    "/" +
    channel +
    "-" +
    @core.async_runtime_marker().to_string() +
    extension
  @fs.write_file(path, normalized_payload, create=0o644)
  @fs.write_file(state_path, normalized_payload, create=0o644)
  if channel == "actions" {
    let action_kind = extract_json_string_field(normalized_payload, "action")
    if action_kind == "submit-prompt" {
      @fs.write_file(
        human_sim_state_dir() + "/latest-intent.json",
        human_sim_intent_json(normalized_payload),
        create=0o644,
      )
    }
  }
  append_text_file(
    runtime_log_directory(),
    runtime_log_path(),
    "{\"ts\":" +
    json_string(@core.async_runtime_marker().to_string()) +
    ",\"kind\":\"human-sim\",\"label\":" +
    json_string(channel + "-received") +
    ",\"text\":" +
    json_string(path) +
    "}\n",
  )
  send_text(conn, 200, normalized_payload, content_type)
}

///|
async fn persist_human_sim_intent_status(
  conn : @http.ServerConnection,
  payload : String,
  content_type : String,
) -> Unit {
  let normalized = normalize_human_sim_intent_status_payload(payload)
  ensure_directory(human_sim_state_dir())
  @fs.write_file(
    human_sim_state_dir() + "/latest-intent-status.json",
    normalized,
    create=0o644,
  )
  append_text_file(
    runtime_log_directory(),
    runtime_log_path(),
    "{\"ts\":" +
    json_string(@core.async_runtime_marker().to_string()) +
    ",\"kind\":\"human-sim\",\"label\":\"intent-status-updated\",\"text\":" +
    json_string(human_sim_state_dir() + "/latest-intent-status.json") +
    "}\n",
  )
  send_text(conn, 200, normalized, content_type)
}

///|
async fn dispatch_latest_human_sim_intent(
  conn : @http.ServerConnection,
) -> Unit {
  let intent_path = human_sim_state_dir() + "/latest-intent.json"
  let intent_raw = read_text_or_default(
    intent_path, "{\n  \"status\": \"empty\"\n}\n",
  )
  let prompt = extract_json_string_field(intent_raw, "prompt")
  let task_kind = extract_json_string_field(intent_raw, "task_kind")
  if prompt == "" {
    send_json(
      conn, 400, "{\n  \"ok\": false,\n  \"error\": \"No captured human-sim intent is available yet.\"\n}\n",
    )
    return
  }
  let request_body = llm_sim_request_body_from_intent(prompt)
  let conversation_history_json = llm_sim_initial_conversation_history_json(
    prompt,
  )
  let (request_id, request_text_path, response_path, error_path) = create_llm_sim_request(
    "openai", "gpt-5.4", "codegen", "moonap://llm-sim", request_body, prompt, task_kind,
    conversation_history_json,
  )
  @fs.write_file(
    human_sim_state_dir() + "/latest-intent-status.json",
    "{\n" +
    "  \"status\": \"dispatched\",\n" +
    "  \"assignee\": \"llm-sim-thread\",\n" +
    "  \"notes\": " +
    json_string(request_id) +
    "\n" +
    "}\n",
    create=0o644,
  )
  send_json(
    conn,
    200,
    "{\n" +
    "  \"ok\": true,\n" +
    "  \"request_id\": " +
    json_string(request_id) +
    ",\n" +
    "  \"request_path\": " +
    json_string(request_text_path) +
    ",\n" +
    "  \"reply_path\": " +
    json_string(response_path) +
    ",\n" +
    "  \"error_path\": " +
    json_string(error_path) +
    "\n" +
    "}\n",
  )
}

///|
async fn process_latest_llm_sim_response(conn : @http.ServerConnection) -> Unit {
  let request_json = latest_llm_sim_request_json_or_default()
  let request_id = extract_json_string_field(request_json, "request_id")
  let response_path = extract_json_string_field(request_json, "reply_path")
  let error_path = extract_json_string_field(request_json, "error_path")
  let original_prompt = extract_json_string_field(
    request_json, "original_prompt",
  )
  let task_kind = extract_json_string_field(request_json, "task_kind")
  let conversation_history_json = extract_json_string_field(
    request_json, "conversation_history_json",
  )
  if request_id == "" {
    send_json(
      conn, 400, "{\n  \"ok\": false,\n  \"error\": \"No llm-sim request is available yet.\"\n}\n",
    )
    return
  }
  if error_path != "" && @fs.exists(error_path) {
    let detail = @fs.read_file(error_path).text()
    append_text_file(
      runtime_log_directory(),
      runtime_log_path(),
      "{\"ts\":" +
      json_string(request_id) +
      ",\"kind\":\"llm-sim\",\"label\":\"response-error-consumed\",\"text\":" +
      json_string(error_path) +
      "}\n",
    )
    send_json(
      conn,
      502,
      "{\n" +
      "  \"ok\": false,\n" +
      "  \"request_id\": " +
      json_string(request_id) +
      ",\n" +
      "  \"status\": \"error-ready\",\n" +
      "  \"error_path\": " +
      json_string(error_path) +
      ",\n" +
      "  \"detail\": " +
      json_string(detail) +
      "\n" +
      "}\n",
    )
    return
  }
  if response_path == "" || !@fs.exists(response_path) {
    send_json(
      conn,
      202,
      "{\n" +
      "  \"ok\": false,\n" +
      "  \"request_id\": " +
      json_string(request_id) +
      ",\n" +
      "  \"status\": \"pending-response\",\n" +
      "  \"response_path\": " +
      json_string(response_path) +
      "\n" +
      "}\n",
    )
    return
  }
  let raw_response = @fs.read_file(response_path).text()
  let source = @core.extract_moonbit_source(raw_response)
  let report = @core.artifact_compile_probe(source)
  let report_json = report.to_json().stringify(indent=2)
  let stage = extract_json_string_field(request_json, "stage")
  let requests_dir = runtime_exec_requests_dir()
  let request_dir = requests_dir + "/" + request_id
  let latest_response_path = runtime_exec_root() + "/latest-raw-response.txt"
  let latest_source_path = runtime_exec_root() + "/latest-source.mbt"
  let latest_report_path = runtime_exec_root() + "/latest-compile-report.json"
  let latest_runtime_request_path = runtime_exec_root() + "/latest-request.json"
  let request_response_path = request_dir + "/raw-response.txt"
  let request_source_path = request_dir + "/main.mbt"
  let request_report_path = request_dir + "/compile-report.json"
  let request_runtime_request_path = request_dir + "/runtime-request.json"
  let observation_path = human_sim_observations_dir() +
    "/" +
    request_id +
    "-compile-observation.md"
  let latest_observation_path = human_sim_observations_dir() +
    "/latest-compile-observation.md"
  ensure_directory(runtime_exec_root())
  ensure_directory(requests_dir)
  ensure_directory(request_dir)
  ensure_directory(human_sim_observations_dir())
  @fs.write_file(request_response_path, raw_response, create=0o644)
  @fs.write_file(request_source_path, source + "\n", create=0o644)
  @fs.write_file(request_report_path, report_json + "\n", create=0o644)
  @fs.write_file(latest_response_path, raw_response, create=0o644)
  @fs.write_file(latest_source_path, source + "\n", create=0o644)
  @fs.write_file(latest_report_path, report_json + "\n", create=0o644)
  let runtime_request_json = runtime_exec_request_json(
    request_id,
    stage,
    request_source_path,
    source,
    report,
    run_id_from_dir(current_runtime_dir()),
  )
  if report.ok {
    @fs.write_file(
      request_runtime_request_path,
      runtime_request_json,
      create=0o644,
    )
    @fs.write_file(
      latest_runtime_request_path,
      runtime_request_json,
      create=0o644,
    )
  }
  let observation = llm_sim_compile_observation_markdown(request_id, report)
  let next_repair_request = if report.ok {
    None
  } else {
    let compiler_excerpt = if report.trimmed_output != "" {
      report.trimmed_output
    } else if report.summary_excerpt != "" {
      report.summary_excerpt
    } else {
      report.output
    }
    let repair_body = llm_sim_repair_request_body_from_report(
      source, report, task_kind, conversation_history_json,
    )
    let next_conversation_history_json = append_json_message_array(
      append_json_message_array(conversation_history_json, "assistant", source),
      "user",
      "Compiler error:\n" + compiler_excerpt,
    )
    let (next_request_id, next_request_path, next_response_path, next_error_path
    ) = create_llm_sim_request(
      "openai", "gpt-5.4", "repair", "moonap://llm-sim", repair_body, original_prompt,
      task_kind, next_conversation_history_json,
    )
    Some(
      (next_request_id, next_request_path, next_response_path, next_error_path),
    )
  }
  @fs.write_file(observation_path, observation, create=0o644)
  @fs.write_file(latest_observation_path, observation, create=0o644)
  @fs.write_file(
    llm_sim_state_dir() + "/latest-response-status.json",
    "{\n" +
    "  \"request_id\": " +
    json_string(request_id) +
    ",\n" +
    "  \"status\": " +
    json_string(if report.ok { "compile-ok" } else { "compile-failed" }) +
    ",\n" +
    "  \"request_stage\": " +
    json_string(stage) +
    ",\n" +
    "  \"response_path\": " +
    json_string(response_path) +
    ",\n" +
    "  \"source_path\": " +
    json_string(request_source_path) +
    ",\n" +
    "  \"compile_report_path\": " +
    json_string(request_report_path) +
    ",\n" +
    "  \"next_request_id\": " +
    json_string(
      match next_repair_request {
        Some((next_request_id, _, _, _)) => next_request_id
        None => ""
      },
    ) +
    "\n" +
    "}\n",
    create=0o644,
  )
  append_text_file(
    runtime_log_directory(),
    runtime_log_path(),
    "{\"ts\":" +
    json_string(request_id) +
    ",\"kind\":\"llm-sim\",\"label\":\"response-processed\",\"text\":" +
    json_string(request_report_path) +
    "}\n",
  )
  append_text_file(
    runtime_log_directory(),
    runtime_log_path(),
    "{\"ts\":" +
    json_string(request_id) +
    ",\"kind\":\"runtime-exec\",\"label\":\"compile-probe-finished\",\"text\":" +
    json_string(if report.ok { "ok" } else { "failed" }) +
    "}\n",
  )
  if report.ok {
    append_text_file(
      runtime_log_directory(),
      runtime_log_path(),
      "{\"ts\":" +
      json_string(request_id) +
      ",\"kind\":\"runtime-exec\",\"label\":\"runtime-request-ready\",\"text\":" +
      json_string(request_runtime_request_path) +
      "}\n",
    )
  }
  if next_repair_request is Some((next_request_id, _, _, _)) {
    append_text_file(
      runtime_log_directory(),
      runtime_log_path(),
      "{\"ts\":" +
      json_string(next_request_id) +
      ",\"kind\":\"llm-sim\",\"label\":\"repair-request-created\",\"text\":" +
      json_string(request_id) +
      "}\n",
    )
  }
  send_json(
    conn,
    200,
    "{\n" +
    "  \"ok\": " +
    bool_json(report.ok) +
    ",\n" +
    "  \"request_id\": " +
    json_string(request_id) +
    ",\n" +
    "  \"source_path\": " +
    json_string(request_source_path) +
    ",\n" +
    "  \"compile_report_path\": " +
    json_string(request_report_path) +
    ",\n" +
    "  \"observation_path\": " +
    json_string(observation_path) +
    ",\n" +
    "  \"stage\": " +
    json_string(report.stage) +
    ",\n" +
    "  \"summary_kind\": " +
    json_string(report.summary_kind) +
    ",\n" +
    "  \"next_request_id\": " +
    json_string(
      match next_repair_request {
        Some((next_request_id, _, _, _)) => next_request_id
        None => ""
      },
    ) +
    ",\n" +
    "  \"next_request_path\": " +
    json_string(
      match next_repair_request {
        Some((_, next_request_path, _, _)) => next_request_path
        None => ""
      },
    ) +
    "\n" +
    "}\n",
  )
}

///|
fn runtime_exec_request_json(
  request_id : String,
  request_stage : String,
  source_path : String,
  source_text : String,
  report : @core.ArtifactCompileReport,
  run_id : String,
) -> String {
  runtime_exec_request_json_from_fields(
    request_id,
    request_stage,
    source_path,
    report.wasm_path,
    run_id,
    "",
    "",
    source_text,
  )
}

///|
fn runtime_exec_request_json_from_fields(
  request_id : String,
  request_stage : String,
  source_path : String,
  wasm_path : String,
  run_id : String,
  task_title : String,
  original_prompt : String,
  source_text : String,
) -> String {
  let base_url = "/api/runtime-exec/request-artifact?run_id=" +
    run_id +
    "&request_id=" +
    request_id
  let task_kind = runtime_task_kind_from_context(
    task_title, original_prompt, source_text,
  )
  let runtime_mode = runtime_mode_for_task_kind(task_kind)
  let result_mode = result_mode_for_task_kind(task_kind)
  let runtime_spec_json = runtime_spec_json_for_context(
    task_kind, original_prompt, source_text,
  )
  "{\n" +
  "  \"run_id\": " +
  json_string(run_id) +
  ",\n" +
  "  \"request_id\": " +
  json_string(request_id) +
  ",\n" +
  "  \"request_stage\": " +
  json_string(request_stage) +
  ",\n" +
  "  \"task_kind\": " +
  json_string(task_kind) +
  ",\n" +
  "  \"runtime_mode\": " +
  json_string(runtime_mode) +
  ",\n" +
  "  \"result_mode\": " +
  json_string(result_mode) +
  ",\n" +
  "  \"status\": \"ready-for-runtime\",\n" +
  "  \"wasm_path\": " +
  json_string(wasm_path) +
  ",\n" +
  "  \"wasm_url\": " +
  json_string(base_url + "&kind=wasm") +
  ",\n" +
  "  \"source_path\": " +
  json_string(source_path) +
  ",\n" +
  "  \"source_url\": " +
  json_string(base_url + "&kind=source") +
  ",\n" +
  "  \"compile_report_url\": " +
  json_string(base_url + "&kind=compile-report") +
  ",\n" +
  "  \"raw_response_url\": " +
  json_string(base_url + "&kind=raw-response") +
  ",\n" +
  "  \"runtime_spec\": " +
  runtime_spec_json +
  ",\n" +
  "  \"runtime_ui\": " +
  runtime_spec_json +
  ",\n" +
  "  \"result_delivery\": {\n" +
  "    \"show_in_browser\": true,\n" +
  "    \"allow_download\": true,\n" +
  "    \"save_skill_after_user_accepts\": true\n" +
  "  }\n" +
  "}\n"
}

///|
fn runtime_mode_for_task_kind(task_kind : String) -> String {
  if task_kind == "fastq-generator" ||
    task_kind == "excel-generator" ||
    task_kind == "large-file-generation" {
    "form"
  } else if task_kind == "fastq-analysis" ||
    task_kind == "large-fastq-analysis" ||
    task_kind == "finance-report-analysis" ||
    task_kind == "large-file-analysis" {
    "file"
  } else if task_kind == "browser-game" {
    "interactive"
  } else {
    "form"
  }
}

///|
fn result_mode_for_task_kind(task_kind : String) -> String {
  if task_kind == "fastq-generator" ||
    task_kind == "excel-generator" ||
    task_kind == "large-file-generation" {
    "download"
  } else if task_kind == "fastq-analysis" ||
    task_kind == "large-fastq-analysis" ||
    task_kind == "finance-report-analysis" ||
    task_kind == "large-file-analysis" {
    "report"
  } else if task_kind == "browser-game" {
    "interactive"
  } else {
    "text"
  }
}

///|
fn runtime_task_kind_from_context(
  task_title : String,
  original_prompt : String,
  source_text : String,
) -> String {
  let haystack = (task_title + "\n" + original_prompt + "\n" + source_text).to_lower()
  let mentions_large_file = haystack.contains("1gb") ||
    haystack.contains("large file") ||
    haystack.contains("large-file") ||
    haystack.contains("streaming") ||
    haystack.contains("chunk") ||
    haystack.contains("browser-local")
  let mentions_generation = haystack.contains("generate") ||
    haystack.contains("generator") ||
    haystack.contains("create") ||
    haystack.contains("synthetic") ||
    haystack.contains("output") ||
    haystack.contains("write") ||
    haystack.contains("writing") ||
    haystack.contains("save file") ||
    haystack.contains("save picker")
  let mentions_analysis = haystack.contains("analy") ||
    haystack.contains("inspect") ||
    haystack.contains("count") ||
    haystack.contains("scan") ||
    haystack.contains("parse") ||
    haystack.contains("report")
  let mentions_fastq = haystack.contains("fastq") ||
    haystack.contains(".fq") ||
    haystack.contains(" fq ") ||
    haystack.contains("sequencing")
  if generic_prompt_has_specialized_runtime(haystack) {
    "generic-task"
  } else if mentions_large_file && mentions_fastq && mentions_analysis {
    "large-fastq-analysis"
  } else if mentions_large_file && mentions_generation {
    "large-file-generation"
  } else if mentions_large_file && mentions_analysis {
    "large-file-analysis"
  } else if mentions_fastq && mentions_analysis {
    "fastq-analysis"
  } else if mentions_fastq {
    "fastq-generator"
  } else if haystack.contains("financial") || haystack.contains("finance") {
    "finance-report-analysis"
  } else if haystack.contains("excel") {
    "excel-generator"
  } else if haystack.contains("game") {
    "browser-game"
  } else {
    "generic-task"
  }
}

///|
fn generic_prompt_has_specialized_runtime(haystack : String) -> Bool {
  (
    haystack.contains("json") &&
    (
      haystack.contains("format") ||
      haystack.contains("validator") ||
      haystack.contains("validate")
    )
  ) ||
  haystack.contains("text analyzer") ||
  (
    haystack.contains("characters") &&
    haystack.contains("words") &&
    haystack.contains("lines")
  ) ||
  haystack.contains("csv") ||
  haystack.contains("tsv") ||
  haystack.contains("column names") ||
  haystack.contains("missing values")
}

///|
fn runtime_spec_json_for_task_kind(task_kind : String) -> String {
  if task_kind == "fastq-generator" {
    "{\n" +
    "    \"mode\": \"form\",\n" +
    "    \"title\": \"Generate FastQ file\",\n" +
    "    \"primary_action_label\": \"Run generator\",\n" +
    "    \"fields\": [\n" +
    "      {\n" +
    "        \"name\": \"read_count\",\n" +
    "        \"label\": \"Read count\",\n" +
    "        \"type\": \"int\",\n" +
    "        \"default\": 10000,\n" +
    "        \"min\": 1,\n" +
    "        \"max\": 1000000,\n" +
    "        \"step\": 1\n" +
    "      },\n" +
    "      {\n" +
    "        \"name\": \"read_length\",\n" +
    "        \"label\": \"Read length\",\n" +
    "        \"type\": \"int\",\n" +
    "        \"default\": 150,\n" +
    "        \"min\": 1,\n" +
    "        \"max\": 10000,\n" +
    "        \"step\": 1\n" +
    "      },\n" +
    "      {\n" +
    "        \"name\": \"n_rate\",\n" +
    "        \"label\": \"N rate\",\n" +
    "        \"type\": \"float\",\n" +
    "        \"default\": 0.01,\n" +
    "        \"min\": 0,\n" +
    "        \"max\": 1,\n" +
    "        \"step\": 0.001\n" +
    "      },\n" +
    "      {\n" +
    "        \"name\": \"random_seed\",\n" +
    "        \"label\": \"Random seed\",\n" +
    "        \"type\": \"int\",\n" +
    "        \"default\": 42,\n" +
    "        \"step\": 1\n" +
    "      }\n" +
    "    ]\n" +
    "  }"
  } else if task_kind == "excel-generator" {
    "{\n" +
    "    \"mode\": \"form\",\n" +
    "    \"title\": \"Generate financial spreadsheet\",\n" +
    "    \"action_label\": \"Run generator\",\n" +
    "    \"fields\": [\n" +
    "      {\n" +
    "        \"name\": \"row_count\",\n" +
    "        \"label\": \"Row count\",\n" +
    "        \"type\": \"int\",\n" +
    "        \"default\": 120,\n" +
    "        \"min\": 1,\n" +
    "        \"max\": 100000,\n" +
    "        \"step\": 1\n" +
    "      },\n" +
    "      {\n" +
    "        \"name\": \"company_name\",\n" +
    "        \"label\": \"Company name\",\n" +
    "        \"type\": \"text\",\n" +
    "        \"default\": \"MoonAP Finance\"\n" +
    "      },\n" +
    "      {\n" +
    "        \"name\": \"currency\",\n" +
    "        \"label\": \"Currency\",\n" +
    "        \"type\": \"text\",\n" +
    "        \"default\": \"USD\"\n" +
    "      },\n" +
    "      {\n" +
    "        \"name\": \"random_seed\",\n" +
    "        \"label\": \"Random seed\",\n" +
    "        \"type\": \"int\",\n" +
    "        \"default\": 42,\n" +
    "        \"step\": 1\n" +
    "      }\n" +
    "    ]\n" +
    "  }"
  } else if task_kind == "fastq-analysis" {
    "{\n" +
    "    \"mode\": \"file\",\n" +
    "    \"title\": \"Analyze FastQ file\",\n" +
    "    \"action_label\": \"Run analysis\",\n" +
    "    \"fields\": []\n" +
    "  }"
  } else if task_kind == "large-fastq-analysis" {
    "{\n" +
    "    \"mode\": \"file\",\n" +
    "    \"title\": \"Analyze large FastQ file\",\n" +
    "    \"action_label\": \"Run FastQ analysis\",\n" +
    "    \"rerun_action_label\": \"Run FastQ analysis again\",\n" +
    "    \"domain_profile\": \"fastq\",\n" +
    "    \"io_contract\": {\n" +
    "      \"protocol\": \"moonap.large-file.v1\",\n" +
    "      \"browser_local_only\": true,\n" +
    "      \"llm_receives_file_contents\": false,\n" +
    "      \"host_capability\": \"chunked-local-analysis\",\n" +
    "      \"input_mode\": \"streaming-text\",\n" +
    "      \"output_mode\": \"report\",\n" +
    "      \"chunk_size_bytes\": 4194304,\n" +
    "      \"carry_strategy\": \"fastq-record-boundary\",\n" +
    "      \"supported_extensions\": [\"fastq\", \"fq\", \"txt\"]\n" +
    "    },\n" +
    "    \"fields\": [\n" +
    "      {\n" +
    "        \"name\": \"max_preview_reads\",\n" +
    "        \"label\": \"Preview reads\",\n" +
    "        \"type\": \"int\",\n" +
    "        \"default\": 3,\n" +
    "        \"min\": 0,\n" +
    "        \"max\": 20,\n" +
    "        \"step\": 1,\n" +
    "        \"help\": \"Only controls how many reads appear in the report preview. It does not limit full-file analysis.\"\n" +
    "      },\n" +
    "      {\n" +
    "        \"name\": \"validate_fastq_structure\",\n" +
    "        \"label\": \"Validate FastQ structure\",\n" +
    "        \"type\": \"bool\",\n" +
    "        \"default\": true,\n" +
    "        \"help\": \"Check @ header, + separator, and sequence/quality length for each four-line FastQ record.\"\n" +
    "      },\n" +
    "      {\n" +
    "        \"name\": \"count_bases\",\n" +
    "        \"label\": \"Count A/C/G/T/N bases\",\n" +
    "        \"type\": \"bool\",\n" +
    "        \"default\": true,\n" +
    "        \"help\": \"Count base composition while streaming. Turn off only if you want a lighter structural scan.\"\n" +
    "      }\n" +
    "    ]\n" +
    "  }"
  } else if task_kind == "large-file-analysis" {
    "{\n" +
    "    \"mode\": \"file\",\n" +
    "    \"title\": \"Analyze large browser-local file\",\n" +
    "    \"action_label\": \"Run streaming analysis\",\n" +
    "    \"rerun_action_label\": \"Run streaming analysis again\",\n" +
    "    \"io_contract\": {\n" +
    "      \"protocol\": \"moonap.large-file.v1\",\n" +
    "      \"browser_local_only\": true,\n" +
    "      \"llm_receives_file_contents\": false,\n" +
    "      \"host_capability\": \"chunked-local-analysis\",\n" +
    "      \"input_mode\": \"streaming-text\",\n" +
    "      \"output_mode\": \"report\",\n" +
    "      \"chunk_size_bytes\": 4194304,\n" +
    "      \"carry_strategy\": \"line-boundary\",\n" +
    "      \"supported_extensions\": [\"fastq\", \"fq\", \"csv\", \"tsv\", \"txt\", \"log\", \"jsonl\"]\n" +
    "    },\n" +
    "    \"fields\": [\n" +
    "      {\n" +
    "        \"name\": \"search_text\",\n" +
    "        \"label\": \"Search text (optional)\",\n" +
    "        \"type\": \"text\",\n" +
    "        \"default\": \"\"\n" +
    "      },\n" +
    "      {\n" +
    "        \"name\": \"max_preview_lines\",\n" +
    "        \"label\": \"Preview lines\",\n" +
    "        \"type\": \"int\",\n" +
    "        \"default\": 3,\n" +
    "        \"min\": 0,\n" +
    "        \"max\": 20,\n" +
    "        \"step\": 1\n" +
    "      }\n" +
    "    ]\n" +
    "  }"
  } else if task_kind == "large-file-generation" {
    "{\n" +
    "    \"mode\": \"form\",\n" +
    "    \"title\": \"Generate large browser-local file\",\n" +
    "    \"primary_action_label\": \"Generate with streaming writer\",\n" +
    "    \"rerun_action_label\": \"Generate with streaming writer again\",\n" +
    "    \"io_contract\": {\n" +
    "      \"protocol\": \"moonap.large-file.v1\",\n" +
    "      \"browser_local_only\": true,\n" +
    "      \"llm_receives_file_contents\": false,\n" +
    "      \"host_capability\": \"streamed-local-generation\",\n" +
    "      \"input_mode\": \"none\",\n" +
    "      \"output_mode\": \"browser-local-save-stream\",\n" +
    "      \"chunk_size_bytes\": 4194304,\n" +
    "      \"save_picker_required\": true\n" +
    "    },\n" +
    "    \"fields\": [\n" +
    "      {\n" +
    "        \"name\": \"output_name\",\n" +
    "        \"label\": \"Output FastQ file name\",\n" +
    "        \"type\": \"text\",\n" +
    "        \"default\": \"moonap-output.fastq\"\n" +
    "      },\n" +
    "      {\n" +
    "        \"name\": \"target_size_mb\",\n" +
    "        \"label\": \"Target size (MB)\",\n" +
    "        \"type\": \"int\",\n" +
    "        \"default\": 128,\n" +
    "        \"min\": 1,\n" +
    "        \"max\": 1024,\n" +
    "        \"step\": 1\n" +
    "      },\n" +
    "      {\n" +
    "        \"name\": \"read_length\",\n" +
    "        \"label\": \"Read length\",\n" +
    "        \"type\": \"int\",\n" +
    "        \"default\": 150,\n" +
    "        \"min\": 20,\n" +
    "        \"max\": 20000,\n" +
    "        \"step\": 1\n" +
    "      },\n" +
    "      {\n" +
    "        \"name\": \"read_header_prefix\",\n" +
    "        \"label\": \"Read header prefix\",\n" +
    "        \"type\": \"text\",\n" +
    "        \"default\": \"moonap_read\"\n" +
    "      },\n" +
    "      {\n" +
    "        \"name\": \"random_seed\",\n" +
    "        \"label\": \"Random seed\",\n" +
    "        \"type\": \"int\",\n" +
    "        \"default\": 42,\n" +
    "        \"min\": 0,\n" +
    "        \"max\": 2147483647,\n" +
    "        \"step\": 1\n" +
    "      },\n" +
    "      {\n" +
    "        \"name\": \"n_rate\",\n" +
    "        \"label\": \"N base rate\",\n" +
    "        \"type\": \"float\",\n" +
    "        \"default\": 0.01,\n" +
    "        \"min\": 0,\n" +
    "        \"max\": 1,\n" +
    "        \"step\": 0.001\n" +
    "      },\n" +
    "      {\n" +
    "        \"name\": \"quality_char\",\n" +
    "        \"label\": \"Quality character\",\n" +
    "        \"type\": \"text\",\n" +
    "        \"default\": \"I\"\n" +
    "      }\n" +
    "    ]\n" +
    "  }"
  } else if task_kind == "finance-report-analysis" {
    "{\n" +
    "    \"mode\": \"file\",\n" +
    "    \"title\": \"Analyze financial report\",\n" +
    "    \"action_label\": \"Run analysis\",\n" +
    "    \"fields\": []\n" +
    "  }"
  } else if task_kind == "browser-game" {
    "{\n" +
    "    \"mode\": \"interactive\",\n" +
    "    \"title\": \"Launch browser game\",\n" +
    "    \"action_label\": \"Run game\",\n" +
    "    \"fields\": []\n" +
    "  }"
  } else {
    "{\n" +
    "    \"mode\": \"form\",\n" +
    "    \"title\": \"Run browser-local app\",\n" +
    "    \"action_label\": \"Run app\",\n" +
    "    \"fields\": [\n" +
    "      {\n" +
    "        \"name\": \"input_text\",\n" +
    "        \"label\": \"Input\",\n" +
    "        \"type\": \"text\",\n" +
    "        \"default\": \"\",\n" +
    "        \"help\": \"Generic input for this APP.\"\n" +
    "      }\n" +
    "    ]\n" +
    "  }"
  }
}

///|
fn runtime_spec_json_for_context(
  task_kind : String,
  original_prompt : String,
  source_text : String,
) -> String {
  if task_kind != "generic-task" {
    runtime_spec_json_for_task_kind(task_kind)
  } else {
    let declared_spec = extract_moonap_runtime_spec_json(source_text)
    let haystack = (original_prompt + "\n" + source_text).to_lower()
    let prompt_spec = runtime_spec_json_for_generic_prompt(haystack)
    if prompt_spec != "" &&
      (declared_spec == "" || runtime_spec_is_generic_fallback(declared_spec)) {
      return prompt_spec
    }
    if declared_spec != "" {
      return declared_spec
    }
    if prompt_spec != "" {
      prompt_spec
    } else {
      runtime_spec_json_for_task_kind(task_kind)
    }
  }
}

///|
fn runtime_spec_is_generic_fallback(spec : String) -> Bool {
  let lowered = spec.to_lower()
  lowered.contains("\"run browser-local app\"") ||
  lowered.contains("\"generic input") ||
  (
    lowered.contains("\"input_text\"") &&
    !lowered.contains("\"tool_kind\"") &&
    !lowered.contains("\"computed_outputs\"")
  )
}

///|
fn runtime_spec_json_for_generic_prompt(haystack : String) -> String {
  if haystack.contains("json") &&
    (
      haystack.contains("format") ||
      haystack.contains("validator") ||
      haystack.contains("validate")
    ) {
    "{\n" +
    "    \"mode\": \"form\",\n" +
    "    \"tool_kind\": \"json-formatter\",\n" +
    "    \"title\": \"JSON formatter and validator\",\n" +
    "    \"action_label\": \"Format JSON\",\n" +
    "    \"rerun_action_label\": \"Format again\",\n" +
    "    \"fields\": [{\"name\":\"json_text\",\"label\":\"JSON text\",\"type\":\"text\",\"default\":\"{\\\"hello\\\":\\\"moonap\\\"}\",\"help\":\"Paste JSON text to validate and pretty-print locally.\"}]\n" +
    "  }"
  } else if haystack.contains("text analyzer") ||
    (
      haystack.contains("characters") &&
      haystack.contains("words") &&
      haystack.contains("lines")
    ) {
    "{\n" +
    "    \"mode\": \"form\",\n" +
    "    \"tool_kind\": \"text-analysis\",\n" +
    "    \"title\": \"Text analyzer\",\n" +
    "    \"action_label\": \"Analyze text\",\n" +
    "    \"rerun_action_label\": \"Analyze again\",\n" +
    "    \"fields\": [{\"name\":\"input_text\",\"label\":\"Text\",\"type\":\"text\",\"default\":\"MoonAP runs browser-local WebAssembly tools.\",\"help\":\"Enter text to count characters, words, lines, and estimated reading time.\"}]\n" +
    "  }"
  } else if haystack.contains("csv") ||
    haystack.contains("tsv") ||
    haystack.contains("column names") ||
    haystack.contains("missing values") {
    "{\n" +
    "    \"mode\": \"file\",\n" +
    "    \"analysis_type\": \"csv-summary\",\n" +
    "    \"title\": \"CSV analyzer\",\n" +
    "    \"action_label\": \"Analyze CSV\",\n" +
    "    \"rerun_action_label\": \"Analyze CSV again\",\n" +
    "    \"result_mode\": \"report\",\n" +
    "    \"io_contract\": {\"browser_local_only\": true, \"llm_receives_file_contents\": false, \"host_capability\": \"csv-summary\", \"input_mode\": \"file\", \"output_mode\": \"report\", \"supported_extensions\": [\"csv\", \"tsv\", \"txt\"]},\n" +
    "    \"fields\": []\n" +
    "  }"
  } else if haystack.contains("celsius") && haystack.contains("fahrenheit") {
    "{\n" +
    "    \"mode\": \"form\",\n" +
    "    \"title\": \"Convert Celsius to Fahrenheit\",\n" +
    "    \"action_label\": \"Convert temperature\",\n" +
    "    \"rerun_action_label\": \"Convert again\",\n" +
    "    \"fields\": [\n" +
    "      {\n" +
    "        \"name\": \"celsius\",\n" +
    "        \"label\": \"Celsius temperature\",\n" +
    "        \"type\": \"float\",\n" +
    "        \"default\": 25,\n" +
    "        \"step\": 0.1,\n" +
    "        \"help\": \"Enter the Celsius value to convert.\"\n" +
    "      }\n" +
    "    ]\n" +
    "  }"
  } else if (
      haystack.contains("two number") ||
      haystack.contains("two numbers") ||
      haystack.contains("2 number") ||
      haystack.contains("2 numbers")
    ) &&
    (haystack.contains("sum") || haystack.contains("add")) {
    "{\n" +
    "    \"mode\": \"form\",\n" +
    "    \"title\": \"Add two numbers\",\n" +
    "    \"action_label\": \"Calculate sum\",\n" +
    "    \"rerun_action_label\": \"Calculate again\",\n" +
    "    \"fields\": [\n" +
    "      {\n" +
    "        \"name\": \"number_a\",\n" +
    "        \"label\": \"First number\",\n" +
    "        \"type\": \"float\",\n" +
    "        \"default\": 1,\n" +
    "        \"step\": 1\n" +
    "      },\n" +
    "      {\n" +
    "        \"name\": \"number_b\",\n" +
    "        \"label\": \"Second number\",\n" +
    "        \"type\": \"float\",\n" +
    "        \"default\": 2,\n" +
    "        \"step\": 1\n" +
    "      }\n" +
    "    ]\n" +
    "  }"
  } else {
    ""
  }
}

///|
fn strip_runtime_spec_comment_prefix(line : String) -> String {
  let trimmed = line.trim().to_string()
  if trimmed.has_prefix("///") {
    trimmed[3:].to_string().trim().to_string()
  } else if trimmed.has_prefix("//") {
    trimmed[2:].to_string().trim().to_string()
  } else {
    line
  }
}

///|
fn extract_moonap_runtime_spec_json(source_text : String) -> String {
  let start_marker = "MOONAP_RUNTIME_SPEC_BEGIN"
  let end_marker = "MOONAP_RUNTIME_SPEC_END"
  guard source_text.find(start_marker) is Some(start_index) else { return "" }
  let after_start = source_text[start_index + start_marker.length():].to_string()
  guard after_start.find(end_marker) is Some(end_index) else { return "" }
  let raw = after_start[:end_index].to_string()
  let lines : Array[String] = []
  for line in raw.split("\n") {
    let cleaned = strip_runtime_spec_comment_prefix(line.to_string())
    if cleaned.trim() != "" {
      lines.push(cleaned)
    }
  }
  let spec = lines.join("\n").trim().to_string()
  if spec.has_prefix("{") && spec.contains("\"fields\"") {
    spec
  } else {
    ""
  }
}

///|
async fn persist_runtime_ready_registration(
  conn : @http.ServerConnection,
  payload : String,
) -> Unit {
  let source_text = extract_payload_block(
    payload, "SOURCE_BEGIN\n", "\nSOURCE_END",
  )
  let compile_report_json = extract_payload_block(
    payload, "COMPILE_REPORT_BEGIN\n", "\nCOMPILE_REPORT_END",
  )
  let task_title = extract_payload_header(payload, "TASK_TITLE")
  let original_prompt = extract_payload_header(payload, "ORIGINAL_PROMPT")
  let llm_provider = extract_payload_header(payload, "LLM_PROVIDER")
  let llm_model = extract_payload_header(payload, "LLM_MODEL")
  let request_stage = extract_payload_header(payload, "REQUEST_STAGE")
  let raw_response_text = extract_payload_block(
    payload, "RAW_RESPONSE_BEGIN\n", "\nRAW_RESPONSE_END",
  )
  let compile_ok = extract_payload_header(payload, "COMPILE_OK") == "true"
  let wasm_path = extract_payload_header(payload, "WASM_PATH")
  if source_text.trim() == "" {
    send_json(
      conn, 400, "{\n  \"ok\": false,\n  \"error\": \"No source_text was provided for runtime registration.\"\n}\n",
    )
    return
  }
  if !compile_ok || wasm_path == "" {
    send_json(
      conn, 400, "{\n  \"ok\": false,\n  \"error\": \"MoonAP runtime registration requires a successful compile report with wasm_path.\"\n}\n",
    )
    return
  }
  let request_id = "browser-runtime-" + @core.async_runtime_marker().to_string()
  let run_id = run_id_from_dir(current_runtime_dir())
  let request_dir = runtime_exec_requests_dir() + "/" + request_id
  let latest_response_path = runtime_exec_root() + "/latest-raw-response.txt"
  let latest_source_path = runtime_exec_root() + "/latest-source.mbt"
  let latest_report_path = runtime_exec_root() + "/latest-compile-report.json"
  let latest_runtime_request_path = runtime_exec_root() + "/latest-request.json"
  let request_response_path = request_dir + "/raw-response.txt"
  let request_source_path = request_dir + "/main.mbt"
  let request_report_path = request_dir + "/compile-report.json"
  let request_runtime_request_path = request_dir + "/runtime-request.json"
  ensure_directory(runtime_exec_root())
  ensure_directory(runtime_exec_requests_dir())
  ensure_directory(request_dir)
  @fs.write_file(
    request_response_path,
    if raw_response_text == "" {
      source_text + "\n"
    } else {
      raw_response_text + "\n"
    },
    create=0o644,
  )
  @fs.write_file(request_source_path, source_text + "\n", create=0o644)
  @fs.write_file(request_report_path, compile_report_json + "\n", create=0o644)
  @fs.write_file(
    latest_response_path,
    if raw_response_text == "" {
      source_text + "\n"
    } else {
      raw_response_text + "\n"
    },
    create=0o644,
  )
  @fs.write_file(latest_source_path, source_text + "\n", create=0o644)
  @fs.write_file(latest_report_path, compile_report_json + "\n", create=0o644)
  let runtime_request_json = runtime_exec_request_json_from_fields(
    request_id,
    if request_stage == "" {
      "browser-direct"
    } else {
      request_stage
    },
    request_source_path,
    wasm_path,
    run_id,
    task_title,
    original_prompt,
    source_text,
  )
  @fs.write_file(
    request_runtime_request_path,
    runtime_request_json,
    create=0o644,
  )
  @fs.write_file(
    latest_runtime_request_path,
    runtime_request_json,
    create=0o644,
  )
  append_text_file(
    runtime_log_directory(),
    runtime_log_path(),
    "{\"ts\":" +
    json_string(request_id) +
    ",\"kind\":\"runtime-exec\",\"label\":\"runtime-request-registered\",\"text\":" +
    json_string(
      (if task_title == "" { "browser-direct" } else { task_title }) +
      " via " +
      (if llm_provider == "" { "unknown-provider" } else { llm_provider }) +
      "/" +
      (if llm_model == "" { "unknown-model" } else { llm_model }),
    ) +
    "}\n",
  )
  send_text(
    conn,
    200,
    "{\n" +
    "  \"ok\": true,\n" +
    "  \"run_id\": " +
    json_string(run_id) +
    ",\n" +
    "  \"request_id\": " +
    json_string(request_id) +
    ",\n" +
    "  \"request_stage\": " +
    json_string(
      if request_stage == "" {
        "browser-direct"
      } else {
        request_stage
      },
    ) +
    ",\n" +
    "  \"task_title\": " +
    json_string(task_title) +
    ",\n" +
    "  \"original_prompt\": " +
    json_string(original_prompt) +
    ",\n" +
    runtime_request_json[1:runtime_request_json.length()].to_string(),
    "application/json; charset=utf-8",
  )
}

///|
fn extract_payload_header(payload : String, key : String) -> String {
  let marker = key + "\t"
  for line in payload.split("\n") {
    let trimmed = line.trim_end().to_string()
    if trimmed.has_prefix(marker) {
      return trimmed[marker.length():].to_string()
    }
  }
  ""
}

///|
fn extract_payload_block(
  payload : String,
  begin_marker : String,
  end_marker : String,
) -> String {
  guard payload.find(begin_marker) is Some(start) else { return "" }
  let after_start = payload[start + begin_marker.length():]
  guard after_start.find(end_marker) is Some(end) else { return "" }
  after_start[:end].to_string()
}

///|
async fn persist_runtime_execution_result(
  conn : @http.ServerConnection,
  payload : String,
) -> Unit {
  let normalized = normalize_runtime_execution_payload(payload)
  let request_id = extract_json_string_field(normalized, "request_id")
  let status = extract_json_string_field(normalized, "status")
  let request_dir = if request_id == "" {
    runtime_exec_root()
  } else {
    runtime_exec_requests_dir() + "/" + request_id
  }
  ensure_directory(runtime_exec_root())
  ensure_directory(runtime_exec_requests_dir())
  ensure_directory(request_dir)
  @fs.write_file(
    runtime_exec_root() + "/latest-result.json",
    normalized,
    create=0o644,
  )
  @fs.write_file(request_dir + "/result.json", normalized, create=0o644)
  let stdout = extract_json_string_field(normalized, "stdout_text")
  let error_text = extract_json_string_field(normalized, "error_text")
  let download_name = extract_json_string_field(normalized, "download_name")
  let download_content = extract_json_string_field(
    normalized, "download_content",
  )
  @fs.write_file(
    request_dir + "/stdout.txt",
    if stdout == "" {
      ""
    } else {
      stdout + "\n"
    },
    create=0o644,
  )
  @fs.write_file(
    request_dir + "/error.txt",
    if error_text == "" {
      ""
    } else {
      error_text + "\n"
    },
    create=0o644,
  )
  @fs.write_file(
    request_dir + "/preview.json",
    "{\n" +
    "  \"request_id\": " +
    json_string(request_id) +
    ",\n" +
    "  \"status\": " +
    json_string(status) +
    ",\n" +
    "  \"download_name\": " +
    json_string(download_name) +
    "\n" +
    "}\n",
    create=0o644,
  )
  if download_name != "" || download_content != "" {
    let download_file_name = if download_name == "" {
      "download.txt"
    } else {
      download_name
    }
    let download_path = request_dir + "/" + download_file_name
    @fs.write_file(download_path, download_content, create=0o644)
  }
  append_text_file(
    runtime_log_directory(),
    runtime_log_path(),
    "{\"ts\":" +
    json_string(
      if request_id == "" {
        @core.async_runtime_marker().to_string()
      } else {
        request_id
      },
    ) +
    ",\"kind\":\"runtime-exec\",\"label\":\"runtime-result-received\",\"text\":" +
    json_string(request_dir + "/result.json") +
    "}\n",
  )
  send_text(conn, 200, normalized, "application/json; charset=utf-8")
}

///|
fn normalize_runtime_execution_payload(payload : String) -> String {
  let run_id = extract_json_string_field(payload, "run_id")
  let request_id = extract_json_string_field(payload, "request_id")
  let status = extract_json_string_field(payload, "status")
  let result_kind = extract_json_string_field(payload, "result_kind")
  let summary = extract_json_string_field(payload, "summary")
  let display_text = extract_json_string_field(payload, "display_text")
  let stdout_text = extract_json_string_field(payload, "stdout_text")
  let error_text = extract_json_string_field(payload, "error_text")
  let download_name = extract_json_string_field(payload, "download_name")
  let download_content = extract_json_string_field(payload, "download_content")
  let accepted_for_skill = extract_json_bool_field(
    payload, "accepted_for_skill",
  )
  let download_url = if request_id == "" || download_name == "" {
    ""
  } else {
    "/api/runtime-exec/request-artifact?" +
    (if run_id == "" { "" } else { "run_id=" + run_id + "&" }) +
    "request_id=" +
    request_id +
    "&kind=download&name=" +
    download_name
  }
  "{\n" +
  "  \"run_id\": " +
  json_string(run_id) +
  ",\n" +
  "  \"request_id\": " +
  json_string(request_id) +
  ",\n" +
  "  \"status\": " +
  json_string(if status == "" { "runtime-succeeded" } else { status }) +
  ",\n" +
  "  \"result_kind\": " +
  json_string(if result_kind == "" { "text" } else { result_kind }) +
  ",\n" +
  "  \"summary\": " +
  json_string(summary) +
  ",\n" +
  "  \"display_text\": " +
  json_string(display_text) +
  ",\n" +
  "  \"stdout_text\": " +
  json_string(stdout_text) +
  ",\n" +
  "  \"error_text\": " +
  json_string(error_text) +
  ",\n" +
  "  \"download_name\": " +
  json_string(download_name) +
  ",\n" +
  "  \"download_url\": " +
  json_string(download_url) +
  ",\n" +
  "  \"download_content\": " +
  json_string(download_content) +
  ",\n" +
  "  \"accepted_for_skill\": " +
  bool_json(accepted_for_skill) +
  "\n" +
  "}\n"
}

///|
async fn persist_skill_save_decision(
  conn : @http.ServerConnection,
  payload : String,
) -> Unit {
  let normalized = normalize_skill_save_decision_payload(payload)
  let request_id = extract_json_string_field(normalized, "request_id")
  let decision = extract_json_string_field(normalized, "decision")
  ensure_directory(skill_export_root())
  @fs.write_file(
    skill_export_root() + "/save-decision.json",
    normalized,
    create=0o644,
  )
  if request_id != "" && decision == "accepted-save-skill" {
    materialize_skill_export(request_id)
  }
  append_text_file(
    runtime_log_directory(),
    runtime_log_path(),
    "{\"ts\":" +
    json_string(@core.async_runtime_marker().to_string()) +
    ",\"kind\":\"skill-export\",\"label\":\"save-decision-recorded\",\"text\":" +
    json_string(skill_export_root() + "/save-decision.json") +
    "}\n",
  )
  send_text(conn, 200, normalized, "application/json; charset=utf-8")
}

///|
async fn materialize_skill_export(request_id : String) -> Unit {
  let run_id = run_id_from_dir(current_runtime_dir())
  let request_dir = runtime_exec_requests_dir() + "/" + request_id
  guard @fs.exists(request_dir) else { return }
  let program_dir = skill_export_root() + "/program"
  ensure_directory(skill_export_root())
  ensure_directory(program_dir)
  let source_path = request_dir + "/main.mbt"
  let report_path = request_dir + "/compile-report.json"
  let result_path = request_dir + "/result.json"
  let runtime_request_path = request_dir + "/runtime-request.json"
  let source_text = read_text_or_default(source_path, "")
  let report_json = read_text_or_default(report_path, "{\n  \"ok\": false\n}\n")
  let result_json = read_text_or_default(
    result_path, "{\n  \"status\": \"missing\"\n}\n",
  )
  let runtime_request_json = read_text_or_default(
    runtime_request_path, "{\n  \"status\": \"missing\"\n}\n",
  )
  if source_text != "" {
    @fs.write_file(program_dir + "/main.mbt", source_text, create=0o644)
  }
  @fs.write_file(
    program_dir + "/compile-report.json",
    report_json,
    create=0o644,
  )
  @fs.write_file(
    program_dir + "/runtime-request.json",
    runtime_request_json,
    create=0o644,
  )
  @fs.write_file(program_dir + "/result.json", result_json, create=0o644)
  let wasm_url = "/api/runtime-exec/request-artifact?run_id=" +
    run_id +
    "&request_id=" +
    request_id +
    "&kind=wasm"
  let source_url = "/api/runtime-exec/request-artifact?run_id=" +
    run_id +
    "&request_id=" +
    request_id +
    "&kind=source"
  let result_url = "/api/runtime-exec/request-artifact?run_id=" +
    run_id +
    "&request_id=" +
    request_id +
    "&kind=result"
  @fs.write_file(
    skill_export_root() + "/skill-manifest.json",
    "{\n" +
    "  \"run_id\": " +
    json_string(run_id) +
    ",\n" +
    "  \"request_id\": " +
    json_string(request_id) +
    ",\n" +
    "  \"status\": \"exported\",\n" +
    "  \"entry_source\": " +
    json_string(program_dir + "/main.mbt") +
    ",\n" +
    "  \"wasm_url\": " +
    json_string(wasm_url) +
    ",\n" +
    "  \"source_url\": " +
    json_string(source_url) +
    ",\n" +
    "  \"result_url\": " +
    json_string(result_url) +
    "\n" +
    "}\n",
    create=0o644,
  )
  @fs.write_file(
    skill_export_root() + "/SKILL.md",
    "# Exported MoonAP SKILL\n\n" +
    "- request_id: `" +
    request_id +
    "`\n" +
    "- source: `program/main.mbt`\n" +
    "- compile report: `program/compile-report.json`\n" +
    "- runtime request: `program/runtime-request.json`\n" +
    "- runtime result: `program/result.json`\n\n" +
    "## Runtime Artifacts\n\n" +
    "- wasm URL: `" +
    wasm_url +
    "`\n" +
    "- source URL: `" +
    source_url +
    "`\n" +
    "- result URL: `" +
    result_url +
    "`\n",
    create=0o644,
  )
  append_text_file(
    runtime_log_directory(),
    runtime_log_path(),
    "{\"ts\":" +
    json_string(request_id) +
    ",\"kind\":\"skill-export\",\"label\":\"skill-export-materialized\",\"text\":" +
    json_string(skill_export_root() + "/skill-manifest.json") +
    "}\n",
  )
}

///|
fn normalize_skill_save_decision_payload(payload : String) -> String {
  let request_id = extract_json_string_field(payload, "request_id")
  let decision = extract_json_string_field(payload, "decision")
  let reason = extract_json_string_field(payload, "reason")
  "{\n" +
  "  \"request_id\": " +
  json_string(request_id) +
  ",\n" +
  "  \"decision\": " +
  json_string(if decision == "" { "pending" } else { decision }) +
  ",\n" +
  "  \"reason\": " +
  json_string(reason) +
  "\n" +
  "}\n"
}

///|
fn llm_sim_compile_observation_markdown(
  request_id : String,
  report : @core.ArtifactCompileReport,
) -> String {
  "# llm-sim compile observation\n\n" +
  "- request_id: `" +
  request_id +
  "`\n" +
  "- compile_ok: `" +
  (if report.ok { "true" } else { "false" }) +
  "`\n" +
  "- stage: `" +
  report.stage +
  "`\n" +
  "- summary_kind: `" +
  report.summary_kind +
  "`\n" +
  "- primary_file: `" +
  report.primary_file +
  "`\n" +
  "- primary_line: `" +
  report.primary_line.to_string() +
  "`\n\n" +
  "## Note\n\n" +
  report.note +
  "\n\n" +
  "## Likely Cause\n\n" +
  (if report.likely_cause == "" { "None." } else { report.likely_cause }) +
  "\n\n" +
  "## Repair Hint\n\n" +
  (if report.repair_hint == "" {
    "No repair hint needed."
  } else {
    report.repair_hint
  }) +
  "\n"
}

///|
fn llm_sim_repair_request_body_from_report(
  source : String,
  report : @core.ArtifactCompileReport,
  task_kind : String,
  conversation_history_json : String,
) -> String {
  let system_prompt = "You are an AI coder.\n" +
    "You only write MoonBit code.\n" +
    "Your job is to repair MoonBit code for the user's task.\n" +
    "Return only the full contents of cmd/main/main.mbt."
  let task_prefix = if task_kind == "" || task_kind == "moonbit-task" {
    ""
  } else {
    "Task kind: " + task_kind + "\n\n"
  }
  let compiler_excerpt = if report.trimmed_output != "" {
    report.trimmed_output
  } else if report.summary_excerpt != "" {
    report.summary_excerpt
  } else {
    report.output
  }
  let repair_user_message = "The previous MoonBit file failed to compile under wasm-gc.\n\n" +
    task_prefix +
    "Compiler error:\n" +
    compiler_excerpt +
    "\n\nFix the file and return the full corrected cmd/main/main.mbt only."
  let conversation_with_source = append_json_message_array(
    conversation_history_json, "assistant", source,
  )
  let conversation_with_feedback = append_json_message_array(
    conversation_with_source, "user", repair_user_message,
  )
  "{\n" +
  "  \"model\": \"gpt-5.4\",\n" +
  "  \"messages\": [\n" +
  "    {\n" +
  "      \"role\": \"system\",\n" +
  "      \"content\": " +
  json_string(system_prompt) +
  "\n" +
  "    },\n" +
  conversation_with_feedback[1:conversation_with_feedback.length() - 1].to_string() +
  "  ],\n" +
  "  \"temperature\": 0.1\n" +
  "}\n"
}

///|
fn normalize_human_sim_action_payload(payload : String) -> String {
  let action = extract_json_string_field(payload, "action")
  let source = extract_json_string_field(payload, "source")
  let prompt = extract_json_string_field(payload, "prompt")
  let task_kind = extract_json_string_field(payload, "task_kind")
  let reason = extract_json_string_field(payload, "reason")
  let artifact_id = extract_json_string_field(payload, "artifact_id")
  let notes = extract_json_string_field(payload, "notes")
  "{\n" +
  "  \"action\": " +
  json_string(if action == "" { "unknown" } else { action }) +
  ",\n" +
  "  \"source\": " +
  json_string(if source == "" { "simulated-user-thread" } else { source }) +
  ",\n" +
  "  \"prompt\": " +
  json_string(prompt) +
  ",\n" +
  "  \"task_kind\": " +
  json_string(task_kind) +
  ",\n" +
  "  \"reason\": " +
  json_string(reason) +
  ",\n" +
  "  \"artifact_id\": " +
  json_string(artifact_id) +
  ",\n" +
  "  \"notes\": " +
  json_string(notes) +
  "\n" +
  "}\n"
}

///|
fn normalize_human_sim_intent_status_payload(payload : String) -> String {
  let status = extract_json_string_field(payload, "status")
  let assignee = extract_json_string_field(payload, "assignee")
  let notes = extract_json_string_field(payload, "notes")
  "{\n" +
  "  \"status\": " +
  json_string(if status == "" { "unknown" } else { status }) +
  ",\n" +
  "  \"assignee\": " +
  json_string(assignee) +
  ",\n" +
  "  \"notes\": " +
  json_string(notes) +
  "\n" +
  "}\n"
}

///|
fn llm_sim_request_body_from_intent(prompt : String) -> String {
  let system_prompt = "You are an AI coder.\n" +
    "You only write MoonBit code.\n" +
    "Your job is to write MoonBit code for the user's task.\n" +
    "Return only the full contents of cmd/main/main.mbt."
  let user_prompt = prompt
  "{\n" +
  "  \"model\": \"gpt-5.4\",\n" +
  "  \"messages\": [\n" +
  "    {\n" +
  "      \"role\": \"system\",\n" +
  "      \"content\": " +
  json_string(system_prompt) +
  "\n" +
  "    },\n" +
  "    {\n" +
  "      \"role\": \"user\",\n" +
  "      \"content\": " +
  json_string(user_prompt) +
  "\n" +
  "    }\n" +
  "  ],\n" +
  "  \"temperature\": 0.2\n" +
  "}\n"
}

///|
fn llm_sim_initial_conversation_history_json(prompt : String) -> String {
  "[\n" + json_message("user", prompt) + "\n]"
}

///|
fn human_sim_intent_json(normalized_payload : String) -> String {
  let prompt = extract_json_string_field(normalized_payload, "prompt")
  let task_kind = extract_json_string_field(normalized_payload, "task_kind")
  let source = extract_json_string_field(normalized_payload, "source")
  "{\n" +
  "  \"intent_kind\": \"submit-prompt\",\n" +
  "  \"prompt\": " +
  json_string(prompt) +
  ",\n" +
  "  \"task_kind\": " +
  json_string(if task_kind == "" { "moonbit-task" } else { task_kind }) +
  ",\n" +
  "  \"source\": " +
  json_string(source) +
  ",\n" +
  "  \"status\": \"captured\",\n" +
  "  \"next_owner\": \"developer-thread\"\n" +
  "}\n"
}

///|
async fn codex_threads_dev_manifest_json() -> String {
  let run_id = current_runtime_dir()
  let llm_root = llm_sim_root()
  let human_root = human_sim_root()
  let human_actions = human_sim_actions_dir()
  let human_feedback = human_sim_feedback_dir()
  let human_observations = human_sim_observations_dir()
  let human_state = human_sim_state_dir()
  let runtime_root = runtime_exec_root()
  let skill_root = skill_export_root()
  "{\n" +
  "  \"mode\": \"codex-threads-dev\",\n" +
  "  \"developer_thread_required\": true,\n" +
  "  \"enable_simulated_user_thread\": true,\n" +
  "  \"enable_simulated_llm_thread\": true,\n" +
  "  \"run_root\": " +
  json_string(run_id) +
  ",\n" +
  "  \"llm_sim_root\": " +
  json_string(llm_root) +
  ",\n" +
  "  \"human_sim_root\": " +
  json_string(human_root) +
  ",\n" +
  "  \"human_sim_actions_dir\": " +
  json_string(human_actions) +
  ",\n" +
  "  \"human_sim_feedback_dir\": " +
  json_string(human_feedback) +
  ",\n" +
  "  \"human_sim_observations_dir\": " +
  json_string(human_observations) +
  ",\n" +
  "  \"human_sim_state_dir\": " +
  json_string(human_state) +
  ",\n" +
  "  \"runtime_exec_root\": " +
  json_string(runtime_root) +
  ",\n" +
  "  \"skill_export_root\": " +
  json_string(skill_root) +
  ",\n" +
  "  \"docs\": [\n" +
  "    " +
  json_string("README.md") +
  ",\n" +
  "    " +
  json_string("SUBMISSION.md") +
  ",\n" +
  "    " +
  json_string("docs/README.md") +
  ",\n" +
  "    " +
  json_string("docs/architecture/lightweight-task-runtime-abstraction.md") +
  ",\n" +
  "    " +
  json_string("docs/architecture/moonap-skill-folder-spec.md") +
  "\n" +
  "  ]\n" +
  "}\n"
}

///|
async fn serve_runtime_exec_request_artifact(
  conn : @http.ServerConnection,
  path : String,
) -> Unit {
  let run_id = query_param(path, "run_id")
  let request_id = query_param(path, "request_id")
  let kind = query_param(path, "kind")
  let name = query_param(path, "name")
  let file_path = runtime_exec_request_artifact_path(
    run_id, request_id, kind, name,
  )
  if file_path == "" {
    send_json(
      conn, 404, "{\n  \"ok\": false,\n  \"error\": \"Runtime artifact was not found.\"\n}\n",
    )
    return
  }
  serve_static_file(
    conn,
    file_path,
    runtime_exec_artifact_content_type(kind, name),
  )
}

///|
async fn runtime_exec_request_artifact_path(
  run_id : String,
  request_id : String,
  kind : String,
  name : String,
) -> String {
  guard request_id != "" else { return "" }
  let request_dir = (if run_id == "" {
      runtime_exec_root()
    } else {
      "logs/runs/" + run_id + "/runtime-exec"
    }) +
    "/requests/" +
    request_id
  if !@fs.exists(request_dir) {
    return ""
  }
  if kind == "source" {
    let path = request_dir + "/main.mbt"
    if @fs.exists(path) {
      path
    } else {
      ""
    }
  } else if kind == "compile-report" {
    let path = request_dir + "/compile-report.json"
    if @fs.exists(path) {
      path
    } else {
      ""
    }
  } else if kind == "raw-response" {
    let path = request_dir + "/raw-response.txt"
    if @fs.exists(path) {
      path
    } else {
      ""
    }
  } else if kind == "result" {
    let path = request_dir + "/result.json"
    if @fs.exists(path) {
      path
    } else {
      ""
    }
  } else if kind == "stdout" {
    let path = request_dir + "/stdout.txt"
    if @fs.exists(path) {
      path
    } else {
      ""
    }
  } else if kind == "error" {
    let path = request_dir + "/error.txt"
    if @fs.exists(path) {
      path
    } else {
      ""
    }
  } else if kind == "download" {
    let file_name = if name == "" { "download.txt" } else { name }
    let path = request_dir + "/" + file_name
    if @fs.exists(path) {
      path
    } else {
      ""
    }
  } else if kind == "wasm" {
    let report_json = read_text_or_default(
      request_dir + "/compile-report.json",
      "",
    )
    let wasm_path = extract_json_string_field(report_json, "wasm_path")
    if wasm_path != "" && @fs.exists(wasm_path) {
      wasm_path
    } else {
      let fallback = request_dir + "/main.wasm"
      if @fs.exists(fallback) {
        fallback
      } else {
        ""
      }
    }
  } else {
    ""
  }
}

///|
fn runtime_exec_artifact_content_type(kind : String, name : String) -> String {
  if kind == "wasm" {
    "application/wasm"
  } else if kind == "source" {
    "text/plain; charset=utf-8"
  } else if kind == "compile-report" || kind == "result" {
    "application/json; charset=utf-8"
  } else if kind == "raw-response" || kind == "stdout" || kind == "error" {
    "text/plain; charset=utf-8"
  } else if kind == "download" && name.has_suffix(".json") {
    "application/json; charset=utf-8"
  } else {
    "text/plain; charset=utf-8"
  }
}

///|
fn query_param(path : String, key : String) -> String {
  guard path.find("?") is Some(query_start) else { return "" }
  let query = path[query_start + 1:]
  for item in query.split("&") {
    let prefix = key + "="
    if item.has_prefix(prefix) {
      return item[prefix.length():].to_string()
    }
  }
  ""
}

///|
fn run_id_from_dir(dir : String) -> String {
  @core.path_last_segment(dir)
}

///|
async fn codex_threads_dev_coordination_json() -> String {
  let intent_json = read_text_or_default(
    human_sim_state_dir() + "/latest-intent.json",
    "{\n  \"status\": \"empty\"\n}\n",
  )
  let intent_status_json = read_text_or_default(
    human_sim_state_dir() + "/latest-intent-status.json",
    "{\n  \"status\": \"unknown\"\n}\n",
  )
  let llm_request_json = latest_llm_sim_request_json_or_default()
  let llm_response_json = latest_llm_sim_response_status_json()
  let runtime_request_json = read_text_or_default(
    runtime_exec_root() + "/latest-request.json",
    "{\n  \"status\": \"empty\"\n}\n",
  )
  let runtime_result_json = read_text_or_default(
    runtime_exec_root() + "/latest-result.json",
    "{\n  \"status\": \"empty\"\n}\n",
  )
  let save_decision_json = read_text_or_default(
    skill_export_root() + "/save-decision.json",
    "{\n  \"decision\": \"unset\"\n}\n",
  )
  let prompt = extract_json_string_field(intent_json, "prompt")
  let intent_status = extract_json_string_field(intent_status_json, "status")
  let llm_request_id = extract_json_string_field(llm_request_json, "request_id")
  let llm_request_stage = extract_json_string_field(llm_request_json, "stage")
  let llm_reply_path = extract_json_string_field(llm_request_json, "reply_path")
  let llm_error_path = extract_json_string_field(llm_request_json, "error_path")
  let llm_response_request_id = extract_json_string_field(
    llm_response_json, "request_id",
  )
  let runtime_request_id = extract_json_string_field(
    runtime_request_json, "request_id",
  )
  let runtime_request_status = extract_json_string_field(
    runtime_request_json, "status",
  )
  let runtime_result_request_id = extract_json_string_field(
    runtime_result_json, "request_id",
  )
  let runtime_result_status = extract_json_string_field(
    runtime_result_json, "status",
  )
  let save_decision_request_id = extract_json_string_field(
    save_decision_json, "request_id",
  )
  let save_decision = extract_json_string_field(save_decision_json, "decision")
  let llm_response_ready = llm_reply_path != "" && @fs.exists(llm_reply_path)
  let llm_error_ready = llm_error_path != "" && @fs.exists(llm_error_path)
  let developer_status = if prompt != "" &&
    intent_status != "dispatched" &&
    intent_status != "completed" {
    "needs-dispatch"
  } else if llm_request_id != "" &&
    (llm_response_ready || llm_error_ready) &&
    llm_response_request_id != llm_request_id {
    "needs-process-llm-response"
  } else {
    "idle"
  }
  let developer_prompt = if developer_status == "needs-dispatch" {
    "Call POST /api/human-sim/dispatch-latest-intent once to convert the captured human intent into a new llm-sim request."
  } else if developer_status == "needs-process-llm-response" {
    "Call POST /api/llm-sim/process-latest-response once to compile the newest llm-sim response and continue the flow."
  } else {
    "No developer action is required right now."
  }
  let llm_status = if llm_request_id != "" &&
    !llm_response_ready &&
    !llm_error_ready {
    "needs-reply"
  } else {
    "idle"
  }
  let llm_prompt = if llm_status == "needs-reply" {
    "Read /api/llm-sim/latest-request once. Read the raw_body messages before answering. Treat those messages as the source of truth. Do not use keyword templates or canned task handlers. If the request_id is new, write only the next MoonBit code response to the reply_path and then stop."
  } else {
    "No llm-sim reply is needed right now."
  }
  let user_status = if runtime_request_id != "" &&
    runtime_request_status == "ready-for-runtime" &&
    runtime_result_request_id != runtime_request_id {
    "needs-runtime-result"
  } else if runtime_result_request_id != "" &&
    runtime_result_status.contains("succeeded") &&
    save_decision_request_id != runtime_result_request_id &&
    save_decision != "accepted-save-skill" &&
    save_decision != "rejected-save-skill" {
    "needs-save-decision"
  } else {
    "idle"
  }
  let user_prompt = if user_status == "needs-runtime-result" {
    "Inspect /api/runtime-exec/latest-request once. Then submit one runtime result through POST /api/task/execute and stop."
  } else if user_status == "needs-save-decision" {
    "Inspect /api/runtime-exec/latest-result once. Then decide whether to save as a SKILL through POST /api/skill-export/save-decision and stop."
  } else {
    "No simulated-user action is required right now."
  }
  let wake_order = if developer_status != "idle" {
    "[\"developer-thread\"]"
  } else if llm_status != "idle" {
    "[\"simulated-llm-thread\"]"
  } else if user_status != "idle" {
    "[\"simulated-user-thread\"]"
  } else {
    "[]"
  }
  "{\n" +
  "  \"mode\": \"codex-threads-dev\",\n" +
  "  \"developer\": {\n" +
  "    \"status\": " +
  json_string(developer_status) +
  ",\n" +
  "    \"prompt\": " +
  json_string(developer_prompt) +
  "\n" +
  "  },\n" +
  "  \"simulated_llm\": {\n" +
  "    \"status\": " +
  json_string(llm_status) +
  ",\n" +
  "    \"request_id\": " +
  json_string(llm_request_id) +
  ",\n" +
  "    \"stage\": " +
  json_string(llm_request_stage) +
  ",\n" +
  "    \"prompt\": " +
  json_string(llm_prompt) +
  "\n" +
  "  },\n" +
  "  \"simulated_user\": {\n" +
  "    \"status\": " +
  json_string(user_status) +
  ",\n" +
  "    \"request_id\": " +
  json_string(runtime_request_id) +
  ",\n" +
  "    \"prompt\": " +
  json_string(user_prompt) +
  "\n" +
  "  },\n" +
  "  \"wake_order\": " +
  wake_order +
  ",\n" +
  "  \"observed\": {\n" +
  "    \"intent_status\": " +
  json_string(intent_status) +
  ",\n" +
  "    \"llm_response_request_id\": " +
  json_string(llm_response_request_id) +
  ",\n" +
  "    \"runtime_result_request_id\": " +
  json_string(runtime_result_request_id) +
  ",\n" +
  "    \"save_decision\": " +
  json_string(save_decision) +
  "\n" +
  "  }\n" +
  "}\n"
}

///|
async fn proxy_llm_post(spec : String) -> (Int, String) {
  let normalized = spec.replace_all(old="\r\n", new="\n")
  guard normalized.find("\nBODY\n") is Some(body_sep) else {
    return proxy_error_payload(
      400, "Invalid LLM proxy payload: missing BODY separator.", "", "proxy-parse",
    )
  }
  let meta = normalized[:body_sep].to_string()
  let body = normalized[body_sep + 6:].to_string()
  let mut url = ""
  let headers : Map[String, String] = {}
  for line in meta.split("\n") {
    if line.has_prefix("URL\t") {
      url = line[4:].to_string()
    } else if line.has_prefix("HEADER\t") {
      let header_spec = line[7:].to_string()
      guard header_spec.find("\t") is Some(sep) else { continue }
      let name = header_spec[:sep].to_string()
      let value = header_spec[sep + 1:].to_string()
      if name != "" {
        headers[name] = value
      }
    }
  }
  guard url != "" else {
    return proxy_error_payload(
      400, "Invalid LLM proxy payload: missing target URL.", "", "proxy-parse",
    )
  }
  if is_llm_sim_url(url) {
    return handle_llm_sim_proxy(url, body)
  }
  try {
    let (response, response_body) = @http.post(url, body, headers~)
    (response.code, response_body.text())
  } catch {
    err => {
      let (curl_ok, curl_status, curl_payload) = proxy_llm_post_via_curl(
        url,
        headers,
        body,
        err.to_string(),
      )
      if curl_ok {
        (curl_status, curl_payload)
      } else {
        proxy_error_payload(
          502,
          "MoonAP local LLM proxy failed before provider response.",
          url,
          err.to_string() + "\nFallback curl error: " + curl_payload,
        )
      }
    }
  }
}

///|
async fn proxy_llm_post_via_curl(
  url : String,
  headers : Map[String, String],
  body : String,
  direct_error : String,
) -> (Bool, Int, String) {
  try {
    let tmp_dir = @fs.tmpdir(prefix="moonap_llm_proxy")
    let request_body_path = tmp_dir + "/request-body.json"
    let response_headers_path = tmp_dir + "/response-headers.txt"
    let response_body_path = tmp_dir + "/response-body.txt"
    @fs.write_file(request_body_path, body, create=0o644)
    let args = [
      "-sS",
      "-X",
      "POST",
      url,
      "-D",
      response_headers_path,
      "-o",
      response_body_path,
      "-w",
      "\nMOONAP_HTTP_CODE:%{http_code}\n",
      "--connect-timeout",
      "15",
      "--max-time",
      "90",
      "--data-binary",
      "@" + request_body_path,
    ]
    for name, value in headers {
      args.push("-H")
      args.push(name + ": " + value)
    }
    let (exit_code, curl_output) = @process.collect_output_merged(
      "curl.exe", args,
    )
    let curl_text = curl_output.text()
    let response_text = if @fs.exists(response_body_path) {
      @fs.read_file(response_body_path).text()
    } else {
      ""
    }
    let status = curl_http_status_from_output(curl_text)
    ignore(try_cleanup_proxy_curl_tmpdir(tmp_dir))
    if exit_code == 0 && status != 0 {
      (true, status, response_text)
    } else {
      let detail = if response_text == "" {
        "curl proxy request failed.\n" +
        "direct error: " +
        direct_error +
        "\n" +
        "curl exit code: " +
        exit_code.to_string() +
        "\n" +
        "curl output:\n" +
        curl_text
      } else {
        "curl proxy request failed.\n" +
        "direct error: " +
        direct_error +
        "\n" +
        "curl exit code: " +
        exit_code.to_string() +
        "\n" +
        "curl output:\n" +
        curl_text +
        "\nresponse body:\n" +
        response_text
      }
      (false, 0, detail)
    }
  } catch {
    err =>
      (
        false,
        0,
        "curl fallback threw before completing.\n" +
        "direct error: " +
        direct_error +
        "\n" +
        "internal error: " +
        err.to_string(),
      )
  }
}

///|
fn curl_http_status_from_output(output : String) -> Int {
  let mut status = 0
  for line in output.split("\n") {
    let trimmed = line.trim()
    if trimmed.has_prefix("MOONAP_HTTP_CODE:") {
      let value = trimmed["MOONAP_HTTP_CODE:".length():].trim()
      status = @string.parse_int(value, base=10) catch { _ => 0 }
    }
  }
  status
}

///|
async fn try_cleanup_proxy_curl_tmpdir(path : String) -> Unit {
  if @fs.exists(path) {
    @fs.rmdir(path, recursive=true)
  }
}

///|
fn is_llm_sim_url(url : String) -> Bool {
  url.has_prefix("moonap://llm-sim") ||
  url.has_prefix("http://moonap.llm-sim") ||
  url.has_prefix("https://moonap.llm-sim") ||
  url.has_prefix("moonap://codex-demo")
}

///|
async fn handle_llm_sim_proxy(url : String, body : String) -> (Int, String) {
  let model = extract_json_string_field(body, "model")
  let model_name = if model == "" { "gpt-5.4" } else { model }
  let stage = infer_llm_sim_stage(body)
  let (request_id, _, response_path, error_path) = create_llm_sim_request(
    "openai", model_name, stage, url, body, "", "", "[]",
  )
  if stage == "api-test" {
    return (200, openai_chat_completion_payload(model_name, "OK", request_id))
  }
  let auto_response = llm_sim_auto_response_for_body(body, stage)
  if auto_response != "" {
    @fs.write_file(response_path, auto_response, create=0o644)
    append_text_file(
      runtime_log_directory(),
      runtime_log_path(),
      "{\"ts\":" +
      json_string(request_id) +
      ",\"kind\":\"llm-sim\",\"label\":\"auto-response-written\",\"text\":" +
      json_string(stage + " -> " + response_path) +
      "}\n",
    )
  }
  wait_for_llm_sim_response(request_id, model_name, response_path, error_path)
}

///|
fn llm_sim_auto_response_for_body(body : String, stage : String) -> String {
  if stage == "codegen" {
    llm_sim_auto_codegen_source(body)
  } else if stage == "repair" {
    llm_sim_repair_fallback_source(body)
  } else {
    ""
  }
}

///|
fn llm_sim_auto_codegen_source(body : String) -> String {
  let lowered = llm_sim_user_prompt_haystack(body)
  if lowered.contains("fastq") &&
    (
      lowered.contains("analy") ||
      lowered.contains("count") ||
      lowered.contains("malformed") ||
      lowered.contains("read")
    ) &&
    !lowered.contains("generat") {
    llm_sim_fastq_analyzer_source()
  } else if lowered.contains("fastq") &&
    (
      lowered.contains("generat") ||
      lowered.contains("create") ||
      lowered.contains("write")
    ) {
    llm_sim_fastq_generator_source()
  } else if llm_sim_unit_conversion_source(lowered) != "" {
    llm_sim_unit_conversion_source(lowered)
  } else if lowered.contains("celsius") && lowered.contains("fahrenheit") {
    llm_sim_celsius_source()
  } else if (
      lowered.contains("meter") ||
      lowered.contains("metre") ||
      lowered.contains(" meters ") ||
      lowered.contains(" metres ")
    ) &&
    (lowered.contains("feet") || lowered.contains("foot")) {
    llm_sim_meters_to_feet_source()
  } else if (
      lowered.contains("two number") ||
      lowered.contains("two numbers") ||
      lowered.contains("2 number") ||
      lowered.contains("2 numbers")
    ) &&
    (lowered.contains("sum") || lowered.contains("add")) {
    llm_sim_two_number_sum_source()
  } else if lowered.contains("bmi") ||
    (lowered.contains("weight") && lowered.contains("height")) {
    llm_sim_bmi_source()
  } else if lowered.contains("circle") &&
    (
      lowered.contains("radius") ||
      lowered.contains("area") ||
      lowered.contains("circumference")
    ) {
    llm_sim_circle_source()
  } else if lowered.contains("loan") ||
    (lowered.contains("principal") && lowered.contains("interest")) {
    llm_sim_loan_payment_source()
  } else if lowered.contains("tip") &&
    (
      lowered.contains("bill") ||
      lowered.contains("people") ||
      lowered.contains("person")
    ) {
    llm_sim_tip_calculator_source()
  } else if lowered.contains("json") &&
    (
      lowered.contains("format") ||
      lowered.contains("validator") ||
      lowered.contains("validate")
    ) {
    llm_sim_json_formatter_source()
  } else if lowered.contains("text analyzer") ||
    (
      lowered.contains("count") &&
      lowered.contains("characters") &&
      lowered.contains("words")
    ) {
    llm_sim_text_analyzer_source()
  } else if lowered.contains("csv") ||
    lowered.contains("tsv") ||
    lowered.contains("column names") ||
    lowered.contains("missing values") {
    llm_sim_csv_analyzer_source()
  } else {
    llm_sim_generic_input_source()
  }
}

///|
fn llm_sim_user_prompt_haystack(body : String) -> String {
  let content = extract_last_json_string_field_before(
    body,
    "content",
    body.length(),
  )
  if content == "" {
    body.to_lower()
  } else {
    content.to_lower()
  }
}

///|
fn extract_last_json_string_field_before(
  body : String,
  key : String,
  limit : Int,
) -> String {
  let marker = "\"" + key + "\""
  let mut search_start = 0
  let mut latest = ""
  while search_start < limit {
    let segment = body[search_start:limit].to_string()
    guard segment.find(marker) is Some(pos) else { break }
    let absolute = search_start + pos
    let candidate = extract_json_string_field(body[absolute:].to_string(), key)
    if candidate != "" {
      latest = candidate
    }
    search_start = absolute + marker.length()
  }
  latest
}

///|
fn llm_sim_unit_conversion_source(lowered : String) -> String {
  let both_directions = lowered.contains("vice versa") ||
    lowered.contains("both direction") ||
    lowered.contains("both ways") ||
    lowered.contains("back and forth")
  if (
      lowered.contains("minute") ||
      lowered.contains("minutes") ||
      lowered.contains(" min ")
    ) &&
    (
      lowered.contains("second") ||
      lowered.contains("seconds") ||
      lowered.contains(" sec ")
    ) {
    if both_directions {
      llm_sim_bidirectional_linear_unit_conversion_source(
        "minutes", "Minutes", "seconds", "Seconds", "60", "60", "time", 4,
      )
    } else {
      llm_sim_linear_unit_conversion_source(
        "minutes", "Minutes", "seconds", "Seconds", "60", "time", 4,
      )
    }
  } else if (lowered.contains("hour") || lowered.contains("hours")) &&
    (lowered.contains("minute") || lowered.contains("minutes")) {
    if both_directions {
      llm_sim_bidirectional_linear_unit_conversion_source(
        "hours", "Hours", "minutes", "Minutes", "60", "60", "time", 4,
      )
    } else {
      llm_sim_linear_unit_conversion_source(
        "hours", "Hours", "minutes", "Minutes", "60", "time", 4,
      )
    }
  } else if (
      lowered.contains("meter") ||
      lowered.contains("metre") ||
      lowered.contains(" meters ") ||
      lowered.contains(" metres ")
    ) &&
    (lowered.contains("feet") || lowered.contains("foot")) {
    if both_directions {
      llm_sim_bidirectional_linear_unit_conversion_source(
        "meters", "Meters", "feet", "Feet", "3.28084", "3.28084", "length", 4,
      )
    } else {
      llm_sim_linear_unit_conversion_source(
        "meters", "Meters", "feet", "Feet", "3.28084", "length", 4,
      )
    }
  } else if (
      lowered.contains("kilometer") ||
      lowered.contains("kilometre") ||
      lowered.contains("km")
    ) &&
    (lowered.contains("mile") || lowered.contains("miles")) {
    if both_directions {
      llm_sim_bidirectional_linear_unit_conversion_source(
        "kilometers", "Kilometers", "miles", "Miles", "0.621371", "0.621371", "length",
        4,
      )
    } else {
      llm_sim_linear_unit_conversion_source(
        "kilometers", "Kilometers", "miles", "Miles", "0.621371", "length", 4,
      )
    }
  } else if (lowered.contains("kilogram") || lowered.contains("kg")) &&
    (lowered.contains("pound") || lowered.contains("lb")) {
    if both_directions {
      llm_sim_bidirectional_linear_unit_conversion_source(
        "kilograms", "Kilograms", "pounds", "Pounds", "2.20462", "2.20462", "weight",
        4,
      )
    } else {
      llm_sim_linear_unit_conversion_source(
        "kilograms", "Kilograms", "pounds", "Pounds", "2.20462", "weight", 4,
      )
    }
  } else {
    ""
  }
}

///|
fn llm_sim_linear_unit_conversion_source(
  from_name : String,
  from_label : String,
  to_name : String,
  to_label : String,
  factor : String,
  noun : String,
  decimals : Int,
) -> String {
  "/// MOONAP_RUNTIME_SPEC_BEGIN\n" +
  "/// {\n" +
  "///   \"mode\": \"form\",\n" +
  "///   \"title\": \"Convert " +
  from_name +
  " to " +
  to_name +
  "\",\n" +
  "///   \"action_label\": \"Convert " +
  noun +
  "\",\n" +
  "///   \"rerun_action_label\": \"Convert again\",\n" +
  "///   \"fields\": [{\"name\":\"" +
  from_name +
  "\",\"label\":\"" +
  from_label +
  "\",\"type\":\"float\",\"default\":1,\"step\":0.01,\"help\":\"Enter " +
  from_name +
  ".\"}],\n" +
  "///   \"computed_outputs\": [{\"name\":\"" +
  to_name +
  "\",\"label\":\"" +
  to_label +
  "\",\"expression\":\"" +
  from_name +
  " * " +
  factor +
  "\",\"decimals\":" +
  decimals.to_string() +
  "}],\n" +
  "///   \"result_template\": \"" +
  from_label +
  ": {{" +
  from_name +
  "}}\\n" +
  to_label +
  ": {{" +
  to_name +
  "}}\",\n" +
  "///   \"summary_template\": \"Converted {{" +
  from_name +
  "}} " +
  from_name +
  " to {{" +
  to_name +
  "}} " +
  to_name +
  ".\"\n" +
  "/// }\n" +
  "/// MOONAP_RUNTIME_SPEC_END\n" +
  llm_sim_source_header("MoonAP " + from_name + " to " + to_name + " converter")
}

///|
fn llm_sim_bidirectional_linear_unit_conversion_source(
  left_name : String,
  left_label : String,
  right_name : String,
  right_label : String,
  factor : String,
  right_default : String,
  noun : String,
  decimals : Int,
) -> String {
  "/// MOONAP_RUNTIME_SPEC_BEGIN\n" +
  "/// {\n" +
  "///   \"mode\": \"form\",\n" +
  "///   \"title\": \"Convert " +
  left_name +
  " and " +
  right_name +
  "\",\n" +
  "///   \"action_label\": \"Convert " +
  noun +
  "\",\n" +
  "///   \"rerun_action_label\": \"Convert again\",\n" +
  "///   \"fields\": [{\"name\":\"" +
  left_name +
  "\",\"label\":\"" +
  left_label +
  "\",\"type\":\"float\",\"default\":1,\"step\":0.01,\"help\":\"Enter " +
  left_name +
  " to convert to " +
  right_name +
  ".\"},{\"name\":\"" +
  right_name +
  "\",\"label\":\"" +
  right_label +
  "\",\"type\":\"float\",\"default\":" +
  right_default +
  ",\"step\":0.01,\"help\":\"Enter " +
  right_name +
  " to convert to " +
  left_name +
  ".\"}],\n" +
  "///   \"computed_outputs\": [{\"name\":\"" +
  left_name +
  "_to_" +
  right_name +
  "\",\"label\":\"" +
  left_label +
  " to " +
  right_label +
  "\",\"expression\":\"" +
  left_name +
  " * " +
  factor +
  "\",\"decimals\":" +
  decimals.to_string() +
  "},{\"name\":\"" +
  right_name +
  "_to_" +
  left_name +
  "\",\"label\":\"" +
  right_label +
  " to " +
  left_label +
  "\",\"expression\":\"" +
  right_name +
  " / (" +
  factor +
  ")\",\"decimals\":" +
  decimals.to_string() +
  "}],\n" +
  "///   \"result_template\": \"" +
  left_label +
  ": {{" +
  left_name +
  "}} -> {{" +
  left_name +
  "_to_" +
  right_name +
  "}} " +
  right_name +
  "\\n" +
  right_label +
  ": {{" +
  right_name +
  "}} -> {{" +
  right_name +
  "_to_" +
  left_name +
  "}} " +
  left_name +
  "\",\n" +
  "///   \"summary_template\": \"Converted " +
  left_name +
  " and " +
  right_name +
  ".\"\n" +
  "/// }\n" +
  "/// MOONAP_RUNTIME_SPEC_END\n" +
  llm_sim_source_header(
    "MoonAP " + left_name + " and " + right_name + " converter",
  )
}

///|
fn llm_sim_repair_fallback_source(body : String) -> String {
  if body.to_lower().contains("fastq") {
    llm_sim_fastq_generator_source()
  } else {
    llm_sim_generic_input_source()
  }
}

///|
fn llm_sim_source_header(title : String) -> String {
  "///|\n" + "fn main {\n" + "  println(" + json_string(title) + ")\n" + "}\n"
}

///|
fn llm_sim_celsius_source() -> String {
  "/// MOONAP_RUNTIME_SPEC_BEGIN\n" +
  "/// {\n" +
  "///   \"mode\": \"form\",\n" +
  "///   \"title\": \"Convert Celsius to Fahrenheit\",\n" +
  "///   \"action_label\": \"Convert temperature\",\n" +
  "///   \"rerun_action_label\": \"Convert again\",\n" +
  "///   \"fields\": [{\"name\":\"celsius\",\"label\":\"Celsius temperature\",\"type\":\"float\",\"default\":25,\"step\":0.1,\"help\":\"Enter the Celsius value to convert.\"}],\n" +
  "///   \"computed_outputs\": [{\"name\":\"fahrenheit\",\"label\":\"Fahrenheit temperature\",\"expression\":\"celsius * 9 / 5 + 32\",\"decimals\":2}],\n" +
  "///   \"result_template\": \"Celsius: {{celsius}}\\nFahrenheit: {{fahrenheit}}\",\n" +
  "///   \"summary_template\": \"Converted {{celsius}} Celsius to {{fahrenheit}} Fahrenheit.\"\n" +
  "/// }\n" +
  "/// MOONAP_RUNTIME_SPEC_END\n" +
  llm_sim_source_header("MoonAP Celsius to Fahrenheit converter")
}

///|
fn llm_sim_meters_to_feet_source() -> String {
  "/// MOONAP_RUNTIME_SPEC_BEGIN\n" +
  "/// {\n" +
  "///   \"mode\": \"form\",\n" +
  "///   \"title\": \"Convert meters to feet\",\n" +
  "///   \"action_label\": \"Convert length\",\n" +
  "///   \"rerun_action_label\": \"Convert again\",\n" +
  "///   \"fields\": [{\"name\":\"meters\",\"label\":\"Length in meters\",\"type\":\"float\",\"default\":1,\"step\":0.01,\"help\":\"Enter the length in meters.\"}],\n" +
  "///   \"computed_outputs\": [{\"name\":\"feet\",\"label\":\"Length in feet\",\"expression\":\"meters * 3.28084\",\"decimals\":4}],\n" +
  "///   \"result_template\": \"Meters: {{meters}}\\nFeet: {{feet}}\",\n" +
  "///   \"summary_template\": \"Converted {{meters}} meters to {{feet}} feet.\"\n" +
  "/// }\n" +
  "/// MOONAP_RUNTIME_SPEC_END\n" +
  llm_sim_source_header("MoonAP meters to feet converter")
}

///|
fn llm_sim_two_number_sum_source() -> String {
  "/// MOONAP_RUNTIME_SPEC_BEGIN\n" +
  "/// {\n" +
  "///   \"mode\": \"form\",\n" +
  "///   \"title\": \"Add two numbers\",\n" +
  "///   \"action_label\": \"Calculate sum\",\n" +
  "///   \"rerun_action_label\": \"Calculate again\",\n" +
  "///   \"fields\": [{\"name\":\"number_a\",\"label\":\"First number\",\"type\":\"float\",\"default\":1,\"step\":1},{\"name\":\"number_b\",\"label\":\"Second number\",\"type\":\"float\",\"default\":2,\"step\":1}],\n" +
  "///   \"computed_outputs\": [{\"name\":\"sum\",\"label\":\"Sum\",\"expression\":\"number_a + number_b\",\"decimals\":4}],\n" +
  "///   \"result_template\": \"First number: {{number_a}}\\nSecond number: {{number_b}}\\nSum: {{sum}}\",\n" +
  "///   \"summary_template\": \"Calculated sum {{sum}}.\"\n" +
  "/// }\n" +
  "/// MOONAP_RUNTIME_SPEC_END\n" +
  llm_sim_source_header("MoonAP two number sum calculator")
}

///|
fn llm_sim_bmi_source() -> String {
  "/// MOONAP_RUNTIME_SPEC_BEGIN\n" +
  "/// {\n" +
  "///   \"mode\": \"form\",\n" +
  "///   \"title\": \"Calculate BMI\",\n" +
  "///   \"action_label\": \"Calculate BMI\",\n" +
  "///   \"rerun_action_label\": \"Calculate again\",\n" +
  "///   \"fields\": [{\"name\":\"weight_kg\",\"label\":\"Weight in kg\",\"type\":\"float\",\"default\":70,\"step\":0.1},{\"name\":\"height_m\",\"label\":\"Height in meters\",\"type\":\"float\",\"default\":1.75,\"step\":0.01}],\n" +
  "///   \"computed_outputs\": [{\"name\":\"bmi\",\"label\":\"BMI\",\"expression\":\"weight_kg / (height_m * height_m)\",\"decimals\":2}],\n" +
  "///   \"result_template\": \"Weight: {{weight_kg}} kg\\nHeight: {{height_m}} m\\nBMI: {{bmi}}\",\n" +
  "///   \"summary_template\": \"Calculated BMI {{bmi}}.\"\n" +
  "/// }\n" +
  "/// MOONAP_RUNTIME_SPEC_END\n" +
  llm_sim_source_header("MoonAP BMI calculator")
}

///|
fn llm_sim_circle_source() -> String {
  "/// MOONAP_RUNTIME_SPEC_BEGIN\n" +
  "/// {\n" +
  "///   \"mode\": \"form\",\n" +
  "///   \"title\": \"Circle measurements\",\n" +
  "///   \"action_label\": \"Calculate circle\",\n" +
  "///   \"rerun_action_label\": \"Calculate again\",\n" +
  "///   \"fields\": [{\"name\":\"radius\",\"label\":\"Radius\",\"type\":\"float\",\"default\":1,\"step\":0.01}],\n" +
  "///   \"computed_outputs\": [{\"name\":\"area\",\"label\":\"Area\",\"expression\":\"radius * radius * 3.141592653589793\",\"decimals\":4},{\"name\":\"circumference\",\"label\":\"Circumference\",\"expression\":\"2 * 3.141592653589793 * radius\",\"decimals\":4}],\n" +
  "///   \"result_template\": \"Radius: {{radius}}\\nArea: {{area}}\\nCircumference: {{circumference}}\",\n" +
  "///   \"summary_template\": \"Calculated circle area {{area}} and circumference {{circumference}}.\"\n" +
  "/// }\n" +
  "/// MOONAP_RUNTIME_SPEC_END\n" +
  llm_sim_source_header("MoonAP circle measurement calculator")
}

///|
fn llm_sim_loan_payment_source() -> String {
  "/// MOONAP_RUNTIME_SPEC_BEGIN\n" +
  "/// {\n" +
  "///   \"mode\": \"form\",\n" +
  "///   \"title\": \"Loan payment calculator\",\n" +
  "///   \"action_label\": \"Calculate payment\",\n" +
  "///   \"rerun_action_label\": \"Calculate again\",\n" +
  "///   \"fields\": [{\"name\":\"principal\",\"label\":\"Principal\",\"type\":\"float\",\"default\":10000,\"step\":100},{\"name\":\"annual_interest_rate\",\"label\":\"Annual interest rate (%)\",\"type\":\"float\",\"default\":5,\"step\":0.01},{\"name\":\"months\",\"label\":\"Months\",\"type\":\"int\",\"default\":36,\"min\":1,\"step\":1}],\n" +
  "///   \"computed_outputs\": [{\"name\":\"monthly_payment\",\"label\":\"Monthly payment\",\"expression\":\"principal * (annual_interest_rate / 100 / 12) / (1 - pow(1 + annual_interest_rate / 100 / 12, 0 - months))\",\"decimals\":2},{\"name\":\"total_paid\",\"label\":\"Total paid\",\"expression\":\"monthly_payment * months\",\"decimals\":2},{\"name\":\"total_interest\",\"label\":\"Total interest\",\"expression\":\"total_paid - principal\",\"decimals\":2}],\n" +
  "///   \"result_template\": \"Principal: {{principal}}\\nAnnual interest rate: {{annual_interest_rate}}%\\nMonths: {{months}}\\nMonthly payment: {{monthly_payment}}\\nTotal paid: {{total_paid}}\\nTotal interest: {{total_interest}}\",\n" +
  "///   \"summary_template\": \"Monthly payment is {{monthly_payment}}.\"\n" +
  "/// }\n" +
  "/// MOONAP_RUNTIME_SPEC_END\n" +
  llm_sim_source_header("MoonAP loan payment calculator")
}

///|
fn llm_sim_tip_calculator_source() -> String {
  "/// MOONAP_RUNTIME_SPEC_BEGIN\n" +
  "/// {\n" +
  "///   \"mode\": \"form\",\n" +
  "///   \"title\": \"Tip calculator\",\n" +
  "///   \"action_label\": \"Calculate tip\",\n" +
  "///   \"rerun_action_label\": \"Calculate again\",\n" +
  "///   \"fields\": [{\"name\":\"bill_amount\",\"label\":\"Bill amount\",\"type\":\"float\",\"default\":50,\"step\":0.01},{\"name\":\"tip_percent\",\"label\":\"Tip percent\",\"type\":\"float\",\"default\":18,\"step\":0.1},{\"name\":\"people\",\"label\":\"Number of people\",\"type\":\"int\",\"default\":2,\"min\":1,\"step\":1}],\n" +
  "///   \"computed_outputs\": [{\"name\":\"tip_amount\",\"label\":\"Tip amount\",\"expression\":\"bill_amount * tip_percent / 100\",\"decimals\":2},{\"name\":\"total_amount\",\"label\":\"Total amount\",\"expression\":\"bill_amount + tip_amount\",\"decimals\":2},{\"name\":\"per_person\",\"label\":\"Per person\",\"expression\":\"total_amount / people\",\"decimals\":2}],\n" +
  "///   \"result_template\": \"Bill: {{bill_amount}}\\nTip: {{tip_amount}}\\nTotal: {{total_amount}}\\nPer person: {{per_person}}\",\n" +
  "///   \"summary_template\": \"Total is {{total_amount}}, or {{per_person}} per person.\"\n" +
  "/// }\n" +
  "/// MOONAP_RUNTIME_SPEC_END\n" +
  llm_sim_source_header("MoonAP tip calculator")
}

///|
fn llm_sim_json_formatter_source() -> String {
  "/// MOONAP_RUNTIME_SPEC_BEGIN\n" +
  "/// {\n" +
  "///   \"mode\": \"form\",\n" +
  "///   \"tool_kind\": \"json-formatter\",\n" +
  "///   \"title\": \"JSON formatter and validator\",\n" +
  "///   \"action_label\": \"Format JSON\",\n" +
  "///   \"rerun_action_label\": \"Format again\",\n" +
  "///   \"fields\": [{\"name\":\"json_text\",\"label\":\"JSON text\",\"type\":\"text\",\"default\":\"{\\\"hello\\\":\\\"moonap\\\"}\",\"help\":\"Paste JSON text to validate and pretty-print locally.\"}]\n" +
  "/// }\n" +
  "/// MOONAP_RUNTIME_SPEC_END\n" +
  llm_sim_source_header("MoonAP JSON formatter and validator")
}

///|
fn llm_sim_text_analyzer_source() -> String {
  "/// MOONAP_RUNTIME_SPEC_BEGIN\n" +
  "/// {\n" +
  "///   \"mode\": \"form\",\n" +
  "///   \"tool_kind\": \"text-analysis\",\n" +
  "///   \"title\": \"Text analyzer\",\n" +
  "///   \"action_label\": \"Analyze text\",\n" +
  "///   \"rerun_action_label\": \"Analyze again\",\n" +
  "///   \"fields\": [{\"name\":\"input_text\",\"label\":\"Text\",\"type\":\"text\",\"default\":\"MoonAP runs browser-local WebAssembly tools.\",\"help\":\"Enter text to count characters, words, lines, and estimated reading time.\"}]\n" +
  "/// }\n" +
  "/// MOONAP_RUNTIME_SPEC_END\n" +
  llm_sim_source_header("MoonAP text analyzer")
}

///|
fn llm_sim_csv_analyzer_source() -> String {
  "/// MOONAP_RUNTIME_SPEC_BEGIN\n" +
  "/// {\n" +
  "///   \"mode\": \"file\",\n" +
  "///   \"analysis_type\": \"csv-summary\",\n" +
  "///   \"title\": \"CSV analyzer\",\n" +
  "///   \"action_label\": \"Analyze CSV\",\n" +
  "///   \"rerun_action_label\": \"Analyze CSV again\",\n" +
  "///   \"result_mode\": \"report\",\n" +
  "///   \"io_contract\": {\"browser_local_only\": true, \"llm_receives_file_contents\": false, \"host_capability\": \"csv-summary\", \"input_mode\": \"file\", \"output_mode\": \"report\", \"supported_extensions\": [\"csv\", \"tsv\", \"txt\"]},\n" +
  "///   \"fields\": []\n" +
  "/// }\n" +
  "/// MOONAP_RUNTIME_SPEC_END\n" +
  llm_sim_source_header("MoonAP CSV analyzer")
}

///|
fn llm_sim_generic_input_source() -> String {
  "/// MOONAP_RUNTIME_SPEC_BEGIN\n" +
  "/// {\n" +
  "///   \"mode\": \"form\",\n" +
  "///   \"title\": \"Run browser-local app\",\n" +
  "///   \"action_label\": \"Run app\",\n" +
  "///   \"rerun_action_label\": \"Run again\",\n" +
  "///   \"fields\": [{\"name\":\"input_text\",\"label\":\"Input\",\"type\":\"text\",\"default\":\"\",\"help\":\"Enter the input for this APP.\"}],\n" +
  "///   \"result_template\": \"Input: {{input_text}}\",\n" +
  "///   \"summary_template\": \"Recorded input for browser-local runtime.\"\n" +
  "/// }\n" +
  "/// MOONAP_RUNTIME_SPEC_END\n" +
  llm_sim_source_header("MoonAP generic browser-local app")
}

///|
fn llm_sim_fastq_generator_source() -> String {
  llm_sim_source_header(
    "MoonAP large FastQ generator. Runtime profile streams browser-local FASTQ output.",
  )
}

///|
fn llm_sim_fastq_analyzer_source() -> String {
  llm_sim_source_header(
    "MoonAP large FastQ analyzer. Runtime profile reads browser-local FASTQ chunks.",
  )
}

///|
async fn create_llm_sim_request(
  provider : String,
  model_name : String,
  stage : String,
  url : String,
  body : String,
  original_prompt : String,
  task_kind : String,
  conversation_history_json : String,
) -> (String, String, String, String) {
  let request_id = "llm-sim-" + @core.async_runtime_marker().to_string()
  let inbox_dir = llm_sim_inbox_dir()
  let outbox_dir = llm_sim_outbox_dir()
  let state_dir = llm_sim_state_dir()
  ensure_directory(inbox_dir)
  ensure_directory(outbox_dir)
  ensure_directory(state_dir)
  let response_path = outbox_dir + "/" + request_id + ".response.txt"
  let error_path = outbox_dir + "/" + request_id + ".error.txt"
  let request_json_path = inbox_dir + "/" + request_id + ".json"
  let request_text_path = inbox_dir + "/" + request_id + ".txt"
  let request_json = "{\n" +
    "  \"request_id\": " +
    json_string(request_id) +
    ",\n" +
    "  \"provider\": " +
    json_string(provider) +
    ",\n" +
    "  \"model\": " +
    json_string(model_name) +
    ",\n" +
    "  \"stage\": " +
    json_string(stage) +
    ",\n" +
    "  \"original_prompt\": " +
    json_string(original_prompt) +
    ",\n" +
    "  \"task_kind\": " +
    json_string(task_kind) +
    ",\n" +
    "  \"conversation_history_json\": " +
    json_string(conversation_history_json) +
    ",\n" +
    "  \"url\": " +
    json_string(url) +
    ",\n" +
    "  \"reply_path\": " +
    json_string(response_path) +
    ",\n" +
    "  \"error_path\": " +
    json_string(error_path) +
    ",\n" +
    "  \"raw_body\": " +
    json_string(body) +
    "\n" +
    "}\n"
  let request_text = "MoonAP LLM-sim request\n" +
    "request_id: " +
    request_id +
    "\n" +
    "provider: " +
    provider +
    "\n" +
    "model: " +
    model_name +
    "\n" +
    "stage: " +
    stage +
    "\n" +
    "original_prompt: " +
    original_prompt +
    "\n" +
    "task_kind: " +
    task_kind +
    "\n" +
    "conversation_history_json: " +
    conversation_history_json +
    "\n" +
    "reply_path: " +
    response_path +
    "\n" +
    "error_path: " +
    error_path +
    "\n\n" +
    "worker_contract:\n" +
    "- read the raw_body messages below before generating any response\n" +
    "- use the request messages as the source of truth\n" +
    "- do not answer from task-keyword templates or cached canned code\n" +
    "- write only the next code response to reply_path\n\n" +
    "raw_body:\n" +
    body +
    "\n"
  @fs.write_file(request_json_path, request_json, create=0o644)
  @fs.write_file(request_text_path, request_text, create=0o644)
  @fs.write_file(
    state_dir + "/latest-request.txt",
    request_text_path + "\n",
    create=0o644,
  )
  append_text_file(
    runtime_log_directory(),
    runtime_log_path(),
    "{\"ts\":" +
    json_string(request_id) +
    ",\"kind\":\"llm-sim\",\"label\":\"request-created\",\"text\":" +
    json_string(stage + " -> " + request_text_path) +
    "}\n",
  )
  (request_id, request_text_path, response_path, error_path)
}

///|
async fn append_text_file(
  directory : String,
  path : String,
  payload : String,
) -> Unit {
  if directory != "" && !@fs.exists(directory) {
    @fs.mkdir(directory, recursive=true, permission=0o755)
  }
  let existing = if @fs.exists(path) { @fs.read_file(path).text() } else { "" }
  @fs.write_file(path, existing + payload, create=0o644)
}

///|
async fn wait_for_llm_sim_response(
  request_id : String,
  model : String,
  response_path : String,
  error_path : String,
) -> (Int, String) {
  wait_for_llm_sim_response_from(
    request_id,
    model,
    response_path,
    error_path,
    @async.now(),
    1000 * 60 * 20,
  )
}

///|
async fn wait_for_llm_sim_response_from(
  request_id : String,
  model : String,
  response_path : String,
  error_path : String,
  started : Int64,
  timeout_ms : Int,
) -> (Int, String) {
  if @fs.exists(response_path) {
    let content = @fs.read_file(response_path).text()
    append_text_file(
      runtime_log_directory(),
      runtime_log_path(),
      "{\"ts\":" +
      json_string(request_id) +
      ",\"kind\":\"llm-sim\",\"label\":\"response-received\",\"text\":" +
      json_string(response_path) +
      "}\n",
    )
    (200, openai_chat_completion_payload(model, content, request_id))
  } else if @fs.exists(error_path) {
    let detail = @fs.read_file(error_path).text()
    append_text_file(
      runtime_log_directory(),
      runtime_log_path(),
      "{\"ts\":" +
      json_string(request_id) +
      ",\"kind\":\"llm-sim\",\"label\":\"response-error\",\"text\":" +
      json_string(detail) +
      "}\n",
    )
    proxy_error_payload(502, "LLM-sim response failed.", response_path, detail)
  } else if (@async.now() - started).to_int() >= timeout_ms {
    let detail = "Timed out waiting for LLM-sim response file.\n" +
      "Write the MoonBit response to: " +
      response_path +
      "\n" +
      "Or write an error to: " +
      error_path
    append_text_file(
      runtime_log_directory(),
      runtime_log_path(),
      "{\"ts\":" +
      json_string(request_id) +
      ",\"kind\":\"llm-sim\",\"label\":\"response-timeout\",\"text\":" +
      json_string(detail) +
      "}\n",
    )
    proxy_error_payload(
      504, "LLM-sim response timed out.", response_path, detail,
    )
  } else {
    @async.sleep(250)
    wait_for_llm_sim_response_from(
      request_id, model, response_path, error_path, started, timeout_ms,
    )
  }
}

///|
fn infer_llm_sim_stage(body : String) -> String {
  let lowered = body.to_lower()
  if lowered.contains("reply with ok") {
    "api-test"
  } else if lowered.contains("repair") ||
    lowered.contains("compiler failure") ||
    lowered.contains("compile-error summarizer") {
    "repair"
  } else {
    "codegen"
  }
}

///|
fn extract_json_string_field(body : String, key : String) -> String {
  let marker = "\"" + key + "\""
  guard body.find(marker) is Some(start) else { return "" }
  let after_key = body[start + marker.length():]
  guard after_key.find(":") is Some(colon) else { return "" }
  let after_colon = after_key[colon + 1:].trim().to_string()
  if !after_colon.has_prefix("\"") {
    return ""
  }
  let source = after_colon[1:]
  let mut index = 0
  let mut escaped = false
  for char in source {
    if escaped {
      escaped = false
    } else if char == '\\' {
      escaped = true
    } else if char == '"' {
      return json_unescape_string(source[:index].to_string())
    }
    index = index + 1
  }
  ""
}

///|
fn json_unescape_string(value : String) -> String {
  let mut result = ""
  let mut escaped = false
  for char in value {
    if escaped {
      if char == 'n' {
        result = result + "\n"
      } else if char == 'r' {
        result = result + "\r"
      } else if char == 't' {
        result = result + "\t"
      } else if char == '"' {
        result = result + "\""
      } else if char == '\\' {
        result = result + "\\"
      } else {
        result = result + char.to_string()
      }
      escaped = false
    } else if char == '\\' {
      escaped = true
    } else {
      result = result + char.to_string()
    }
  }
  if escaped {
    result + "\\"
  } else {
    result
  }
}

///|
fn extract_json_bool_field(body : String, key : String) -> Bool {
  let marker = "\"" + key + "\""
  guard body.find(marker) is Some(start) else { return false }
  let after_key = body[start + marker.length():]
  guard after_key.find(":") is Some(colon) else { return false }
  let after_colon = after_key[colon + 1:].trim().to_string()
  after_colon.has_prefix("true")
}

///|
fn openai_chat_completion_payload(
  model : String,
  content : String,
  request_id : String,
) -> String {
  "{\n" +
  "  \"id\": " +
  json_string(request_id) +
  ",\n" +
  "  \"object\": \"chat.completion\",\n" +
  "  \"created\": " +
  @core.async_runtime_marker().to_string() +
  ",\n" +
  "  \"model\": " +
  json_string(model) +
  ",\n" +
  "  \"choices\": [\n" +
  "    {\n" +
  "      \"index\": 0,\n" +
  "      \"message\": {\n" +
  "        \"role\": \"assistant\",\n" +
  "        \"content\": " +
  json_string(content) +
  "\n" +
  "      },\n" +
  "      \"finish_reason\": \"stop\"\n" +
  "    }\n" +
  "  ]\n" +
  "}\n"
}

///|
fn proxy_error_payload(
  status : Int,
  message : String,
  url : String,
  detail : String,
) -> (Int, String) {
  (
    status,
    "{\"error\":{\"message\":" +
    json_string(message) +
    ",\"url\":" +
    json_string(url) +
    ",\"detail\":" +
    json_string(detail) +
    "}}",
  )
}

///|
fn json_string(value : String) -> String {
  "\"" +
  value
  .replace_all(old="\\", new="\\\\")
  .replace_all(old="\"", new="\\\"")
  .replace_all(old="\r", new="\\r")
  .replace_all(old="\n", new="\\n")
  .replace_all(old="\t", new="\\t") +
  "\""
}

///|
async fn send_json(
  conn : @http.ServerConnection,
  status : Int,
  body : String,
) -> Unit {
  send_text(conn, status, body, "application/json; charset=utf-8")
}

///|
async fn send_html(conn : @http.ServerConnection, body : String) -> Unit {
  send_text(conn, 200, body, "text/html; charset=utf-8")
}

///|
async fn send_css(conn : @http.ServerConnection, body : String) -> Unit {
  send_text(conn, 200, body, "text/css; charset=utf-8")
}

///|
async fn serve_static_file(
  conn : @http.ServerConnection,
  file_path : String,
  content_type : String,
) -> Unit {
  guard @fs.exists(file_path) else {
    send_text(conn, 404, "Not Found", "text/plain; charset=utf-8")
    return
  }
  let file = @fs.open(file_path, mode=ReadOnly)
  defer file.close()
  conn
  ..send_response(200, "OK", extra_headers={
    "Content-Type": content_type,
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store, max-age=0",
  })
  ..write_reader(file)
  .end_response()
}

///|
async fn send_text(
  conn : @http.ServerConnection,
  status : Int,
  body : String,
  content_type : String,
) -> Unit {
  conn
  ..send_response(status, "OK", extra_headers={
    "Content-Type": content_type,
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store, max-age=0",
  })
  ..write(body)
  .end_response()
}

///|
fn web_index_html() -> String {
  [
    "<!doctype html>", "<html lang=\"en\">", "<head>", "<meta charset=\"utf-8\" />",
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />",
    "<title>MoonAP</title>", "<link rel=\"stylesheet\" href=\"/style.css\" />", "</head>",
    "<body>", "<div class=\"app-shell\">", "<main class=\"chat-shell\">", "<header class=\"topbar\">",
    "<div class=\"topbar-main\">", "<aside class=\"topbar-sidebar\">", "<div class=\"entry-actions topbar-actions\">",
    "<button id=\"llmButton\" class=\"entry-button entry-button-llm\" type=\"button\">LLM</button>",
    "<button id=\"skillButton\" class=\"entry-button entry-button-skill\" type=\"button\">SKILL</button>",
    "</div>", "</aside>", "<div class=\"topbar-copy-wrap\">", "<div class=\"topbar-copy\">",
    "<h1 class=\"topbar-title\">MoonAP: MoonBit Agent Playground</h1>", "<p class=\"tagline topbar-tagline\">Describe what APP you want to build.</p>",
    "<p class=\"tagline topbar-tagline secondary\">Or directly use an existing SKILL.</p>",
    "</div>", "</div>", "<div class=\"top-actions\">", "<button id=\"detailsToggle\" class=\"details-button\" type=\"button\" aria-expanded=\"false\">Details</button>",
    "</div>", "</header>", "<section class=\"conversation\" aria-label=\"Chat conversation\">",
    "<div class=\"welcome\">", "<label class=\"verify-option\"><input id=\"formalVerification\" type=\"checkbox\" /> Formal verification before Wasm compile</label>",
    "<div class=\"privacy-strip\" id=\"privacyStrip\">File contents stay in this browser. Uploaded bytes: 0. LLM receives metadata only.</div>",
    "<section id=\"onboardingCard\" class=\"onboarding-card\"></section>", "<div id=\"modePanel\" class=\"mode-panel\">",
    "<div class=\"skill-section\">", "<div class=\"section-title\"><span>1.1</span><strong>Personal-SKILL-Set</strong></div>",
    "<div class=\"personal-skill-toolbar\">", "<div class=\"personal-skill-toolbar-meta\"><strong>Local directory</strong><small id=\"personalSkillRootLabel\">No local Personal SKILL folder selected yet.</small></div>",
    "<button id=\"personalSkillChoosePath\" class=\"dialog-button secondary personal-skill-toolbar-button\" type=\"button\">Choose or change local directory</button>",
    "</div>", "<div id=\"personalSkillCards\" class=\"personal-skill-cards\"></div>",
    "</div>", "<div class=\"skill-section local-hub-section\">", "<div class=\"section-title\"><span>1.2</span><strong>Local-SKILL-Hub</strong></div>",
    "<div class=\"personal-skill-toolbar local-skill-toolbar\">", "<div class=\"personal-skill-toolbar-meta\"><strong>Local directory</strong><small id=\"localSkillHubRootLabel\">No local SKILL Hub folder selected yet.</small></div>",
    "<button id=\"localSkillHubChoosePath\" class=\"dialog-button secondary personal-skill-toolbar-button\" type=\"button\">Choose or change local SKILL Hub directory</button>",
    "</div>", "<div id=\"localSkillHubCards\" class=\"personal-skill-cards\"></div>",
    "</div>", "<div class=\"skill-section hub-section\">", "<div class=\"section-title\"><span>1.3</span><strong>Cloud-SKILL-Hub</strong></div>",
    "<div class=\"personal-skill-toolbar cloud-skill-toolbar\">", "<div class=\"personal-skill-toolbar-meta\"><strong>Official source</strong><small id=\"cloudSkillHubSourceLabel\"><a href=\"https://github.com/tangmaomao16/MoonAP-SKILL-Hub\" target=\"_blank\" rel=\"noreferrer\" title=\"https://github.com/tangmaomao16/MoonAP-SKILL-Hub\" aria-label=\"Official MoonAP SKILL Hub repository\">Official MoonAP SKILL Hub</a></small></div>",
    "<button id=\"cloudSkillHubRefresh\" class=\"dialog-button secondary personal-skill-toolbar-button\" type=\"button\">Refresh cloud catalog</button>",
    "</div>", "<div id=\"cloudSkillHubCards\" class=\"personal-skill-cards\">", "<div class=\"personal-skill-empty\">Cloud catalog is empty for now. We will load real SKILL metadata from the official MoonAP-SKILL-Hub repository next.</div>",
    "</div>", "</div>", "</div>", "<section id=\"resultPanel\" class=\"result-panel\" aria-live=\"polite\">",
    "<div class=\"result-head\"><span id=\"resultStatus\">Ready</span><strong id=\"resultTitle\">Browser-local FastQ workflow</strong></div>",
    "<div class=\"progress-track\"><div id=\"progressFill\" class=\"progress-fill\"></div></div>",
    "<div class=\"metrics-grid\">", "<div><span>File</span><strong id=\"metricFile\">-</strong></div>",
    "<div><span>Processed</span><strong id=\"metricProcessed\">0 B</strong></div>",
    "<div><span>Reads</span><strong id=\"metricReads\">0</strong></div>", "<div><span>N bases</span><strong id=\"metricTarget\">0</strong></div>",
    "<div><span>Total bases</span><strong id=\"metricBases\">0</strong></div>", "<div><span>Uploaded</span><strong id=\"metricUploaded\">0 B</strong></div>",
    "</div>", "</section>", "</div>", "<div id=\"messages\" class=\"messages\" aria-live=\"polite\"></div>",
    "<div id=\"artifactActions\" class=\"artifact-actions\" aria-live=\"polite\"></div>",
    "<dialog id=\"skillDialog\" class=\"skill-dialog\">", "<form method=\"dialog\" class=\"skill-dialog-body\">",
    "<div class=\"dialog-head\"><span id=\"dialogScope\">SKILL</span><strong id=\"dialogTitle\">Configure SKILL</strong></div>",
    "<p id=\"dialogSummary\" class=\"dialog-summary\"></p>", "<div id=\"dialogFields\" class=\"dialog-fields\"></div>",
    "<div id=\"dialogInputTarget\" class=\"dialog-output-target\" style=\"display:none;\"><button id=\"dialogChooseInput\" class=\"dialog-button secondary\" type=\"button\">Choose input FastQ file</button><span id=\"dialogInputStatus\">No input file selected yet.</span></div>",
    "<div id=\"dialogOutputTarget\" class=\"dialog-output-target\" style=\"display:none;\"><button id=\"dialogChooseOutput\" class=\"dialog-button secondary\" type=\"button\">Choose output file/location</button><span id=\"dialogOutputStatus\">No output file selected yet.</span></div>",
    "<div class=\"dialog-actions\"><button id=\"dialogCancel\" class=\"dialog-button\" type=\"button\">Cancel</button><button id=\"dialogOpenSource\" class=\"dialog-button secondary\" type=\"button\" style=\"display:none;\">View on GitHub</button><button id=\"dialogRun\" class=\"dialog-button primary\" type=\"button\">Run</button></div>",
    "</form>", "</dialog>", "<dialog id=\"llmDialog\" class=\"skill-dialog\">", "<form method=\"dialog\" class=\"skill-dialog-body\">",
    "<div class=\"dialog-head\"><span>LLM Router</span><strong>Connect Real API or Simulated API</strong></div>",
    "<p class=\"dialog-summary\">MoonAP stores these keys in this browser only. Use Real API for normal use. Simulated API stays available for local development and demos.</p>",
    "<div class=\"router-tabs\" role=\"tablist\" aria-label=\"LLM API mode\"><button id=\"routerTabReal\" class=\"router-tab is-active\" type=\"button\" data-router-tab=\"real\" aria-selected=\"true\">Real API</button><button id=\"routerTabSimulated\" class=\"router-tab\" type=\"button\" data-router-tab=\"simulated\" aria-selected=\"false\">Simulated API</button></div>",
    "<div id=\"routerPanelReal\" class=\"router-tab-panel is-active\" data-router-panel=\"real\"><div class=\"router-grid\">",
    "<div class=\"router-row\"><div class=\"router-row-head\"><span class=\"router-level\">Level 1</span><input id=\"routerEnableNVIDIA\" type=\"checkbox\" checked /><strong>NVIDIA</strong></div><div class=\"router-level-label\">Level 2 - Models</div><div id=\"routerModelsNVIDIA\" class=\"router-model-list\"></div><label>Base URL<input id=\"routerBaseNVIDIA\" value=\"https://integrate.api.nvidia.com/v1\" /></label><label>API key<input id=\"routerKeyNVIDIA\" type=\"password\" placeholder=\"Paste NVIDIA API key\" /></label></div>",
    "<div class=\"router-row\"><div class=\"router-row-head\"><span class=\"router-level\">Level 1</span><input id=\"routerEnableZAI\" type=\"checkbox\" checked /><strong>ZAI</strong></div><div class=\"router-level-label\">Level 2 - Models</div><div id=\"routerModelsZAI\" class=\"router-model-list\"></div><label>Base URL<input id=\"routerBaseZAI\" value=\"https://open.bigmodel.cn/api/paas/v4\" /></label><label>API key<input id=\"routerKeyZAI\" type=\"password\" placeholder=\"Paste ZAI API key\" /></label></div>",
    "<div class=\"router-row\"><div class=\"router-row-head\"><span class=\"router-level\">Level 1</span><input id=\"routerEnableGemini\" type=\"checkbox\" /><strong>Gemini</strong></div><div class=\"router-level-label\">Level 2 - Models</div><div id=\"routerModelsGemini\" class=\"router-model-list\"></div><label>Base URL<input id=\"routerBaseGemini\" value=\"https://generativelanguage.googleapis.com\" /></label><label>API key<input id=\"routerKeyGemini\" type=\"password\" placeholder=\"Paste Gemini API key\" /></label></div>",
    "<div class=\"router-row\"><div class=\"router-row-head\"><span class=\"router-level\">Level 1</span><input id=\"routerEnableSiliconFlow\" type=\"checkbox\" /><strong>SiliconFlow</strong></div><div class=\"router-level-label\">Level 2 - Models</div><div id=\"routerModelsSiliconFlow\" class=\"router-model-list\"></div><label>Base URL<input id=\"routerBaseSiliconFlow\" value=\"https://api.siliconflow.cn/v1\" /></label><label>API key<input id=\"routerKeySiliconFlow\" type=\"password\" placeholder=\"Paste SiliconFlow API key\" /></label></div>",
    "<div class=\"router-row\"><div class=\"router-row-head\"><span class=\"router-level\">Level 1</span><input id=\"routerEnableOpenRouter\" type=\"checkbox\" /><strong>OpenRouter</strong></div><div class=\"router-level-label\">Level 2 - Models</div><div id=\"routerModelsOpenRouter\" class=\"router-model-list\"></div><label>Base URL<input id=\"routerBaseOpenRouter\" value=\"https://openrouter.ai/api/v1\" /></label><label>API key<input id=\"routerKeyOpenRouter\" type=\"password\" placeholder=\"Paste OpenRouter API key\" /></label></div>",
    "<div class=\"router-row router-row-custom\"><div class=\"router-row-head\"><span class=\"router-level\">Custom</span><input id=\"routerEnableCustom\" type=\"checkbox\" /><strong>Custom provider</strong></div><div class=\"router-level-label\">Manual OpenAI-compatible endpoint</div><div class=\"router-custom-fields\"><label>Provider<input id=\"routerProviderCustom\" placeholder=\"my-provider\" /></label><label>Endpoint URL<input id=\"routerBaseCustom\" placeholder=\"https://example.com/v1\" /></label><label>Model name<input id=\"routerModelCustom\" placeholder=\"model-name\" /></label><label>API key<input id=\"routerKeyCustom\" type=\"password\" placeholder=\"Paste API key\" /></label></div></div>",
    "</div></div><div id=\"routerPanelSimulated\" class=\"router-tab-panel\" data-router-panel=\"simulated\"><div class=\"router-grid\">",
    "<div class=\"router-row\"><div class=\"router-row-head\"><span class=\"router-level\">Sim</span><input id=\"routerEnableOpenAI\" type=\"checkbox\" /><strong>OpenAI / GPT-5.4 simulated</strong></div><div class=\"router-level-label\">Level 2 - Models</div><div id=\"routerModelsOpenAI\" class=\"router-model-list\"></div><label>Base URL<input id=\"routerBaseOpenAI\" value=\"moonap://llm-sim\" /></label><label>API key<input id=\"routerKeyOpenAI\" type=\"password\" value=\"llm-sim-mode\" placeholder=\"llm-sim-mode\" /></label></div>",
    "</div></div>", "<label class=\"dialog-toggle\"><input id=\"routerFormalVerification\" type=\"checkbox\" /> Reserve MoonBit formal verification before Wasm compile</label>",
    "<label class=\"dialog-toggle\"><input id=\"routerRepairUseRawCompilerOutput\" type=\"checkbox\" checked /> Feed native compiler output into repair rounds</label>",
    "<div id=\"routerTestStatus\" class=\"router-test-status\">No API test run yet.</div>",
    "<div class=\"dialog-actions\"><button id=\"llmCancel\" class=\"dialog-button\" type=\"button\">Cancel</button><button id=\"llmSave\" class=\"dialog-button primary\" type=\"button\">Save</button></div>",
    "</form>", "</dialog>", "</section>", "<form id=\"chatForm\" class=\"composer\">",
    "<label class=\"sr-only\" for=\"message\">Message</label>", "<div class=\"composer-box\">",
    "<label class=\"attach-button\" for=\"fileInput\" title=\"Attach file\">+</label>",
    "<input id=\"fileInput\" type=\"file\" />", "<textarea id=\"message\" rows=\"1\" placeholder=\"\"></textarea>",
    "<button class=\"send-button\" type=\"submit\" title=\"Send\">&gt;</button>",
    "</div>", "</form>", "</main>", "<aside id=\"detailsDrawer\" class=\"details-drawer\" aria-label=\"MoonAP details\">",
    "<div class=\"details-drawer-body\">", "<section class=\"details-section details-state-section\"><strong>State</strong><pre id=\"state\">{}</pre></section>",
    "<section class=\"details-section details-process-section\"><strong>Process</strong>",
    "<div class=\"details-process-grid\">", "<div><span>Provider</span><strong id=\"processProvider\">-</strong></div>",
    "<div><span>Stage</span><strong id=\"processStage\">-</strong></div>", "<div><span>Result</span><strong id=\"processResult\">waiting</strong></div>",
    "</div>", "<div class=\"details-log\"><span>Last event</span><pre id=\"processLog\">MoonAP is waiting for input.</pre></div>",
    "<div class=\"details-log\"><span>LLM prompt mode</span><pre id=\"promptMode\">No LLM prompt captured yet.</pre></div>",
    "<div class=\"details-log\"><span>LLM system prompt</span><pre id=\"promptSystem\">No LLM prompt captured yet.</pre></div>",
    "<div class=\"details-log\"><span>LLM user prompt</span><pre id=\"promptUser\">No LLM prompt captured yet.</pre></div>",
    "<div class=\"details-log\"><span>MoonBit code preview</span><pre id=\"processSource\">No generated source yet.</pre></div>",
    "</section>", "</div>", "</aside>", "</div>", "<script type=\"module\" src=\"/app-live.js?v=moonap-llm-router-34\"></script>",
    "</body>", "</html>",
  ]
  .iter()
  .join("\n")
}

///|
fn web_style_css() -> String {
  [
    ":root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif; background: #ffffff; color: #111111; }",
    "* { box-sizing: border-box; }", "body { margin: 0; min-height: 100vh; background: #ffffff; }",
    "button, textarea { font: inherit; }", "button, label[for], .skill-card { cursor: pointer; }",
    ".app-shell { --details-space: 0px; min-height: 100vh; }", ".app-shell.details-open { --details-space: 420px; }",
    ".chat-shell { min-width: 0; min-height: 100vh; display: grid; grid-template-rows: 108px minmax(0, 1fr) auto; }",
    ".topbar { position: sticky; top: 0; z-index: 20; display: grid; grid-template-columns: 118px minmax(0, 1fr) auto; align-items: start; gap: 18px; padding: 8px calc(40px + var(--details-space)) 8px 26px; background: rgba(255,255,255,0.96); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(236,236,236,0.95); transition: padding-right 160ms ease; }",
    ".topbar-main { display: contents; }", ".topbar-sidebar { display: flex; justify-content: flex-start; }",
    ".topbar-copy-wrap { display: flex; justify-content: center; align-items: flex-start; min-width: 0; }",
    ".topbar-copy { width: min(920px, 100%); display: grid; justify-items: center; align-content: start; gap: 8px; text-align: center; padding-top: 1px; }",
    ".topbar-title { margin: 0; font-size: clamp(20px, 2vw, 30px); line-height: 1.08; font-weight: 720; letter-spacing: -0.028em; color: #111111; text-wrap: balance; }",
    ".topbar-tagline { margin: 0; color: #4d4d4d; font-size: clamp(14px, 1.18vw, 18px); line-height: 1.2; font-weight: 430; text-wrap: balance; }",
    ".topbar-tagline.secondary { font-size: clamp(13px, 1.05vw, 16px); color: #626262; }",
    ".topbar-actions { justify-content: flex-start; align-self: start; }", ".top-actions { position: relative; z-index: 40; flex: 0 0 auto; display: flex; gap: 10px; align-items: center; padding-top: 4px; }",
    ".details-button { border: 1px solid #dedede; border-radius: 999px; padding: 8px 14px; color: #555555; background: #ffffff; cursor: pointer; user-select: none; }",
    ".details-button:hover { background: #f5f5f5; }", ".details-drawer { position: fixed; right: 0; top: 0; bottom: 0; z-index: 80; width: min(420px, calc(100vw - 48px)); overflow: auto; padding: 12px 16px 16px; border-left: 1px solid #e6e6e6; background: #ffffff; box-shadow: -10px 0 30px rgba(0,0,0,0.08); transform: translateX(100%); transition: transform 160ms ease; }",
    ".app-shell.details-open .details-drawer { transform: translateX(0); }", ".details-drawer-body { min-height: calc(100vh - 104px); display: grid; grid-auto-rows: min-content; gap: 16px; }",
    ".details-section { display: grid; gap: 10px; align-content: start; }", ".details-section strong { font-size: 14px; }",
    ".details-state-section { min-height: 0; }", ".details-process-section { min-height: 0; }",
    ".details-process-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }",
    ".details-process-grid div { display: grid; gap: 4px; padding: 10px; border-radius: 10px; background: #f7f7f7; }",
    ".details-process-grid span { color: #666666; font-size: 12px; }", ".details-process-grid strong { font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
    ".details-log { display: grid; gap: 6px; }", ".details-log span { color: #666666; font-size: 12px; }",
    "#state { margin: 0; min-height: 260px; height: min(42vh, 420px); overflow: auto; padding: 12px; border-radius: 12px; background: #0d1113; color: #d7f7e8; font-size: 12px; line-height: 1.5; white-space: pre-wrap; }",
    ".details-log pre { margin: 0; min-height: 150px; height: min(24vh, 240px); overflow: auto; padding: 12px; border-radius: 12px; background: #0d1113; color: #d7f7e8; font-size: 12px; line-height: 1.5; white-space: pre-wrap; }",
    ".conversation { min-height: 0; overflow: auto; padding: 10px calc(24px + var(--details-space)) 140px 24px; transition: padding-right 160ms ease; }",
    ".welcome { width: min(920px, calc(100vw - 48px - var(--details-space))); margin: 0 auto 10px; display: grid; justify-items: stretch; align-content: start; gap: 12px; min-height: 24px; transition: width 160ms ease; }",
    ".welcome .tagline { margin: 0; color: #5f5f5f; font-size: 15px; text-align: center; line-height: 1.45; }",
    ".entry-actions { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }",
    ".topbar-actions { display: grid; gap: 14px; }", ".entry-button { width: 94px; min-height: 34px; border: 1px solid rgba(17,17,17,0.08); border-radius: 14px; padding: 0 14px; background: #ffffff; color: #111111; font-size: 20px; line-height: 1; font-weight: 500; box-shadow: 0 10px 22px rgba(31, 43, 36, 0.06); }",
    ".entry-button-llm { background: linear-gradient(180deg, #e5f7da 0%, #d3edc0 100%); }",
    ".entry-button-skill { background: linear-gradient(180deg, #f3d4f1 0%, #e8bfe6 100%); }",
    ".entry-button:hover { transform: translateY(-1px); box-shadow: 0 14px 30px rgba(0,0,0,0.1); }",
    ".verify-option { display: none; align-items: center; justify-content: center; gap: 8px; color: #6a6a6a; font-size: 13px; }",
    ".onboarding-card { max-width: 720px; margin: 0 auto; display: none; gap: 12px; padding: 16px; border: 1px solid #dfe7e3; border-radius: 14px; background: #f7fbf9; }",
    ".onboarding-card.is-open { display: grid; }", ".onboarding-card strong { font-size: 15px; }",
    ".onboarding-card small { color: #555555; line-height: 1.5; }", ".onboarding-actions { display: flex; flex-wrap: wrap; gap: 10px; }",
    ".onboarding-actions button { height: 38px; border: 1px solid #1f7a5b; border-radius: 999px; padding: 0 16px; background: #1f7a5b; color: #ffffff; cursor: pointer; }",
    ".onboarding-actions button.secondary { border-color: #d8d8d8; background: #ffffff; color: #111111; }",
    ".verify-option input { width: 14px; height: 14px; accent-color: #111111; }",
    ".privacy-strip { display: none; width: 100%; padding: 10px 12px; border: 1px solid #cde4da; border-radius: 12px; background: #f7fbf9; color: #225c46; font-size: 13px; text-align: center; }",
    ".privacy-strip.is-open { display: block; }", ".mode-panel { width: 100%; display: none; gap: 12px; margin-top: 8px; }",
    ".mode-panel.is-open { display: grid; }", ".skill-section { display: grid; gap: 10px; padding: 12px; border: 1px solid #e8e8e8; border-radius: 14px; background: #ffffff; }",
    ".skill-section:first-child { border-color: #cfe2d9; background: #fbfdfc; }",
    ".hub-section { border-color: #e8e8e8; background: #ffffff; }", ".section-title { display: flex; align-items: center; gap: 8px; color: #111111; flex-wrap: wrap; }",
    ".section-title span { color: #666666; font-size: 12px; }", ".section-title strong { font-size: 15px; }",
    ".personal-skill-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 14px; border: 1px solid #d7e6df; border-radius: 12px; background: linear-gradient(180deg, #f8fcfa 0%, #f2f8f5 100%); }",
    ".personal-skill-toolbar-meta { display: grid; gap: 4px; }", ".personal-skill-toolbar-meta strong { font-size: 14px; color: #163328; }",
    ".personal-skill-toolbar-meta small { color: #567163; line-height: 1.45; }",
    ".personal-skill-toolbar-button { min-height: 40px; }", ".hub-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }",
    ".skill-card { min-height: 118px; display: grid; align-content: start; gap: 8px; padding: 14px; border: 1px solid #e2e2e2; border-radius: 12px; background: #ffffff; text-align: left; transition: border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease; }",
    ".skill-card:hover { border-color: #111111; box-shadow: 0 10px 28px rgba(0,0,0,0.08); transform: translateY(-1px); }",
    ".skill-card:focus-visible, .entry-button:focus-visible, .send-button:focus-visible, .attach-button:focus-visible { outline: 2px solid #111111; outline-offset: 3px; }",
    ".skill-card.is-selected { border-color: #1f7a5b; background: #f7fbf9; box-shadow: 0 12px 30px rgba(31,122,91,0.12); }",
    ".skill-card span { color: #6b6b6b; font-size: 12px; }", ".skill-card strong { font-size: 15px; line-height: 1.25; }",
    ".skill-card small { color: #555555; font-size: 12px; line-height: 1.4; }", ".skill-card.personal { border-color: #cde4da; background: #f7fbf9; }",
    ".personal-skill-cards { display: grid; gap: 10px; }", ".personal-skill-empty { padding: 14px; border: 1px dashed #d7dfdb; border-radius: 12px; color: #5d5d5d; background: #fcfcfc; }",
    ".artifact-actions { width: min(920px, calc(100vw - 48px - var(--details-space))); margin: 0 auto; display: grid; gap: 14px; transition: width 160ms ease; }",
    ".action-card { display: none; gap: 12px; max-width: 720px; padding: 18px 20px; border: 1px solid #dfe7e3; border-radius: 18px; background: #f7fbf9; box-shadow: 0 14px 34px rgba(22, 38, 31, 0.05); }",
    ".action-card.is-open { display: grid; }", ".action-card strong { font-size: 16px; line-height: 1.3; }",
    ".action-card small { color: #56615b; line-height: 1.55; }", ".action-card-meta { display: flex; flex-wrap: wrap; gap: 8px; }",
    ".action-card-meta span { border-radius: 999px; padding: 5px 10px; background: #eef5f1; color: #24523f; font-size: 12px; }",
    ".action-card-actions { display: flex; flex-wrap: wrap; gap: 10px; }", ".action-card button { justify-self: start; min-height: 40px; border: 1px solid #d8d8d8; border-radius: 999px; padding: 0 16px; background: #ffffff; color: #111111; cursor: pointer; }",
    ".action-card button.primary { border-color: #1f7a5b; background: #1f7a5b; color: #ffffff; }",
    ".action-card button.secondary { border-color: #d8d8d8; background: #ffffff; color: #111111; }",
    ".action-card button.secondary.strong { border-color: #1f7a5b; background: rgba(31,122,91,0.08); color: #195f47; }",
    ".action-card-runtime { gap: 14px; border-color: #d7e6df; background: linear-gradient(180deg, #f6fbf8 0%, #eef6f1 100%); box-shadow: 0 18px 42px rgba(41, 76, 60, 0.08); }",
    ".action-card-runtime.is-complete { border-color: #d1e4da; background: linear-gradient(180deg, #f7fbf7 0%, #edf6ef 100%); }",
    ".action-card-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #2f5d4b; }",
    ".action-card-status { display: flex; flex-wrap: wrap; gap: 8px; }", ".action-card-status span { border-radius: 999px; padding: 6px 10px; background: #e5f1ea; color: #24523f; font-size: 12px; }",
    ".action-card-params { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 12px; padding: 12px; border: 1px solid #dbe7e0; border-radius: 14px; background: rgba(255,255,255,0.68); }",
    ".action-card-params label { display: grid; gap: 6px; font-size: 12px; color: #335748; }",
    ".action-card-params label span { font-weight: 600; }", ".action-card-params input { width: 100%; min-height: 38px; border: 1px solid #d0ddd6; border-radius: 10px; padding: 0 12px; background: #ffffff; color: #14261d; font: inherit; }",
    ".action-card-file-target { display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; align-items: center; padding: 12px; border: 1px solid #d6e6dc; border-radius: 14px; background: #f5fbf7; color: #315241; font-size: 13px; }",
    ".action-card-file-target small { grid-column: 1 / -1; color: #557061; line-height: 1.45; }",
    ".action-card-file-target span { overflow-wrap: anywhere; }", ".action-card-params label.checkbox-param, .dialog-fields label.checkbox-param { display: grid; grid-template-columns: 18px 1fr; gap: 6px 10px; align-items: start; padding: 10px 12px; border: 1px solid #d6e6dc; border-radius: 12px; background: #f8fcfa; }",
    ".action-card-params label.checkbox-param input, .dialog-fields label.checkbox-param input { width: 18px; min-height: 18px; height: 18px; margin-top: 1px; padding: 0; accent-color: #1f7a5b; }",
    ".param-help { color: #607568; font-size: 12px; line-height: 1.4; font-weight: 400; }",
    ".checkbox-param .param-help { grid-column: 2; }", ".action-card-primary, .action-card-secondary { display: flex; flex-wrap: wrap; gap: 10px; }",
    ".action-card-result-preview { display: grid; gap: 8px; padding: 12px 14px; border: 1px solid #cfe4da; border-radius: 12px; background: #ffffff; }",
    ".action-card-result-preview strong { font-size: 13px; color: #24523f; }", ".action-card-result-preview pre { margin: 0; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; font: 14px/1.55 ui-monospace, SFMono-Regular, Menlo, Consolas, \"Liberation Mono\", monospace; color: #111111; }",
    ".action-card-primary button.primary { background: #1f7a5b; color: #ffffff; border-color: #1f7a5b; }",
    ".action-card-primary button.secondary.strong { border-color: #1f7a5b; background: rgba(31,122,91,0.08); color: #195f47; }",
    ".action-card-secondary { padding-top: 2px; }", ".action-card-secondary button.secondary { background: rgba(255,255,255,0.84); border-color: #d4dfd8; color: #193529; }",
    ".result-panel { width: 100%; display: none; gap: 12px; padding: 16px; border: 1px solid #e0e0e0; border-radius: 14px; background: #ffffff; box-shadow: 0 12px 36px rgba(0,0,0,0.06); }",
    ".result-panel.is-open { display: grid; }", ".result-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }",
    ".result-head span { border-radius: 999px; background: #111111; color: #ffffff; padding: 5px 10px; font-size: 12px; }",
    ".result-head strong { font-size: 15px; }", ".progress-track { height: 8px; border-radius: 999px; overflow: hidden; background: #eeeeee; }",
    ".progress-fill { width: 0%; height: 100%; border-radius: inherit; background: #1f7a5b; transition: width 160ms ease; }",
    ".metrics-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px; }",
    ".metrics-grid div { min-width: 0; display: grid; gap: 4px; padding: 10px; border-radius: 10px; background: #f7f7f7; }",
    ".metrics-grid span { color: #666666; font-size: 12px; }", ".metrics-grid strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; }",
    ".skill-dialog { width: min(560px, calc(100vw - 40px)); border: 1px solid #dedede; border-radius: 16px; padding: 0; box-shadow: 0 24px 80px rgba(0,0,0,0.22); }",
    ".skill-dialog::backdrop { background: rgba(0,0,0,0.18); }", ".skill-dialog-body { display: grid; gap: 16px; padding: 20px; }",
    ".dialog-head { display: grid; gap: 4px; }", ".dialog-head span { color: #666666; font-size: 12px; }",
    ".dialog-head strong { font-size: 20px; }", ".dialog-summary { margin: 0; color: #444444; line-height: 1.5; }",
    ".router-tabs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; padding: 4px; border: 1px solid #e5e5e5; border-radius: 14px; background: #f6f6f6; }",
    ".router-tab { min-height: 38px; border: 0; border-radius: 10px; background: transparent; color: #555555; font-weight: 650; cursor: pointer; }",
    ".router-tab.is-active { background: #111111; color: #ffffff; box-shadow: 0 8px 18px rgba(0,0,0,0.12); }",
    ".router-tab-panel { display: none; }", ".router-tab-panel.is-active { display: grid; gap: 12px; }",
    ".router-grid { display: grid; gap: 12px; }", ".router-row { display: grid; gap: 10px; padding: 12px; border: 1px solid #e5e5e5; border-radius: 12px; background: #fafafa; }",
    ".router-row-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }",
    ".router-row-head strong { font-size: 15px; }", ".router-level { display: inline-flex; align-items: center; justify-content: center; min-width: 54px; height: 22px; padding: 0 8px; border-radius: 999px; background: #111111; color: #ffffff; font-size: 11px; font-weight: 650; }",
    ".router-level-label { color: #555555; font-size: 13px; font-weight: 600; }",
    ".dialog-fields { display: grid; gap: 10px; }", ".dialog-fields label, .router-row label { display: grid; gap: 6px; color: #555555; font-size: 13px; }",
    ".dialog-fields input, .router-row input { width: 100%; border: 1px solid #d8d8d8; border-radius: 10px; padding: 8px 10px; font: inherit; }",
    ".dialog-fields input, .router-row input { height: 38px; }", ".router-custom-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }",
    ".router-row-custom { border-color: #cfe2d9; background: #f7fbf9; }", ".router-model-list { display: grid; gap: 8px; max-height: 180px; overflow: auto; padding: 12px; border: 1px solid #d8d8d8; border-radius: 10px; background: #ffffff; }",
    ".dialog-output-target { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #d6e6dc; border-radius: 12px; background: #f5fbf7; color: #315241; font-size: 13px; }",
    ".dialog-output-target span { overflow-wrap: anywhere; }", ".router-model-option { display: flex; align-items: flex-start; gap: 10px; padding: 8px 10px; border-radius: 10px; background: #fafafa; }",
    ".router-model-option input { width: 16px; height: 16px; margin-top: 2px; border: 0; border-radius: 0; padding: 0; background: transparent; accent-color: #111111; }",
    ".router-model-option span { color: #222222; font-size: 13px; line-height: 1.4; overflow-wrap: anywhere; }",
    ".dialog-toggle { display: flex; align-items: center; gap: 8px; color: #555555; font-size: 13px; }",
    ".dialog-toggle input { width: 14px; height: 14px; accent-color: #111111; }",
    ".router-test-status { min-height: 88px; max-height: 180px; overflow: auto; white-space: pre-wrap; padding: 12px; border: 1px solid #e5e5e5; border-radius: 12px; background: #fafafa; color: #222222; font-size: 12px; line-height: 1.5; }",
    ".dialog-actions { display: flex; justify-content: flex-end; gap: 10px; }", ".dialog-button { height: 38px; border: 1px solid #d8d8d8; border-radius: 999px; padding: 0 16px; background: #ffffff; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }",
    ".dialog-button.primary { border-color: #1f7a5b; background: #1f7a5b; color: #ffffff; }",
    ".dialog-button:hover { background: #f3f3f3; }", ".dialog-button.primary:hover { background: #195f47; }",
    ".large-file-progress { position: fixed; right: 28px; bottom: 28px; width: min(420px, calc(100vw - 56px)); display: grid; gap: 10px; padding: 14px 16px; border: 1px solid #cde4da; border-radius: 16px; background: rgba(247,251,249,0.98); color: #173f31; box-shadow: 0 22px 60px rgba(24,48,37,0.20); opacity: 0; transform: translateY(12px); pointer-events: none; transition: opacity 140ms ease, transform 140ms ease; z-index: 1300; }",
    ".large-file-progress.is-open { opacity: 1; transform: translateY(0); }", ".large-file-progress.is-error { border-color: #f0c7c7; background: rgba(255,247,247,0.98); color: #7a1f1f; }",
    ".large-file-progress-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }",
    ".large-file-progress-head strong { font-size: 15px; }", ".large-file-progress-head span { font-variant-numeric: tabular-nums; font-weight: 700; }",
    ".large-file-progress-track { height: 8px; border-radius: 999px; overflow: hidden; background: #e6eee9; }",
    ".large-file-progress-track div { width: 0%; height: 100%; border-radius: inherit; background: #1f7a5b; transition: width 120ms ease; }",
    ".large-file-progress.is-error .large-file-progress-track div { background: #b94a48; }",
    ".large-file-progress-detail { font-size: 13px; line-height: 1.45; overflow-wrap: anywhere; }",
    ".moonap-toast { position: fixed; right: 24px; bottom: 26px; max-width: min(420px, calc(100vw - 48px)); padding: 12px 16px; border-radius: 14px; border: 1px solid #cde4da; background: rgba(247, 251, 249, 0.98); color: #194433; box-shadow: 0 18px 44px rgba(24, 48, 37, 0.14); font-size: 14px; line-height: 1.45; opacity: 0; transform: translateY(10px); pointer-events: none; transition: opacity 140ms ease, transform 140ms ease; z-index: 1200; }",
    ".moonap-toast.is-open { opacity: 1; transform: translateY(0); }", ".messages { width: min(920px, calc(100vw - 48px - var(--details-space))); margin: 0 auto; display: grid; align-content: start; gap: 18px; transition: width 160ms ease; }",
    ".message { max-width: 720px; padding: 16px 18px; border-radius: 18px; line-height: 1.55; white-space: pre-wrap; overflow-wrap: anywhere; }",
    ".message.user { justify-self: end; background: #f4f4f4; color: #111111; }",
    ".message.assistant { justify-self: start; background: transparent; color: #111111; }",
    ".composer { position: sticky; bottom: 0; padding: 18px calc(24px + var(--details-space)) 28px 24px; background: linear-gradient(to top, #ffffff 70%, rgba(255,255,255,0)); transition: padding-right 160ms ease; }",
    ".composer-box { width: min(920px, calc(100vw - 48px - var(--details-space))); min-height: 64px; margin: 0 auto; display: grid; grid-template-columns: 44px minmax(0, 1fr) 44px; align-items: end; gap: 10px; padding: 10px 12px; border: 1px solid #d8d8d8; border-radius: 30px; background: #ffffff; box-shadow: 0 18px 50px rgba(0,0,0,0.08); transition: width 160ms ease; }",
    ".attach-button, .send-button { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 50%; border: 0; font-size: 28px; line-height: 1; }",
    ".attach-button { color: #111111; background: transparent; }", ".attach-button:hover { background: #f2f2f2; }",
    ".send-button { background: #111111; color: white; font-size: 22px; }", "#fileInput { display: none; }",
    "textarea { width: 100%; max-height: 180px; resize: none; border: 0; outline: 0; padding: 11px 0; color: #111111; background: transparent; line-height: 1.45; }",
    "textarea.suggested { color: #8a8a8a; }", "textarea::placeholder { color: #8a8a8a; }",
    ".sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }",
    "@media (max-width: 980px) { .hub-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .metrics-grid, .details-process-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } .app-shell.details-open { --details-space: 360px; } .chat-shell { grid-template-rows: 100px minmax(0, 1fr) auto; } .topbar { grid-template-columns: 108px minmax(0, 1fr) auto; gap: 14px; padding: 8px calc(28px + var(--details-space)) 8px 18px; } .entry-button { width: 88px; min-height: 32px; font-size: 18px; } .topbar-copy { gap: 6px; } .topbar-title { font-size: clamp(18px, 2.1vw, 26px); } .topbar-tagline { font-size: clamp(13px, 1.2vw, 16px); } .topbar-tagline.secondary { font-size: clamp(12px, 1.05vw, 15px); } .conversation { padding-top: 8px; } .welcome { min-height: 20px; margin-bottom: 8px; } }",
    "@media (max-width: 760px) { .app-shell.details-open { --details-space: 0px; } .chat-shell { grid-template-rows: 126px minmax(0, 1fr) auto; } .topbar { grid-template-columns: 1fr auto; gap: 10px; padding: 8px 16px; } .topbar-sidebar { grid-column: 1 / 2; grid-row: 1 / 2; } .topbar-copy-wrap { grid-column: 1 / 3; grid-row: 2 / 3; justify-content: flex-start; } .topbar-copy { justify-items: start; text-align: left; gap: 6px; width: 100%; } .topbar-actions { grid-auto-flow: column; justify-content: flex-start; } .entry-button { width: 88px; min-height: 30px; font-size: 18px; } .topbar-title { font-size: 20px; } .topbar-tagline { font-size: 14px; } .topbar-tagline.secondary { font-size: 13px; } .conversation { padding: 10px 16px 112px; } .welcome { width: 100%; min-height: 18px; margin-bottom: 8px; } .hub-grid { grid-template-columns: 1fr; } .messages, .composer-box { width: 100%; } .details-drawer { right: 0; left: auto; top: 0; bottom: 0; width: min(100vw, 420px); padding: 10px 14px 14px; } .details-drawer-body { min-height: calc(100vh - 24px); } .details-process-grid { grid-template-columns: 1fr; } #state { min-height: 220px; height: 34vh; } .details-log pre { min-height: 120px; height: 20vh; } .composer { padding: 18px 16px 28px; } }",
  ]
  .iter()
  .join("\n")
}
