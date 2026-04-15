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

test "server contract is owned by MoonBit" {
  let contract = @moonap.moonap_server_contract()
  let encoded = contract.to_json().stringify()
  assert_true(encoded.contains("/api/server-contract"))
  assert_true(encoded.contains("/api/llm-router-policy"))
  assert_true(encoded.contains("/api/file-analysis-policy"))
  assert_true(encoded.contains("/api/attachment-runtime-contract"))
  assert_true(encoded.contains("/api/artifact-validation-policy"))
  assert_true(encoded.contains("/api/codegen-contract"))
  assert_true(encoded.contains("/api/compiler-plan"))
  assert_true(encoded.contains("/api/server-runtime"))
  assert_true(encoded.contains("/api/server-bootstrap"))
  assert_true(encoded.contains("/api/chat"))
  assert_true(encoded.contains("/api/benchmarks/fastq"))
  assert_true(contract.routes.length() >= 10)
  assert_true(contract.adapter_responsibilities.contains("MoonBit compiler process execution"))
  assert_true(contract.migration_order[0].contains("Move all route policy"))
}

test "agent runtime plan is decided by MoonBit policy" {
  let plan = @moonap.moonap_agent_runtime_plan(
    "count n bases in this fastq file",
    "chat",
    "fastq",
    true,
  )
  assert_eq(plan.normalized_mode, "chat")
  assert_true(plan.needs_file_analysis)
  assert_true(plan.needs_artifact)
  assert_eq(plan.requested_analysis, "fastq-n-stats")
  assert_true(plan.adapter_notes[0].contains("MoonBit owns task classification"))
}

test "attachment runtime contract stays generic" {
  let contract = @moonap.attachment_runtime_contract()
  let encoded = contract.to_json().stringify()
  assert_true(contract.supported_file_types.contains("fastq"))
  assert_true(contract.supported_file_types.contains("csv"))
  assert_true(contract.supported_file_types.contains("spreadsheet"))
  assert_true(encoded.contains("ingest_chunk"))
  assert_true(encoded.contains("is_n_base"))
}

test "artifact validation policy is owned by MoonBit" {
  let policy = @moonap.artifact_validation_policy()
  let encoded = policy.to_json().stringify()
  assert_true(policy.required_source_files.contains("cmd/main/main.mbt"))
  assert_true(policy.forbidden_source_patterns.contains("print_string"))
  assert_true(policy.forbidden_source_patterns.contains(" var "))
  assert_true(policy.fastq_compat_exports.contains("accumulate_n_bases"))
  assert_true(policy.max_remote_repair_rounds >= 2)
  assert_true(encoded.contains("Return only strict JSON"))
}

test "compiler plan is owned by MoonBit" {
  let plan = @moonap.compiler_plan()
  let encoded = plan.to_json().stringify()
  assert_eq(plan.module_name, "moonap_generated/runtime")
  assert_eq(plan.entry_package, "cmd/main")
  assert_eq(plan.target, "wasm")
  assert_true(plan.build_args.contains("build"))
  assert_true(plan.build_args.contains("--target"))
  assert_true(plan.wasm_output_path.contains("main.wasm"))
  assert_true(encoded.contains("__MOONAP_WASM_EXPORTS__"))
  assert_true(plan.package_dirs_excluded_from_autofill.contains("cmd/main"))
}

test "moonbit server runtime manifest owns the default server entry" {
  let runtime = @moonap.moonbit_server_runtime()
  let encoded = runtime.to_json().stringify()
  assert_eq(runtime.server_entry, "moonap/cmd/server_native/main.mbt")
  assert_eq(runtime.build_target, "js")
  assert_true(runtime.endpoint_parity)
  assert_true(encoded.contains("server/lib/chat-engine-v3.mjs"))
  assert_true(encoded.contains("server/lib/moonbit-compiler.mjs"))
  assert_true(encoded.contains("platform adapters"))
}

test "moonbit server bootstrap carries every server policy in one payload" {
  let bootstrap = @moonap.moonbit_server_bootstrap()
  let encoded = bootstrap.to_json().stringify()
  assert_eq(bootstrap.runtime.server_entry, "moonap/cmd/server_native/main.mbt")
  assert_eq(bootstrap.contract.static_root, "web")
  assert_true(encoded.contains("\"llm_router\""))
  assert_true(encoded.contains("\"task_router\""))
  assert_true(encoded.contains("\"artifact_validation\""))
  assert_true(encoded.contains("\"codegen_prompt\""))
  assert_true(encoded.contains("Return strict JSON"))
  assert_true(encoded.contains("MoonBit 0.9 skill summary"))
}

test "codegen prompt policy is owned by MoonBit" {
  let policy = @moonap.codegen_prompt_policy()
  let encoded = policy.to_json().stringify()
  assert_true(policy.system_identity.contains("MoonAP"))
  assert_true(policy.chat_system_identity.contains("local-first"))
  assert_true(policy.fastq_structure.contains("fastq_stats.mbt"))
  assert_true(policy.generated_file_rules.length() >= 3)
  assert_true(policy.fastq_generation_rules.join("\n").contains("N bases"))
  assert_true(encoded.contains("previous_response_label"))
}
