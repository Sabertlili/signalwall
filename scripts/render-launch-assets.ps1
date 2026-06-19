param(
    [string]$ChromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$assetsDir = Join-Path $repoRoot "docs\launch-assets"
$sourceAssets = Join-Path $repoRoot "docs\assets"
$tempDir = Join-Path $env:TEMP ("signalwall-launch-assets-" + [guid]::NewGuid().ToString("N"))

New-Item -ItemType Directory -Force -Path $assetsDir | Out-Null
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

if (-not (Test-Path -LiteralPath $ChromePath)) {
    throw "Chrome was not found at $ChromePath"
}

function Convert-PathToFileUri([string]$Path) {
    return ([System.Uri](Resolve-Path -LiteralPath $Path).Path).AbsoluteUri
}

function Write-WrapperHtml {
    param(
        [string]$SvgPath,
        [string]$OutputPath,
        [string]$Fit = "cover"
    )

    $svgUri = Convert-PathToFileUri $SvgPath
    $html = @"
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; width: 1270px; height: 760px; overflow: hidden; background: #070907; }
    body { display: grid; place-items: center; }
    img { width: 1270px; height: 760px; object-fit: $Fit; display: block; }
  </style>
</head>
<body>
  <img src="$svgUri" alt="">
</body>
</html>
"@
    Set-Content -LiteralPath $OutputPath -Value $html -Encoding UTF8
}

function Capture-Chrome {
    param(
        [string]$HtmlPath,
        [string]$OutputPath,
        [int]$Width,
        [int]$Height
    )

    $uri = Convert-PathToFileUri $HtmlPath
    $arguments = @(
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        "--window-size=$Width,$Height",
        "--screenshot=$OutputPath",
        $uri
    )

    & $ChromePath @arguments | Out-Null

    if (-not (Test-Path -LiteralPath $OutputPath)) {
        throw "Chrome did not create $OutputPath"
    }
}

function Write-ThumbnailHtml {
    param([string]$OutputPath)

    $html = @"
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; width: 240px; height: 240px; overflow: hidden; background: #060806; }
    body {
      display: grid;
      place-items: center;
      color: #f7efe1;
      font-family: Arial, Helvetica, sans-serif;
      font-weight: 900;
      letter-spacing: 0;
      background:
        radial-gradient(circle at 74% 23%, rgba(152,214,200,.32), transparent 26%),
        radial-gradient(circle at 26% 74%, rgba(241,196,100,.28), transparent 28%),
        linear-gradient(145deg, #060806 0%, #0f1712 52%, #080907 100%);
    }
    .mark {
      width: 190px;
      height: 190px;
      border: 1px solid rgba(247,239,225,.24);
      border-radius: 28px;
      display: grid;
      place-items: center;
      position: relative;
      overflow: hidden;
      box-shadow: inset 0 0 60px rgba(247,239,225,.06);
    }
    .mark::before {
      content: "";
      position: absolute;
      inset: 44px 18px auto 18px;
      height: 2px;
      background: linear-gradient(90deg, #e3bd63, #98d6c8, #bd86de);
    }
    .dot {
      position: absolute;
      top: 38px;
      right: 36px;
      width: 18px;
      height: 18px;
      border-radius: 999px;
      background: #f7efe1;
    }
    .letters { font-size: 76px; line-height: .9; transform: translateY(10px); }
  </style>
</head>
<body>
  <div class="mark">
    <div class="dot"></div>
    <div class="letters">SW</div>
  </div>
</body>
</html>
"@
    Set-Content -LiteralPath $OutputPath -Value $html -Encoding UTF8
}

$wallpaperHtml = Join-Path $tempDir "wallpaper.html"
$controlHtml = Join-Path $tempDir "control.html"
$multiHtml = Join-Path $tempDir "multi.html"
$positioningHtml = Join-Path $tempDir "positioning.html"
$thumbHtml = Join-Path $tempDir "thumbnail.html"

Write-WrapperHtml -SvgPath (Join-Path $sourceAssets "quote-signal-capture.svg") -OutputPath $wallpaperHtml -Fit "cover"
Write-WrapperHtml -SvgPath (Join-Path $sourceAssets "customization-workflow.svg") -OutputPath $controlHtml -Fit "cover"
Write-WrapperHtml -SvgPath (Join-Path $sourceAssets "screen-layout-modes.svg") -OutputPath $multiHtml -Fit "contain"
Write-WrapperHtml -SvgPath (Join-Path $sourceAssets "product-hunt-positioning-v3.svg") -OutputPath $positioningHtml -Fit "cover"
Write-ThumbnailHtml -OutputPath $thumbHtml

Capture-Chrome -HtmlPath $wallpaperHtml -OutputPath (Join-Path $assetsDir "product-hunt-gallery-1-wallpaper.png") -Width 1270 -Height 760
Capture-Chrome -HtmlPath $controlHtml -OutputPath (Join-Path $assetsDir "product-hunt-gallery-2-control-center.png") -Width 1270 -Height 760
Capture-Chrome -HtmlPath $multiHtml -OutputPath (Join-Path $assetsDir "product-hunt-gallery-3-multi-monitor.png") -Width 1270 -Height 760
Capture-Chrome -HtmlPath $positioningHtml -OutputPath (Join-Path $assetsDir "product-hunt-gallery-1-positioning-v3.png") -Width 1270 -Height 760
Capture-Chrome -HtmlPath $thumbHtml -OutputPath (Join-Path $assetsDir "product-hunt-thumbnail.png") -Width 240 -Height 240

$resolvedTempDir = (Resolve-Path -LiteralPath $tempDir).Path
$resolvedTempRoot = (Resolve-Path -LiteralPath $env:TEMP).Path.TrimEnd('\')
if (-not $resolvedTempDir.StartsWith($resolvedTempRoot + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to remove unexpected temporary directory: $resolvedTempDir"
}
Remove-Item -LiteralPath $resolvedTempDir -Recurse -Force

Get-ChildItem -LiteralPath $assetsDir -Filter "*.png" |
    Select-Object Name, Length |
    Format-Table -AutoSize
