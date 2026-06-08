# Installation depuis la source avec IA

SignalWall est gratuit, open source et encore jeune. L'installateur Windows public est actuellement **non signe**, donc le chemin le plus prudent est de demander a un agent local comme Codex, Claude Code ou un equivalent d'inspecter le depot, de compiler depuis le code source, puis de presenter un rapport de securite avant de lancer quoi que ce soit.

Depot: `https://github.com/Sabertlili/signalwall`

## Prompt a copier

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

## Ce que l'agent doit verifier

- **Origine**: le clone doit venir de `github.com/Sabertlili/signalwall`.
- **Revue du code**: le code de l'app, le fond d'ecran HTML inclus, les scripts et les workflows doivent etre inspectes avant execution.
- **Dependances**: SignalWall utilise .NET 8 et WebView2. L'agent doit rapporter les warnings de restore/build.
- **Statut installateur**: les installateurs alpha publics sont non signes sauf indication contraire dans une future release.
- **Securite Windows**: la bonne reponse a Smart App Control n'est pas de contourner Windows aveuglement; c'est d'inspecter et compiler depuis la source, ou d'attendre une release signee.

## Captures produit

![Capture du fond d'ecran Quote Signal](assets/quote-signal-capture.svg)

![Workflow de personnalisation](assets/customization-workflow.svg)

![Ordre des ecrans et modes](assets/screen-layout-modes.svg)
