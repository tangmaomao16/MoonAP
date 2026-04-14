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
  assert_eq(manifest.project_files.length(), 5)
  assert_eq(manifest.skills.length(), 2)
  assert_true(manifest.project_files[3].path.contains("cmd/main/fastq"))
  assert_true(manifest.verification_gate[2].detail.contains("formal verification slot"))
  assert_eq(benchmark.generated_source_file_count, 3)
  assert_true(benchmark.recommended_chunk_sizes.contains("8 MB"))
}
