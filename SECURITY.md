# Security Policy

SignalWall is a local Windows desktop app that hosts bundled HTML/CSS/JS wallpapers in WebView2 windows.

## Supported versions

| Version | Supported |
| --- | --- |
| `main` | Yes |
| `v0.3.x` | Yes |
| `v0.2.x` | Best effort |

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
- Release binaries include SHA-256 checksums, a verification script, an SPDX SBOM, and GitHub build-provenance attestations.
- Release binaries should be checked with `Verify-SignalWallRelease.ps1` or `gh attestation verify`.
- The app should not disable Windows security features.
- Any future network behavior, auto-update behavior, or startup persistence must be documented before release.

See [agent-verifiable source installation](docs/ai-assisted-install.en.md) for a guided audit and build prompt.
