# MoonAP Server Architecture

MoonAP does not ship a standalone Node.js JavaScript HTTP server.

The product server entry is authored in MoonBit:

```text
moonap/cmd/server_native/main.mbt
```

It is compiled with the MoonBit JS target and launched by:

```powershell
npm run dev
```

## MoonBit-Owned Parts

MoonBit owns the core server behavior and product policies:

- route contract
- runtime manifest
- server bootstrap
- LLM router policy
- task router policy
- file analysis policy
- artifact validation policy
- attachment runtime contract
- compiler plan
- prompt policy
- task kernel protocol

The bootstrap can be inspected with:

```powershell
cd moonap
moon run cmd/server_bootstrap
```

## Node Host Adapter Boundary

Files under `server/lib/` are host adapters. They exist because MoonBit JS-target code still needs access to Node platform APIs for:

- HTTP requests to LLM providers
- local filesystem access when explicitly requested
- spawning `moon build` for generated projects
- development fallback artifacts

These adapter modules should stay thin. Product decisions should live in MoonBit.

## Migration Direction

The next migration target is agent orchestration:

```text
chat-engine-v3.mjs -> MoonBit orchestration module + thin network/process adapters
```

The long-term target is a fully native MoonBit server once the MoonBit ecosystem has mature server-side HTTP, filesystem, TLS, and process APIs for this workload.
