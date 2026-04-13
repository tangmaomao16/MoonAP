function contains(text, words) {
  return words.some((word) => text.includes(word));
}

function extractLastNumber(text, fallback) {
  const matches = text.match(/\d+/g);
  return matches && matches.length > 0 ? Number(matches[matches.length - 1]) : fallback;
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

function fastqDemoProgram() {
  return `fn count_n_bases(sequence : String) -> Int {
  let mut total = 0
  for char in sequence {
    if char == 'N' || char == 'n' {
      total = total + 1
    }
  }
  total
}

fn main {
  let sample = "AATTCCGGNNNNA"
  let n_count = count_n_bases(sample)
  println("sample sequence = " + sample)
  println("N bases = " + n_count.to_string())
  println("ratio = " + n_count.to_string() + "/" + sample.length().to_string())
}`;
}

function csvDemoProgram() {
  return `fn split_count(line : String, delimiter : Char) -> Int {
  let mut count = 1
  for char in line {
    if char == delimiter {
      count = count + 1
    }
  }
  count
}

fn main {
  let header = "sample_id,group,score"
  println("header = " + header)
  println("column count = " + split_count(header, ',').to_string())
}`;
}

function safePrompt(prompt) {
  return prompt.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function generateWithMock(prompt, context = {}) {
  const normalized = prompt.toLowerCase();
  const fileInfo = context.fileInfo || null;
  const analysis = context.analysis || null;

  if (analysis?.analysisType === "fastq-n-stats" || contains(normalized, ["fastq", ".fastq", ".fq", "n base", "n碱基"])) {
    return {
      title: "FastQ N Base Analyzer Demo",
      summary:
        "Generated a MoonBit demo program that shows the core counting logic for N bases. The real file statistics are computed by MoonAP's local streaming analyzer.",
      moonbitCode: fastqDemoProgram(),
    };
  }

  if (analysis?.analysisType === "csv-summary" || fileInfo?.detectedType === "csv" || contains(normalized, ["csv"])) {
    return {
      title: "CSV Structure Demo",
      summary:
        "Generated a MoonBit demo program that illustrates simple CSV header analysis. MoonAP's local analyzer provides the actual file summary in the chat response.",
      moonbitCode: csvDemoProgram(),
    };
  }

  if (contains(normalized, ["hello", "你好", "问候", "greet"])) {
    return {
      title: "Hello MoonBit",
      summary: "Generated a minimal runnable MoonBit program that prints a greeting.",
      moonbitCode: helloProgram("Hello from MoonBit and WebAssembly!"),
    };
  }

  if (contains(normalized, ["斐波那契", "fibonacci", "fib"])) {
    const n = extractLastNumber(normalized, 10);
    return {
      title: "Fibonacci Demo",
      summary: "Generated a recursive Fibonacci example to demonstrate MoonBit code synthesis.",
      moonbitCode: fibonacciProgram(n),
    };
  }

  if (contains(normalized, ["素数", "prime"])) {
    const n = extractLastNumber(normalized, 30);
    return {
      title: "Prime Generator",
      summary: "Generated a MoonBit program that prints all primes up to the requested limit.",
      moonbitCode: primeProgram(n),
    };
  }

  if (contains(normalized, ["求和", "sum", "累加", "总和", "的和"])) {
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
    moonbitCode: `fn main {
  println("MoonAP received: ${safePrompt(prompt)}")
  println("Tip: provide a task plus an optional local file path for richer analysis.")
}`,
  };
}
