fn main {
  let fastq = @lib.build_demo_context(@lib.fastq_demo_task())
  println("MoonAP demo context")
  println("===================")
  println(fastq.summary())
  println("")
  println("benchmark tiers = " + fastq.benchmark_profile.map(profile => profile.benchmark_tiers.iter().join(" / ")).unwrap_or("(none)"))
  println("recommended chunks = " + fastq.benchmark_profile.map(profile => profile.recommended_chunk_sizes.iter().join(" / ")).unwrap_or("(none)"))
  println("")
  println(fastq.to_pretty_json())
}
