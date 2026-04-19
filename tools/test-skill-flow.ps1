param(
  [string]$PersonalRoot = "",
  [string]$LocalHubRoot = "",
  [string]$CloudHubRoot = "",
  [string]$SkillName = "",
  [switch]$RequireLatestSave,
  [switch]$RequireLocalInstall,
  [switch]$Strict
)

$ErrorActionPreference = "Stop"

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$WorkspaceRoot = Split-Path -Parent $RepoRoot
if ($PersonalRoot -eq "") {
  $PersonalRoot = Join-Path $HOME "MoonAP-SKILL\Personal-SKILL-Set"
}
if ($LocalHubRoot -eq "") {
  $LocalHubRoot = Join-Path $HOME "MoonAP-SKILL\Local-SKILL-Hub"
}
if ($CloudHubRoot -eq "") {
  $CloudHubRoot = Join-Path $WorkspaceRoot "MoonAP-SKILL-Hub"
}

function Add-Result {
  param(
    [string]$Scope,
    [string]$Check,
    [bool]$Ok,
    [string]$Detail = ""
  )
  [pscustomobject]@{
    Scope = $Scope
    Check = $Check
    Ok = $Ok
    Detail = $Detail
  }
}

function Test-SkillFolder {
  param(
    [string]$Scope,
    [string]$Folder,
    [string]$ZipPath = ""
  )
  $results = @()
  $name = Split-Path -Leaf $Folder
  $skillMd = Join-Path $Folder "SKILL.md"
  $programDir = Join-Path $Folder "program"
  $wasm = Join-Path $programDir "main.wasm"
  $source = Join-Path $programDir "main.mbt"
  $results += Add-Result $Scope "$name has SKILL.md" (Test-Path -LiteralPath $skillMd) $skillMd
  $results += Add-Result $Scope "$name has program/main.wasm" (Test-Path -LiteralPath $wasm) $wasm
  $results += Add-Result $Scope "$name has program/main.mbt" (Test-Path -LiteralPath $source) $source
  if ($ZipPath -ne "") {
    $results += Add-Result $Scope "$name has sibling zip" (Test-Path -LiteralPath $ZipPath) $ZipPath
  }
  if (Test-Path -LiteralPath $skillMd) {
    $text = Get-Content -LiteralPath $skillMd -Raw
    $hasRuntimeSpec = $text -match "(?s)# Runtime Spec\s*```json"
    $hasTaskKind = $text -match "(?m)^- task kind:"
    $results += Add-Result $Scope "$name declares task metadata" ($hasRuntimeSpec -or $hasTaskKind) $skillMd
  }
  return $results
}

function Get-SkillFolders {
  param([string]$Root)
  if (!(Test-Path -LiteralPath $Root)) {
    return @()
  }
  Get-ChildItem -LiteralPath $Root -Directory -Recurse |
    Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName "SKILL.md") }
}

$all = @()

$all += Add-Result "Roots" "Personal root exists" (Test-Path -LiteralPath $PersonalRoot) $PersonalRoot
$all += Add-Result "Roots" "Local hub root exists" (Test-Path -LiteralPath $LocalHubRoot) $LocalHubRoot
$all += Add-Result "Roots" "Cloud hub root exists" (Test-Path -LiteralPath $CloudHubRoot) $CloudHubRoot

if (Test-Path -LiteralPath $PersonalRoot) {
  $personalFolders = Get-SkillFolders $PersonalRoot
  if ($SkillName -ne "") {
    $personalFolders = $personalFolders | Where-Object { $_.Name -eq $SkillName -or $_.FullName -like "*$SkillName*" }
  }
  $all += Add-Result "Personal" "discoverable skill folders" ($personalFolders.Count -gt 0) ("count=" + $personalFolders.Count)
  foreach ($folder in $personalFolders) {
    $zipPath = Join-Path (Split-Path -Parent $folder.FullName) ($folder.Name + ".zip")
    $all += Test-SkillFolder "Personal" $folder.FullName $zipPath
  }
}

if (Test-Path -LiteralPath $LocalHubRoot) {
  $localFolders = Get-SkillFolders $LocalHubRoot
  if ($SkillName -ne "") {
    $localFolders = $localFolders | Where-Object { $_.Name -eq $SkillName -or $_.FullName -like "*$SkillName*" }
  }
  $localCount = @($localFolders).Count
  $all += Add-Result "Local" "discoverable installed skill folders" ($localCount -gt 0 -or -not $RequireLocalInstall) ("count=" + $localCount)
  foreach ($folder in $localFolders) {
    $all += Test-SkillFolder "Local" $folder.FullName
  }
}

if (Test-Path -LiteralPath $CloudHubRoot) {
  $indexPath = Join-Path $CloudHubRoot "index.json"
  $all += Add-Result "Cloud" "index.json exists" (Test-Path -LiteralPath $indexPath) $indexPath
  if (Test-Path -LiteralPath $indexPath) {
    $index = Get-Content -LiteralPath $indexPath -Raw | ConvertFrom-Json
    $entries = @($index | ForEach-Object { $_ })
    if ($entries.Count -eq 1 -and $null -ne $entries[0].skills) {
      $entries = @($entries[0].skills | ForEach-Object { $_ })
    }
    if ($SkillName -ne "") {
      $entries = $entries | Where-Object {
        $_.name -eq $SkillName -or $_.id -like "*$SkillName*" -or $_.folder_path -like "*$SkillName*"
      }
    }
    $entryCount = @($entries).Count
    $all += Add-Result "Cloud" "catalog entries" ($entryCount -gt 0) ("count=" + $entryCount)
    foreach ($entry in $entries) {
      $entryName = [string]$entry.name
      $folderPath = [string]$entry.folder_path
      $zipPath = [string]$entry.zip_path
      $folderFull = Join-Path $CloudHubRoot $folderPath
      $zipFull = Join-Path $CloudHubRoot $zipPath
      $all += Add-Result "Cloud" "$entryName folder_path exists" (Test-Path -LiteralPath $folderFull) $folderFull
      $all += Add-Result "Cloud" "$entryName zip_path exists" (Test-Path -LiteralPath $zipFull) $zipFull
      if (Test-Path -LiteralPath $folderFull) {
        $all += Test-SkillFolder "Cloud" $folderFull $zipFull
      }
    }
  }
}

$currentRunFile = Join-Path (Get-Location) "logs\current-run-dir.txt"
if (Test-Path -LiteralPath $currentRunFile) {
  $runDir = (Get-Content -LiteralPath $currentRunFile -Raw).Trim()
  $skillExportRoot = Join-Path (Get-Location) ($runDir + "\skill-export")
  $all += Add-Result "LatestRun" "current run dir exists" (Test-Path -LiteralPath (Join-Path (Get-Location) $runDir)) $runDir
  $all += Add-Result "LatestRun" "skill-export directory exists" (Test-Path -LiteralPath $skillExportRoot) $skillExportRoot
  if (Test-Path -LiteralPath $skillExportRoot) {
    $latestSkillMd = Join-Path $skillExportRoot "SKILL.md"
    $latestManifest = Join-Path $skillExportRoot "skill-manifest.json"
    $latestDecision = Join-Path $skillExportRoot "save-decision.json"
    $latestSkillMdExists = Test-Path -LiteralPath $latestSkillMd
    $latestManifestExists = Test-Path -LiteralPath $latestManifest
    $latestDecisionExists = Test-Path -LiteralPath $latestDecision
    $all += Add-Result "LatestRun" "server-side SKILL.md exists after save decision" ($latestSkillMdExists -or -not $RequireLatestSave) $latestSkillMd
    $all += Add-Result "LatestRun" "server-side skill-manifest exists" ($latestManifestExists -or -not $RequireLatestSave) $latestManifest
    $all += Add-Result "LatestRun" "save-decision recorded" ($latestDecisionExists -or -not $RequireLatestSave) $latestDecision
  }
}

$all | Format-Table -AutoSize

$failed = @($all | Where-Object { -not $_.Ok })
if ($failed.Count -gt 0) {
  Write-Host ""
  Write-Host ("FAILED CHECKS: " + $failed.Count) -ForegroundColor Yellow
  $failed | Format-Table -AutoSize
  if ($Strict) {
    exit 1
  }
} else {
  Write-Host ""
  Write-Host "All SKILL checks passed." -ForegroundColor Green
}
