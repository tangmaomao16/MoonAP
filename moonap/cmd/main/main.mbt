fn main {
  let fastq = @lib.build_demo_context(@lib.fastq_demo_task())
  println("MoonAP demo context")
  println("===================")
  println(fastq.summary())
  println("")
  println(fastq.to_pretty_json())
}
