# SignalWall

English: [README.md](README.md)

SignalWall est un petit host de fonds d'ecran dynamiques Windows, open source, construit de zero pour Quote Signal.

Il cree une fenetre WebView2 sans bordure par ecran, place ces fenetres derriere les icones du bureau, puis charge le fond d'ecran HTML Quote Signal inclus.

## Installation prudente avec Codex ou Claude Code

Le projet est gratuit et open source. L'installateur public actuel est une alpha non signee, donc le chemin recommande est de demander a Codex, Claude Code ou un agent equivalent d'inspecter le code source, compiler localement, puis presenter un rapport de securite avant de lancer l'app.

Prompt pret a copier:

**[Prompt d'installation source assistee par IA](docs/ai-assisted-install.fr.md)**

Ce prompt demande a l'agent de:

- cloner uniquement `https://github.com/Sabertlili/signalwall`;
- inspecter le code de l'app, le fond d'ecran HTML inclus, les scripts et les GitHub Actions;
- verifier les binaires de release avec `Get-AuthenticodeSignature` et `Get-FileHash` si necessaire;
- compiler depuis la source avec `dotnet restore` et `dotnet build`;
- ne pas desactiver Microsoft Defender, Smart App Control ou la securite navigateur;
- expliquer ses conclusions avant de lancer l'app ou de construire un installateur local.

## Captures

![Capture du fond d'ecran Quote Signal](docs/assets/quote-signal-capture.svg)

![Workflow de personnalisation](docs/assets/customization-workflow.svg)

![Ordre des ecrans et modes](docs/assets/screen-layout-modes.svg)

## Statut

C'est un MVP encore jeune, pas encore un remplacement complet de Lively Wallpaper.

Fonctionnalites actuelles:

- Fenetre de fond d'ecran par moniteur.
- Rendu HTML/CSS/JS via WebView2.
- Quote Signal inclus comme fond d'ecran par defaut.
- Injection de slot par ecran pour themes specifiques.
- Meme citation sur tous les ecrans ou citation differente par ecran.
- Themes texte globaux ou par ecran.
- Themes couleur/background globaux ou par ecran.
- Ordre physique des ecrans configurable.
- Duree par citation, taille du texte, particules, opacite de grille, barre de progression, ordre aleatoire et transitions.
- Menu tray avec reload, ouverture du dossier web et exit.

Fonctionnalites prevues:

- Interface de parametres integree.
- Installateur et option auto-start.
- Pause lors des apps/jeux plein ecran.
- Bibliotheque de fonds d'ecran.
- Import/export de themes et packs de citations.

## Prerequis

- Windows 10 ou Windows 11
- SDK .NET 8 pour le developpement
- Microsoft Edge WebView2 Runtime

La plupart des machines Windows 11 ont deja WebView2. Si l'app ne peut pas demarrer WebView2, installez l'Evergreen Runtime de Microsoft.

## Build

```powershell
dotnet restore .\src\SignalWall\SignalWall.csproj
dotnet build .\src\SignalWall\SignalWall.csproj -c Release
```

## Lancer

```powershell
dotnet run --project .\src\SignalWall\SignalWall.csproj -c Release
```

Apres lancement, SignalWall apparait dans la zone de notification. Clic droit sur l'icone pour recharger les fonds d'ecran, ouvrir le dossier web inclus ou quitter.

## Publier

```powershell
dotnet publish .\src\SignalWall\SignalWall.csproj -c Release -r win-x64 --self-contained false -o .\publish\win-x64
```

## Signature de l'installateur

Les installateurs publics non signes peuvent etre bloques par Windows Smart App Control. Voir [docs/code-signing.md](docs/code-signing.md) pour le workflow de signature et les secrets GitHub Actions.

## Licence

MIT. SignalWall est un projet clean-room et ne copie pas le code source de Lively Wallpaper.
