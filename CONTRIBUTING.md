# Contributing to SignalWall

SignalWall is early, source-first, and intentionally small. Contributions are welcome when they keep the app calm, inspectable, and useful on real Windows desktops.

## Good first contributions

- Improve the README, screenshots, or install prompts.
- Add quote packs, theme presets, or transition presets.
- Share a preset file that demonstrates a useful desktop workflow.
- Improve multi-monitor behavior on unusual layouts.
- Add tests around screen-slot mapping and configuration parsing.
- Report installation friction with clear Windows version and security-tool details.

## Local setup

```powershell
git clone https://github.com/Sabertlili/signalwall.git
cd signalwall
dotnet restore .\src\SignalWall\SignalWall.csproj
dotnet build .\src\SignalWall\SignalWall.csproj -c Release
dotnet run --project .\src\SignalWall\SignalWall.csproj -c Release
```

## Pull request checklist

- Keep changes focused.
- Explain the user-facing behavior change.
- Include screenshots or a short recording for UI changes.
- Run `dotnet build .\src\SignalWall\SignalWall.csproj -c Release`.
- Run `dotnet test .\tests\SignalWall.Tests\SignalWall.Tests.csproj -c Release`.
- Do not add telemetry, hidden network calls, or startup persistence without explicit discussion.
- Do not disable Microsoft Defender, Smart App Control, browser protection, or any Windows security feature.

## Design principles

- One clear control surface.
- Multi-monitor behavior must be predictable.
- Quiet visuals beat decorative noise.
- Source-first install remains the recommended path until a signed installer exists.
