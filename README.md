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

- `moonap/`: MoonBit core package and demo agent context model
- `server/`: Node.js server that handles chat requests, local file inspection, and MoonBit compilation
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

## How To Experience MoonAP

In the current prototype, you can:

- chat with the assistant in the browser in a ChatGPT-style interface
- enter your own LLM API settings in the sidebar
- attach a local file path for inspection
- inspect or analyze a local file before starting a synthesis chat
- choose a browser-local FastQ file and run chunk-based analysis without sending the file to the server
- build a MoonBit Wasm report artifact directly from browser-local FastQ analysis results
- switch between dedicated task modes
- let the server generate MoonBit code
- compile the generated MoonBit code to Wasm
- run the Wasm result in the browser
- inspect the generated project manifest, source files, verification gate, reusable skills, benchmark profile, and benchmark report

Current workflow modes:

- `Chat`: general conversation, planning, and design work
- `MoonBit Builder`: generate MoonBit code for a practical task
- `FastQ Analyst`: inspect a local FastQ file and produce analysis logic
- `Game Studio`: prototype a browser mini-game with MoonBit and Wasm-friendly logic

Suggested prompts:

- `Please analyze this FastQ file, count N bases, compute the ratio, and generate a MoonBit demo program.`
- `Generate a small browser game in MoonBit that can be compiled to WebAssembly.`
- `Generate a MoonBit tool that reads user intent, tracks context as JSON, and prepares a Wasm-ready task pipeline.`

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

- ChatGPT-style browser interface
- mode picker for product workflows
- custom LLM API configuration in the UI
- local file inspection API
- FastQ-oriented local analysis path
- richer FastQ metrics including GC ratio, average read length, and chunk-ready benchmark planning
- MoonBit code artifact generation
- multi-file MoonBit project synthesis protocol
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



