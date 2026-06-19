param(
    [int] $Size = 256
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$assetRoot = Join-Path $repoRoot "src\SignalWall\assets"
$pngPath = Join-Path $assetRoot "SignalWall.png"
$icoPath = Join-Path $assetRoot "SignalWall.ico"

New-Item -ItemType Directory -Force -Path $assetRoot | Out-Null

$bitmap = [System.Drawing.Bitmap]::new($Size, $Size)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.Clear([System.Drawing.Color]::FromArgb(255, 7, 8, 6))

$gridPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(22, 246, 239, 226), 1)
for ($position = 32; $position -lt $Size; $position += 32) {
    $graphics.DrawLine($gridPen, $position, 0, $position, $Size)
    $graphics.DrawLine($gridPen, 0, $position, $Size, $position)
}

$signalPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(220, 152, 214, 200), 7)
$signalPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$signalPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawLine($signalPen, 26, 48, 82, 48)

$accentBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 231, 193, 116))
$graphics.FillRectangle($accentBrush, 29, 37, 11, 11)

$font = [System.Drawing.Font]::new("Segoe UI", 154, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$textBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.Rectangle]::new(36, 62, 190, 172),
    [System.Drawing.Color]::FromArgb(255, 255, 248, 237),
    [System.Drawing.Color]::FromArgb(255, 152, 214, 200),
    18
)
$format = [System.Drawing.StringFormat]::new()
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center
$graphics.DrawString("S", $font, $textBrush, [System.Drawing.RectangleF]::new(24, 54, 208, 190), $format)

$bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

$pngBytes = [System.IO.File]::ReadAllBytes($pngPath)
$stream = [System.IO.File]::Create($icoPath)
$writer = [System.IO.BinaryWriter]::new($stream)
$writer.Write([UInt16]0)
$writer.Write([UInt16]1)
$writer.Write([UInt16]1)
$writer.Write([Byte]0)
$writer.Write([Byte]0)
$writer.Write([Byte]0)
$writer.Write([Byte]0)
$writer.Write([UInt16]1)
$writer.Write([UInt16]32)
$writer.Write([UInt32]$pngBytes.Length)
$writer.Write([UInt32]22)
$writer.Write($pngBytes)
$writer.Dispose()

$format.Dispose()
$textBrush.Dispose()
$font.Dispose()
$accentBrush.Dispose()
$signalPen.Dispose()
$gridPen.Dispose()
$graphics.Dispose()
$bitmap.Dispose()

Write-Host "Generated $pngPath"
Write-Host "Generated $icoPath"
