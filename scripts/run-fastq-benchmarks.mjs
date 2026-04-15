import { writeFastqBenchmarkArtifacts } from "../server/lib/fastq-benchmark.mjs";

const skipBuild = process.argv.includes("--skip-build");
const skipSamples = process.argv.includes("--skip-samples");

const result = await writeFastqBenchmarkArtifacts({
  compileArtifact: !skipBuild,
  includeSamples: !skipSamples,
});

console.log("MoonAP FastQ benchmark suite completed.");
console.log(`JSON report: ${result.jsonPath}`);
console.log(`Markdown report: ${result.markdownPath}`);
console.log("");
console.log(result.markdown);
