# MoonAP Competition Submission Notes / 竞赛结题说明

This document is the release-oriented entry point for the MoonBit Large Software Synthesis Challenge submission.

中文摘要：MoonAP 的最终定位是 **MoonBit Agent Playground**，不是 FastQ 专用工具。项目完成了一条面向软件合成的通用链路：用户用自然语言描述 APP，LLM 生成 MoonBit 程序，MoonAP 编译为 WebAssembly，浏览器在本地运行，成功的 APP 可以保存为 MoonAP SKILL 并复用。FastQ 大文件生成/分析保留为高价值的大文件浏览器本地计算样例，但 v0.1 还覆盖 CSV、JSON、文本分析和多个计算器类通用 APP。

## Project Positioning

MoonAP is a **MoonBit Agent Playground**.

It explores a software-synthesis workflow where an LLM writes MoonBit programs, MoonAP compiles them to WebAssembly, and users run the generated apps locally in the browser. Successful apps can be saved as MoonAP SKILLs and reused later without another LLM call.

The original proposal used FastQ data processing as a motivating problem. That motivation still matters, especially for privacy-preserving large-file workflows, but the final project should be evaluated as a broader platform:

```text
natural language -> MoonBit code -> WebAssembly -> browser-local app -> reusable SKILL
```

## Why MoonAP Fits the Challenge

MoonAP demonstrates large-scale software synthesis at two levels:

1. **The system itself is a MoonBit-first agent application.**
   The server, browser app, build scripts, runtime orchestration, and validation flow are organized around the MoonBit toolchain.

2. **The system synthesizes new MoonBit apps.**
   Users can ask for utilities such as calculators, JSON formatters, text analyzers, CSV analyzers, or large FastQ tools. MoonAP compiles the generated MoonBit source and runs it as a browser app.

3. **Generated apps become reusable assets.**
   The SKILL mechanism turns a successful generated app into a local reusable package with `SKILL.md`, `program/main.mbt`, `program/main.wasm`, and optional ZIP distribution.

4. **The project has a real privacy and local-compute story.**
   Large files are processed in the browser. File contents are not uploaded to the LLM.

## Current v0.1 Demonstration Matrix

| Capability family | Demo examples | Runtime path |
| --- | --- | --- |
| Computed form apps | Celsius/Fahrenheit, minutes/seconds, BMI, circle, loan, tip | Generic runtime spec |
| Text and JSON utilities | JSON formatter, text analyzer | Generic browser-local tool runtime |
| Browser-local file utility | CSV summary analyzer | Generic file runtime with browser file picker |
| Large-file generation | Large FastQ generator | Browser-local streamed writer |
| Large-file analysis | Large FastQ analyzer | Browser-local chunked reader/report |
| Reuse | Personal SKILL, Local SKILL-Hub | Artifact-driven SKILL runtime |
| Sharing/install | Cloud SKILL-Hub | Discovery and ZIP install only |

## Evaluation-Criteria Mapping

### Functional Completeness

- Natural-language prompt to generated MoonBit source.
- MoonBit build/compile to WebAssembly.
- Browser-local runtime forms and result cards.
- Generic runtime contracts embedded in generated MoonBit source.
- Personal SKILL save and reuse.
- Cloud SKILL discovery and Local SKILL install/reuse.
- Large FastQ generation and analysis with browser-local file handling.
- Validation scripts for 12 v0.1 demo categories and SKILL package integrity.

### Engineering Quality

- MoonBit packages follow the repository's `moon.pkg` / `moon.mod.json` structure.
- Windows build/restart scripts encapsulate MSVC setup.
- `web/app*.js` distribution bundles are committed for fresh-clone startup fallback.
- `tools\test-demo-prompts.ps1` and `tools\test-skill-flow.ps1` provide repeatable local checks.
- `.gitignore` excludes build outputs, logs, local runtime data, and secrets.
- Apache 2.0 license is included.

### Explainability and Documentation

- Root [README.md](README.md) explains install, run, LLM configuration, demos, and validation.
- [docs/README.md](docs/README.md) indexes architecture, plans, modes, notes, and experiments.
- [docs/architecture/lightweight-task-runtime-abstraction.md](docs/architecture/lightweight-task-runtime-abstraction.md) explains the runtime abstraction.
- [docs/architecture/moonap-skill-folder-spec.md](docs/architecture/moonap-skill-folder-spec.md) explains the SKILL format.
- The release docs keep the stable architecture and validation story visible while internal handoff notes are intentionally excluded from the public repository.

### User Experience

- Browser UI gives a single place to describe apps, configure LLM routes, run generated apps, inspect details, and save/reuse SKILLs.
- Real API and Simulated API are separated into tabs.
- The Simulated GPT-5.4 route gives a stable demo path when real provider access is rate-limited or weak at MoonBit generation.
- Runtime forms are generated from specs, so ordinary apps present task-specific inputs instead of raw code.
- Large-file workflows show progress and keep file contents local.

## Recommended Demo Flow

1. Start the server:

   ```cmd
   tools\restart-moonap-server.cmd
   ```

2. Open:

   ```text
   http://127.0.0.1:3000/
   ```

3. Press `Ctrl+F5`.

4. Configure `LLM -> Simulated API -> OpenAI / GPT-5.4 simulated` for a deterministic demo.

5. Demonstrate generated-app flow:

   ```text
   Build an app where the user enters a Celsius temperature and gets the Fahrenheit temperature.
   ```

   Expected result: a runtime card with a Celsius input field and a Fahrenheit result.

6. Demonstrate generic utility flow:

   ```text
   Build a JSON formatter and validator.
   ```

7. Demonstrate browser-local file utility:

   ```text
   Build a CSV analyzer that reports row count, column names, missing values, and numeric column summaries.
   ```

8. Demonstrate SKILL reuse:

   - Open `SKILL`.
   - Install `Celsius Fahrenheit Converter` from Cloud to Local.
   - Run it from Local-SKILL-Hub.
   - Optionally install and run `JSON Formatter Validator` and `CSV Summary Analyzer`.

9. Demonstrate large-file story if time allows:

   - Run or open `large-fastq-generator`.
   - Show browser save picker and progress.
   - Run or open `large-fastq-analyzer`.
   - Show browser file picker and report.

## Validation Before Submission

Run:

```cmd
moon fmt
tools\moon-msvc.cmd build cmd\web_app --target js
node --check web\app-live.js
node --check web\app.js
tools\restart-moonap-server.cmd
powershell -ExecutionPolicy Bypass -File tools\test-demo-prompts.ps1
powershell -ExecutionPolicy Bypass -File tools\test-skill-flow.ps1
```

Expected:

- `node --check` exits successfully.
- `test-demo-prompts.ps1` reports all 12 demo prompts as `ok:true`.
- `test-skill-flow.ps1` reports Cloud catalog entries and SKILL package files as valid.
- `http://127.0.0.1:3000/api/health` returns `ok:true`.

## Known Limitations to State Clearly

- Real API routes depend on provider access, model quality, rate limits, and local network/proxy health.
- Lightweight/free real models may not reliably write valid MoonBit yet; Simulated GPT-5.4 is the stable v0.1 demo route.
- The current Windows path is the best-tested path. macOS/Linux support is a future release goal.
- The browser File System Access API works best in Chrome/Edge.
- The large-file runtime is platform-shaped and useful, but a fully universal WASM host ABI for arbitrary chunk callbacks is future work.

## Release Repositories

Main project:

```text
https://github.com/tangmaomao16/MoonAP-MB-server2
```

Official public SKILL Hub:

```text
https://github.com/tangmaomao16/MoonAP-SKILL-Hub
```

Both repositories should be pushed before final submission.
