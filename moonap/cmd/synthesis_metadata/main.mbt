fn print_metadata(mode : String, analysis_type : String) -> Unit {
  println(@lib.synthesis_manifest_json_for_mode(mode, analysis_type))
  println("---")
  println(@lib.benchmark_profile_json_for_mode(mode, analysis_type))
}

fn main {
  print_metadata("fastq-agent", "fastq-n-stats")
  println("===")
  print_metadata("moonbit-task", "")
  println("===")
  print_metadata("game-agent", "")
}
