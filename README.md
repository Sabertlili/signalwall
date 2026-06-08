# SignalWall

English below, francais plus bas.

SignalWall is a small open-source Windows live wallpaper host built from scratch for Quote Signal.

It creates one borderless WebView2 wallpaper window per monitor, attaches those windows behind the desktop icons, and loads the bundled Quote Signal HTML wallpaper.

## Install safely with Codex or Claude Code

SignalWall is free and open source. The current public installer is an unsigned alpha, so the recommended path is to ask Codex, Claude Code, or another local coding agent to inspect the source, build it locally, and report security findings before launching it.

Copy the ready-to-use prompt here:

**[AI-assisted source install prompt](docs/ai-assisted-install.md)**

That prompt tells the agent to:

- clone only `https://github.com/Sabertlili/signalwall`;
- inspect the app code, bundled HTML wallpaper, scripts, and GitHub Actions;
- check release binaries with `Get-AuthenticodeSignature` and `Get-FileHash` if needed;
- build from source with `dotnet restore` and `dotnet build`;
- avoid disabling Microsoft Defender, Smart App Control, or browser security;
- explain findings before running the app or building a local installer.

## Captures

![Quote Signal wallpaper capture](docs/assets/quote-signal-capture.svg)

![Customization workflow](docs/assets/customization-workflow.svg)

![Screen layout and modes](docs/assets/screen-layout-modes.svg)

## Status

This is an early MVP, not a full Lively Wallpaper replacement yet.

Current features:

- Multi-monitor wallpaper windows
- WebView2-powered HTML/CSS/JS wallpaper rendering
- Quote Signal bundled as the default wallpaper
- Per-screen slot injection for screen-specific themes
- Same quote across screens or different quotes per screen
- Global or per-screen text themes
- Global or per-screen color/background themes
- Screen order mapping for left, center, and right monitor layouts
- Quote timing, text size, particles, grid opacity, progress bar, random order, and transition effects
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

## Francais

SignalWall est un petit host de fonds d'ecran dynamiques Windows, open source, construit de zero pour Quote Signal.

Il cree une fenetre WebView2 sans bordure par ecran, place ces fenetres derriere les icones du bureau, puis charge le fond d'ecran HTML Quote Signal inclus.

### Installation prudente avec Codex ou Claude Code

Le projet est gratuit et open source. L'installateur public actuel est une alpha non signee, donc le chemin recommande est de demander a Codex, Claude Code ou un agent equivalent d'inspecter le code source, compiler localement, puis presenter un rapport de securite avant de lancer l'app.

Prompt pret a copier:

**[Prompt d'installation source assistee par IA](docs/ai-assisted-install.md)**

Ce prompt demande a l'agent de:

- cloner uniquement `https://github.com/Sabertlili/signalwall`;
- inspecter le code de l'app, le fond d'ecran HTML inclus, les scripts et les GitHub Actions;
- verifier les binaires de release avec `Get-AuthenticodeSignature` et `Get-FileHash` si necessaire;
- compiler depuis la source avec `dotnet restore` et `dotnet build`;
- ne pas desactiver Microsoft Defender, Smart App Control ou la securite navigateur;
- expliquer ses conclusions avant de lancer l'app ou de construire un installateur local.

### Options de personnalisation

- Un fond d'ecran par moniteur.
- Meme citation partout ou citation differente par ecran.
- Theme de texte global ou theme de texte par ecran.
- Theme couleur/background global ou theme couleur/background par ecran.
- Ordre physique des ecrans configurable.
- Duree par citation, taille du texte, densite/vitesse des particules, opacite de grille, barre de progression, ordre aleatoire et effets de transition.

## License

MIT. SignalWall is a clean-room project and does not copy Lively Wallpaper source code.
