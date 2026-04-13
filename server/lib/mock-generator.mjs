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
  const match = text.match(/\d+/);
  return match ? Number(match[0]) : fallback;
}

export function generateWithMock(prompt) {
  const normalized = prompt.toLowerCase();

  if (contains(normalized, ["hello", "你好", "问候", "greet"])) {
    return {
      title: "Hello MoonBit",
      summary: "生成一个最小可运行的 MoonBit 程序，并输出问候语。",
      moonbitCode: helloProgram("Hello from MoonBit and WebAssembly!"),
    };
  }

  if (contains(normalized, ["斐波那契", "fibonacci", "fib"])) {
    const n = extractNumber(normalized, 10);
    return {
      title: "Fibonacci Demo",
      summary: "生成递归版斐波那契程序，适合展示自然语言到 MoonBit 的代码合成能力。",
      moonbitCode: fibonacciProgram(n),
    };
  }

  if (contains(normalized, ["素数", "prime"])) {
    const n = extractNumber(normalized, 30);
    return {
      title: "Prime Generator",
      summary: "生成一个输出指定范围内素数的 MoonBit 程序。",
      moonbitCode: primeProgram(n),
    };
  }

  if (contains(normalized, ["求和", "sum", "累加", "总和", "的和"])) {
    const n = extractNumber(normalized, 100);
    return {
      title: "Sum Calculator",
      summary: "生成一个从 1 累加到指定上限的 MoonBit 程序。",
      moonbitCode: sumProgram(n),
    };
  }

  return {
    title: "MoonBit Starter",
    summary: "规则生成器没有命中特定意图，因此返回一个可编译的起步程序，便于继续演示整条编译执行链路。",
    moonbitCode: `fn main {
  println("MoonAP received: ${prompt.replace(/"/g, '\\"')}")
  println("Tip: connect an OpenAI-compatible API to generate richer MoonBit code.")
}`,
  };
}
