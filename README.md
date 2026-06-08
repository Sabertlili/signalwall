# SignalWall

SignalWall is a small open-source Windows live wallpaper host built from scratch for Quote Signal.

It creates one borderless WebView2 wallpaper window per monitor, attaches those windows behind the desktop icons, and loads the bundled Quote Signal HTML wallpaper.

## Status

This is an early MVP, not a full Lively Wallpaper replacement yet.

Current features:

- Multi-monitor wallpaper windows
- WebView2-powered HTML/CSS/JS wallpaper rendering
- Quote Signal bundled as the default wallpaper
- Per-screen slot injection for screen-specific themes
- Tray menu with reload, open web folder, and exit

Planned features:

- Built-in settings UI
- Installer and auto-start option
- Fullscreen app/game pause behavior
- Wallpaper library
- Import/export of themes and quote packs

## Requirements

- Windows 10 or Windows 11
- .NET 8 SDK for development
- Microsoft Edge WebView2 Runtime

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

After launch, SignalWall appears in the system tray. Right-click the tray icon to reload wallpapers, open the bundled web folder, or exit.

## Publish

```powershell
dotnet publish .\src\SignalWall\SignalWall.csproj -c Release -r win-x64 --self-contained false -o .\publish\win-x64
```

## Installer signing

Unsigned public installers can be blocked by Windows Smart App Control. See [docs/code-signing.md](docs/code-signing.md) for the signing workflow and GitHub Actions secrets.

## License

MIT. SignalWall is a clean-room project and does not copy Lively Wallpaper source code.
