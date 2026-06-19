param(
    [string] $Configuration = "Release",
    [string] $Runtime = "win-x64",
    [string] $Version = "0.2.0",
    [string] $SigningPfxPath = $env:SIGNALWALL_SIGNING_PFX_PATH,
    [string] $SigningPfxBase64 = $env:SIGNALWALL_SIGNING_PFX_BASE64,
    [string] $SigningPfxPassword = $env:SIGNALWALL_SIGNING_PFX_PASSWORD,
    [string] $TimestampUrl = $(if ($env:SIGNALWALL_TIMESTAMP_URL) { $env:SIGNALWALL_TIMESTAMP_URL } else { "http://timestamp.digicert.com" })
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

$script:SigningConfig = $null
$script:SigningTempPfx = $null

function Get-SignToolPath {
    $signToolCmd = Get-Command signtool.exe -ErrorAction SilentlyContinue
    if ($signToolCmd) {
        return $signToolCmd.Source
    }

    $kitsRoot = Join-Path ${env:ProgramFiles(x86)} "Windows Kits\10\bin"
    if (Test-Path $kitsRoot) {
        $candidate = Get-ChildItem -Path $kitsRoot -Recurse -Filter signtool.exe -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -match "\\x64\\signtool\.exe$" } |
            Sort-Object FullName -Descending |
            Select-Object -First 1

        if ($candidate) {
            return $candidate.FullName
        }
    }

    throw "signtool.exe was not found. Install the Windows SDK or add signtool.exe to PATH."
}

function Initialize-CodeSigning {
    if ([string]::IsNullOrWhiteSpace($SigningPfxPath) -and [string]::IsNullOrWhiteSpace($SigningPfxBase64)) {
        Write-Host "Code signing skipped: no certificate was configured."
        return
    }

    $resolvedPfxPath = $SigningPfxPath
    if (-not [string]::IsNullOrWhiteSpace($SigningPfxBase64)) {
        $tempRoot = if ($env:RUNNER_TEMP) { $env:RUNNER_TEMP } else { [System.IO.Path]::GetTempPath() }
        $resolvedPfxPath = Join-Path $tempRoot "signalwall-codesign-$([Guid]::NewGuid()).pfx"
        [System.IO.File]::WriteAllBytes($resolvedPfxPath, [Convert]::FromBase64String($SigningPfxBase64))
        $script:SigningTempPfx = $resolvedPfxPath
    }

    if (-not (Test-Path $resolvedPfxPath)) {
        throw "Configured signing certificate was not found: $resolvedPfxPath"
    }

    $password = if ($null -eq $SigningPfxPassword) { "" } else { $SigningPfxPassword }
    $cert = [System.Security.Cryptography.X509Certificates.X509Certificate2]::new(
        $resolvedPfxPath,
        $password,
        [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::Exportable
    )

    $script:SigningConfig = [pscustomobject]@{
        PfxPath = $resolvedPfxPath
        Certificate = $cert
        SignTool = Get-SignToolPath
    }

    Write-Host "Code signing enabled."
}

function Clear-SigningTemp {
    if ($script:SigningTempPfx -and (Test-Path $script:SigningTempPfx)) {
        Remove-Item -LiteralPath $script:SigningTempPfx -Force -ErrorAction SilentlyContinue
    }
}

function Sign-AuthenticodeFile {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path
    )

    if (-not $script:SigningConfig) {
        return
    }

    $signature = Get-AuthenticodeSignature -FilePath $Path
    if ($signature.Status -eq "Valid") {
        Write-Host "Already signed: $Path"
        return
    }

    if ($signature.Status -ne "NotSigned") {
        throw "Refusing to sign file with unexpected signature state '$($signature.Status)': $Path"
    }

    Write-Host "Signing: $Path"
    $signArgs = @("sign", "/f", $script:SigningConfig.PfxPath, "/fd", "SHA256", "/tr", $TimestampUrl, "/td", "SHA256")
    if (-not [string]::IsNullOrEmpty($SigningPfxPassword)) {
        $signArgs += @("/p", $SigningPfxPassword)
    }
    $signArgs += $Path

    & $script:SigningConfig.SignTool @signArgs | Out-Host
    if ($LASTEXITCODE -ne 0) {
        throw "signtool failed for: $Path"
    }

    $signed = Get-AuthenticodeSignature -FilePath $Path
    if ($signed.Status -ne "Valid") {
        throw "Signed file did not validate as trusted. Status: $($signed.Status). Path: $Path"
    }
}

function Sign-PowerShellScript {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path
    )

    if (-not $script:SigningConfig) {
        return
    }

    Write-Host "Signing PowerShell script: $Path"
    $result = Set-AuthenticodeSignature -FilePath $Path -Certificate $script:SigningConfig.Certificate -TimestampServer $TimestampUrl
    if ($result.Status -ne "Valid") {
        throw "PowerShell script signature failed. Status: $($result.Status). Path: $Path"
    }
}

trap {
    Clear-SigningTemp
    throw
}

Remove-Item -LiteralPath $publishDir -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $installerWorkDir -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $publishDir, $distDir, $payloadRoot, $stageDir | Out-Null

Initialize-CodeSigning

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

Get-ChildItem -Path $payloadRoot -Recurse -File -Include *.exe, *.dll |
    ForEach-Object { Sign-AuthenticodeFile -Path $_.FullName }

Sign-PowerShellScript -Path (Join-Path $payloadRoot "uninstall.ps1")

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

Sign-PowerShellScript -Path (Join-Path $stageDir "install.ps1")

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

Sign-AuthenticodeFile -Path $setupExe
Clear-SigningTemp

Write-Host "Installer created at $setupExe"
