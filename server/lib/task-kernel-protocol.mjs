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

export function fastqTaskKernelProtocol() {
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

export function workflowTaskKernelProtocol() {
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

export function gameTaskKernelProtocol() {
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
