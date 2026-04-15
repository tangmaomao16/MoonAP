fn main {
  println(@lib.verification_gate_json_for_mode("fastq-agent", "fastq-n-stats"))
  println("---")
  println(@lib.verification_gate_json_for_mode("moonbit-task", ""))
  println("---")
  println(@lib.verification_gate_json_for_mode("game-agent", ""))
}
