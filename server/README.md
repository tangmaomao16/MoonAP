# MoonAP Server Host Adapters

MoonAP no longer has a standalone Node.js JavaScript HTTP server.

The product server entry is authored in MoonBit:

```powershell
npm run dev
```

That command builds and runs `moonap/cmd/server_native/main.mbt` with the MoonBit JS target.

Files under `server/lib/` are temporary Node host adapters for APIs that MoonBit JS-target code still reaches through the JavaScript runtime:

- HTTP provider requests for user-configured LLM APIs
- local filesystem access requested by the user
- MoonBit compiler process execution
- safe fallback artifact generation during development

Product routing, server bootstrap, task policy, LLM policy, file policy, validation policy, compiler plan, and prompt policy are owned by MoonBit.
