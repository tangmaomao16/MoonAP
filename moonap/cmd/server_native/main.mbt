#cfg(target="js")
extern "js" fn start_moonap_server(
  port : Int,
  web_root : String,
  server_contract_json : String,
  llm_router_policy_json : String,
  task_router_policy_json : String,
  file_analysis_policy_json : String,
  artifact_validation_policy_json : String,
  attachment_runtime_contract_json : String,
  compiler_plan_json : String,
  codegen_contract : String,
  agent_skill : String,
) -> Unit =
  #| (port, webRoot, serverContractJson, llmRouterPolicyJson, taskRouterPolicyJson, fileAnalysisPolicyJson, artifactValidationPolicyJson, attachmentRuntimeContractJson, compilerPlanJson, codegenContract, agentSkill) => {
  #|   const parseJson = (text, fallback) => {
  #|     try { return JSON.parse(String(text || "")); } catch { return fallback; }
  #|   };
  #|   const sendJson = (res, status, payload) => {
  #|     res.writeHead(status, {
  #|       "Content-Type": "application/json; charset=utf-8",
  #|       "Access-Control-Allow-Origin": "*",
  #|       "Access-Control-Allow-Headers": "Content-Type",
  #|     });
  #|     res.end(JSON.stringify(payload));
  #|   };
  #|   const sendText = (res, status, text, contentType = "text/plain; charset=utf-8") => {
  #|     res.writeHead(status, { "Content-Type": contentType });
  #|     res.end(text);
  #|   };
  #|   const readJsonBody = async (req) => {
  #|     const chunks = [];
  #|     for await (const chunk of req) chunks.push(chunk);
  #|     const text = Buffer.concat(chunks).toString("utf8").trim();
  #|     return text ? JSON.parse(text) : {};
  #|   };
  #|   const contentTypeFor = (filePath) => {
  #|     if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  #|     if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  #|     if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  #|     if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  #|     return "application/octet-stream";
  #|   };
  #|   const NO_LLM_MARKER = "[No LLM connecting now!]";
  #|   const withNoLlmMarker = (text) => {
  #|     const content = String(text || "").trim();
  #|     if (!content) return NO_LLM_MARKER;
  #|     if (content.includes(NO_LLM_MARKER)) return content;
  #|     return `${content}\n${NO_LLM_MARKER}`;
  #|   };
  #|   (async () => {
  #|     const http = await import("node:http");
  #|     const fs = await import("node:fs/promises");
  #|     const path = await import("node:path");
  #|     const { pathToFileURL } = await import("node:url");
  #|     const configuredPort = Number(process.env.PORT || port || 3000);
  #|     const rootDir = process.cwd();
  #|     const staticRoot = path.resolve(rootDir, webRoot || "web");
  #|     const importServerLib = async (relativePath) =>
  #|       import(pathToFileURL(path.join(rootDir, "server", "lib", relativePath)).href);
  #|     const chatEngine = await importServerLib("chat-engine-v3.mjs");
  #|     const compiler = await importServerLib("moonbit-compiler.mjs");
  #|     const mock = await importServerLib("mock-v3.mjs");
  #|     const localFiles = await importServerLib("local-file-service.mjs");
  #|     const benchmark = await importServerLib("fastq-benchmark.mjs");
  #|     const policies = {
  #|       serverContract: parseJson(serverContractJson, {}),
  #|       llmRouterPolicy: parseJson(llmRouterPolicyJson, {}),
  #|       taskRouterPolicy: parseJson(taskRouterPolicyJson, {}),
  #|       fileAnalysisPolicy: parseJson(fileAnalysisPolicyJson, {}),
  #|       artifactValidationPolicy: parseJson(artifactValidationPolicyJson, {}),
  #|       attachmentRuntimeContract: parseJson(attachmentRuntimeContractJson, {}),
  #|       compilerPlan: parseJson(compilerPlanJson, {}),
  #|     };
  #|     const compileArtifactStrict = async (artifact) => {
  #|       if (!artifact?.moonbitCode && !artifact?.sourceFiles?.length) {
  #|         return { artifact: null, compiled: null };
  #|       }
  #|       const compiled = await compiler.compileMoonBitToWasm(artifact);
  #|       return { artifact, compiled };
  #|     };
  #|     const compileArtifactWithFallback = async ({ artifact, prompt, fileInfo, analysis, selectedMode }) => {
  #|       if (!artifact?.moonbitCode && !artifact?.sourceFiles?.length) {
  #|         return { artifact: null, compiled: null };
  #|       }
  #|       try {
  #|         const compiled = await compiler.compileMoonBitToWasm(artifact);
  #|         return { artifact, compiled };
  #|       } catch (error) {
  #|         const fallbackArtifact = {
  #|           ...mock.generateMockMoonBit(prompt, { fileInfo, analysis, selectedMode }),
  #|           adapter: "compile-fallback",
  #|           warning: `Remote MoonBit artifact failed to compile, so MoonAP switched to a safe local fallback: ${error instanceof Error ? error.message : String(error)}`,
  #|         };
  #|         const compiled = await compiler.compileMoonBitToWasm(fallbackArtifact);
  #|         return { artifact: fallbackArtifact, compiled };
  #|       }
  #|     };
  #|     const server = http.createServer(async (req, res) => {
  #|       try {
  #|         const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  #|         if (req.method === "OPTIONS") {
  #|           res.writeHead(204, {
  #|             "Access-Control-Allow-Origin": "*",
  #|             "Access-Control-Allow-Headers": "Content-Type",
  #|             "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  #|           });
  #|           res.end();
  #|           return;
  #|         }
  #|         if (req.method === "GET" && url.pathname === "/api/health") {
  #|           sendJson(res, 200, { ok: true, server: "moonbit-js", moonap: "MoonBit-authored server adapter" });
  #|           return;
  #|         }
  #|         if (req.method === "GET" && url.pathname === "/api/server-contract") {
  #|           sendJson(res, 200, { ok: true, contract: policies.serverContract });
  #|           return;
  #|         }
  #|         if (req.method === "GET" && url.pathname === "/api/llm-router-policy") {
  #|           sendJson(res, 200, { ok: true, policy: policies.llmRouterPolicy });
  #|           return;
  #|         }
  #|         if (req.method === "GET" && url.pathname === "/api/task-router-policy") {
  #|           sendJson(res, 200, { ok: true, policy: policies.taskRouterPolicy });
  #|           return;
  #|         }
  #|         if (req.method === "GET" && url.pathname === "/api/file-analysis-policy") {
  #|           sendJson(res, 200, { ok: true, policy: policies.fileAnalysisPolicy });
  #|           return;
  #|         }
  #|         if (req.method === "GET" && url.pathname === "/api/artifact-validation-policy") {
  #|           sendJson(res, 200, { ok: true, policy: policies.artifactValidationPolicy });
  #|           return;
  #|         }
  #|         if (req.method === "GET" && url.pathname === "/api/attachment-runtime-contract") {
  #|           sendJson(res, 200, { ok: true, contract: policies.attachmentRuntimeContract });
  #|           return;
  #|         }
  #|         if (req.method === "GET" && url.pathname === "/api/codegen-contract") {
  #|           sendJson(res, 200, { ok: true, contract: codegenContract, skill: agentSkill });
  #|           return;
  #|         }
  #|         if (req.method === "GET" && url.pathname === "/api/compiler-plan") {
  #|           sendJson(res, 200, { ok: true, plan: policies.compilerPlan });
  #|           return;
  #|         }
  #|         if (req.method === "POST" && url.pathname === "/api/chat") {
  #|           const body = await readJsonBody(req);
  #|           const prompt = String(body.message || "").trim();
  #|           const history = Array.isArray(body.history) ? body.history : [];
  #|           const filePath = String(body.filePath || "").trim();
  #|           const selectedMode = String(body.selectedMode || "chat").trim();
  #|           const llmConfig = body.llmConfig && typeof body.llmConfig === "object" ? body.llmConfig : {};
  #|           if (!prompt) {
  #|             sendJson(res, 400, { ok: false, error: "message is required" });
  #|             return;
  #|           }
  #|           const result = await chatEngine.generateMoonAPResponse({ prompt, history, filePath, selectedMode, llmConfig });
  #|           const compiledResult = await compileArtifactWithFallback({
  #|             artifact: result.artifact,
  #|             prompt,
  #|             fileInfo: result.fileInfo,
  #|             analysis: result.analysis,
  #|             selectedMode,
  #|           });
  #|           const finalArtifact = compiledResult.artifact;
  #|           const compiled = compiledResult.compiled;
  #|           const assistantContent =
  #|             finalArtifact?.adapter === "compile-fallback" ||
  #|             finalArtifact?.adapter === "mock-fallback" ||
  #|             finalArtifact?.adapter === "mock"
  #|               ? withNoLlmMarker(result.assistant.content)
  #|               : result.assistant.content;
  #|           sendJson(res, 200, {
  #|             ok: true,
  #|             server: "moonbit-js",
  #|             mode: result.mode,
  #|             experienceMode: result.experienceMode,
  #|             assistant: { ...result.assistant, content: assistantContent },
  #|             fileInfo: result.fileInfo,
  #|             analysis: result.analysis,
  #|             artifact: finalArtifact
  #|               ? {
  #|                   ...finalArtifact,
  #|                   wasmBase64: compiled?.wasmBase64 || "",
  #|                   buildLog: compiled?.buildLog || "",
  #|                   warning: finalArtifact.warning || "",
  #|                 }
  #|               : null,
  #|           });
  #|           return;
  #|         }
  #|         if (req.method === "POST" && url.pathname === "/api/files/inspect") {
  #|           const body = await readJsonBody(req);
  #|           const filePath = String(body.path || "").trim();
  #|           if (!filePath) {
  #|             sendJson(res, 400, { ok: false, error: "path is required" });
  #|             return;
  #|           }
  #|           const fileInfo = await localFiles.inspectLocalFile(filePath);
  #|           sendJson(res, 200, { ok: true, server: "moonbit-js", fileInfo });
  #|           return;
  #|         }
  #|         if (req.method === "POST" && url.pathname === "/api/files/analyze") {
  #|           const body = await readJsonBody(req);
  #|           const filePath = String(body.path || "").trim();
  #|           const requestedAnalysis = String(body.requestedAnalysis || "auto").trim();
  #|           if (!filePath) {
  #|             sendJson(res, 400, { ok: false, error: "path is required" });
  #|             return;
  #|           }
  #|           const fileInfo = await localFiles.inspectLocalFile(filePath);
  #|           const analysis = await localFiles.analyzeLocalFile({ filePath: fileInfo.path, requestedAnalysis });
  #|           sendJson(res, 200, { ok: true, server: "moonbit-js", fileInfo, analysis });
  #|           return;
  #|         }
  #|         if (req.method === "POST" && url.pathname === "/api/benchmarks/fastq") {
  #|           const body = await readJsonBody(req);
  #|           const includeSamples = body?.includeSamples !== false;
  #|           const compileArtifact = body?.compileArtifact !== false;
  #|           const result = await benchmark.writeFastqBenchmarkArtifacts({ includeSamples, compileArtifact });
  #|           sendJson(res, 200, {
  #|             ok: true,
  #|             server: "moonbit-js",
  #|             report: result.report,
  #|             markdown: result.markdown,
  #|             jsonPath: result.jsonPath,
  #|             markdownPath: result.markdownPath,
  #|           });
  #|           return;
  #|         }
  #|         if (req.method === "POST" && url.pathname === "/api/browser-analysis/artifact") {
  #|           const body = await readJsonBody(req);
  #|           const prompt = String(body.prompt || "").trim() || "Generate a MoonBit FastQ analysis report.";
  #|           const browserAnalysis = body.analysis && typeof body.analysis === "object" ? body.analysis : null;
  #|           const browserFile = body.browserFile && typeof body.browserFile === "object" ? body.browserFile : null;
  #|           if (!browserFile) {
  #|             sendJson(res, 400, { ok: false, error: "browserFile is required" });
  #|             return;
  #|           }
  #|           const fileInfo = {
  #|             path: browserFile.name || "browser-local.fastq",
  #|             sizeBytes: Number(browserFile.size || 0),
  #|             detectedType: "fastq",
  #|           };
  #|           const artifact = {
  #|             ...mock.generateMockMoonBit(prompt, { selectedMode: "fastq-agent", fileInfo, analysis: browserAnalysis }),
  #|             adapter: "browser-local-fastq",
  #|           };
  #|           const compiled = await compiler.compileMoonBitToWasm(artifact);
  #|           sendJson(res, 200, {
  #|             ok: true,
  #|             server: "moonbit-js",
  #|             assistant: {
  #|               role: "assistant",
  #|               content: mock.generateMockChatReply(prompt, {
  #|                 fileInfo,
  #|                 analysis: browserAnalysis,
  #|                 selectedMode: "fastq-agent",
  #|                 artifact,
  #|               }),
  #|             },
  #|             analysis: browserAnalysis,
  #|             artifact: { ...artifact, wasmBase64: compiled.wasmBase64, buildLog: compiled.buildLog },
  #|           });
  #|           return;
  #|         }
  #|         if (req.method === "POST" && url.pathname === "/api/artifacts/compile") {
  #|           const body = await readJsonBody(req);
  #|           const prompt = String(body.prompt || "").trim() || "Generate a MoonBit workflow.";
  #|           const selectedMode = String(body.selectedMode || "chat").trim();
  #|           const noFallback = body.noFallback === true;
  #|           const fileInfo = body.fileInfo && typeof body.fileInfo === "object" ? body.fileInfo : null;
  #|           const analysis = body.analysis && typeof body.analysis === "object" ? body.analysis : null;
  #|           const incomingArtifact = body.artifact && typeof body.artifact === "object" ? body.artifact : null;
  #|           const fallback = mock.generateMockMoonBit(prompt, { fileInfo, analysis, selectedMode });
  #|           const mergedArtifact = incomingArtifact
  #|             ? {
  #|                 ...fallback,
  #|                 ...incomingArtifact,
  #|                 sourceFiles: Array.isArray(incomingArtifact.sourceFiles) && incomingArtifact.sourceFiles.length > 0
  #|                   ? incomingArtifact.sourceFiles
  #|                   : fallback.sourceFiles,
  #|               }
  #|             : fallback;
  #|           const compiledResult = noFallback
  #|             ? await compileArtifactStrict(mergedArtifact)
  #|             : await compileArtifactWithFallback({ artifact: mergedArtifact, prompt, fileInfo, analysis, selectedMode });
  #|           sendJson(res, 200, {
  #|             ok: true,
  #|             server: "moonbit-js",
  #|             artifact: compiledResult.artifact
  #|               ? {
  #|                   ...compiledResult.artifact,
  #|                   wasmBase64: compiledResult.compiled?.wasmBase64 || "",
  #|                   buildLog: compiledResult.compiled?.buildLog || "",
  #|                   warning: compiledResult.artifact.warning || "",
  #|                 }
  #|               : null,
  #|           });
  #|           return;
  #|         }
  #|         if (req.method === "GET") {
  #|           const normalized = url.pathname === "/" ? "/chat.html" : url.pathname;
  #|           const target = path.resolve(staticRoot, "." + decodeURIComponent(normalized));
  #|           if (!target.startsWith(staticRoot)) {
  #|             sendText(res, 403, "Forbidden");
  #|             return;
  #|           }
  #|           try {
  #|             const content = await fs.readFile(target);
  #|             sendText(res, 200, content, contentTypeFor(target));
  #|           } catch {
  #|             sendText(res, 404, "Not Found");
  #|           }
  #|           return;
  #|         }
  #|         sendText(res, 405, "Method Not Allowed");
  #|       } catch (error) {
  #|         sendJson(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
  #|       }
  #|     });
  #|     server.on("error", (error) => {
  #|       if (error && error.code === "EADDRINUSE") {
  #|         console.error(`MoonAP MoonBit-authored server could not start: port ${configuredPort} is already in use.`);
  #|         console.error("Stop the existing server, or start this one on another port, for example:");
  #|         console.error("  PowerShell: $env:PORT=3001; npm run start:moonbit-server");
  #|         console.error("  npm: npm run start:moonbit-server:3001");
  #|       } else {
  #|         console.error(error);
  #|       }
  #|       if (typeof process !== "undefined") process.exitCode = 1;
  #|     });
  #|     server.listen(configuredPort, () => {
  #|       console.log(`MoonAP MoonBit-authored server is ready at http://localhost:${configuredPort}`);
  #|     });
  #|   })().catch((error) => {
  #|     console.error(error);
  #|     if (typeof process !== "undefined") process.exitCode = 1;
  #|   });
  #| }

#cfg(target="js")
fn main {
  start_moonap_server(
    3000,
    "web",
    @lib.moonap_server_contract_json(),
    @lib.llm_router_policy_json(),
    @lib.task_router_policy_json(),
    @lib.file_analysis_policy_json(),
    @lib.artifact_validation_policy_json(),
    @lib.attachment_runtime_contract_json(),
    @lib.compiler_plan_json(),
    @lib.moonbit_codegen_contract(),
    @lib.moonbit_agent_skill(),
  )
}

#cfg(not(target="js"))
fn main {
  println("MoonAP server_native is a MoonBit-authored JS-target server adapter.")
  println("contract = " + @lib.moonap_server_contract().name)
  println("Build it with: moon build --target js")
  println("Run it with: node moonap/_build/js/debug/build/cmd/server_native/server_native.js")
}
