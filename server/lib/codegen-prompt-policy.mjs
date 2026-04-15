import { getMoonBitBootstrapSection } from "./moonbit-bootstrap.mjs";

const FALLBACK_PROMPT_POLICY = {
  systemIdentity: "You are MoonAP, an expert MoonBit code generator.",
  chatSystemIdentity: "You are MoonAP, a concise and practical assistant. Help in a chat style, and guide users toward local-first analysis when files are involved.",
  noProtocolFallback: "No explicit task kernel protocol was provided. Use a whole-file MoonBit workflow artifact.",
  genericStructure: "Prefer a small multi-file project whose files are actually used by main.mbt.",
  workflowStructure: [
    "Expected file structure for workflow tasks:",
    "- cmd/main/main.mbt",
    "- cmd/main/agent_spec.mbt",
    "- cmd/main/session_context.mbt",
    "main.mbt should call helper functions defined in the other two files.",
  ].join("\n"),
  gameStructure: [
    "Expected file structure for browser game tasks:",
    "- cmd/main/main.mbt",
    "- cmd/main/game_state.mbt",
    "- cmd/main/game_loop.mbt",
  ].join("\n"),
  fastqStructure: [
    "Expected file structure for FastQ tasks:",
    "- cmd/main/main.mbt",
    "- cmd/main/fastq_stats.mbt",
    "- cmd/main/fastq_chunking.mbt",
  ].join("\n"),
  repairIntro: "Repair the previous MoonAP JSON response.",
  previousResponseLabel: "Previous response:",
  generatedFileRules: ["This request is asking for downloadable generated files.", "Add generatedDownloads to the JSON artifact."],
  fastqGenerationRules: ["Include realistic N bases in synthetic reads by default unless the user explicitly asks for zero Ns."],
};

function arrayOfStrings(value) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function promptPolicyFromMoonBit(policy) {
  return {
    systemIdentity: String(policy?.system_identity || FALLBACK_PROMPT_POLICY.systemIdentity),
    chatSystemIdentity: String(policy?.chat_system_identity || FALLBACK_PROMPT_POLICY.chatSystemIdentity),
    noProtocolFallback: String(policy?.no_protocol_fallback || FALLBACK_PROMPT_POLICY.noProtocolFallback),
    genericStructure: String(policy?.generic_structure || FALLBACK_PROMPT_POLICY.genericStructure),
    workflowStructure: String(policy?.workflow_structure || FALLBACK_PROMPT_POLICY.workflowStructure),
    gameStructure: String(policy?.game_structure || FALLBACK_PROMPT_POLICY.gameStructure),
    fastqStructure: String(policy?.fastq_structure || FALLBACK_PROMPT_POLICY.fastqStructure),
    repairIntro: String(policy?.repair_intro || FALLBACK_PROMPT_POLICY.repairIntro),
    previousResponseLabel: String(policy?.previous_response_label || FALLBACK_PROMPT_POLICY.previousResponseLabel),
    generatedFileRules: arrayOfStrings(policy?.generated_file_rules),
    fastqGenerationRules: arrayOfStrings(policy?.fastq_generation_rules),
  };
}

export function getCodegenPromptPolicy() {
  const policy = getMoonBitBootstrapSection("codegen_prompt");
  return policy ? promptPolicyFromMoonBit(policy) : FALLBACK_PROMPT_POLICY;
}

export function fileStructureBlockForProtocol(protocol) {
  const policy = getCodegenPromptPolicy();
  if (protocol?.protocolName === "moonap.workflow.whole-file.v1") return policy.workflowStructure;
  if (protocol?.protocolName === "moonap.browser.interactive.v1") return policy.gameStructure;
  if (protocol?.protocolName === "moonap.fastq.streaming.v1") return policy.fastqStructure;
  return policy.genericStructure;
}
