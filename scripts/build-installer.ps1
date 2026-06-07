param(
    [string] $Configuration = "Release",
    [string] $Runtime = "win-x64",
    [string] $Version = "0.1.0"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$workspaceRoot = Split-Path -Parent $repoRoot
$project = Join-Path $repoRoot "src\SignalWall\SignalWall.csproj"
$publishDir = Join-Path $repoRoot "publish\$Runtime-self-contained"
$distDir = Join-Path $repoRoot "dist"
$installerWorkDir = Join-Path $repoRoot "installer-work"
$payloadRoot = Join-Path $installerWorkDir "payload"
$stageDir = Join-Path $installerWorkDir "stage"
$payloadZip = Join-Path $stageDir "SignalWallPayload.zip"
$sedPath = Join-Path $installerWorkDir "SignalWallSetup.sed"
$setupExe = Join-Path $distDir "SignalWallSetup-v$Version-$Runtime.exe"

$localDotnet = Join-Path $workspaceRoot ".dotnet-sdk\dotnet.exe"
if (Test-Path $localDotnet) {
    $dotnet = $localDotnet
} else {
    $dotnetCmd = Get-Command dotnet -ErrorAction SilentlyContinue
    if (-not $dotnetCmd) {
        throw "dotnet was not found."
    }
    $dotnet = $dotnetCmd.Source
}

$iexpressCmd = Get-Command iexpress.exe -ErrorAction SilentlyContinue
if (-not $iexpressCmd) {
    throw "iexpress.exe was not found. It is required to build the installer on Windows."
}

Remove-Item -LiteralPath $publishDir -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $installerWorkDir -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $publishDir, $distDir, $payloadRoot, $stageDir | Out-Null

& $dotnet publish $project `
    -c $Configuration `
    -r $Runtime `
    --self-contained true `
    -p:PublishSingleFile=false `
    -o $publishDir

Copy-Item -Path (Join-Path $publishDir "*") -Destination $payloadRoot -Recurse -Force

@'
@echo off
set "SWDIR=%~dp0"
cd /d "%TEMP%"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SWDIR%uninstall.ps1"
'@ | Set-Content -Path (Join-Path $payloadRoot "UninstallSignalWall.cmd") -Encoding ASCII

@'
$ErrorActionPreference = "Stop"

$installRoot = Join-Path $env:LOCALAPPDATA "Programs\SignalWall"
$expectedSuffix = "Programs\SignalWall"
if (-not $installRoot.EndsWith($expectedSuffix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to remove unexpected install path: $installRoot"
}

Stop-Process -Name "SignalWall" -ErrorAction SilentlyContinue

$startMenuDir = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\SignalWall"
$desktopShortcut = Join-Path ([Environment]::GetFolderPath("Desktop")) "SignalWall.lnk"

Remove-Item -LiteralPath $desktopShortcut -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $startMenuDir -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\SignalWall" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $installRoot -Recurse -Force -ErrorAction SilentlyContinue
'@ | Set-Content -Path (Join-Path $payloadRoot "uninstall.ps1") -Encoding ASCII

Compress-Archive -Path (Join-Path $payloadRoot "*") -DestinationPath $payloadZip -Force

@'
@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1"
'@ | Set-Content -Path (Join-Path $stageDir "InstallSignalWall.cmd") -Encoding ASCII

@"
`$ErrorActionPreference = "Stop"

`$installRoot = Join-Path `$env:LOCALAPPDATA "Programs\SignalWall"
`$payload = Join-Path `$PSScriptRoot "SignalWallPayload.zip"
`$startMenuDir = Join-Path `$env:APPDATA "Microsoft\Windows\Start Menu\Programs\SignalWall"
`$desktopShortcut = Join-Path ([Environment]::GetFolderPath("Desktop")) "SignalWall.lnk"
`$exe = Join-Path `$installRoot "SignalWall.exe"
`$uninstallCmd = Join-Path `$installRoot "UninstallSignalWall.cmd"

Stop-Process -Name "SignalWall" -ErrorAction SilentlyContinue

if (Test-Path `$installRoot) {
    Remove-Item -LiteralPath `$installRoot -Recurse -Force
}

New-Item -ItemType Directory -Force -Path `$installRoot, `$startMenuDir | Out-Null
Expand-Archive -LiteralPath `$payload -DestinationPath `$installRoot -Force

`$shell = New-Object -ComObject WScript.Shell

`$startMenuShortcut = `$shell.CreateShortcut((Join-Path `$startMenuDir "SignalWall.lnk"))
`$startMenuShortcut.TargetPath = `$exe
`$startMenuShortcut.WorkingDirectory = `$installRoot
`$startMenuShortcut.IconLocation = "`$exe,0"
`$startMenuShortcut.Save()

`$desktopLink = `$shell.CreateShortcut(`$desktopShortcut)
`$desktopLink.TargetPath = `$exe
`$desktopLink.WorkingDirectory = `$installRoot
`$desktopLink.IconLocation = "`$exe,0"
`$desktopLink.Save()

`$uninstallKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\SignalWall"
New-Item -Path `$uninstallKey -Force | Out-Null
New-ItemProperty -Path `$uninstallKey -Name "DisplayName" -Value "SignalWall" -PropertyType String -Force | Out-Null
New-ItemProperty -Path `$uninstallKey -Name "DisplayVersion" -Value "$Version" -PropertyType String -Force | Out-Null
New-ItemProperty -Path `$uninstallKey -Name "Publisher" -Value "Nestcells" -PropertyType String -Force | Out-Null
New-ItemProperty -Path `$uninstallKey -Name "InstallLocation" -Value `$installRoot -PropertyType String -Force | Out-Null
New-ItemProperty -Path `$uninstallKey -Name "DisplayIcon" -Value `$exe -PropertyType String -Force | Out-Null
New-ItemProperty -Path `$uninstallKey -Name "UninstallString" -Value "`"`$uninstallCmd`"" -PropertyType String -Force | Out-Null
New-ItemProperty -Path `$uninstallKey -Name "URLInfoAbout" -Value "https://nestcells.com" -PropertyType String -Force | Out-Null
New-ItemProperty -Path `$uninstallKey -Name "NoModify" -Value 1 -PropertyType DWord -Force | Out-Null
New-ItemProperty -Path `$uninstallKey -Name "NoRepair" -Value 1 -PropertyType DWord -Force | Out-Null

Start-Process -FilePath `$exe
"@ | Set-Content -Path (Join-Path $stageDir "install.ps1") -Encoding ASCII

$targetName = $setupExe.Replace("\", "\\")
$stageName = ($stageDir + "\").Replace("\", "\\")

@"
[Version]
Class=IEXPRESS
SEDVersion=3
[Options]
PackagePurpose=InstallApp
ShowInstallProgramWindow=1
HideExtractAnimation=1
UseLongFileName=1
InsideCompressed=0
CAB_FixedSize=0
CAB_ResvCodeSigning=0
RebootMode=N
InstallPrompt=%InstallPrompt%
DisplayLicense=%DisplayLicense%
FinishMessage=%FinishMessage%
TargetName=%TargetName%
FriendlyName=%FriendlyName%
AppLaunched=%AppLaunched%
PostInstallCmd=%PostInstallCmd%
AdminQuietInstCmd=%AdminQuietInstCmd%
UserQuietInstCmd=%UserQuietInstCmd%
SourceFiles=SourceFiles
[Strings]
InstallPrompt=
DisplayLicense=
FinishMessage=SignalWall has been installed.
TargetName=$targetName
FriendlyName=SignalWall Setup
AppLaunched=InstallSignalWall.cmd
PostInstallCmd=<None>
AdminQuietInstCmd=InstallSignalWall.cmd
UserQuietInstCmd=InstallSignalWall.cmd
FILE0="SignalWallPayload.zip"
FILE1="InstallSignalWall.cmd"
FILE2="install.ps1"
[SourceFiles]
SourceFiles0=$stageName
[SourceFiles0]
%FILE0%=
%FILE1%=
%FILE2%=
"@ | Set-Content -Path $sedPath -Encoding ASCII

& $iexpressCmd.Source /N /Q $sedPath | Out-Host

if (-not (Test-Path $setupExe)) {
    throw "Installer was not created: $setupExe"
}

Write-Host "Installer created at $setupExe"
