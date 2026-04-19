# MoonAP SKILL Hub Taxonomy And Index

This document defines the recommended first stable structure for the public
`MoonAP-SKILL-Hub` repository and for future Local/Cloud SKILL Hub rendering in
MoonAP.

Official Cloud SKILL Hub repository:

- [MoonAP-SKILL-Hub](https://github.com/tangmaomao16/MoonAP-SKILL-Hub)

## Goals

- Keep the public SKILL Hub simple enough to maintain by hand in GitHub.
- Use domain-oriented categories instead of generic buckets like
  `research` or `productivity`.
- Make Cloud and Local Hub use the same SKILL folder structure.
- Keep room for later features such as search, versioning, screenshots, and
  one-click install.

## Design Principles

1. Public SKILLs, Local Hub SKILLs, and Personal SKILLs should share the same
   base SKILL folder format whenever possible.
2. The Cloud Hub is a publish-and-discover layer, not the runtime source of
   truth. MoonAP should run installed local copies.
3. Top-level categorization should follow professional verticals or academic
   disciplines.
4. The repository should be navigable directly in GitHub without any database or
   external service.
5. A single lightweight `index.json` should be enough for the first public
   release.

## Recommended Taxonomy

Do not use broad generic top-level buckets like:

- `research`
- `productivity`
- `general-tools`

Prefer professional or disciplinary top-level buckets such as:

- `bioinformatics`
- `finance`
- `education`
- `chemistry`
- `materials`
- `medicine`
- `law`
- `manufacturing`
- `geography`
- `linguistics`
- `games`

Notes:

- `games` is still acceptable as a top-level domain because it is a concrete
  application vertical, not a generic productivity grouping.
- A top-level domain should be understandable to end users who are looking for
  skills in their own field.

## Recommended Folder Layout

Use a three-level structure:

1. Domain
2. Subdomain or workflow family
3. Concrete skill folder

Example:

```text
MoonAP-SKILL-Hub/
  index.json
  README.md
  bioinformatics/
    sequencing/
      fastq-generator/
        SKILL.md
        program/
          main.wasm
          main.mbt
      fastq-base-counter/
        SKILL.md
        program/
          main.wasm
          main.mbt
  finance/
    accounting/
      excel-max-amount-row/
        SKILL.md
        program/
          main.wasm
          main.mbt
  games/
    board-games/
      gomoku/
        SKILL.md
        program/
          main.wasm
          main.mbt
```

## Naming Rules

- Domain folder names: lowercase kebab-case or lowercase plain words.
- Subdomain folder names: lowercase kebab-case.
- Skill folder names: lowercase kebab-case.
- Prefer stable names that describe the workflow, not the implementation detail.

Good examples:

- `bioinformatics/sequencing/fastq-generator`
- `finance/accounting/excel-max-amount-row`
- `games/board-games/gomoku`

Avoid:

- `research/bioinformatics/fastq-generator`
- `productivity/excel-tool`
- `misc/skill1`

## Index File

Place a single `index.json` at repository root.

Purpose:

- Provide a lightweight machine-readable Cloud catalog.
- Let MoonAP render the Cloud SKILL Hub without recursively scraping GitHub
  HTML.
- Keep future fields extensible without changing folder layout.

### Minimal v1 shape

```json
{
  "hub_version": "1",
  "hub_name": "MoonAP-SKILL-Hub",
  "repository_url": "https://github.com/tangmaomao16/MoonAP-SKILL-Hub",
  "skills": [
    {
      "id": "bioinformatics.sequencing.fastq-generator",
      "name": "FastQ Generator",
      "description": "Generate synthetic FastQ files for testing and demos.",
      "version": "0.1.0",
      "domain": "bioinformatics",
      "subdomain": "sequencing",
      "folder_path": "bioinformatics/sequencing/fastq-generator",
      "tags": ["fastq", "sequencing", "demo", "generator"]
    }
  ]
}
```

### Required v1 fields

- `hub_version`
- `hub_name`
- `repository_url`
- `skills`

Per skill:

- `id`
- `name`
- `description`
- `version`
- `domain`
- `subdomain`
- `folder_path`

### Optional later fields

These should not be required in the first version, but the schema should leave
space for them:

- `author`
- `license`
- `homepage_url`
- `zip_url`
- `icon_url`
- `screenshot_urls`
- `min_moonap_version`
- `entry_wasm_path`
- `entry_source_path`
- `tags`

## Relationship Between Cloud, Local, And Personal

MoonAP should treat the three sources as different shelves, but not as
different SKILL protocols.

- `Cloud SKILL Hub`
  Published catalog from the official GitHub repository.
- `Local SKILL Hub`
  User-selected local directory containing installed public SKILL folders.
- `Personal SKILL`
  User-saved reusable workflows exported from MoonAP itself.

Recommended runtime rule:

- Cloud is for discovery.
- Local and Personal are for execution.

## ZIP Packaging

Keep ZIP packaging optional and secondary.

Recommended approach:

- The GitHub repository stores normal skill folders.
- ZIP files may be added later for convenient download.
- MoonAP should ultimately install and run extracted folder contents, not run
  directly from ZIP archives.

This keeps the first implementation simple and GitHub-friendly.

## Suggested Initial Public Domains

A practical first wave:

- `bioinformatics`
- `finance`
- `education`
- `games`

These are enough to demonstrate:

- scientific workflows
- business data workflows
- educational content generation
- interactive browser-local applications

## Suggested First Migration For Existing Demo Skills

Current demo skills can be mapped like this:

- `fastq-generator` -> `bioinformatics/sequencing/fastq-generator`
- `fastq-base-counter` -> `bioinformatics/sequencing/fastq-base-counter`
- `excel-max-amount-row` -> `finance/accounting/excel-max-amount-row`
- `gomoku` -> `games/board-games/gomoku`

## v1 Implementation Advice

For the first implementation, do only this:

1. Keep Cloud Hub UI empty until `index.json` exists in the public repository.
2. Read Cloud catalog from that single `index.json`.
3. Render Local Hub by scanning a user-selected local directory for `SKILL.md`.
4. Keep Personal SKILL handling independent from Local Hub installation.

Do not add yet:

- dependency management
- remote runtime execution
- multi-file manifests beyond `SKILL.md` plus `index.json`
- mandatory ZIP install flow
- signing or trust infrastructure

That keeps the system small while preserving a clear path for future upgrades.
