test "agent context can round-trip through json" {
  let context = @moonap.build_demo_context(@moonap.fastq_demo_task())
  let encoded = context.to_json()
  let decoded : @moonap.AgentContext = @json.from_json(encoded)
  assert_true(decoded == context)
}

test "wasm gate stays closed when a verification check fails" {
  let browser_task = @moonap.browser_game_demo_task()
  let context = @moonap.build_demo_context(@moonap.browser_game_demo_task())
    .record_check(
      @moonap.VerificationCheck::new(
        "unsafe-ffi",
        browser_task.verification_level,
        false,
        "The generated browser bindings exceeded the allowed surface.",
      ),
    )
  assert_false(context.ready_for_wasm())
  assert_eq(context.failed_check_count(), 1)
}

test "fastq scenario exposes the expected capabilities" {
  let task = @moonap.fastq_demo_task()
  assert_true(task.to_json().stringify().contains("\"domain\":\"FastqAnalysis\""))
  assert_true(task.required_capabilities.contains("fastq-streaming"))
  assert_true(task.required_capabilities.contains("wasm-output"))
}

test "demo context includes a reusable synthesis manifest" {
  let context = @moonap.build_demo_context(@moonap.fastq_demo_task())
  let manifest = context.synthesis_manifest.unwrap()
  let benchmark = context.benchmark_profile.unwrap()
  let kernel = manifest.task_kernel_protocol.unwrap()
  assert_eq(manifest.project_files.length(), 6)
  assert_eq(manifest.skills.length(), 2)
  assert_true(manifest.project_files[3].path.contains("cmd/main/fastq"))
  assert_true(manifest.verification_gate[2].detail.contains("formal-proof slot"))
  assert_eq(benchmark.generated_source_file_count, 4)
  assert_true(benchmark.recommended_chunk_sizes.contains("8 MB"))
  assert_eq(kernel.protocol_name, "moonap.fastq.streaming.v1")
  assert_true(kernel.to_json().stringify().contains("\"input_mode\":\"StreamingBytes\""))
  assert_true(kernel.ingest_fn == "ingest_chunk")
}

test "task router policy keeps MoonAP generic" {
  let policy = @moonap.task_router_policy()
  let encoded = policy.to_json().stringify()
  assert_eq(policy.default_mode, "chat")
  assert_true(encoded.contains("\"mode\":\"moonbit-task\""))
  assert_true(encoded.contains("\"mode\":\"game-agent\""))
  assert_true(encoded.contains("\"mode\":\"fastq-agent\""))
  assert_true(policy.file_analysis_keywords.contains("excel"))
  assert_true(policy.artifact_keywords.contains("moonbit"))
}

test "llm router policy exposes cross-provider model pool" {
  let policy = @moonap.llm_router_policy()
  let encoded = policy.to_json().stringify()
  assert_eq(policy.default_provider, "gemini")
  assert_true(encoded.contains("\"key\":\"gemini\""))
  assert_true(encoded.contains("\"key\":\"siliconflow\""))
  assert_true(encoded.contains("\"key\":\"zai\""))
  assert_true(encoded.contains("\"key\":\"openrouter\""))
  assert_true(encoded.contains("gemini-3-flash-preview"))
  assert_true(encoded.contains("DeepSeek-R1-Distill-Qwen-32B"))
}

test "file analysis policy is extensible beyond fastq" {
  let policy = @moonap.file_analysis_policy()
  let encoded = policy.to_json().stringify()
  assert_eq(policy.max_preview_lines, 12)
  assert_true(encoded.contains("\"detected_type\":\"fastq\""))
  assert_true(encoded.contains("\"detected_type\":\"csv\""))
  assert_true(encoded.contains("\"detected_type\":\"spreadsheet\""))
  assert_true(encoded.contains("\"default_analysis\":\"spreadsheet-summary\""))
  assert_true(encoded.contains("\"analysis_type\":\"csv-summary\""))
}

test "codegen contract is owned by MoonBit" {
  let contract = @moonap.moonbit_codegen_contract()
  assert_true(contract.contains("sourceFiles is required"))
  assert_true(contract.contains("cmd/main/main.mbt"))
  assert_true(contract.contains("Do not use print_string"))
  assert_true(contract.contains("taskKernelProtocol"))
}
