param(
    [string] $Configuration = "Release",
    [string] $Runtime = "win-x64"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$project = Join-Path $repoRoot "src\SignalWall\SignalWall.csproj"
$output = Join-Path $repoRoot "publish\$Runtime"

dotnet publish $project -c $Configuration -r $Runtime --self-contained false -o $output
Write-Host "Published to $output"
