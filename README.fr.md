# SignalWall

English: [README.md](README.md)

SignalWall est une petite application open source de fonds d’écran dynamiques Windows, construite de zéro pour Quote Signal.

Elle crée une fenêtre WebView2 sans bordure par écran, place ces fenêtres derrière les icônes du bureau, puis charge le fond d’écran HTML Quote Signal inclus.

## Installation prudente avec Codex ou Claude Code

Le projet est gratuit et open source. L’installateur public actuel est une alpha non signée. Le chemin recommandé est donc de demander à Codex, Claude Code ou un agent équivalent d’inspecter le code source, de compiler localement, puis de présenter un rapport de sécurité avant de lancer l’application.

Prompt prêt à copier :

**[Prompt d’installation depuis la source, assistée par IA](docs/ai-assisted-install.fr.md)**

Ce prompt demande à l’agent de :

- cloner uniquement `https://github.com/Sabertlili/signalwall`;
- inspecter le code de l’application, le fond d’écran HTML inclus, les scripts et les GitHub Actions;
- vérifier les binaires de version publiée avec `Get-AuthenticodeSignature` et `Get-FileHash` si nécessaire;
- compiler depuis la source avec `dotnet restore` et `dotnet build`;
- ne pas désactiver Microsoft Defender, Smart App Control ou la sécurité du navigateur;
- expliquer ses conclusions avant de lancer l’application ou de construire un installateur local.

## Captures

![Capture du fond d’écran Quote Signal](docs/assets/quote-signal-capture.svg)

![Flux de personnalisation](docs/assets/customization-workflow.svg)

![Ordre des écrans et modes](docs/assets/screen-layout-modes.svg)

## Statut

C’est un MVP encore jeune, pas encore un remplacement complet de Lively Wallpaper.

Fonctionnalités actuelles :

- Fenêtre de fond d’écran par moniteur.
- Rendu HTML/CSS/JS via WebView2.
- Quote Signal inclus comme fond d’écran par défaut.
- Injection de slot par écran pour les thèmes spécifiques.
- Même citation sur tous les écrans ou citation différente par écran.
- Thèmes texte globaux ou par écran.
- Thèmes couleur / arrière-plan globaux ou par écran.
- Ordre physique des écrans configurable.
- Durée par citation, taille du texte, particules, opacité de grille, barre de progression, ordre aléatoire et transitions.
- Menu tray avec rechargement, ouverture du dossier web et fermeture.

Fonctionnalités prévues :

- Interface de paramètres intégrée.
- Installateur et option de démarrage automatique.
- Pause lors des applications ou jeux en plein écran.
- Bibliothèque de fonds d’écran.
- Import/export de thèmes et de packs de citations.

## Prérequis

- Windows 10 ou Windows 11
- SDK .NET 8 pour le développement
- Microsoft Edge WebView2 Runtime

La plupart des machines Windows 11 ont déjà WebView2. Si l’application ne peut pas démarrer WebView2, installez l’Evergreen Runtime de Microsoft.

## Build

```powershell
dotnet restore .\src\SignalWall\SignalWall.csproj
dotnet build .\src\SignalWall\SignalWall.csproj -c Release
```

## Lancer

```powershell
dotnet run --project .\src\SignalWall\SignalWall.csproj -c Release
```

Après lancement, SignalWall apparaît dans la zone de notification. Clic droit sur l’icône pour recharger les fonds d’écran, ouvrir le dossier web inclus ou quitter.

## Publier

```powershell
dotnet publish .\src\SignalWall\SignalWall.csproj -c Release -r win-x64 --self-contained false -o .\publish\win-x64
```

## Signature de l’installateur

Les installateurs publics non signés peuvent être bloqués par Windows Smart App Control. Voir [docs/code-signing.md](docs/code-signing.md) pour le processus de signature et les secrets GitHub Actions.

## Licence

MIT. SignalWall est un projet clean-room et ne copie pas le code source de Lively Wallpaper.
