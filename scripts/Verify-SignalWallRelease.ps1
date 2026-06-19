param(
    [string] $ReleaseDirectory = ".",
    [string] $ChecksumsFile = "SHA256SUMS.txt",
    [switch] $VerifyGitHubProvenance
)

$ErrorActionPreference = "Stop"

$root = (Resolve-Path -LiteralPath $ReleaseDirectory).Path
$checksumsPath = Join-Path $root $ChecksumsFile
if (-not (Test-Path -LiteralPath $checksumsPath -PathType Leaf)) {
    throw "Checksum file not found: $checksumsPath"
}

$entries = foreach ($line in Get-Content -LiteralPath $checksumsPath) {
    if ([string]::IsNullOrWhiteSpace($line)) {
        continue
    }

    if ($line -notmatch "^(?<hash>[0-9a-fA-F]{64})\s{2}(?<name>.+)$") {
        throw "Invalid checksum line: $line"
    }

    [pscustomobject]@{
        Hash = $Matches.hash.ToLowerInvariant()
        Name = $Matches.name
    }
}

if (-not $entries) {
    throw "The checksum file does not contain any artifacts."
}

$failed = $false
foreach ($entry in $entries) {
    $path = Join-Path $root $entry.Name
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        Write-Host "[MISSING] $($entry.Name)" -ForegroundColor Red
        $failed = $true
        continue
    }

    $actual = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actual -ne $entry.Hash) {
        Write-Host "[MISMATCH] $($entry.Name)" -ForegroundColor Red
        Write-Host "  expected $($entry.Hash)"
        Write-Host "  actual   $actual"
        $failed = $true
        continue
    }

    Write-Host "[OK] $($entry.Name)" -ForegroundColor Green

    if ([System.IO.Path]::GetExtension($path) -eq ".exe") {
        $signature = Get-AuthenticodeSignature -FilePath $path
        Write-Host "  Authenticode: $($signature.Status)"
    }
}

if ($failed) {
    throw "SignalWall release verification failed."
}

if ($VerifyGitHubProvenance) {
    $gh = Get-Command gh -ErrorAction SilentlyContinue
    if (-not $gh) {
        throw "GitHub CLI is required for provenance verification. Install it from https://cli.github.com/"
    }

    foreach ($entry in $entries | Where-Object { $_.Name -match "\.(exe|zip)$" }) {
        $path = Join-Path $root $entry.Name
        & $gh.Source attestation verify $path -R Sabertlili/signalwall
        if ($LASTEXITCODE -ne 0) {
            throw "GitHub provenance verification failed for $($entry.Name)."
        }
    }
}

Write-Host ""
Write-Host "SignalWall release verification passed." -ForegroundColor Green
