import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { PORT, ROOT_DIR } from "./lib/config.mjs";
import { generateMoonAPResponse } from "./lib/chat-engine-v3.mjs";
import { analyzeLocalFile, inspectLocalFile } from "./lib/local-file-service.mjs";
import { generateMockChatReply, generateMockMoonBit } from "./lib/mock-v3.mjs";
import { compileMoonBitToWasm } from "./lib/moonbit-compiler.mjs";

const WEB_ROOT = path.join(ROOT_DIR, "web");
const moonVersionPromise = detectMoonVersion();

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

      let compiled = null;
      if (result.artifact?.moonbitCode || result.artifact?.sourceFiles?.length) {
        compiled = await compileMoonBitToWasm(result.artifact);
      }

      sendJson(response, 200, {
        ok: true,
        mode: result.mode,
        experienceMode: result.experienceMode,
        assistant: result.assistant,
        fileInfo: result.fileInfo,
        analysis: result.analysis,
        artifact: result.artifact
          ? {
              ...result.artifact,
              wasmBase64: compiled?.wasmBase64 || "",
              buildLog: compiled?.buildLog || "",
              warning: result.artifact.warning || "",
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

  if (request.method === "POST" && request.url === "/api/browser-analysis/artifact") {
    try {
      const body = await readJsonBody(request);
      const prompt = String(body.prompt || "").trim() || "Generate a MoonBit FastQ analysis report.";
      const browserAnalysis = body.analysis && typeof body.analysis === "object" ? body.analysis : null;
      const browserFile = body.browserFile && typeof body.browserFile === "object" ? body.browserFile : null;

      if (!browserAnalysis || !browserFile) {
        sendJson(response, 400, { ok: false, error: "analysis and browserFile are required" });
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

  if (request.method === "GET") {
    await serveStaticFile(request.url, response);
    return;
  }

  sendText(response, 405, "Method Not Allowed");
});

server.listen(PORT, () => {
  console.log(`MoonAP is ready at http://localhost:${PORT}`);
});
