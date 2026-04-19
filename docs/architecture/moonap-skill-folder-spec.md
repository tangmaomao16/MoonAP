# MoonAP SKILL Folder Specification

Last updated: `2026-04-18 22:58` in `Asia/Shanghai (UTC+08:00)`

## Why this document exists

MoonAP now has one runtime path that can complete end to end:

- natural-language request
- LLM-generated MoonBit
- wasm compile
- browser-local runtime execution
- result review
- save as reusable SKILL

This document defines the minimal MoonAP SKILL folder format for that saved workflow.

The goal is to stay compatible in spirit with Anthropic / Agent Skills style:

- a SKILL is a folder
- the main entry is `SKILL.md`
- additional files are loaded only when needed

We explicitly want to keep the format small and avoid duplicated metadata.

## Minimal folder layout

MoonAP should export a SKILL folder in this shape:

```text
<skill-name>/
  SKILL.md
  program/
    main.wasm
```

Recommended optional file:

```text
  program/
    main.mbt
```

At the current stage, MoonAP should not require extra files such as:

- `skill.json`
- `runtime-spec.json`
- example-input files
- example-result files

Those details should stay inside `SKILL.md` unless a later real need appears.

## `SKILL.md` design principle

`SKILL.md` should serve two roles at once:

1. a human-readable skill description
2. the primary machine-readable entry for MoonAP

To reduce duplicate content and token cost:

- frontmatter should only contain `name` and `description`
- the body should not repeat the same name/description again
- runtime details should be placed in structured sections in the body

## Required `SKILL.md` structure

Recommended structure:

```md
---
name: fastq-generator
description: Generate a synthetic FastQ file for testing, demos, or pipeline validation.
---

# Key Attributes
- task kind: fastq-generator
- runtime mode: form
- result mode: download
- wasm path: program/main.wasm
- moonbit source path: program/main.mbt

# Inputs
- read_count: number of reads to generate
- read_length: length of each read
- n_rate: proportion of N bases
- random_seed: random seed

# Output
A downloadable `.fastq` file.

# Runtime Spec
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
```

## Why the headings use `#`

The body intentionally starts with top-level headings:

- `# Key Attributes`
- `# Inputs`
- `# Output`
- `# Runtime Spec`

This is because the file does not repeat the skill name as a top-level title.

The name already exists in frontmatter. Starting the body directly at `# Key Attributes` keeps the Markdown hierarchy valid and avoids redundant title text.

## Meaning of each section

### Frontmatter

Used for:

- indexing
- search
- quick skill matching

Only:

- `name`
- `description`

### `# Key Attributes`

Used for the smallest set of runtime-defining facts:

- task kind
- runtime mode
- result mode
- wasm path
- optional source path

### `# Inputs`

Used for a short human-readable explanation of runtime parameters.

### `# Output`

Used for the expected runtime result shape.

### `# Runtime Spec`

Used as the single structured runtime contract that MoonAP parses to render UI and collect runtime inputs.

## MoonAP integration interface

MoonAP should support four lightweight SKILL interfaces:

1. save
2. list
3. read
4. run

### Save

When the user accepts the current workflow as a reusable SKILL:

- prompt for a target directory
- create the skill folder
- write `SKILL.md`
- write `program/main.wasm`
- optionally write `program/main.mbt`

### List

MoonAP should list saved skills by reading only the frontmatter of `SKILL.md` first.

### Read

When the user opens a specific skill, MoonAP should then read the rest of `SKILL.md` and parse:

- `Key Attributes`
- `Inputs`
- `Output`
- `Runtime Spec`

### Run

When the user runs a saved skill, MoonAP should:

- read the runtime spec from `SKILL.md`
- render the runtime UI
- execute the wasm artifact
- show the result

This path should be artifact-driven, not LLM-driven.

## Current implementation priority

The current first priority is:

- export a valid SKILL folder for `fastq-generator`

After that, the same format should be reused for:

- `fastq-analysis`
- `excel-generator`
- `finance-report-analysis`
- `browser-game`
