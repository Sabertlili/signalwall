# Security Policy

SignalWall is a local Windows desktop app that hosts bundled HTML/CSS/JS wallpapers in WebView2 windows.

## Supported versions

| Version | Supported |
| --- | --- |
| `main` | Yes |
| `v0.1.x` | Best effort |

## Reporting a vulnerability

Please do not open a public issue for a vulnerability.

Report privately through GitHub security advisories if available, or contact the maintainer through the GitHub profile linked from this repository.

Include:

- SignalWall version or commit SHA.
- Windows version.
- Exact reproduction steps.
- Whether the issue requires running an installer, running from source, or changing wallpaper content.
- Any relevant logs, screenshots, or hashes.

## Current security posture

- The public alpha installer is unsigned.
- The recommended path is to review the source, build locally, and run from source.
- Release binaries should be checked with `Get-AuthenticodeSignature` and `Get-FileHash`.
- The app should not disable Windows security features.
- Any future network behavior, auto-update behavior, or startup persistence must be documented before release.

See [AI-assisted source installation](docs/ai-assisted-install.en.md) for a guided verification prompt.
