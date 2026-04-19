///|
test "health json is MoonBit owned" {
  let encoded = @moonap_mb_server.health_json()
  assert_true(encoded.contains("\"ok\": true"))
  assert_true(encoded.contains("MoonBit-first minimal server"))
}

///|
test "route table exposes first milestone endpoints" {
  let encoded = @moonap_mb_server.policies_json()
  assert_true(encoded.contains("\"/api/health\""))
  assert_true(encoded.contains("\"/api/policies\""))
  assert_true(encoded.contains("\"/api/app-state\""))
  assert_true(encoded.contains("\"/api/formal-verification\""))
  assert_true(encoded.contains("\"/api/large-file-policy\""))
  assert_true(encoded.contains("\"/api/skills\""))
  assert_true(encoded.contains("\"/api/agent/context\""))
  assert_true(encoded.contains("\"/api/artifact/compile\""))
}

///|
test "file privacy defaults to metadata only" {
  let context = @moonap_mb_server.normalize_agent_context(
    "test-session", "Count N bases", "moonbit-task", "reads.fastq", 1024, "fastq",
    "2026-04-15T00:00:00Z",
  )
  assert_false(context.llm_receives_file_contents)
  assert_eq(context.active_skill, "fastq")
  assert_eq(context.attachments[0].privacy_level, "metadata-only")
}

///|
test "skill routing stays generic" {
  assert_eq(@moonap_mb_server.choose_skill("make a browser game", ""), "game")
  assert_eq(
    @moonap_mb_server.choose_skill("summarize this Excel workbook", ""),
    "spreadsheet",
  )
  assert_eq(@moonap_mb_server.choose_skill("inspect records", "csv"), "csv")
  assert_eq(@moonap_mb_server.choose_skill("hello", ""), "chat")
}

///|
test "app state starts in skill-only mode until LLM is configured" {
  let encoded = @moonap_mb_server.app_state_json()
  assert_true(
    encoded.contains(
      "Tell, what APP you want to build. Or, directly use an existing SKILL.",
    ),
  )
  assert_true(encoded.contains("\"llm_status\": \"not_configured\""))
  assert_true(encoded.contains("\"skill_enabled\": true"))
}

///|
test "large-file policy keeps file contents browser-local" {
  let encoded = @moonap_mb_server.large_file_policy_json()
  assert_true(encoded.contains("\"browser_local_streaming\": true"))
  assert_true(encoded.contains("\"uploaded_bytes_default\": 0"))
  assert_true(encoded.contains("\"llm_receives_file_contents\": false"))
  assert_true(encoded.contains("\"default_chunk_size_bytes\": 4194304"))
}

///|
test "formal verification is reserved but disabled by default" {
  let encoded = @moonap_mb_server.formal_verification_policy_json()
  assert_true(encoded.contains("\"available_in_moonbit_version\": \"0.9\""))
  assert_true(encoded.contains("\"enabled_by_default\": false"))
  assert_true(encoded.contains("\"planned_command\": \"moon prove\""))
  assert_true(encoded.contains("proof_requires"))
}

///|
test "artifact pipeline reserves optional formal verification before wasm compile" {
  let encoded = @moonap_mb_server.policies_json()
  assert_true(encoded.contains("\"moonbit-codegen\""))
  assert_true(encoded.contains("\"moonbit-formal-verification\""))
  assert_true(encoded.contains("\"moonbit-wasm-compile\""))
}

///|
test "skill hub exposes Anthropic-style MoonAP skills with defaults" {
  let encoded = @moonap_mb_server.builtin_skill_hub_json()
  assert_true(encoded.contains("\"description_file\": \"SKILL.md\""))
  assert_true(encoded.contains("\"program_dir\": \"program\""))
  assert_true(encoded.contains("research.bioinformatics.fastq-base-counter"))
  assert_true(encoded.contains("research.bioinformatics.fastq-generator"))
  assert_true(encoded.contains("\"default_value\": \"N\""))
  assert_true(encoded.contains("\"default_value\": \"10000\""))
  assert_true(encoded.contains("\"default_value\": \"single_player\""))
}

///|
test "skill run plan uses default parameters" {
  let encoded = @moonap_mb_server.skill_run_plan_json("finance excel")
  assert_true(encoded.contains("finance.accounting.excel-max-amount-row"))
  assert_true(encoded.contains("\"name\": \"amount_column\""))
  assert_true(encoded.contains("\"value\": \"amount\""))
  assert_true(encoded.contains("\"default_used\": true"))
}

///|
async test "artifact compile probe returns real compile result" {
  let source = "fn main { println(\"hi\") }\n"
  let encoded = @moonap_mb_server.artifact_compile_probe_json(source)
  assert_true(
    encoded.contains("\"command\": \"moon build cmd/main --target wasm-gc\""),
  )
  assert_true(encoded.contains("\"source_bytes\": 25"))
  assert_true(encoded.contains("\"stage\": \"moonbit-wasm-compile\""))
}

///|
test "compile error summarizer classifies common MoonBit failures" {
  let summary = @moonap_mb_server.summarize_compile_output(
    "failed:\ncmd/main/main.mbt:12: unknown identifier random_base\n",
  )
  assert_eq(summary.kind, "name-resolution-error")
  assert_eq(summary.primary_file, "cmd/main/main.mbt")
  assert_eq(summary.primary_line, 12)
  assert_true(summary.repair_hint.contains("missing helpers"))
}

///|
test "compile error summarizer detects reasoning leaked into code output" {
  let summary = @moonap_mb_server.summarize_compile_output(
    "Error: [3002]\n1 │ Okay, I need to generate a MoonBit program that creates a Personal FastQ Generator.\n",
  )
  assert_eq(summary.kind, "non-code-response")
  assert_true(summary.likely_cause.contains("reasoning"))
  assert_true(summary.repair_hint.contains("only valid cmd/main/main.mbt code"))
}

///|
test "moonbit extractor prefers FILE wrapper" {
  let response = "analysis first\nFILE: cmd/main/main.mbt\nfn main {\n  \"hello moonbit\"\n}\nEND_FILE\nextra"
  let extracted = @moonap_mb_server.extract_moonbit_source(response)
  assert_eq(extracted, "fn main {\n  \"hello moonbit\"\n}")
}

///|
test "moonbit extractor supports moonbit file tag" {
  let response = "<moonbit-file path=\"cmd/main/main.mbt\">\nfn main {\n  \"hello moonbit\"\n}\n</moonbit-file>"
  let extracted = @moonap_mb_server.extract_moonbit_source(response)
  assert_eq(extracted, "fn main {\n  \"hello moonbit\"\n}")
}

///|
test "moonbit extractor falls back to fenced moonbit code" {
  let response = "```moonbit\nfn main {\n  \"hello moonbit\"\n}\n```"
  let extracted = @moonap_mb_server.extract_moonbit_source(response)
  assert_eq(extracted, "fn main {\n  \"hello moonbit\"\n}")
}

///|
test "path last segment handles unix and windows separators" {
  assert_eq(
    @moonap_mb_server.path_last_segment(
      "C:\\workspace\\moonap\\logs\\run-12345",
    ),
    "run-12345",
  )
  assert_eq(
    @moonap_mb_server.path_last_segment(
      "/tmp/moonap/runtime/browser-runtime-42/",
    ),
    "browser-runtime-42",
  )
}

///|
test "normalize virtual path uses forward slashes" {
  assert_eq(
    @moonap_mb_server.normalize_virtual_path(
      "bioinformatics\\sequencing\\fastq-generator",
    ),
    "bioinformatics/sequencing/fastq-generator",
  )
  assert_eq(
    @moonap_mb_server.normalize_virtual_path(
      "bioinformatics/sequencing/fastq-generator.zip",
    ),
    "bioinformatics/sequencing/fastq-generator.zip",
  )
  assert_eq(
    @moonap_mb_server.normalize_virtual_path(
      "\\bioinformatics\\\\sequencing///fastq-generator\\",
    ),
    "bioinformatics/sequencing/fastq-generator",
  )
}
