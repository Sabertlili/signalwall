# Code signing

SignalWall can build an installer without signing, but Windows Smart App Control can block unsigned public downloads.

For public distribution, use one of these paths:

- Microsoft Store MSIX: Microsoft signs the package after certification. This is the cleanest user experience.
- Azure Artifact Signing / Trusted Signing or a public CA code-signing certificate: use this when distributing outside the Store.

Do not use a self-signed certificate for public downloads. It only works on machines where the certificate has been manually trusted, and it can still trigger SmartScreen or Smart App Control blocks.

## GitHub Actions PFX signing

The `Build Windows installer` workflow signs the payload files and final setup executable when these repository secrets exist:

- `SIGNALWALL_SIGNING_PFX_BASE64`: base64 text for the `.pfx` code-signing certificate.
- `SIGNALWALL_SIGNING_PFX_PASSWORD`: password for the `.pfx` certificate.

Optional repository variable:

- `SIGNALWALL_TIMESTAMP_URL`: timestamp server URL. Defaults to `http://timestamp.digicert.com`.

Create the base64 secret from PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\codesign.pfx")) | Set-Clipboard
```

After adding the secrets, run the `Build Windows installer` GitHub Actions workflow. The workflow verifies the final installer signature before uploading the release asset.

## Local signing

You can also pass signing inputs locally:

```powershell
.\scripts\build-installer.ps1 `
  -SigningPfxPath "C:\path\to\codesign.pfx" `
  -SigningPfxPassword "pfx-password"
```

Verify the installer:

```powershell
Get-AuthenticodeSignature .\dist\SignalWallSetup-v0.1.0-win-x64.exe
```
