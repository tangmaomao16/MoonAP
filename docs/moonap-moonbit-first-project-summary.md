# MoonAP MoonBit-first Project Summary

This document summarizes the current MoonAP prototype and provides a clean starting blueprint for a new MoonBit-first implementation. The goal of the new project is to build MoonAP as a general MoonBit Agent Playground, with the server authored in MoonBit from the beginning and host JavaScript kept as a thin runtime adapter only where Node.js or browser APIs are unavoidable.

## 1. Product Vision

MoonAP means MoonBit Agent Playground.

The product should feel like a ChatGPT-style workspace where users can:

- Configure one or more cloud LLM providers.
- Chat with an Agent that understands tasks and files.
- Ask the Agent to generate MoonBit code.
- Compile generated MoonBit code to WebAssembly.
- Run the WebAssembly program locally in the browser.
- Attach local files without uploading their private data to cloud LLM providers.
- Reuse built-in SKILLs such as FastQ analysis, sample-file generation, mini-games, CSV analysis, JSON inspection, and log analysis.

The core idea is:

```text
Natural language -> MoonBit Agent -> MoonBit task kernel -> WebAssembly -> Browser-local execution
```

For competition positioning, MoonAP should not look like a FastQ-only tool. FastQ analysis is only the first strong demo SKILL. The platform itself should be generic.

## 2. Current Prototype Status

The current MoonAP repository already demonstrates several important capabilities:

- A ChatGPT-like browser UI.
- LLM provider configuration for Gemini, SiliconFlow, Z.AI/GLM, and OpenRouter.
- Browser-side LLM calls using user-provided API keys stored in the browser.
- LLM Router model rotation with basic provider/model selection.
- MoonBit-generated policy JSON for task routing, LLM routing, file policy, compiler plan, and codegen prompt policy.
- MoonBit-authored server entry compiled to JavaScript with `moon build --target js`.
- A working FastQ attachment workflow:
  User attaches a FastQ file, asks for N-base analysis, MoonAP asks the LLM to generate MoonBit code, compiles it to Wasm, then runs the Wasm kernel over the browser-local file.
- A built-in FastQ sample generator SKILL.
- A result display pattern that should become:
  direct answer in chat, detailed result in a collapsible/result panel.

However, the prototype is still hybrid:

- Runtime conversation history is mostly managed in `web/chat.js`.
- Browser-side LLM message construction is mostly JavaScript.
- Some server behavior is MoonBit-authored but implemented through JS extern blocks.
- File adapters are still too explicit for FastQ.
- The product currently has a proven FastQ path, but generic file-task execution is not fully implemented yet.

## 3. Main Lessons Learned

### 3.1 Keep MoonAP Generic

FastQ is a strong demo, but the platform must stay generic.

Do not build the whole product around `fastq-agent`. Instead, use a generic task model:

```text
TaskRequest
TaskContext
TaskPlan
TaskKernel
TaskResult
```

FastQ, CSV, XLSX, JSON, logs, and games should all be SKILLs or task profiles built on top of the same protocol.

### 3.2 The UI Should Answer First

When the user asks:

```text
Count the number of N bases in this FastQ file.
```

The main chat answer should be:

```text
4 N bases were found in fastq-gc-mixed.fastq.
```

Detailed metrics should be hidden in a Results or Advanced panel. The user should not be forced to read a benchmark-style report unless they ask for it.

### 3.3 File Privacy Is a Key Selling Point

The LLM should receive:

- User intent.
- File name.
- File type.
- File size.
- Small optional preview or schema.
- Host-provided task context.

The LLM should not receive large private file contents by default.

The generated Wasm should run against local browser file chunks.

### 3.4 MoonBit Should Own Agent Context

MoonBit is strong at typed data structures and JSON modeling. Therefore, the new project should put these in MoonBit from the start:

- Conversation context.
- File attachment metadata.
- Task routing.
- LLM routing policy.
- Codegen prompt policy.
- Repair prompt policy.
- Artifact validation policy.
- Task result schema.

JavaScript should not be the primary owner of agent context.

### 3.5 Protocols Should Be Small And Loose

Do not overfit protocols to FastQ.

A good task kernel protocol should be simple:

```text
init -> ingest -> finalize
```

But the host should accept multiple compatible shapes:

- Whole-file text tasks.
- Streaming text tasks.
- Streaming byte tasks.
- Structured rows.
- Interactive browser/game tasks.
- Downloadable file generation tasks.

The protocol should guide LLM-generated code, not trap it in a narrow signature.

## 4. Recommended New Project Architecture

The new MoonAP project should be organized as follows.

```text
moonap/
  moon.mod.json
  src/
    agent/
      context.mbt
      message.mbt
      task_request.mbt
      task_plan.mbt
      task_result.mbt
    llm/
      provider.mbt
      router.mbt
      prompt_builder.mbt
      repair_prompt.mbt
    server/
      router.mbt
      http_contract.mbt
      handlers.mbt
      response.mbt
    task/
      kernel_protocol.mbt
      artifact.mbt
      validation.mbt
      compiler_plan.mbt
    skills/
      registry.mbt
      fastq.mbt
      csv.mbt
      json.mbt
      game.mbt
    file/
      metadata.mbt
      type_detect.mbt
      preview_policy.mbt
    runtime/
      wasm_runner_contract.mbt
      browser_adapter_contract.mbt
  cmd/
    server/
      main.mbt
    policy_dump/
      main.mbt
web/
  index.html
  app.js
  style.css
host/
  node_http_adapter.mjs
  node_fs_adapter.mjs
  node_process_adapter.mjs
  browser_wasm_adapter.js
docs/
  architecture.md
  skill-development.md
  llm-router.md
  task-kernel-protocol.md
```

The important principle:

```text
MoonBit owns product logic.
Host JS owns only platform APIs.
```

## 5. MoonBit-owned Core Types

The new project should define typed JSON structures early.

Example conceptual model:

```moonbit
pub struct AgentMessage {
  role : String
  content : String
  timestamp : String
} derive(ToJson, FromJson, Eq, Debug)

pub struct FileAttachment {
  name : String
  size_bytes : Int64
  detected_type : String
  mime_type : String
  privacy_level : String
} derive(ToJson, FromJson, Eq, Debug)

pub struct AgentSessionContext {
  session_id : String
  messages : Array[AgentMessage]
  selected_mode : String
  attachments : Array[FileAttachment]
  active_skill : String?
  task_plan : TaskPlan?
} derive(ToJson, FromJson, Eq, Debug)

pub struct TaskResult {
  direct_answer : String
  result_kind : String
  details_markdown : String
  metrics_json : Json?
  downloads : Array[GeneratedDownload]
} derive(ToJson, FromJson, Eq, Debug)
```

The browser should ask MoonBit to build or update this context, then use the returned JSON for LLM calls and UI rendering.

## 6. Server Design

The ideal server should be a MoonBit-authored HTTP service.

If MoonBit cannot directly bind all Node.js APIs yet, use a thin JS host adapter:

```text
MoonBit server router
  -> host_http_listen extern
  -> host_read_body extern
  -> host_send_json extern
  -> host_static_file extern
```

The server route table should be MoonBit-owned:

```text
GET  /
GET  /api/health
GET  /api/policies
POST /api/agent/context
POST /api/agent/route
POST /api/llm/complete
POST /api/artifact/compile
POST /api/artifact/repair
POST /api/task/execute
```

Recommended first implementation:

- Keep LLM network calls in the browser where user API keys are stored.
- Use server only for compiling MoonBit to Wasm.
- Add server-side LLM fallback later.

This reduces privacy and credential risks.

## 7. LLM Router Design

The LLM Router should be MoonBit-owned and browser-executed through exported JSON policy.

Recommended provider hierarchy:

- Gemini: primary if quota is available.
- SiliconFlow DeepSeek: reliable domestic fallback.
- Z.AI/GLM: useful when accessible.
- OpenRouter: optional fallback only.

User should configure API keys per provider, not per model.

The model pool should allow checkboxes:

```text
[x] Gemini / Gemini 3 Flash
[x] SiliconFlow / DeepSeek R1 Distill Qwen 32B
[ ] GLM / GLM 5.1
[ ] OpenRouter / Free Router
```

Routing rules:

- Prefer checked models sorted by priority.
- Skip models with recent rate-limit failures.
- Cool down 429 routes longer than network failures.
- Store route health in browser local storage.
- Never delete the user API key automatically.

## 8. Task Kernel Protocol

Keep the protocol generic:

```text
TaskKernel:
  init(context) -> state
  ingest(state, chunk_or_event) -> state
  finalize(state) -> TaskResult
```

Then allow SKILL-specific adapters:

- FastQ streaming bytes.
- CSV structured rows.
- XLSX structured rows after host preprocessing.
- JSON whole text or parsed tree.
- Logs streaming lines.
- Browser games interactive events.

The LLM should receive the generic protocol plus a small SKILL-specific note, not a huge rigid spec.

## 9. FastQ SKILL As First Real Demo

FastQ remains the first benchmark-quality SKILL because it demonstrates:

- Local file privacy.
- Streaming analysis.
- Large file capability.
- MoonBit string/byte processing.
- WebAssembly execution in browser.

Correct FastQ assumptions:

- Every record has four lines.
- Line 1 starts with `@`.
- Line 2 is the sequence.
- Line 3 starts with `+`.
- Line 4 is the quality string.
- Base counts must only use sequence lines, not quality lines.

Example:

```text
@read_1
NNNNATGCNN
+
IIIIIIIIII
```

Only `NNNNATGCNN` is sequence data.

## 10. Product UI Principles

The default page should be minimal:

```text
MoonAP: MoonBit Agent Playground.
Configure LLM API and chat, or directly run early SKILLs.
```

Main visible controls:

- Chat input.
- Attach file button.
- LLM button.
- SKILL button.
- Progress button.
- Send button.

Do not show protocol, benchmark, source files, or build logs by default.

Use panels:

- Chat: direct answers only.
- Results: user-facing task results.
- Artifact: generated MoonBit code and program output.
- Advanced: build logs, progress, protocol, validation, routing details.

## 11. Development Roadmap For The New Project

### Phase 1: MoonBit Server Skeleton

- Create a new MoonBit module.
- Implement route table in MoonBit.
- Serve static web files through a thin Node host adapter.
- Add `/api/health`.
- Add `/api/policies`.
- Add tests for route policy JSON.

### Phase 2: MoonBit Agent Context

- Implement `AgentSessionContext`.
- Implement `TaskRequest`.
- Implement `TaskResult`.
- Add `/api/agent/context`.
- Frontend sends raw input; MoonBit returns normalized context JSON.
- Add JSON round-trip tests.

### Phase 3: LLM Router Policy

- Implement provider/model policy in MoonBit.
- Browser stores API keys.
- Browser uses MoonBit policy to route calls.
- Add cooldown and rate-limit metadata.

### Phase 4: MoonBit Codegen Prompt Builder

- Move system prompt and repair prompt construction into MoonBit.
- JS only calls:

```text
/api/prompt/build
/api/prompt/repair
```

### Phase 5: Compile Service

- Implement compile request validation in MoonBit.
- Host adapter runs `moon build`.
- Return Wasm base64 and build log.
- Add no-fallback strict compile mode.

### Phase 6: Generic Attachment Tasks

- Implement file metadata and type detection.
- Add generic whole-file and streaming protocols.
- Keep FastQ as first supported execution adapter.
- Add CSV text rows next.
- Add XLSX via host-side preprocessing later.

### Phase 7: SKILL Library

- Store SKILL metadata in MoonBit.
- Each SKILL declares:
  - name
  - input types
  - task protocol
  - prompt hint
  - validation rules
  - result schema

### Phase 8: Competition Polish

- Create a reliable demo script.
- Prepare small and large FastQ samples.
- Prepare one non-FastQ demo, such as CSV expense filtering.
- Add screenshots and a short architecture diagram.
- Add a `README.md` that clearly says the server is MoonBit-authored.

## 12. What To Avoid

- Do not hardcode the platform as FastQ-only.
- Do not show huge reports in the main chat answer.
- Do not send large local file contents to the LLM by default.
- Do not let JavaScript own the core Agent state.
- Do not require users to understand MoonBit build logs unless they open Advanced.
- Do not rely on a single LLM provider.
- Do not make the task kernel protocol too strict too early.

## 13. Suggested New Repository Name

Possible names:

- `MoonAP`
- `MoonAP-MoonBit`
- `MoonAP-MoonBit-Server`
- `MoonAP-Core`

If the current repository keeps the experimental migration history, the clean new project can use:

```text
MoonAP-MoonBit
```

## 14. One-sentence Competition Positioning

MoonAP is a MoonBit Agent Playground that turns natural-language tasks into browser-local WebAssembly programs, letting users analyze private local files and run custom generated tools without uploading their data.

## 15. Recommended First Milestone

The first real milestone for the new project should be:

```text
User opens MoonAP -> configures Gemini or SiliconFlow API -> attaches a FastQ file -> asks "Count N bases" -> MoonBit server builds AgentContext JSON -> LLM generates MoonBit task kernel -> server compiles to Wasm -> browser runs Wasm locally -> chat shows direct answer.
```

This milestone is small enough to finish, strong enough for a live demo, and generic enough to extend to CSV/XLSX/log/JSON tasks afterward.
