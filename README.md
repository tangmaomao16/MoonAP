# MoonAP

MoonAP means MoonBit Agent Playground.

This project aims to build a ChatGPT-like web application with a MoonBit-first workflow:

- users describe a task in natural language
- MoonAP generates MoonBit code
- the system compiles that MoonBit code to WebAssembly
- the browser runs the generated program directly

The project is designed for the MoonBit software development competition, so the long-term goal is to move more of the agent logic into MoonBit itself, not just use MoonBit as a compilation target.

## Project Vision

MoonAP is especially suited for two kinds of scenarios:

- data-oriented local analysis, such as FastQ file inspection and statistics
- browser-native interactive programs, such as small games generated from prompts

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
- switch between dedicated task modes
- let the server generate MoonBit code
- compile the generated MoonBit code to Wasm
- run the Wasm result in the browser

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
- a `ready_for_wasm` gate

This is the beginning of moving agent state management into MoonBit using JSON-friendly typed structures.

## Tests

Run MoonBit tests:

```powershell
cd C:\my_work\MoonBit_Competition\GitHub\MoonAP\moonap
moon test
```

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
- MoonBit code artifact generation
- automatic MoonBit -> Wasm compilation
- browser-side Wasm execution
- MoonBit version display in the UI
- MoonBit-side agent context JSON model and verification gate demo

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
