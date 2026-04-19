# MoonAP MoonBit-first Development Plan

## Goal

MoonAP is a MoonBit Agent Playground: natural language becomes MoonBit task code, MoonBit compiles to WebAssembly, and the browser runs that program against local files without uploading private file contents.

## Current milestone

Build the smallest honest MoonBit-first server:

- MoonBit owns health JSON, route policy, LLM routing policy, file preview policy, task kernel protocol, skill registry, normalized agent context, the HTTP server, and the browser frontend state machine.
- The first server uses `moonbitlang/async/http` on the native backend.
- The first frontend uses MoonBit's JavaScript backend; DOM and `fetch` remain thin host FFI boundaries.
- Browser calls `/api/agent/context` and receives MoonBit-generated `AgentSessionContext`.

## Phase 1

- Keep `/api/health` and `/api/policies` stable.
- Add tests for MoonBit route policy and privacy defaults.
- Keep compile and LLM routes as explicit planned MoonBit service boundaries.
- Keep `cmd/web_app` as the owner of browser chat state and API routing.

## Phase 2

- Add typed `TaskRequest`, `TaskPlan`, and `TaskResult`.
- Move prompt construction into MoonBit.
- Make `/api/agent/route` choose FastQ, CSV, spreadsheet, JSON, game, or chat.
- Add MoonAP-SKILL-Hub as the public entry point for new users.
- Add Personal-MoonAP-SKILL-Set as the local reuse target for validated LLM-generated MoonBit programs.

## SKILL Architecture

MoonAP uses two compatible skill stores:

- `MoonAP-SKILL-Hub`: public, GitHub-hosted, curated, and organized by domain and category.
- `Personal-MoonAP-SKILL-Set`: local, user-owned, and layout-compatible with the hub.

Each SKILL is an Anthropic-style folder:

```text
skill-folder/
  SKILL.md
  moonap.skill.json
  program/
```

`SKILL.md` describes the capability, when to use it, inputs, parameters, privacy, runtime, and outputs. `moonap.skill.json` is the machine-readable manifest. `program/` contains MoonBit source code compiled to WebAssembly for browser-local execution.

Default parameters are part of the manifest and the MoonBit run plan:

- FastQ base counter: `target_base = N`.
- Financial spreadsheet extraction: `amount_column = amount`, `operation = max_row`.
- Gomoku: `play_mode = single_player`, `board_size = 15`.

LLM-generated artifacts become personal skills only after:

- Manifest generation.
- Optional formal-verification gate when the user enables it.
- MoonBit compile validation.
- Browser runtime validation.
- User approval to save into `Personal-MoonAP-SKILL-Set`.

## Formal Verification Reserve

MoonBit 0.9 introduced formal-verification syntax and tooling that MoonAP can later use for higher-trust LLM-generated programs. MoonAP reserves this as a user-configurable, off-by-default artifact pipeline step:

```text
LLM MoonBit code generation
  -> optional formal verification with moon prove
  -> MoonBit-to-Wasm compilation
  -> browser-local execution
```

The planned verification artifacts include `.mbt` source files and `.mbtp` predicate files. The planned contract surface includes `proof_requires`, `proof_ensures`, `proof_invariant`, and `proof_assert`.

## Phase 3

- Implement `/api/artifact/compile` as a MoonBit service driven by a MoonBit `CompilerPlan`.
- Compile one generated FastQ kernel to Wasm.
- Run the Wasm in the browser against a local file stream.

## Competition demo target

User opens MoonAP, attaches a FastQ file, asks for N-base analysis, MoonAP sends only intent and metadata to the LLM, compiles the generated MoonBit kernel to Wasm, runs it locally in the browser, and answers directly in chat.
