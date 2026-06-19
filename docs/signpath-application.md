# SignPath Foundation application

This document prepares the SignalWall application for free open-source code signing. A maintainer must review and submit the final application.

## Project

- Name: SignalWall
- Repository: https://github.com/Sabertlili/signalwall
- Website: https://nestcells.com
- License: MIT
- Platform: Windows 10 and Windows 11
- Technology: .NET 8, WinForms, WebView2, HTML, CSS, JavaScript
- Distribution: GitHub Releases

## Short description

SignalWall is a free, open-source Windows live wallpaper host for calm multi-monitor desktops. It creates one wallpaper window per monitor and includes a built-in control center for screen order, quote packs, timing, motion, text themes, and color themes.

## Why signing is needed

Windows Smart App Control can block SignalWall’s unsigned executables and DLLs even when users build the public source locally. SignalWall does not instruct users to disable Windows security. Authenticode signing would let users verify that release artifacts were produced from the public repository and distributed by the official project.

## Security posture

- Public MIT-licensed source repository.
- GitHub Actions CI on every push and pull request.
- CodeQL analysis for C#.
- Dependabot for NuGet and GitHub Actions dependencies.
- SHA-256 checksums for release artifacts.
- No hidden telemetry.
- No bundled advertising or paid features.
- Release workflow and installer scripts are public.
- Signing is restricted to release artifacts built by GitHub Actions.

## Intended signed artifacts

- `SignalWall.exe`
- bundled application DLLs when required by the artifact policy
- `SignalWallSetup-vX.Y.Z-win-x64.exe`

## Proposed release policy

- Repository: `Sabertlili/signalwall`
- Trusted build system: GitHub Actions
- Allowed refs: tags matching `v*`
- Required workflow: `.github/workflows/build-installer.yml`
- Artifact configuration: Authenticode-sign the application payload and final installer
- Timestamping: enabled

## Maintainer statement draft

SignalWall is an independent, non-commercial open-source project. Its purpose is to provide a transparent Windows live wallpaper host with a calm multi-monitor experience. The project does not sell access, bundle advertising, collect telemetry, or hide executable source. Signing is requested solely to improve user safety, release authenticity, and compatibility with Windows security controls.

## Before submission

- [ ] CI and CodeQL are green on `main`.
- [ ] Version 0.2 source and release workflow are public.
- [ ] Repository homepage points to https://nestcells.com.
- [ ] SECURITY.md and code-signing documentation are current.
- [ ] Maintainer reviews SignPath Foundation terms.
- [ ] Maintainer explicitly approves submitting the application.
