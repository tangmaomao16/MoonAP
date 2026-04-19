param(
  [string]$BaseUrl = "http://127.0.0.1:3000"
)

$ErrorActionPreference = "Stop"

$cases = @(
  @{ Prompt = "Build an app where the user enters a Celsius temperature and gets the Fahrenheit temperature."; ExpectContract = $true },
  @{ Prompt = "Build an APP which can convert minutes into seconds, or vice versa."; ExpectContract = $true },
  @{ Prompt = "Build an app where the user enters two numbers and gets the sum."; ExpectContract = $true },
  @{ Prompt = "Build a BMI calculator using weight in kg and height in meters."; ExpectContract = $true },
  @{ Prompt = "Build a circle calculator that computes area and circumference from radius."; ExpectContract = $true },
  @{ Prompt = "Build a loan payment calculator using principal, annual interest rate, and months."; ExpectContract = $true },
  @{ Prompt = "Build a tip calculator with bill amount, tip percent, and number of people."; ExpectContract = $true },
  @{ Prompt = "Build a JSON formatter and validator."; ExpectContract = $true; ExpectText = "json-formatter" },
  @{ Prompt = "Build a text analyzer that counts characters, words, lines, and estimated reading time."; ExpectContract = $true; ExpectText = "text-analysis" },
  @{ Prompt = "Build a CSV analyzer that reports row count, column names, missing values, and numeric column summaries."; ExpectContract = $true; ExpectText = "csv-summary" },
  @{ Prompt = "Build a large FastQ file generator that creates a 1GB FASTQ file in the browser."; ExpectContract = $false; ExpectText = "FastQ" },
  @{ Prompt = "Build a large FastQ analyzer that reads a FastQ file in chunks and reports read count, base count, A C G T N, read length, and malformed records."; ExpectContract = $false; ExpectText = "FastQ" }
)

foreach ($case in $cases) {
  $systemPrompt = @"
You are an AI coder.
For text analyzers, use mode=form with tool_kind=text-analysis and one text field named input_text.
For JSON formatter/validator apps, use mode=form with tool_kind=json-formatter and one text field named json_text.
For CSV/TSV analyzers, use mode=file with analysis_type=csv-summary and io_contract.browser_local_only=true.
Return only MoonBit code.
"@
  $requestJson = @{
    model = "gpt-5.4"
    messages = @(
      @{ role = "system"; content = $systemPrompt },
      @{ role = "user"; content = $case.Prompt }
    )
  } | ConvertTo-Json -Depth 8 -Compress

  $proxyBody = "URL`tmoonap://llm-sim/chat/completions`nHEADER`tcontent-type`tapplication/json`nBODY`n$requestJson"
  $response = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/llm/proxy" -Body $proxyBody -ContentType "text/plain"
  $content = [string]$response.choices[0].message.content

  $hasContract = $content.Contains("MOONAP_RUNTIME_SPEC_BEGIN")
  if ($hasContract -ne [bool]$case.ExpectContract) {
    throw "Unexpected runtime contract state for prompt: $($case.Prompt)"
  }
  if ($case.ContainsKey("ExpectText") -and !$content.Contains([string]$case.ExpectText)) {
    throw "Expected generated source to contain '$($case.ExpectText)' for prompt: $($case.Prompt)"
  }

  $compile = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/llm-sim/process-latest-response" -Body "" -ContentType "text/plain"
  if ($compile.ok -ne $true) {
    throw "Compile failed for prompt: $($case.Prompt). Status: $($compile.stage)"
  }

  [pscustomobject]@{
    ok = $true
    prompt = $case.Prompt
    has_contract = $hasContract
    stage = $compile.stage
  } | ConvertTo-Json -Compress
}

$genericSource = @'
/// MOONAP_RUNTIME_SPEC_BEGIN
/// {
///   "mode": "form",
///   "title": "Run browser-local app",
///   "action_label": "Run app",
///   "fields": [{"name":"input_text","label":"Input","type":"text","default":""}]
/// }
/// MOONAP_RUNTIME_SPEC_END
///|
fn main {
  println("MoonAP generic browser-local app")
}
'@

$demoWasmPath = Join-Path $env:TEMP "moonap-demo.wasm"
$compileReport = @{
  ok = $true
  wasm_path = $demoWasmPath
  stage = "moonbit-wasm-compile"
  summary_kind = "none"
} | ConvertTo-Json -Compress
$sequence = @(
  @{ Prompt = "Build a JSON formatter and validator."; Expect = "json_text"; Reject = "tool_kind`": `"text-analysis" },
  @{ Prompt = "Build a text analyzer that counts characters, words, lines, and estimated reading time."; Expect = "text-analysis"; Reject = "json_text" }
)

foreach ($item in $sequence) {
  $envelope = @(
    "TASK_TITLE`tMoonBit Task",
    "ORIGINAL_PROMPT`t$($item.Prompt)",
    "LLM_PROVIDER`topenai",
    "LLM_MODEL`tgpt-5.4",
    "REQUEST_STAGE`ttest-registration",
    "COMPILE_OK`ttrue",
    "WASM_PATH`t$demoWasmPath",
    "SOURCE_BEGIN",
    $genericSource.TrimEnd(),
    "SOURCE_END",
    "COMPILE_REPORT_BEGIN",
    $compileReport,
    "COMPILE_REPORT_END",
    "RAW_RESPONSE_BEGIN",
    "",
    "RAW_RESPONSE_END"
  ) -join "`n"
  $registered = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/runtime-exec/register-ready" -Body $envelope -ContentType "text/plain"
  $specText = $registered.runtime_spec | ConvertTo-Json -Depth 20 -Compress
  if (!$specText.Contains([string]$item.Expect)) {
    throw "Sequential registration expected '$($item.Expect)' for prompt: $($item.Prompt)"
  }
  if ($specText.Contains([string]$item.Reject)) {
    throw "Sequential registration leaked '$($item.Reject)' for prompt: $($item.Prompt)"
  }
  [pscustomobject]@{
    ok = $true
    prompt = $item.Prompt
    sequential_registration_expect = $item.Expect
  } | ConvertTo-Json -Compress
}
