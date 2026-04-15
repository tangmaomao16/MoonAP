import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT_DIR } from "./config.mjs";

function buildTaskKernelProtocol({
  protocolName,
  inputMode,
  stateType,
  initFn,
  ingestFn,
  finalizeFn,
  hostResponsibilities,
  kernelResponsibilities,
}) {
  return {
    protocolName,
    inputMode,
    stateType,
    initFn,
    ingestFn,
    finalizeFn,
    hostResponsibilities,
    kernelResponsibilities,
  };
}

function fastqTaskKernelProtocolFallback() {
  return buildTaskKernelProtocol({
    protocolName: "moonap.fastq.streaming.v1",
    inputMode: "streaming-bytes",
    stateType: "FastqStreamingState",
    initFn: "init_state",
    ingestFn: "ingest_chunk",
    finalizeFn: "finalize_report",
    hostResponsibilities: [
      "open the local browser file and read it chunk by chunk",
      "copy each chunk into the MoonBit/Wasm bridge",
      "surface progress, benchmark metrics, and final report in the UI",
    ],
    kernelResponsibilities: [
      "keep FastQ carry-over state between chunks",
      "advance the four-line FastQ state machine",
      "accumulate read count, N count, GC count, and read-length statistics",
      "return a final analysis report that is safe to render in the browser",
    ],
  });
}

function workflowTaskKernelProtocolFallback() {
  return buildTaskKernelProtocol({
    protocolName: "moonap.workflow.whole-file.v1",
    inputMode: "whole-file-text",
    stateType: "WorkflowTaskState",
    initFn: "init_state",
    ingestFn: "ingest_input",
    finalizeFn: "finalize_result",
    hostResponsibilities: [
      "collect the user's task input and selected files",
      "pass normalized text or bytes into the MoonBit kernel",
      "render the final result and generated artifacts",
    ],
    kernelResponsibilities: [
      "normalize task state",
      "process task-specific input",
      "return a final result for browser rendering",
    ],
  });
}

function gameTaskKernelProtocolFallback() {
  return buildTaskKernelProtocol({
    protocolName: "moonap.browser.interactive.v1",
    inputMode: "interactive",
    stateType: "GameRuntimeState",
    initFn: "init_state",
    ingestFn: "ingest_event",
    finalizeFn: "finalize_frame",
    hostResponsibilities: [
      "collect browser input events and timing information",
      "forward events into the MoonBit game kernel",
      "render the returned frame state in the browser shell",
    ],
    kernelResponsibilities: [
      "own gameplay state transitions",
      "apply player input and collision rules",
      "emit browser-safe frame summaries for rendering",
    ],
  });
}

function toKebabInputMode(value) {
  return String(value || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

function fromMoonBitProtocol(protocol) {
  if (!protocol || typeof protocol !== "object") return null;
  return buildTaskKernelProtocol({
    protocolName: protocol.protocol_name,
    inputMode: toKebabInputMode(protocol.input_mode),
    stateType: protocol.state_type,
    initFn: protocol.init_fn,
    ingestFn: protocol.ingest_fn,
    finalizeFn: protocol.finalize_fn,
    hostResponsibilities: Array.isArray(protocol.host_responsibilities) ? protocol.host_responsibilities : [],
    kernelResponsibilities: Array.isArray(protocol.kernel_responsibilities) ? protocol.kernel_responsibilities : [],
  });
}

function loadMoonBitProtocols() {
  const moonapDir = path.join(ROOT_DIR, "moonap");
  const result = spawnSync("moon", ["run", "cmd/task_protocol"], {
    cwd: moonapDir,
    encoding: "utf8",
    timeout: 5000,
    windowsHide: true,
  });
  if (result.status !== 0 || !String(result.stdout || "").trim()) {
    return null;
  }

  const [fastq, workflow, game] = String(result.stdout)
    .split(/\r?\n---\r?\n/)
    .map((chunk) => chunk.trim())
    .map((chunk) => JSON.parse(chunk));

  return {
    "fastq-agent": fromMoonBitProtocol(fastq),
    "moonbit-task": fromMoonBitProtocol(workflow),
    "game-agent": fromMoonBitProtocol(game),
  };
}

const MOONBIT_PROTOCOLS = loadMoonBitProtocols();

export function fastqTaskKernelProtocol() {
  return MOONBIT_PROTOCOLS?.["fastq-agent"] || fastqTaskKernelProtocolFallback();
}

export function workflowTaskKernelProtocol() {
  return MOONBIT_PROTOCOLS?.["moonbit-task"] || workflowTaskKernelProtocolFallback();
}

export function gameTaskKernelProtocol() {
  return MOONBIT_PROTOCOLS?.["game-agent"] || gameTaskKernelProtocolFallback();
}

export function getTaskKernelProtocol(mode) {
  switch (mode) {
    case "fastq-agent":
      return fastqTaskKernelProtocol();
    case "game-agent":
      return gameTaskKernelProtocol();
    case "moonbit-task":
      return workflowTaskKernelProtocol();
    default:
      return null;
  }
}
