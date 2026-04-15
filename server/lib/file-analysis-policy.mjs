import path from "node:path";
import { getMoonBitBootstrapSection } from "./moonbit-bootstrap.mjs";

const FALLBACK_POLICY = {
  maxPreviewBytes: 4096,
  maxPreviewLines: 12,
  fileTypes: [
    { detectedType: "fastq", label: "FastQ sequencing reads", extensions: [".fastq", ".fq"], defaultAnalysis: "fastq-n-stats", streamingPreferred: true, supportedNow: true },
    { detectedType: "csv", label: "CSV table", extensions: [".csv"], defaultAnalysis: "csv-summary", streamingPreferred: true, supportedNow: true },
    { detectedType: "json", label: "JSON document", extensions: [".json"], defaultAnalysis: "json-summary", streamingPreferred: false, supportedNow: true },
    { detectedType: "text", label: "Text or log file", extensions: [".txt", ".log", ".tsv"], defaultAnalysis: "text-summary", streamingPreferred: true, supportedNow: true },
    { detectedType: "spreadsheet", label: "Spreadsheet table", extensions: [".xlsx", ".xls"], defaultAnalysis: "spreadsheet-summary", streamingPreferred: false, supportedNow: false },
  ],
  analyses: [
    { analysisType: "fastq-n-stats", label: "FastQ N-base statistics", benchmarkTiers: ["0.1 GB", "1 GB", "5 GB"], recommendedChunkSizes: ["4 MB", "8 MB", "16 MB"], evaluationFocus: ["memory peak", "chunk throughput", "total runtime", "output correctness"] },
    { analysisType: "csv-summary", label: "CSV structure summary", benchmarkTiers: ["small", "medium", "large"], recommendedChunkSizes: ["4 MB"], evaluationFocus: ["schema summary accuracy", "row count", "build success"] },
    { analysisType: "json-summary", label: "JSON structure summary", benchmarkTiers: ["small", "medium", "large"], recommendedChunkSizes: ["not applicable"], evaluationFocus: ["structure accuracy", "safe preview", "build success"] },
    { analysisType: "text-summary", label: "Text/log summary", benchmarkTiers: ["small", "medium", "large"], recommendedChunkSizes: ["4 MB", "8 MB"], evaluationFocus: ["line count", "preview accuracy", "build success"] },
  ],
};

function fileTypeFromMoonBit(item) {
  return {
    detectedType: String(item?.detected_type || "").trim(),
    label: String(item?.label || "").trim(),
    extensions: Array.isArray(item?.extensions) ? item.extensions.map((value) => String(value).toLowerCase()) : [],
    defaultAnalysis: String(item?.default_analysis || "auto").trim(),
    streamingPreferred: item?.streaming_preferred === true,
    supportedNow: item?.supported_now !== false,
  };
}

function analysisFromMoonBit(item) {
  return {
    analysisType: String(item?.analysis_type || "").trim(),
    label: String(item?.label || "").trim(),
    summary: String(item?.summary || "").trim(),
    benchmarkTiers: Array.isArray(item?.benchmark_tiers) ? item.benchmark_tiers : [],
    recommendedChunkSizes: Array.isArray(item?.recommended_chunk_sizes) ? item.recommended_chunk_sizes : [],
    evaluationFocus: Array.isArray(item?.evaluation_focus) ? item.evaluation_focus : [],
  };
}

function policyFromMoonBit(policy) {
  return {
    maxPreviewBytes: Number(policy?.max_preview_bytes || 4096),
    maxPreviewLines: Number(policy?.max_preview_lines || 12),
    fileTypes: Array.isArray(policy?.file_types) ? policy.file_types.map(fileTypeFromMoonBit) : [],
    analyses: Array.isArray(policy?.analyses) ? policy.analyses.map(analysisFromMoonBit) : [],
  };
}

function loadMoonBitPolicy() {
  const policy = getMoonBitBootstrapSection("file_analysis");
  return policy ? policyFromMoonBit(policy) : null;
}

const FILE_ANALYSIS_POLICY = loadMoonBitPolicy() || FALLBACK_POLICY;

export function getFileAnalysisPolicy() {
  return FILE_ANALYSIS_POLICY;
}

export function detectFileTypeByPolicy(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return FILE_ANALYSIS_POLICY.fileTypes.find((item) => item.extensions.includes(extension))?.detectedType || "unknown";
}

export function getAnalysisPolicy(analysisType) {
  return FILE_ANALYSIS_POLICY.analyses.find((item) => item.analysisType === analysisType) || null;
}

export function getDefaultAnalysisForType(detectedType) {
  return FILE_ANALYSIS_POLICY.fileTypes.find((item) => item.detectedType === detectedType)?.defaultAnalysis || "auto";
}

export function chooseChunkSizesByPolicy(analysisType, sizeBytes) {
  const policy = getAnalysisPolicy(analysisType);
  const sizes = policy?.recommendedChunkSizes?.length ? policy.recommendedChunkSizes : ["4 MB", "8 MB", "16 MB"];
  if (analysisType !== "fastq-n-stats") return sizes;
  if (sizeBytes >= 5 * 1024 * 1024 * 1024) return ["16 MB", "8 MB", "4 MB"];
  if (sizeBytes >= 1024 * 1024 * 1024) return ["8 MB", "16 MB", "4 MB"];
  return sizes;
}
