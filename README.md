# SignalWall

Français: [README.fr.md](README.fr.md)

<p align="center">
  <img src="src/SignalWall/assets/SignalWall.png" width="112" alt="SignalWall app icon">
</p>

[![CI](https://github.com/Sabertlili/signalwall/actions/workflows/ci.yml/badge.svg)](https://github.com/Sabertlili/signalwall/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Sabertlili/signalwall/actions/workflows/codeql.yml/badge.svg)](https://github.com/Sabertlili/signalwall/actions/workflows/codeql.yml)
[![Installer](https://github.com/Sabertlili/signalwall/actions/workflows/build-installer.yml/badge.svg)](https://github.com/Sabertlili/signalwall/actions/workflows/build-installer.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-f6efe2.svg)](LICENSE)
[![Windows](https://img.shields.io/badge/platform-Windows-98d6c8.svg)](#requirements)

SignalWall is a free, open-source Windows live wallpaper app for calm, intentional multi-monitor desktops.

Version 0.2 adds a built-in control center for timing, motion, screen order, quote packs, text themes, and color themes. SignalWall creates one borderless WebView2 wallpaper window per monitor and keeps every setting in the app tray.

[Website](https://nestcells.com) | [Source-first install prompt](docs/ai-assisted-install.en.md) | [Roadmap](ROADMAP.md) | [Architecture](ARCHITECTURE.md) | [Launch kit](docs/launch-kit.md) | [Product Hunt pack](docs/product-hunt-submission.md)

## Why it exists

Most live wallpapers are designed to impress for five seconds. SignalWall is designed for the screen you stare at all day.

- Calm typography instead of visual noise.
- Multi-monitor behavior as a first-class workflow.
- Quote and theme systems that can be personalized without touching code.
- A source-first install path while the alpha installer is unsigned.

## Product preview

![SignalWall website and live wallpaper preview](docs/launch-assets/product-hunt-gallery-1-hero-v2.png)

![SignalWall built-in control center](docs/launch-assets/product-hunt-gallery-3-control-center-v2.png)

<details>
<summary>More product captures</summary>

| Wallpaper | Control center |
| --- | --- |
| ![Quote Signal wallpaper capture](docs/assets/quote-signal-capture.svg) | ![Customization workflow](docs/assets/customization-workflow.svg) |

| Multi-screen workflow |
| --- |
| ![Screen layout and modes](docs/assets/screen-layout-modes.svg) |

</details>

## Install safely with Codex or Claude Code

SignalWall is free and open source. Public binaries are currently unsigned, and Windows Smart App Control can block them on strict systems. Do not disable Windows security. The recommended path is to ask Codex, Claude Code, or another local coding agent to inspect the source, build locally, and report security findings before launching the app.

**[Copy the AI-assisted source install prompt](docs/ai-assisted-install.en.md)**

That prompt tells the agent to:

- clone only `https://github.com/Sabertlili/signalwall`;
- inspect the app code, bundled HTML wallpaper, scripts, and GitHub Actions;
- check release binaries with `Get-AuthenticodeSignature` and `Get-FileHash` if needed;
- build from source with `dotnet restore` and `dotnet build`;
- avoid disabling Microsoft Defender, Smart App Control, or browser security;
- explain findings before running the app or building a local installer.

## Current features

- Multi-monitor wallpaper windows.
- Built-in WebView2 control center opened from the tray.
- WebView2-powered HTML/CSS/JS wallpaper rendering.
- Quote Signal bundled as the default wallpaper.
- Same quote across screens or different quotes per screen.
- Global or per-screen text themes.
- Global or per-screen color/background themes.
- Screen order mapping for left, center, and right monitor layouts.
- Quote timing, text size, particles, grid opacity, progress bar, random order, and transition effects.
- Light and dark control-center themes.
- One-phrase-per-line quote pack creation.
- Tray menu with control center, reload, wallpaper folder, website, and exit.

## Requirements

- Windows 10 or Windows 11.
- .NET 8 SDK for development.
- Microsoft Edge WebView2 Runtime.

Most Windows 11 machines already have WebView2 installed. If the app cannot start WebView2, install the Evergreen Runtime from Microsoft.

## Build

```powershell
dotnet restore .\src\SignalWall\SignalWall.csproj
dotnet build .\src\SignalWall\SignalWall.csproj -c Release
```

## Run

```powershell
dotnet run --project .\src\SignalWall\SignalWall.csproj -c Release
```

On first launch, SignalWall opens the control center. Later, use **Open control center** from the tray menu.

## Publish locally

```powershell
dotnet publish .\src\SignalWall\SignalWall.csproj -c Release -r win-x64 --self-contained false -o .\publish\win-x64
```

## Trust and security

- Public alpha installers are unsigned and may be blocked by Windows Smart App Control.
- The project is preparing an application to [SignPath Foundation](https://signpath.org/) for free open-source Authenticode signing.
- Release artifacts include a SHA-256 checksum when built by the installer workflow.
- CodeQL and CI run through GitHub Actions.
- Dependabot tracks NuGet and GitHub Actions updates.
- See [SECURITY.md](SECURITY.md), [docs/code-signing.md](docs/code-signing.md), and the [SignPath application draft](docs/signpath-application.md).

## Contributing

SignalWall is small on purpose. Good contributions improve clarity, safety, multi-monitor behavior, wallpaper polish, or the source-first install path.

Start with [CONTRIBUTING.md](CONTRIBUTING.md), [ROADMAP.md](ROADMAP.md), and [ARCHITECTURE.md](ARCHITECTURE.md).

## License

MIT. SignalWall is a clean-room project and does not copy Lively Wallpaper source code.
