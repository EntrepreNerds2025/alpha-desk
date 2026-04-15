param(
  [int]$DebounceSeconds = 8,
  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

if (-not (Test-Path ".git")) {
  throw "auto-push.ps1 must run from inside a git repo."
}

Write-Host "Auto-push watcher started for $repoRoot (branch: $Branch, debounce: $DebounceSeconds sec)." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop." -ForegroundColor Cyan

$pendingSince = $null

while ($true) {
  $status = (git status --porcelain).Trim()

  if ([string]::IsNullOrWhiteSpace($status)) {
    $pendingSince = $null
    Start-Sleep -Seconds 2
    continue
  }

  if (-not $pendingSince) {
    $pendingSince = Get-Date
    Start-Sleep -Seconds 2
    continue
  }

  $elapsed = (Get-Date) - $pendingSince
  if ($elapsed.TotalSeconds -lt $DebounceSeconds) {
    Start-Sleep -Seconds 2
    continue
  }

  try {
    git add -A

    $afterAddStatus = (git status --porcelain).Trim()
    if ([string]::IsNullOrWhiteSpace($afterAddStatus)) {
      $pendingSince = $null
      Start-Sleep -Seconds 2
      continue
    }

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"
    $message = "chore: auto-sync $timestamp"

    git commit -m $message | Out-Host
    git push origin $Branch | Out-Host

    Write-Host "Auto-pushed commit: $message" -ForegroundColor Green
  }
  catch {
    Write-Warning "Auto-push failed: $($_.Exception.Message)"
  }
  finally {
    $pendingSince = $null
  }

  Start-Sleep -Seconds 2
}
