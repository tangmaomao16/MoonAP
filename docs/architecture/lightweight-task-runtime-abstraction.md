# Lightweight Task Runtime Abstraction

Last updated: `2026-04-17 23:12` in `Asia/Shanghai (UTC+08:00)`

## Why this document exists

MoonAP already has one end-to-end task path that works well:

- user enters a natural-language request
- LLM generates MoonBit
- MoonAP compiles to wasm
- browser-local runtime step runs
- user gets a result
- user may save the workflow as a SKILL

The first task that now runs through this path is `FastQ file generation`.

The next architectural step is to make this path reusable for other task types without over-designing the system. We explicitly want to avoid repeating the earlier mistake made in prompt design for `GPT-5.4`, where too much abstraction and too much system scaffolding made the behavior worse instead of better.

This document therefore proposes a deliberately small abstraction for task runtime orchestration.

## Design principle

MoonAP should be:

- general enough to support multiple task families
- simple enough that the runtime contract stays legible
- explicit enough that the browser UI and runtime executor do not need to hardcode every task forever

The goal is not to build a universal application DSL. The goal is to build a small reusable runtime contract.

## The four core fields

MoonAP runtime flow should standardize on only these four concepts:

1. `task_kind`
2. `runtime_mode`
3. `runtime_spec`
4. `result_mode`

### `task_kind`

`task_kind` is a light task family label. It does not need to describe the whole workflow. It only tells MoonAP what kind of runtime and result behavior to expect.

Recommended initial set:

- `fastq-generator`
- `fastq-analysis`
- `excel-generator`
- `finance-report-analysis`
- `browser-game`
- `generic`

### `runtime_mode`

`runtime_mode` tells the browser how the user should interact with the runtime step.

Recommended initial set:

- `form`
- `file`
- `form+file`
- `interactive`

This is intentionally small.

### `runtime_spec`

`runtime_spec` contains just enough information for the browser to render the runtime step.

For the current stage, it should stay minimal:

- `title`
- `action_label`
- `fields`

Each field should also stay minimal:

- `name`
- `label`
- `kind`
- `default`

Optional numeric helpers are allowed when useful:

- `min`
- `max`
- `step`

This is enough for the current MoonAP stage. More advanced UI hints should be delayed until clearly needed.

### `result_mode`

`result_mode` tells MoonAP how the runtime result should be delivered to the user.

Recommended initial set:

- `download`
- `report`
- `interactive`
- `text`

## Why this abstraction is intentionally small

We explicitly do **not** want to start with:

- a large task planner DSL
- a deep runtime executor registry
- a generic assessment platform
- a heavy UI schema language

All of those can come later if needed.

For now, MoonAP mainly needs:

- a small number of task kinds
- a small number of runtime interaction modes
- a small browser-renderable spec
- a small result-mode vocabulary

That is enough to support the currently discussed product scenarios.

## Mapping to the current target task scenarios

### 1. FastQ file generation

This is the current best-developed scenario.

- `task_kind = fastq-generator`
- `runtime_mode = form`
- `result_mode = download`

Typical `runtime_spec`:

```json
{
  "title": "Generate FastQ file",
  "action_label": "Run generator",
  "fields": [
    { "name": "read_count", "label": "Read count", "kind": "int", "default": 10000 },
    { "name": "read_length", "label": "Read length", "kind": "int", "default": 150 },
    { "name": "n_rate", "label": "N rate", "kind": "float", "default": 0.01 },
    { "name": "random_seed", "label": "Random seed", "kind": "int", "default": 42 }
  ]
}
```

### 2. FastQ file analysis

This should be treated as a separate task family from generation.

- `task_kind = fastq-analysis`
- `runtime_mode = file` or `form+file`
- `result_mode = report`

First implementation should prefer simplicity:

- require the user to choose a file
- run browser-local analysis
- show summary metrics in the page

Only after that is stable should we add optional analysis parameters.

### 3. Financial Excel mock file generation

This is a file-generation task, not an analysis task.

- `task_kind = excel-generator`
- `runtime_mode = form`
- `result_mode = download`

Typical fields may include:

- `row_count`
- `sheet_name`
- `currency`
- `company_name`
- `random_seed`

The output should be a downloadable spreadsheet-like artifact, likely `.csv` first and `.xlsx` later if needed.

### 4. Financial report analysis

This is different from Excel generation and should not share the same runtime contract.

- `task_kind = finance-report-analysis`
- `runtime_mode = file` or `form+file`
- `result_mode = report`

Typical first-version behavior:

- user uploads one report file
- MoonAP analyzes it locally
- MoonAP displays a structured report in browser
- optional downloadable report can be added later

This keeps the flow simple:

- upload
- run
- review result
- optionally save as SKILL

### 5. Browser mini game

This is the most different task family and should not be forced into a file-download pattern.

- `task_kind = browser-game`
- `runtime_mode = interactive`
- `result_mode = interactive`

For this case, `runtime_spec` may be very small:

```json
{
  "title": "Launch browser game",
  "action_label": "Run game",
  "fields": []
}
```

This keeps the model simple while still fitting into the same overall runtime framework.

## Example unified mapping

| Task scenario | task_kind | runtime_mode | result_mode |
| --- | --- | --- | --- |
| Generate FastQ file | `fastq-generator` | `form` | `download` |
| Analyze FastQ file | `fastq-analysis` | `file` or `form+file` | `report` |
| Generate financial Excel mock file | `excel-generator` | `form` | `download` |
| Analyze financial report | `finance-report-analysis` | `file` or `form+file` | `report` |
| Browser mini game | `browser-game` | `interactive` | `interactive` |

## Current implementation direction

MoonAP has already started moving toward this abstraction:

- runtime requests now carry `task_kind`
- runtime requests now carry a browser-renderable runtime schema
- the browser runtime form is no longer tied only to fixed FastQ field ids

At the moment, FastQ generation is the first fully usable runtime schema instance. That is acceptable for this stage.

The important part is that the shape is now reusable.

## What should stay simple for now

The following should remain intentionally minimal in the near term:

- task classification
- runtime form schema
- result mode vocabulary
- browser rendering rules

MoonAP should resist the temptation to turn this into a very general framework too early.

## Recommended next rollout order

1. Keep `fastq-generator` as the first validated schema-driven runtime task
2. Add `excel-generator` as the second downloadable-file task
3. Add `finance-report-analysis` or `fastq-analysis` as the first file-input analysis task
4. Add `browser-game` as the first interactive runtime task

This order tests the abstraction progressively without making the architecture too complicated too early.

## Decision summary

MoonAP should adopt a lightweight runtime abstraction based on:

- `task_kind`
- `runtime_mode`
- `runtime_spec`
- `result_mode`

This is enough to support the currently planned task families while keeping the system understandable and maintainable.
