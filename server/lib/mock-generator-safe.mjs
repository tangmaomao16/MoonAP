function contains(text, words) {
  return words.some((word) => text.includes(word));
}

function helloProgram(message) {
  return `fn main {
  println("${message}")
}`;
}

function sumProgram(limit) {
  return `fn sum_to(n : Int) -> Int {
  let mut total = 0
  let mut i = 1
  while i <= n {
    total = total + i
    i = i + 1
  }
  total
}

fn main {
  let n = ${limit}
  println("sum(1.." + n.to_string() + ") = " + sum_to(n).to_string())
}`;
}

function fibonacciProgram(limit) {
  return `fn fib(n : Int) -> Int {
  if n <= 1 {
    n
  } else {
    fib(n - 1) + fib(n - 2)
  }
}

fn main {
  let n = ${limit}
  println("fib(" + n.to_string() + ") = " + fib(n).to_string())
}`;
}

function primeProgram(limit) {
  return `fn is_prime(n : Int) -> Bool {
  if n < 2 {
    false
  } else {
    let mut i = 2
    let mut ok = true
    while i * i <= n {
      if n % i == 0 {
        ok = false
      }
      i = i + 1
    }
    ok
  }
}

fn main {
  let limit = ${limit}
  let mut i = 2
  while i <= limit {
    if is_prime(i) {
      println(i.to_string())
    }
    i = i + 1
  }
}`;
}

function extractNumber(text, fallback) {
  const matches = text.match(/\d+/g);
  return matches && matches.length > 0 ? Number(matches[matches.length - 1]) : fallback;
}

export function generateWithMock(prompt) {
  const normalized = prompt.toLowerCase();

  if (contains(normalized, ["hello", "\u4f60\u597d", "\u95ee\u5019", "greet"])) {
    return {
      title: "Hello MoonBit",
      summary: "Generate a minimal runnable MoonBit program that prints a greeting.",
      moonbitCode: helloProgram("Hello from MoonBit and WebAssembly!"),
    };
  }

  if (contains(normalized, ["\u6590\u6ce2\u90a3\u5951", "fibonacci", "fib"])) {
    const n = extractNumber(normalized, 10);
    return {
      title: "Fibonacci Demo",
      summary: "Generate a recursive Fibonacci example to demonstrate MoonBit code synthesis.",
      moonbitCode: fibonacciProgram(n),
    };
  }

  if (contains(normalized, ["\u7d20\u6570", "prime"])) {
    const n = extractNumber(normalized, 30);
    return {
      title: "Prime Generator",
      summary: "Generate a MoonBit program that prints all primes up to the requested limit.",
      moonbitCode: primeProgram(n),
    };
  }

  if (contains(normalized, ["\u6c42\u548c", "sum", "\u7d2f\u52a0", "\u603b\u548c", "\u7684\u548c"])) {
    const n = extractNumber(normalized, 100);
    return {
      title: "Sum Calculator",
      summary: "Generate a MoonBit program that adds numbers from 1 to the requested upper bound.",
      moonbitCode: sumProgram(n),
    };
  }

  const safePrompt = prompt.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return {
    title: "MoonBit Starter",
    summary: "Return a safe starter program when the mock generator does not match a more specific intent.",
    moonbitCode: `fn main {
  println("MoonAP received: ${safePrompt}")
  println("Tip: connect an OpenAI-compatible API to generate richer MoonBit code.")
}`,
  };
}
