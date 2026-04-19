param(
  [string]$BaseUrl = "http://127.0.0.1:3000",
  [string]$CloudHubRoot = "",
  [switch]$NoIndexUpdate
)

$ErrorActionPreference = "Stop"

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if ($CloudHubRoot -eq "") {
  $CloudHubRoot = Join-Path (Split-Path -Parent $RepoRoot) "MoonAP-SKILL-Hub"
}

$cases = @(
  @{
    Slug = "celsius-fahrenheit-converter"
    Name = "Celsius Fahrenheit Converter"
    Description = "Convert Celsius temperatures to Fahrenheit in the browser."
    Prompt = "Build an app where the user enters a Celsius temperature and gets the Fahrenheit temperature."
  },
  @{
    Slug = "minutes-seconds-converter"
    Name = "Minutes Seconds Converter"
    Description = "Convert minutes to seconds or seconds to minutes with a browser-local form."
    Prompt = "Build an APP which can convert minutes into seconds, or vice versa."
  },
  @{
    Slug = "two-number-sum"
    Name = "Two Number Sum"
    Description = "Add two numbers locally in the browser."
    Prompt = "Build an app where the user enters two numbers and gets the sum."
  },
  @{
    Slug = "bmi-calculator"
    Name = "BMI Calculator"
    Description = "Calculate body mass index from weight and height."
    Prompt = "Build a BMI calculator using weight in kg and height in meters."
  },
  @{
    Slug = "circle-calculator"
    Name = "Circle Calculator"
    Description = "Calculate circle area and circumference from radius."
    Prompt = "Build a circle calculator that computes area and circumference from radius."
  },
  @{
    Slug = "loan-payment-calculator"
    Name = "Loan Payment Calculator"
    Description = "Estimate monthly loan payment from principal, interest rate, and month count."
    Prompt = "Build a loan payment calculator using principal, annual interest rate, and months."
  },
  @{
    Slug = "tip-calculator"
    Name = "Tip Calculator"
    Description = "Calculate tip, total bill, and per-person amount."
    Prompt = "Build a tip calculator with bill amount, tip percent, and number of people."
  },
  @{
    Slug = "json-formatter-validator"
    Name = "JSON Formatter Validator"
    Description = "Validate and pretty-print JSON text locally in the browser."
    Prompt = "Build a JSON formatter and validator."
  },
  @{
    Slug = "text-analyzer"
    Name = "Text Analyzer"
    Description = "Count characters, words, lines, and estimated reading time."
    Prompt = "Build a text analyzer that counts characters, words, lines, and estimated reading time."
  },
  @{
    Slug = "csv-summary-analyzer"
    Name = "CSV Summary Analyzer"
    Description = "Analyze a browser-local CSV or TSV file for rows, columns, missing values, and numeric summaries."
    Prompt = "Build a CSV analyzer that reports row count, column names, missing values, and numeric column summaries."
  }
)

function Invoke-SimulatedCompile {
  param([string]$Prompt)
  $systemPrompt = @"
You are an AI coder.
For ordinary form-style apps, include a MoonAP declarative runtime contract in line comments before main.
For text analyzers, use mode=form with tool_kind=text-analysis and one text field named input_text.
For JSON formatter/validator apps, use mode=form with tool_kind=json-formatter and one text field named json_text.
For CSV/TSV analyzers, use mode=file with analysis_type=csv-summary and io_contract.browser_local_only=true.
Return only MoonBit code.
"@
  $requestJson = @{
    model = "gpt-5.4"
    messages = @(
      @{ role = "system"; content = $systemPrompt },
      @{ role = "user"; content = $Prompt }
    )
  } | ConvertTo-Json -Depth 12 -Compress
  $proxyBody = "URL`tmoonap://llm-sim/chat/completions`nHEADER`tcontent-type`tapplication/json`nBODY`n$requestJson"
  $response = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/llm/proxy" -Body $proxyBody -ContentType "text/plain"
  $source = [string]$response.choices[0].message.content
  if (!$source.Contains("MOONAP_RUNTIME_SPEC_BEGIN")) {
    throw "Generated source did not include a runtime spec for prompt: $Prompt"
  }
  $compile = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/llm-sim/process-latest-response" -Body "" -ContentType "text/plain"
  if ($compile.ok -ne $true) {
    throw "Compile failed for prompt: $Prompt"
  }
  $compileReport = Get-Content -LiteralPath ([string]$compile.compile_report_path) -Raw | ConvertFrom-Json
  [pscustomobject]@{
    RequestId = [string]$compile.request_id
    SourcePath = [string]$compile.source_path
    WasmPath = [string]$compileReport.wasm_path
    Source = $source
  }
}

function Get-RuntimeSpecJson {
  param([string]$Source)
  $match = [regex]::Match($Source, "(?s)MOONAP_RUNTIME_SPEC_BEGIN(?<body>.*?)MOONAP_RUNTIME_SPEC_END")
  if (!$match.Success) {
    throw "Runtime spec markers not found."
  }
  $lines = $match.Groups["body"].Value -split "`n"
  $clean = foreach ($line in $lines) {
    $text = $line.Trim()
    if ($text.StartsWith("///")) {
      $text = $text.Substring(3).TrimStart()
    }
    if ($text.Trim() -ne "") {
      $text
    }
  }
  ($clean -join "`n").Trim()
}

function Write-Skill {
  param(
    [hashtable]$Case,
    [pscustomobject]$Compiled
  )
  $slug = [string]$Case.Slug
  $targetRoot = Join-Path $CloudHubRoot "demo\utilities"
  $targetDir = Join-Path $targetRoot $slug
  $programDir = Join-Path $targetDir "program"
  New-Item -ItemType Directory -Force -Path $programDir | Out-Null
  Copy-Item -LiteralPath $Compiled.SourcePath -Destination (Join-Path $programDir "main.mbt") -Force
  Copy-Item -LiteralPath $Compiled.WasmPath -Destination (Join-Path $programDir "main.wasm") -Force
  $runtimeSpecJson = Get-RuntimeSpecJson $Compiled.Source
  $runtimeSpec = $runtimeSpecJson | ConvertFrom-Json
  $mode = [string]$runtimeSpec.mode
  if ([string]::IsNullOrWhiteSpace($mode)) {
    $mode = "form"
  }
  $resultMode = [string]$runtimeSpec.result_mode
  if ([string]::IsNullOrWhiteSpace($resultMode)) {
    if ($mode -eq "file") {
      $resultMode = "report"
    } else {
      $resultMode = "text"
    }
  }
  $taskKind = [string]$runtimeSpec.task_kind
  if ([string]::IsNullOrWhiteSpace($taskKind)) {
    $taskKind = "generic-task"
  }
  $fields = @($runtimeSpec.fields)
  $inputLines = if ($fields.Count -gt 0) {
    $fields | ForEach-Object {
      $fieldName = [string]$_.name
      $label = [string]$_.label
      $type = [string]$_.type
      if ([string]::IsNullOrWhiteSpace($type)) {
        $type = [string]$_.kind
      }
      if ([string]::IsNullOrWhiteSpace($type)) {
        $type = "text"
      }
      $default = if ($null -ne $_.default) { " (default: $($_.default))" } else { "" }
      "- ${fieldName}: ${label} [${type}]${default}"
    }
  } else {
    "- input_file: Browser-local file selected by the user."
  }
  $skillMd = @"
---
name: $($Case.Name)
description: $($Case.Description)
---

# Key Attributes
- task kind: $taskKind
- runtime mode: $mode
- result mode: $resultMode
- wasm path: program/main.wasm
- moonbit source path: program/main.mbt

# Inputs
$($inputLines -join "`n")

# Output
Browser-local runtime result rendered from this SKILL runtime spec.

# Runtime Spec
``````json
$runtimeSpecJson
``````
"@
  Set-Content -LiteralPath (Join-Path $targetDir "SKILL.md") -Value $skillMd -Encoding UTF8
  $zipPath = Join-Path $targetRoot "$slug.zip"
  if (Test-Path -LiteralPath $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
  }
  Compress-Archive -Path $targetDir -DestinationPath $zipPath -Force
  [pscustomobject]@{
    id = "demo.utilities.$slug"
    name = [string]$Case.Name
    description = [string]$Case.Description
    version = "0.1.0"
    domain = "demo"
    subdomain = "utilities"
    category = "demo"
    task_kind = $taskKind
    runtime_mode = $mode
    result_mode = $resultMode
    folder_path = "demo/utilities/$slug"
    zip_path = "demo/utilities/$slug.zip"
    runtime_spec = $runtimeSpec
  }
}

$entries = @()
foreach ($case in $cases) {
  Write-Host "Generating $($case.Slug)..."
  $compiled = Invoke-SimulatedCompile -Prompt ([string]$case.Prompt)
  $entries += Write-Skill -Case $case -Compiled $compiled
}

$entryPath = Join-Path $CloudHubRoot ".moonap-demo-skill-entries.json"
$entries | ConvertTo-Json -Depth 40 | Set-Content -LiteralPath $entryPath -Encoding UTF8

if (!$NoIndexUpdate) {
  node -e "const fs=require('fs'); const root=process.argv[1]; const readJson=(path)=>JSON.parse(fs.readFileSync(path,'utf8').replace(/^\uFEFF/,'')); const indexPath=root+'/index.json'; const entries=readJson(root+'/.moonap-demo-skill-entries.json'); const current=readJson(indexPath); const next=current.filter(item=>!entries.some(entry=>entry.id===item.id)); next.push(...entries); fs.writeFileSync(indexPath, JSON.stringify(next,null,2)+'\n');" $CloudHubRoot
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to update Cloud SKILL-Hub index.json"
  }
  Remove-Item -LiteralPath $entryPath -Force
}

Write-Host "Published demo SKILL folders: $($entries.Count)"
$entries | Select-Object id,folder_path,zip_path | Format-Table -AutoSize
