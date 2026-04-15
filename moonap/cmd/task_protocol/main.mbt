fn main {
  println(@lib.task_kernel_protocol_json_for_mode("fastq-agent"))
  println("---")
  println(@lib.task_kernel_protocol_json_for_mode("moonbit-task"))
  println("---")
  println(@lib.task_kernel_protocol_json_for_mode("game-agent"))
}
