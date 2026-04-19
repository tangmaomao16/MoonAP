# Free LLM Models Ability of Generating MoonBit Code

## Goal

Evaluate the basic MoonBit coding ability of every free LLM model for which we can obtain an API key.

This experiment is designed to answer:

1. Which models are reachable from MoonAP.
2. Which models respond quickly enough to be usable.
3. Which models stall, time out, or fail at the network/API layer.
4. Which models can generate correct MoonBit code for simple coding tasks.
5. How many generation-repair rounds each model typically needs before the code compiles.

The final output of this work is a knowledge document:

- `docs/experiments/free-llm-moonbit/results.md`

And one structured raw-result file:

- `artifacts/moonbit-eval-results.json`

## Scope

This evaluation covers only models that satisfy both conditions:

1. The user can obtain an API key for the provider.
2. The model is usable under a free quota, free trial, or free development tier.

Target providers currently include:

- Gemini
- ZAI
- NVIDIA
- SiliconFlow
- OpenRouter

## Principle

We are measuring the model's own MoonBit coding ability, not the ability of a large prompting scaffold.

Therefore the experiment must use:

- the simplest possible system prompt
- the simplest possible user prompt
- no large MoonBit knowledge pack
- no long role instructions
- no task-specific business context

We should keep the generation prompt minimal enough that a strong model can succeed from its own learned knowledge.

## Benchmark levels

The initial benchmark covers Levels 1 to 3 only.

### Level 1

Smallest valid `cmd/main/main.mbt` that compiles under `wasm-gc`.

Required behavior:

- `main` returns `"hello moonbit"`
- no helper functions
- no imports

### Level 2

One helper plus `main`.

Required behavior:

- one helper function returning a string
- `main` calls the helper
- no imports

### Level 3

Simple control flow and deterministic string construction.

Required behavior:

- produce a fixed short string using basic bindings and control flow
- no imports
- keep the program compact

## Prompt protocol

### Minimal system prompt

```text
You write MoonBit code.
Return only cmd/main/main.mbt.
No markdown fences.
No explanations.
```

### Minimal user prompt

The user prompt contains only the benchmark task itself.

No MoonBit primer is injected in this experiment mode.

## Evaluation modes

We track two scores for each model.

### 1. Raw codegen score

The model gets only the minimal system prompt and the benchmark task.

Success condition:

- the first generated file compiles under `moon build cmd/main --target wasm-gc`

### 2. Assisted score

If raw codegen fails, MoonAP may optionally try repair rounds using compile output.

Success condition:

- the code compiles within the configured repair budget

This separation matters because it tells us whether the model already knows enough MoonBit on its own, or whether it only succeeds with compiler-guided repair.

## Metrics to record

Each provider/model pair must record the following fields.

### Availability

- provider
- model
- base_url
- api_test_status
- api_test_message
- http_status if known
- non_json_response flag
- timeout flag

### Latency

- api_test_latency_ms
- first_codegen_response_latency_ms
- total_time_to_first_compile_success_ms

### Benchmark outcome

For each of `L1`, `L2`, `L3`:

- attempted
- raw_codegen_pass
- raw_codegen_compile_exit_code
- raw_codegen_compile_summary_kind
- repair_attempts_used
- assisted_pass
- final_compile_exit_code
- final_compile_summary_kind
- final_source_bytes

### Notes

- stalled_or_long_no_response
- parser_drift_notes
- language_drift_notes
- final_recommendation_note

## Round counting

Round counting is defined as:

- `1`: first codegen compiled successfully
- `2`: first codegen failed, first repair compiled successfully
- `3`: second attempt after one more repair compiled successfully
- `fail`: compile still failed after the current repair budget

## Recommended output document structure

The result document should contain:

1. Executive summary
2. Best overall model
3. Best first-pass MoonBit model
4. Best repair-assisted model
5. Provider-by-provider table
6. Detailed notes for each model
7. Recommended default development model
8. Recommended backup model

## Decision rule for the default development model

Default development model should be chosen by the following order:

1. Highest Level 3 pass rate
2. Fewest rounds needed
3. Lowest timeout/stall rate
4. Lowest median latency
5. Highest stability across repeated runs

## Execution phases

### Phase 1

Freeze benchmark tasks and minimal prompts.

### Phase 2

Implement the evaluation harness in MoonAP.

### Phase 3

Run API reachability tests for every configured model.

### Phase 4

Run benchmark L1-L3 for every reachable model.

### Phase 5

Summarize results into the knowledge document and select the preferred development model.

## Non-goals

This experiment does not yet measure:

- MoonBit formal verification
- browser-local runtime behavior
- long-context agent workflows
- large bioinformatics generation tasks
- aesthetic or prose quality

Those can be evaluated later, after we identify the strongest basic MoonBit coding model.
