# Installation source vérifiable par un agent

SignalWall est gratuit, open source et encore jeune. L’installateur Windows public est actuellement **non signé**. Le parcours recommandé, vérifiable par un agent, consiste à demander à Codex, Claude Code ou un équivalent d’inspecter le dépôt, de compiler depuis le code source, puis de présenter un rapport de sécurité avant de lancer quoi que ce soit.

Dépôt : `https://github.com/Sabertlili/signalwall`

## Prompt à copier

```text
Tu es mon agent de code local sur Windows. Je veux installer SignalWall depuis son dépôt open source, mais seulement après vérification du code source et du processus de build.

Dépôt : https://github.com/Sabertlili/signalwall

Règles de sécurité :
- Ne désactive pas Microsoft Defender, Smart App Control, la protection du navigateur ou une autre protection Windows.
- Ne lance pas le fichier EXE téléchargé depuis une version publiée, sauf si je l’approuve explicitement après ton rapport sur sa signature.
- Privilégie une compilation depuis le code source au lieu d’installer un binaire non signé.
- Arrête-toi et demande mon accord avant de lancer un installateur, une commande admin ou un processus en arrière-plan.

Checklist de vérification :
1. Clone le dépôt dans un dossier local propre.
2. Confirme que le remote Git est exactement https://github.com/Sabertlili/signalwall.
3. Inspecte la structure du projet, surtout src/SignalWall, src/SignalWall/web, scripts et .github/workflows.
4. Cherche les comportements suspects : téléchargements cachés, accès aux identifiants, persistance hors de l’application tray, appels réseau inattendus, opérations destructives ou commandes qui désactivent des outils de sécurité.
5. Relis le script d’installateur avant de l’utiliser. Explique ce qu’il package et s’il signe quelque chose.
6. Si un EXE de version publiée est présent, exécute Get-AuthenticodeSignature et Get-FileHash dessus, puis explique le résultat simplement.
7. Restaure et compile depuis le code source avec :
   dotnet restore .\src\SignalWall\SignalWall.csproj
   dotnet build .\src\SignalWall\SignalWall.csproj -c Release
8. Résume les warnings, les dépendances et les risques avant de lancer l’application.
9. Si le code source semble acceptable, lance :
   dotnet run --project .\src\SignalWall\SignalWall.csproj -c Release
10. Si je demande un installateur, construis-le localement avec :
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\build-installer.ps1

Sortie finale attendue :
- Un court rapport de sécurité.
- Les commandes exactes exécutées.
- Une recommandation claire : lancer depuis le code source, construire un installateur local ou attendre une version signée.
```

## Ce que l’agent doit vérifier

- **Origine** : le clone doit venir de `github.com/Sabertlili/signalwall`.
- **Revue du code** : le code de l’application, le fond d’écran HTML inclus, les scripts et les workflows doivent être inspectés avant exécution.
- **Dépendances** : SignalWall utilise .NET 8 et WebView2. L’agent doit rapporter les warnings de restore/build.
- **Statut installateur** : les installateurs alpha publics sont non signés sauf indication contraire dans une future version.
- **Sécurité Windows** : la bonne réponse à Smart App Control n’est pas de contourner Windows aveuglément; c’est d’inspecter et de compiler depuis la source, ou d’attendre une version signée.

## Captures produit

![Capture du fond d’écran Quote Signal](assets/quote-signal-capture.svg)

![Flux de personnalisation](assets/customization-workflow.svg)

![Ordre des écrans et modes](assets/screen-layout-modes.svg)
