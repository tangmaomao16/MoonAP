test "greet" {
  let result = greet("Developer")
  if result != "Hello, Developer from MoonBit!" {
    fail("Greeting failed")
  }
}
