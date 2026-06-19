# Verify a SignalWall release

SignalWall publishes multiple independent verification signals for every tagged Windows release:

- SHA-256 checksums.
- A local PowerShell verification script.
- A machine-readable release manifest.
- An SPDX software bill of materials.
- GitHub build-provenance and SBOM attestations signed through Sigstore.

These checks prove that downloaded files match the artifacts produced by the public GitHub Actions workflow. They do not replace Authenticode signing, and they do not require disabling Windows security.

## Local checksum verification

Download the release artifacts, `SHA256SUMS.txt`, and `Verify-SignalWallRelease.ps1` into the same directory. Then run:

```powershell
powershell.exe -NoProfile -File .\Verify-SignalWallRelease.ps1
```

The script fails if an expected file is missing or its SHA-256 hash differs.

## GitHub provenance verification

Install the [GitHub CLI](https://cli.github.com/), then verify an installer or portable archive:

```powershell
gh attestation verify .\SignalWallPortable-v0.3.0-win-x64.zip -R Sabertlili/signalwall
gh attestation verify .\SignalWallSetup-v0.3.0-win-x64.exe -R Sabertlili/signalwall
```

You can combine checksum and provenance checks:

```powershell
powershell.exe -NoProfile -File .\Verify-SignalWallRelease.ps1 -VerifyGitHubProvenance
```

## Inspect the SBOM

The `SignalWall-v0.3.0.spdx.json` file lists the components detected in the portable application package. It is also attached as a signed SBOM attestation to the portable archive.

## Current signing status

SignalWall's public Windows binaries remain unsigned until an open-source code-signing application is approved. Windows Smart App Control may block them. Do not disable Smart App Control, Microsoft Defender, or browser protection to run SignalWall.
