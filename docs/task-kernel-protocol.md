# MoonAP Task Kernel Protocol

MoonAP uses a task kernel protocol to separate the browser host shell from the MoonBit task kernel.

The host is allowed to:

- collect browser input, local files, and user intent
- read local files with browser APIs
- bridge bytes, text, or events into the generated MoonBit/Wasm module
- render progress, logs, benchmark output, and final results

The MoonBit task kernel is expected to:

- own task-specific state
- ingest host-provided input in a stable format
- return a browser-safe result
- remain compatible with MoonBit -> Wasm compilation

## Protocol Shape

Each synthesized artifact can expose:

- `protocolName`
- `inputMode`
- `stateType`
- `initFn`
- `ingestFn`
- `finalizeFn`
- `hostResponsibilities`
- `kernelResponsibilities`

This is represented in:

- MoonBit core types in [moonap.mbt](/C:/my_work/MoonBit_Competition/GitHub/MoonAP/moonap/moonap.mbt:1)
- server-side protocol catalog in [task-kernel-protocol.mjs](/C:/my_work/MoonBit_Competition/GitHub/MoonAP/server/lib/task-kernel-protocol.mjs:1)
- synthesized artifacts emitted by [mock-v3.mjs](/C:/my_work/MoonBit_Competition/GitHub/MoonAP/server/lib/mock-v3.mjs:1)

## Input Modes

- `streaming-bytes`
  Best for large local files such as FastQ, logs, and binary-ish text streams. The host reads chunks and forwards them to the MoonBit kernel.
- `streaming-text`
  Best for line-oriented text streams where host-side decoding is acceptable.
- `whole-file-bytes`
  Best for medium-sized files that should be parsed as one buffer.
- `whole-file-text`
  Best for single documents, task specs, or small structured files.
- `interactive`
  Best for browser games and event-driven runtimes.

## Current Protocols

### `moonap.fastq.streaming.v1`

- Input mode: `streaming-bytes`
- State type: `FastqStreamingState`
- Host role: open the browser-local file, read chunks, bridge them into Wasm, and render progress
- Kernel role: maintain cross-chunk carry state, advance the FastQ state machine, accumulate metrics, and finalize a report

### `moonap.workflow.whole-file.v1`

- Input mode: `whole-file-text`
- State type: `WorkflowTaskState`
- Host role: collect normalized task text and optional files
- Kernel role: transform the task input into a MoonBit-friendly workflow result

### `moonap.browser.interactive.v1`

- Input mode: `interactive`
- State type: `GameRuntimeState`
- Host role: forward input events and timing
- Kernel role: own gameplay state transitions and emit render-safe frame summaries

## Why This Matters

This protocol lets MoonAP support more than one fixed FastQ pipeline.

- FastQ can use stateful chunk streaming.
- Table files can use header-aware whole-file or streaming parsing.
- Browser games can use event-driven kernels.

That means future LLM-generated MoonBit code can target a stable kernel contract instead of reinventing browser glue on every task.
