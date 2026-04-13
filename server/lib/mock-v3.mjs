function contains(text, words) {
  return words.some((word) => text.includes(word));
}

function extractLastNumber(text, fallback) {
  const matches = text.match(/\d+/g);
  return matches && matches.length > 0 ? Number(matches[matches.length - 1]) : fallback;
}

function helloProgram(message) {
  return `fn main {\n  println("${message}")\n}`;
}

function sumProgram(limit) {
  return `fn sum_to(n : Int) -> Int {\n  let mut total = 0\n  let mut i = 1\n  while i <= n {\n    total = total + i\n    i = i + 1\n  }\n  total\n}\n\nfn main {\n  let n = ${limit}\n  println("sum(1.." + n.to_string() + ") = " + sum_to(n).to_string())\n}`;
}

function fastqDemoProgram() {
  return `fn count_n_bases(sequence : String) -> Int {\n  let mut total = 0\n  for char in sequence {\n    if char == 'N' || char == 'n' {\n      total = total + 1\n    }\n  }\n  total\n}\n\nfn main {\n  let sample = "AATTCCGGNNNNA"\n  let n_count = count_n_bases(sample)\n  println("sample sequence = " + sample)\n  println("N bases = " + n_count.to_string())\n  println("ratio = " + n_count.to_string() + "/" + sample.length().to_string())\n}`;
}

function csvDemoProgram() {
  return `fn split_count(line : String, delimiter : Char) -> Int {\n  let mut count = 1\n  for char in line {\n    if char == delimiter {\n      count = count + 1\n    }\n  }\n  count\n}\n\nfn main {\n  let header = "sample_id,group,score"\n  println("header = " + header)\n  println("column count = " + split_count(header, ',').to_string())\n}`;
}

function safePrompt(prompt) {
  return prompt.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function generateMockChatReply(prompt, context = {}) {
  const fileInfo = context.fileInfo || null;
  const analysis = context.analysis || null;
  const normalized = prompt.toLowerCase();

  if (analysis) {
    return [
      fileInfo ? `I analyzed the local file ${fileInfo.path}.` : "I completed a local file analysis.",
      "",
      analysis.summary,
      "",
      "If you want, I can next refine the analysis logic or produce a more specialized MoonBit example.",
    ].join("\n");
  }

  if (fileInfo) {
    return `I loaded the local file context for ${fileInfo.path}. You can now ask for FastQ quality stats, CSV structure checks, JSON inspection, or a custom local analysis workflow.`;
  }

  if (contains(normalized, ["chatgpt", "assistant", "moonap"])) {
    return "MoonAP is ready for chat. When you add a local file path and ask for analysis, it will switch into the MoonBit -> WebAssembly -> browser execution workflow.";
  }

  return "I can chat normally, help design an analysis workflow, or switch into local file analysis mode when you provide a file path.";
}

export function generateMockMoonBit(prompt, context = {}) {
  const normalized = prompt.toLowerCase();
  const fileInfo = context.fileInfo || null;
  const analysis = context.analysis || null;

  if (analysis?.analysisType === "fastq-n-stats" || contains(normalized, ["fastq", ".fastq", ".fq", "n base"])) {
    return {
      title: "FastQ N Base Analyzer Demo",
      summary: "Generated a MoonBit demo program that shows the core counting logic for N bases.",
      moonbitCode: fastqDemoProgram(),
    };
  }

  if (analysis?.analysisType === "csv-summary" || fileInfo?.detectedType === "csv" || contains(normalized, ["csv"])) {
    return {
      title: "CSV Structure Demo",
      summary: "Generated a MoonBit demo program that illustrates simple CSV header analysis.",
      moonbitCode: csvDemoProgram(),
    };
  }

  if (contains(normalized, ["hello", "greet"])) {
    return {
      title: "Hello MoonBit",
      summary: "Generated a minimal runnable MoonBit program that prints a greeting.",
      moonbitCode: helloProgram("Hello from MoonBit and WebAssembly!"),
    };
  }

  if (contains(normalized, ["sum"])) {
    const n = extractLastNumber(normalized, 100);
    return {
      title: "Sum Calculator",
      summary: "Generated a MoonBit program that adds numbers from 1 to the requested upper bound.",
      moonbitCode: sumProgram(n),
    };
  }

  return {
    title: "MoonBit Starter",
    summary: "Returned a safe starter program when the local generator did not match a more specific intent.",
    moonbitCode: `fn main {\n  println("MoonAP received: ${safePrompt(prompt)}")\n  println("Tip: provide a file path and ask for local analysis to trigger the Wasm workflow.")\n}`,
  };
}
