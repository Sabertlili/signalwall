param(
    [string] $Configuration = "Release"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$project = Join-Path $repoRoot "src\SignalWall\SignalWall.csproj"

dotnet restore $project
dotnet build $project -c $Configuration --no-restore
