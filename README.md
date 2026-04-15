# MoonAP

MoonAP means MoonBit Agent Playground.

This project aims to build a ChatGPT-like web application with a MoonBit-first workflow:

- users describe a task in natural language
- MoonAP generates MoonBit code
- the system compiles that MoonBit code to WebAssembly
- the browser runs the generated program directly

The project is designed for the MoonBit software development competition, so the long-term goal is to move more of the agent logic into MoonBit itself, not just use MoonBit as a compilation target. The intended end state is a MoonBit software synthesis platform for local-first data computing.

## Project Vision

MoonAP is especially suited for two kinds of scenarios:

- data-oriented local analysis, especially FastQ file inspection and statistics
- browser-native interactive programs, such as small games generated from prompts

The primary competition scenario is local FastQ analysis:

- analyze GB-level sequencing files without uploading them to the cloud
- synthesize MoonBit projects for the requested analysis
- compile them to WebAssembly
- run them in the browser while keeping data on the user's machine

The intended architecture is:

1. natural language -> structured agent task
2. agent context and validation -> MoonBit
3. MoonBit program generation -> WebAssembly
4. browser execution -> visible result

## Current Repository Layout

- `moonap/`: MoonBit core package, agent policies, compiler plan, and MoonBit-authored server entry
- `server/`: legacy JS adapter modules used by the MoonBit-authored server for platform I/O, LLM calls, and compiler process execution
- `web/`: browser UI
- `samples/`: sample local files for experiments

## Quick Start

Requirements:

- Node.js
- MoonBit toolchain with `moon` available in `PATH`

Start the web app from the project root:

```powershell
cd C:\my_work\MoonBit_Competition\GitHub\MoonAP
npm run dev
```

Then open:

[http://localhost:3000](http://localhost:3000)

`npm run dev` and `npm start` now launch the MoonBit-authored JS-target server from `moonap/cmd/server_native`.

If port 3000 is already occupied, use:

```powershell
npm run start:moonbit-server:3001
```

There is no separate JavaScript server start script now. The product start path is the MoonBit-authored server.

## How To Experience MoonAP

In the current prototype, you can:

- chat with the assistant in the browser in a ChatGPT-style interface
- enter your own LLM API settings in the sidebar
- attach a browser-local FastQ file for local-first analysis
- choose a browser-local FastQ file with the file picker and let MoonBit Wasm analyze it directly in the browser
- run browser-local FastQ analysis without sending the file contents to the server
- build a MoonBit Wasm analysis report app directly from browser-local FastQ analysis results
- verify that the active FastQ analysis kernel is the generated MoonBit Wasm module
- switch between dedicated task modes
- let the server generate MoonBit code
- compile the generated MoonBit code to Wasm
- run the Wasm result in the browser
- inspect the generated project manifest, source files, verification gate, reusable skills, benchmark profile, and benchmark report
- inspect the task kernel protocol that defines what the browser host does and what the MoonBit kernel does

Current workflow modes:

- `Chat`: general conversation, planning, and design work
- `MoonBit Builder`: generate MoonBit code for a practical task
- `FastQ Analyst`: inspect a local FastQ file and produce analysis logic
- `Game Studio`: prototype a browser mini-game with MoonBit and Wasm-friendly logic

Suggested prompts:

- `Please analyze this FastQ file, count N bases, compute the ratio, and generate a MoonBit demo program.`
- `Generate a small browser game in MoonBit that can be compiled to WebAssembly.`
- `Generate a MoonBit tool that reads user intent, tracks context as JSON, and prepares a Wasm-ready task pipeline.`

FastQ sample files for manual testing are available in:

- [FASTQ_SAMPLES.md](/C:/my_work/MoonBit_Competition/GitHub/MoonAP/samples/FASTQ_SAMPLES.md:1)
- [fastq-small.fastq](/C:/my_work/MoonBit_Competition/GitHub/MoonAP/samples/fastq-small.fastq:1)
- [fastq-n-heavy.fastq](/C:/my_work/MoonBit_Competition/GitHub/MoonAP/samples/fastq-n-heavy.fastq:1)
- [fastq-gc-mixed.fastq](/C:/my_work/MoonBit_Competition/GitHub/MoonAP/samples/fastq-gc-mixed.fastq:1)

## MoonBit Core Entry

Besides the web app, the MoonBit package now has its own runnable demo entry.

Run:

```powershell
cd C:\my_work\MoonBit_Competition\GitHub\MoonAP\moonap
moon run cmd/main
```

This prints a demo `AgentContext` as formatted JSON. The current MoonBit core models:

- chat messages
- task specifications
- verification checks
- generated file tracking
- synthesis manifests
- benchmark profiles
- reusable skills
- a `ready_for_wasm` gate

This is the beginning of moving agent state management into MoonBit using JSON-friendly typed structures.

## Task Kernel Protocol

MoonAP now includes a generic task kernel protocol so the platform does not assume every task is the same kind of FastQ chunk counter.

The protocol gives each synthesized MoonBit artifact a stable contract:

- `input mode`: streaming bytes, streaming text, whole-file bytes, whole-file text, or interactive events
- `state type`: the MoonBit state owned by the kernel
- `init`, `ingest`, `finalize`: the lifecycle entrypoints the host and kernel agree on
- `host responsibilities`: browser file APIs, local chunk reads, UI rendering, and bridge logic
- `kernel responsibilities`: MoonBit task state, parsing, analysis, and result production

Current built-in protocol families are:

- `moonap.fastq.streaming.v1`
- `moonap.workflow.whole-file.v1`
- `moonap.browser.interactive.v1`

See the full protocol note in [docs/task-kernel-protocol.md](/C:/my_work/MoonBit_Competition/GitHub/MoonAP/docs/task-kernel-protocol.md:1).

## Tests

Run MoonBit tests:

```powershell
cd C:\my_work\MoonBit_Competition\GitHub\MoonAP\moonap
moon test
```

Run the reproducible FastQ benchmark suite:

```powershell
cd C:\my_work\MoonBit_Competition\GitHub\MoonAP
npm run benchmark:fastq
```

This writes the latest benchmark artifacts to:

- `.moonap-artifacts/benchmarks/fastq-benchmark-latest.json`
- `.moonap-artifacts/benchmarks/fastq-benchmark-latest.md`

When `samples/` contains saved `.fastq` or `.fq` files, the benchmark suite now includes them automatically. This means generated files such as [simulated_5mb.fastq](/C:/my_work/MoonBit_Competition/GitHub/MoonAP/samples/simulated_5mb.fastq) become part of the official MoonAP benchmark evidence instead of living outside the main workflow.

## Optional Remote Model Configuration

By default, MoonAP can run with local mock generation so the full workflow is still demoable without an API key.

If you want to connect an OpenAI-compatible endpoint, set:

- `OPENAI_BASE_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Example:

```powershell
$env:OPENAI_BASE_URL="https://your-endpoint/v1"
$env:OPENAI_API_KEY="sk-..."
$env:OPENAI_MODEL="gpt-4.1-mini"
npm run dev
```

## Current Status

Already implemented:

- MoonBit-authored JS-target server entry as the default `npm run dev` / `npm start` path
- MoonBit-owned server contract, task router policy, LLM router policy, file analysis policy, artifact validation policy, attachment runtime contract, and compiler plan
- MoonBit-owned server runtime manifest exposed at `/api/server-runtime`
- single MoonBit server bootstrap payload exposed at `/api/server-bootstrap` and used by the MoonBit-authored server entry
- MoonBit-owned LLM prompt policy for chat, MoonBit code generation, repair, and generated-file instructions
- remaining `server/lib/*.mjs` files are treated as temporary Node platform adapters for HTTP/network/filesystem/process integration, not as the product server entry
- ChatGPT-style browser interface
- mode picker for product workflows
- custom LLM API configuration in the UI
- local file inspection API
- FastQ-oriented local analysis path
- richer FastQ metrics including GC ratio, average read length, and chunk-ready benchmark planning
- MoonBit code artifact generation
- multi-file MoonBit project synthesis protocol
- generic MoonBit task kernel protocol for streaming, whole-file, and interactive tasks
- multi-file MoonBit -> Wasm compilation pipeline
- project manifest generation
- generated source file workbench
- reusable skill summaries
- verification gate summaries
- server-driven benchmark readiness profile
- benchmark panel with current-size chunk estimates and metric snapshots for FastQ analysis
- FastQ benchmark report for local competition-style evaluation
- reproducible FastQ benchmark suite with synthetic datasets and Wasm build validation
- browser-local FastQ chunk analysis path for a true local-first demo
- browser-local FastQ analysis -> MoonBit Wasm report synthesis mainline
- Wasm-exported FastQ byte classifiers for browser-side verification
- automatic MoonBit -> Wasm compilation
- browser-side Wasm execution
- MoonBit version display in the UI
- MoonBit-side agent context JSON model and verification gate demo

## Competition Narrative

MoonAP is not only a chat interface. It is intended to evolve into a MoonBit software synthesis system:

1. understand a natural-language task
2. normalize it into a MoonBit-friendly spec
3. synthesize a small MoonBit project instead of a single code snippet
4. apply verification gates and engineering checks
5. compile to WebAssembly
6. run the result locally in the browser

The strongest showcase path is FastQ analysis with local-first execution and benchmarkable chunk-based processing.

MoonAP now also exposes the synthesized MoonBit source files directly in the UI, so users and judges can inspect the actual multi-file artifact that is being compiled instead of only reading a high-level manifest.

## Competition-Oriented Next Steps

The most important next steps for this project are:

- migrate more agent orchestration logic from `server/` into `moonap/`
- use MoonBit JSON support to store and evolve multi-turn context
- add stronger verification before code generation and before Wasm execution
- support richer FastQ workflows
- support richer browser game templates
- support multi-file MoonBit project generation

## License

This repository currently contains the original `moonap/` package scaffold under Apache-2.0, and the surrounding prototype code for MoonAP development.



