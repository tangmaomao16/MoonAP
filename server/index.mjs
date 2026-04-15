import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { PORT, ROOT_DIR } from "./lib/config.mjs";
import { generateMoonAPResponse } from "./lib/chat-engine-v3.mjs";
import { writeFastqBenchmarkArtifacts } from "./lib/fastq-benchmark.mjs";
import { analyzeLocalFile, inspectLocalFile } from "./lib/local-file-service.mjs";
import { generateMockChatReply, generateMockMoonBit } from "./lib/mock-v3.mjs";
import { compileMoonBitToWasm } from "./lib/moonbit-compiler.mjs";

const WEB_ROOT = path.join(ROOT_DIR, "web");
const moonVersionPromise = detectMoonVersion();
const NO_LLM_MARKER = "[No LLM connecting now!]";

function detectMoonVersion() {
  return new Promise((resolve) => {
    const child = spawn("moon", ["version"], {
      cwd: ROOT_DIR,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", () => resolve("moon cli unavailable"));
    child.on("close", () => {
      const text = [stdout.trim(), stderr.trim()].filter(Boolean).join(" ").trim();
      resolve(text || "moon version unavailable");
    });
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, text, contentType = "text/plain; charset=utf-8") {
  response.writeHead(statusCode, { "Content-Type": contentType });
  response.end(text);
}

function withNoLlmMarker(text) {
  const content = String(text || "").trim();
  if (!content) return NO_LLM_MARKER;
  if (content.includes(NO_LLM_MARKER)) return content;
  return `${content}\n${NO_LLM_MARKER}`;
}

async function compileArtifactWithFallback({ artifact, prompt, fileInfo, analysis, selectedMode }) {
  if (!artifact?.moonbitCode && !artifact?.sourceFiles?.length) {
    return { artifact: null, compiled: null };
  }

  try {
    const compiled = await compileMoonBitToWasm(artifact);
    return { artifact, compiled };
  } catch (error) {
    const fallbackArtifact = {
      ...generateMockMoonBit(prompt, {
        fileInfo,
        analysis,
        selectedMode,
      }),
      adapter: "compile-fallback",
      warning: `Remote MoonBit artifact failed to compile, so MoonAP switched to a safe local fallback: ${error instanceof Error ? error.message : String(error)}`,
    };
    const compiled = await compileMoonBitToWasm(fallbackArtifact);
    return { artifact: fallbackArtifact, compiled };
  }
}

async function compileArtifactStrict(artifact) {
  if (!artifact?.moonbitCode && !artifact?.sourceFiles?.length) {
    return { artifact: null, compiled: null };
  }

  const compiled = await compileMoonBitToWasm(artifact);
  return { artifact, compiled };
}

async function serveStaticFile(requestPath, response) {
  const normalized = requestPath === "/" ? "/chat.html" : requestPath;
  const filePath = path.join(WEB_ROOT, normalized);
  const safeRoot = path.resolve(WEB_ROOT);
  const safeFilePath = path.resolve(filePath);

  if (!safeFilePath.startsWith(safeRoot)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  try {
    const content = await fs.readFile(safeFilePath);
    const extension = path.extname(safeFilePath);
    const contentType =
      extension === ".html"
        ? "text/html; charset=utf-8"
        : extension === ".css"
          ? "text/css; charset=utf-8"
          : extension === ".js"
            ? "application/javascript; charset=utf-8"
            : "application/octet-stream";
    sendText(response, 200, content, contentType);
  } catch {
    sendText(response, 404, "Not Found");
  }
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = http.createServer(async (request, response) => {
  if (!request.url) {
    sendText(response, 400, "Bad Request");
    return;
  }

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    });
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/api/health") {
    sendJson(response, 200, { ok: true, moonVersion: await moonVersionPromise });
    return;
  }

  if (request.method === "POST" && request.url === "/api/chat") {
    try {
      const body = await readJsonBody(request);
      const prompt = String(body.message || "").trim();
      const history = Array.isArray(body.history) ? body.history : [];
      const filePath = String(body.filePath || "").trim();
      const selectedMode = String(body.selectedMode || "chat").trim();
      const llmConfig = body.llmConfig && typeof body.llmConfig === "object" ? body.llmConfig : {};

      if (!prompt) {
        sendJson(response, 400, { error: "message is required" });
        return;
      }

      const result = await generateMoonAPResponse({
        prompt,
        history,
        filePath,
        selectedMode,
        llmConfig,
      });

      const compiledResult = await compileArtifactWithFallback({
        artifact: result.artifact,
        prompt,
        fileInfo: result.fileInfo,
        analysis: result.analysis,
        selectedMode,
      });
      const finalArtifact = compiledResult.artifact;
      const compiled = compiledResult.compiled;
      const assistantContent =
        finalArtifact?.adapter === "compile-fallback" ||
        finalArtifact?.adapter === "mock-fallback" ||
        finalArtifact?.adapter === "mock"
          ? withNoLlmMarker(result.assistant.content)
          : result.assistant.content;

      sendJson(response, 200, {
        ok: true,
        mode: result.mode,
        experienceMode: result.experienceMode,
        assistant: {
          ...result.assistant,
          content: assistantContent,
        },
        fileInfo: result.fileInfo,
        analysis: result.analysis,
        artifact: finalArtifact
          ? {
              ...finalArtifact,
              wasmBase64: compiled?.wasmBase64 || "",
              buildLog: compiled?.buildLog || "",
              warning: finalArtifact.warning || "",
            }
          : null,
      });
    } catch (error) {
      sendJson(response, 500, {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return;
  }

  if (request.method === "POST" && request.url === "/api/files/inspect") {
    try {
      const body = await readJsonBody(request);
      const filePath = String(body.path || "").trim();

      if (!filePath) {
        sendJson(response, 400, { ok: false, error: "path is required" });
        return;
      }

      const fileInfo = await inspectLocalFile(filePath);
      sendJson(response, 200, { ok: true, fileInfo });
    } catch (error) {
      sendJson(response, 500, {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return;
  }

  if (request.method === "POST" && request.url === "/api/files/analyze") {
    try {
      const body = await readJsonBody(request);
      const filePath = String(body.path || "").trim();
      const requestedAnalysis = String(body.requestedAnalysis || "auto").trim();

      if (!filePath) {
        sendJson(response, 400, { ok: false, error: "path is required" });
        return;
      }

      const fileInfo = await inspectLocalFile(filePath);
      const analysis = await analyzeLocalFile({
        filePath: fileInfo.path,
        requestedAnalysis,
      });
      sendJson(response, 200, { ok: true, fileInfo, analysis });
    } catch (error) {
      sendJson(response, 500, {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return;
  }

  if (request.method === "POST" && request.url === "/api/benchmarks/fastq") {
    try {
      const body = await readJsonBody(request);
      const includeSamples = body?.includeSamples !== false;
      const compileArtifact = body?.compileArtifact !== false;
      const result = await writeFastqBenchmarkArtifacts({
        includeSamples,
        compileArtifact,
      });
      sendJson(response, 200, {
        ok: true,
        report: result.report,
        markdown: result.markdown,
        jsonPath: result.jsonPath,
        markdownPath: result.markdownPath,
      });
    } catch (error) {
      sendJson(response, 500, {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return;
  }

  if (request.method === "POST" && request.url === "/api/browser-analysis/artifact") {
    try {
      const body = await readJsonBody(request);
      const prompt = String(body.prompt || "").trim() || "Generate a MoonBit FastQ analysis report.";
      const browserAnalysis = body.analysis && typeof body.analysis === "object" ? body.analysis : null;
      const browserFile = body.browserFile && typeof body.browserFile === "object" ? body.browserFile : null;

      if (!browserFile) {
        sendJson(response, 400, { ok: false, error: "browserFile is required" });
        return;
      }

      const fileInfo = {
        path: browserFile.name || "browser-local.fastq",
        sizeBytes: Number(browserFile.size || 0),
        detectedType: "fastq",
      };

      const artifact = {
        ...generateMockMoonBit(prompt, {
          selectedMode: "fastq-agent",
          fileInfo,
          analysis: browserAnalysis,
        }),
        adapter: "browser-local-fastq",
      };
      const compiled = await compileMoonBitToWasm(artifact);

      sendJson(response, 200, {
        ok: true,
        assistant: {
          role: "assistant",
          content: generateMockChatReply(prompt, {
            fileInfo,
            analysis: browserAnalysis,
            selectedMode: "fastq-agent",
            artifact,
          }),
        },
        analysis: browserAnalysis,
        artifact: {
          ...artifact,
          wasmBase64: compiled.wasmBase64,
          buildLog: compiled.buildLog,
        },
      });
    } catch (error) {
      sendJson(response, 500, {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return;
  }

  if (request.method === "POST" && request.url === "/api/artifacts/compile") {
    try {
      const body = await readJsonBody(request);
      const prompt = String(body.prompt || "").trim() || "Generate a MoonBit workflow.";
      const selectedMode = String(body.selectedMode || "chat").trim();
      const noFallback = body.noFallback === true;
      const fileInfo = body.fileInfo && typeof body.fileInfo === "object" ? body.fileInfo : null;
      const analysis = body.analysis && typeof body.analysis === "object" ? body.analysis : null;
      const incomingArtifact = body.artifact && typeof body.artifact === "object" ? body.artifact : null;

      const mergedArtifact = incomingArtifact
        ? {
            ...generateMockMoonBit(prompt, { fileInfo, analysis, selectedMode }),
            ...incomingArtifact,
            sourceFiles: Array.isArray(incomingArtifact.sourceFiles) && incomingArtifact.sourceFiles.length > 0
              ? incomingArtifact.sourceFiles
              : generateMockMoonBit(prompt, { fileInfo, analysis, selectedMode }).sourceFiles,
          }
        : generateMockMoonBit(prompt, { fileInfo, analysis, selectedMode });

      const compiledResult = noFallback
        ? await compileArtifactStrict(mergedArtifact)
        : await compileArtifactWithFallback({
            artifact: mergedArtifact,
            prompt,
            fileInfo,
            analysis,
            selectedMode,
          });

      sendJson(response, 200, {
        ok: true,
        artifact: compiledResult.artifact
          ? {
              ...compiledResult.artifact,
              wasmBase64: compiledResult.compiled?.wasmBase64 || "",
              buildLog: compiledResult.compiled?.buildLog || "",
              warning: compiledResult.artifact.warning || "",
            }
          : null,
      });
    } catch (error) {
      if (request.url === "/api/artifacts/compile") {
        const bodyText = error instanceof Error ? error.message : String(error);
        sendJson(response, 422, {
          ok: false,
          error: bodyText,
        });
        return;
      }
      sendJson(response, 500, {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return;
  }

  if (request.method === "GET") {
    await serveStaticFile(request.url, response);
    return;
  }

  sendText(response, 405, "Method Not Allowed");
});

server.listen(PORT, () => {
  console.log(`MoonAP is ready at http://localhost:${PORT}`);
});
