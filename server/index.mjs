import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { PORT, ROOT_DIR } from "./lib/config.mjs";
import { generateMoonBitArtifact } from "./lib/chat-engine.mjs";
import { compileMoonBitToWasm } from "./lib/moonbit-compiler.mjs";

const WEB_ROOT = path.join(ROOT_DIR, "web");

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
  const normalized = requestPath === "/" ? "/index.html" : requestPath;
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
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "POST" && request.url === "/api/chat") {
    try {
      const body = await readJsonBody(request);
      const prompt = String(body.message || "").trim();
      const history = Array.isArray(body.history) ? body.history : [];

      if (!prompt) {
        sendJson(response, 400, { error: "message is required" });
        return;
      }

      const artifact = await generateMoonBitArtifact(prompt, history);
      const compiled = await compileMoonBitToWasm(artifact.moonbitCode);

      sendJson(response, 200, {
        ok: true,
        assistant: {
          role: "assistant",
          content: artifact.summary,
        },
        artifact: {
          title: artifact.title,
          summary: artifact.summary,
          moonbitCode: artifact.moonbitCode,
          wasmBase64: compiled.wasmBase64,
          buildLog: compiled.buildLog,
          adapter: artifact.adapter,
          warning: artifact.warning || "",
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
