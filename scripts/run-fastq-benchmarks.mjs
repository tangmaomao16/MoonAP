import { writeFastqBenchmarkArtifacts } from "../server/lib/fastq-benchmark.mjs";

const skipBuild = process.argv.includes("--skip-build");

const result = await writeFastqBenchmarkArtifacts({
  compileArtifact: !skipBuild,
});

console.log("MoonAP FastQ benchmark suite completed.");
console.log(`JSON report: ${result.jsonPath}`);
console.log(`Markdown report: ${result.markdownPath}`);
console.log("");
console.log(result.markdown);
