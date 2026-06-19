# SignalWall

English: [README.md](README.md)

<p align="center">
  <img src="src/SignalWall/assets/SignalWall.png" width="112" alt="Icône de l’application SignalWall">
</p>

[![CI](https://github.com/Sabertlili/signalwall/actions/workflows/ci.yml/badge.svg)](https://github.com/Sabertlili/signalwall/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Sabertlili/signalwall/actions/workflows/codeql.yml/badge.svg)](https://github.com/Sabertlili/signalwall/actions/workflows/codeql.yml)
[![Installateur](https://github.com/Sabertlili/signalwall/actions/workflows/build-installer.yml/badge.svg)](https://github.com/Sabertlili/signalwall/actions/workflows/build-installer.yml)
[![Dernière version](https://img.shields.io/github/v/release/Sabertlili/signalwall?color=5fc4b8)](https://github.com/Sabertlili/signalwall/releases/latest)
[![Licence MIT](https://img.shields.io/badge/licence-MIT-f6efe2.svg)](LICENSE)
[![Windows](https://img.shields.io/badge/plateforme-Windows-98d6c8.svg)](#prérequis)

SignalWall est un système Windows gratuit et open source de fonds d’écran dynamiques centrés sur la typographie. Chaque moniteur devient une surface indépendante pour afficher des citations, des idées et un mouvement discret.

La version 0.3 ajoute l’import et l’export de presets partageables, des tests automatisés, un SBOM SPDX et une provenance de build GitHub signée cryptographiquement. SignalWall crée une fenêtre WebView2 sans bordure par écran et rassemble toute la configuration multi-écran dans un seul centre de contrôle.

[Site web](https://nestcells.com) | [Dernière version](https://github.com/Sabertlili/signalwall/releases/latest) | [Vérifier une release](docs/release-verification.md) | [Prompt d’installation vérifiable par un agent](docs/ai-assisted-install.fr.md) | [Roadmap](ROADMAP.md) | [Architecture](ARCHITECTURE.md)

## Pourquoi ce projet existe

La plupart des fonds d’écran dynamiques sont centrés sur l’image ou la vidéo. SignalWall est centré sur la typographie : les mots, la hiérarchie, le rythme et la relation entre les écrans constituent le produit.

- Affichez la même pensée partout ou attribuez un rôle différent à chaque écran.
- Contrôlez les citations, les thèmes de texte et de couleur, le rythme, le mouvement et l’ordre physique des écrans.
- Créez des packs complets avec une phrase par ligne.
- Exportez tout l’espace de travail dans un preset partageable.
- Utilisez un parcours source vérifiable par un agent tant que les binaires Windows publics ne sont pas signés.

## Aperçu produit

![Positionnement typographique de SignalWall](docs/launch-assets/product-hunt-gallery-1-positioning-v3.png)

![Centre de contrôle intégré SignalWall](docs/launch-assets/product-hunt-gallery-3-control-center-v2.png)

<details>
<summary>Voir plus de captures</summary>

| Fond d’écran | Centre de contrôle |
| --- | --- |
| ![Capture du fond d’écran Quote Signal](docs/assets/quote-signal-capture.svg) | ![Flux de personnalisation](docs/assets/customization-workflow.svg) |

| Workflow multi-écran |
| --- |
| ![Ordre des écrans et modes](docs/assets/screen-layout-modes.svg) |

</details>

## Installation vérifiable par Codex ou Claude Code

Le projet est gratuit et open source. Les binaires publics sont actuellement non signés et Windows Smart App Control peut les bloquer sur les systèmes stricts. Ne désactivez pas la sécurité Windows. Le parcours recommandé est vérifiable par un agent : demandez à Codex, Claude Code ou un équivalent d’inspecter le code source, de compiler localement, puis de présenter un rapport de sécurité avant de lancer l’application.

**[Copier le prompt d’installation vérifiable par un agent](docs/ai-assisted-install.fr.md)**

Ce prompt demande à l’agent de :

- cloner uniquement `https://github.com/Sabertlili/signalwall`;
- inspecter le code de l’application, le fond d’écran HTML inclus, les scripts et les GitHub Actions;
- vérifier les binaires de version publiée avec `Get-AuthenticodeSignature` et `Get-FileHash` si nécessaire;
- compiler depuis la source avec `dotnet restore` et `dotnet build`;
- ne pas désactiver Microsoft Defender, Smart App Control ou la sécurité du navigateur;
- expliquer ses conclusions avant de lancer l’application ou de construire un installateur local.

## Fonctionnalités actuelles

- Fenêtre de fond d’écran par moniteur.
- Centre de contrôle WebView2 intégré, accessible depuis la barre système.
- Rendu HTML/CSS/JS via WebView2.
- Quote Signal inclus comme fond d’écran par défaut.
- Même citation sur tous les écrans ou citation différente par écran.
- Thèmes texte globaux ou par écran.
- Thèmes couleur / arrière-plan globaux ou par écran.
- Ordre physique des écrans configurable.
- Durée par citation, taille du texte, particules, opacité de grille, barre de progression, ordre aléatoire et transitions.
- Thèmes clair et sombre pour le centre de contrôle.
- Création rapide de packs avec une phrase par ligne.
- Import et export de fichiers de preset partageables.
- Menu de barre système avec centre de contrôle, rechargement, dossier du fond d’écran, site web et fermeture.

## Prérequis

- Windows 10 ou Windows 11.
- SDK .NET 8 pour le développement.
- Microsoft Edge WebView2 Runtime.

La plupart des machines Windows 11 ont déjà WebView2. Si l’application ne peut pas démarrer WebView2, installez l’Evergreen Runtime de Microsoft.

## Build

```powershell
dotnet restore .\tests\SignalWall.Tests\SignalWall.Tests.csproj
dotnet build .\src\SignalWall\SignalWall.csproj -c Release
dotnet test .\tests\SignalWall.Tests\SignalWall.Tests.csproj -c Release
```

## Lancer

```powershell
dotnet run --project .\src\SignalWall\SignalWall.csproj -c Release
```

Au premier lancement, SignalWall ouvre le centre de contrôle. Ensuite, utilisez **Open control center** dans le menu de la barre système.

## Publier localement

```powershell
dotnet publish .\src\SignalWall\SignalWall.csproj -c Release -r win-x64 --self-contained false -o .\publish\win-x64
```

## Confiance et sécurité

- Les installateurs alpha publics ne sont pas signés et peuvent être bloqués par Windows Smart App Control.
- Le projet prépare une candidature auprès de [SignPath Foundation](https://signpath.org/) pour obtenir gratuitement une signature Authenticode open source.
- Les releases incluent des empreintes SHA-256, un SBOM SPDX, un manifeste lisible par machine et un script local de vérification.
- GitHub Actions signe la provenance du build et l’attestation SBOM avec Sigstore.
- Les tests automatisés, CodeQL et la CI tournent dans GitHub Actions.
- Dependabot suit les mises à jour NuGet et GitHub Actions.
- Voir [la vérification des releases](docs/release-verification.md), [SECURITY.md](SECURITY.md), [docs/code-signing.md](docs/code-signing.md) et le [brouillon de candidature SignPath](docs/signpath-application.md).

## Contribuer

SignalWall reste petit volontairement. Les bonnes contributions améliorent la clarté, la sécurité, le multi-écran, la typographie, la finition du fond d’écran ou le parcours d’installation vérifiable par un agent.

Commencez par [CONTRIBUTING.md](CONTRIBUTING.md), [ROADMAP.md](ROADMAP.md) et [ARCHITECTURE.md](ARCHITECTURE.md).

## Licence

MIT. SignalWall est un projet clean-room et ne copie pas le code source de Lively Wallpaper.
