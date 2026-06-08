# AI-assisted source install / Installation source assistee par IA

SignalWall is free, open source, and early. The public Windows installer is currently **unsigned**, so the safest installation path is to let a local coding agent inspect the repository, build from source, and explain the security findings before anything runs.

SignalWall est gratuit, open source et encore jeune. L'installateur Windows public est actuellement **non signe**, donc le chemin le plus prudent est de demander a un agent local comme Codex, Claude Code ou un equivalent d'inspecter le depot, de compiler depuis le code source, puis de presenter un rapport de securite avant de lancer quoi que ce soit.

Repository / Depot: `https://github.com/Sabertlili/signalwall`

## Copy this prompt / Copiez ce prompt

### English

```text
You are my local coding agent on Windows. I want to install SignalWall from its open-source repository, but only after you verify the source and build path.

Repository: https://github.com/Sabertlili/signalwall

Security rules:
- Do not disable Microsoft Defender, Smart App Control, browser protection, or any Windows security feature.
- Do not run the downloaded release EXE unless I explicitly approve it after you report its signature status.
- Prefer building from source over installing an unsigned downloaded binary.
- Stop and ask me before running any installer, elevated command, or long-running background process.

Verification checklist:
1. Clone the repository into a clean local folder.
2. Confirm the Git remote is exactly https://github.com/Sabertlili/signalwall.
3. Inspect the project structure, especially src/SignalWall, src/SignalWall/web, scripts, and .github/workflows.
4. Look for suspicious behavior: hidden downloads, credential access, persistence outside the tray app, unexpected network calls, destructive file operations, or commands that disable security tools.
5. Review the installer script before using it. Explain what it packages and whether it signs anything.
6. If a release EXE is present, run Get-AuthenticodeSignature and Get-FileHash on it, then explain the result in plain language.
7. Restore and build from source with:
   dotnet restore .\src\SignalWall\SignalWall.csproj
   dotnet build .\src\SignalWall\SignalWall.csproj -c Release
8. Summarize warnings, dependencies, and any security concerns before launching.
9. If the source looks acceptable, run:
   dotnet run --project .\src\SignalWall\SignalWall.csproj -c Release
10. If I ask for an installer, build it locally with:
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\build-installer.ps1

Final output expected:
- A short security report.
- The exact commands you ran.
- Whether you recommend running from source, building a local installer, or waiting for a signed release.
```

### Francais

```text
Tu es mon agent de code local sur Windows. Je veux installer SignalWall depuis son depot open source, mais seulement apres verification du code source et du processus de build.

Depot: https://github.com/Sabertlili/signalwall

Regles de securite:
- Ne desactive pas Microsoft Defender, Smart App Control, la protection du navigateur ou une protection Windows.
- Ne lance pas le fichier EXE telecharge depuis les releases, sauf si je l'approuve explicitement apres ton rapport sur sa signature.
- Privilegie une compilation depuis le code source au lieu d'installer un binaire non signe.
- Arrete-toi et demande mon accord avant de lancer un installateur, une commande admin ou un processus en arriere-plan.

Checklist de verification:
1. Clone le depot dans un dossier local propre.
2. Confirme que le remote Git est exactement https://github.com/Sabertlili/signalwall.
3. Inspecte la structure du projet, surtout src/SignalWall, src/SignalWall/web, scripts et .github/workflows.
4. Cherche les comportements suspects: telechargements caches, acces aux identifiants, persistance hors de l'app tray, appels reseau inattendus, operations destructives, ou commandes qui desactivent des outils de securite.
5. Relis le script d'installateur avant de l'utiliser. Explique ce qu'il package et s'il signe quelque chose.
6. Si un EXE de release est present, execute Get-AuthenticodeSignature et Get-FileHash dessus, puis explique le resultat simplement.
7. Restaure et compile depuis le code source avec:
   dotnet restore .\src\SignalWall\SignalWall.csproj
   dotnet build .\src\SignalWall\SignalWall.csproj -c Release
8. Resume les warnings, les dependances et les risques avant de lancer l'app.
9. Si le code source semble acceptable, lance:
   dotnet run --project .\src\SignalWall\SignalWall.csproj -c Release
10. Si je demande un installateur, construis-le localement avec:
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\build-installer.ps1

Sortie finale attendue:
- Un court rapport de securite.
- Les commandes exactes executees.
- Une recommandation claire: lancer depuis le code source, construire un installateur local, ou attendre une release signee.
```

## What the agent should verify / Ce que l'agent doit verifier

- **Origin / Origine**: the clone must come from `github.com/Sabertlili/signalwall`.
- **Source review / Revue du code**: app code, bundled wallpaper HTML, scripts, and workflows should be inspected before execution.
- **Dependencies / Dependances**: SignalWall uses .NET 8 and WebView2. The agent should report restore/build warnings.
- **Installer status / Statut installateur**: public alpha installers are unsigned unless a future release states otherwise.
- **Windows security / Securite Windows**: the correct response to Smart App Control is not to bypass Windows blindly; it is to inspect and build from source, or wait for a signed release.

## Product captures / Captures produit

![Quote Signal wallpaper capture](assets/quote-signal-capture.svg)

![Customization workflow](assets/customization-workflow.svg)

![Screen layout and modes](assets/screen-layout-modes.svg)

## Personalization options / Options de personnalisation

- Quote timing from quick rotation to five minutes per quote.
- Text scale, particle density, particle speed, grid opacity, progress bar, and random order.
- Transition effects: fade, slide, rise, scale, glitch, random, or no transition.
- Same quote on every screen or a different quote per screen.
- One global text theme or a different text theme per screen.
- One global color theme or a different color/background theme per screen.
- Screen order mapping for monitor setups where screen 1, 2, and 3 are physically rearranged.
- Custom quote themes where each line can become a separate phrase.

- Duree d'affichage des citations: rotation rapide ou jusqu'a cinq minutes par citation.
- Taille du texte, densite des particules, vitesse des particules, opacite de la grille, barre de progression et ordre aleatoire.
- Effets de transition: fade, slide, rise, scale, glitch, random, ou aucune transition.
- Meme citation sur tous les ecrans ou citation differente par ecran.
- Un theme de texte global ou un theme different par ecran.
- Un theme couleur/background global ou un theme different par ecran.
- Ordre des ecrans configurable si l'ecran 1, 2 ou 3 est a gauche, au centre ou a droite.
- Themes de citations personnalisables ou chaque ligne peut devenir une phrase separee.
