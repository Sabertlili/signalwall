# Product Hunt Submission Pack

Use this page to create the SignalWall launch draft on Product Hunt.

Official Product Hunt requirements to keep in mind:

- Product name should be only the name.
- Tagline should be short and under 60 characters.
- Thumbnail should be square, recommended 240 x 240, under 3 MB.
- Gallery should include at least two images, recommended 1270 x 760.
- Pricing should clearly say free, paid, or paid with a free plan.

## Ready-to-paste fields

Product URL:

```text
https://nestcells.com
```

Product name:

```text
SignalWall
```

Tagline:

```text
Typography-first live wallpapers for every Windows screen
```

Short description:

```text
SignalWall turns every Windows monitor into a living typography surface. Give each screen its own quotes, themes, timing, and motion, then share the setup as a preset. Free, open source, telemetry-free, and agent-verifiable.
```

Pricing:

```text
Free
```

Status:

```text
Version 0.3 / open-source alpha
```

Suggested topics:

```text
Productivity
Open Source
Design Tools
Windows
```

Extra links:

```text
Website: https://nestcells.com
GitHub: https://github.com/Sabertlili/signalwall
Agent-verifiable install prompt: https://github.com/Sabertlili/signalwall/blob/main/docs/ai-assisted-install.en.md
```

## Assets

Logo / thumbnail:

```text
docs/launch-assets/product-hunt-logo-v3.png
```

Gallery:

```text
docs/launch-assets/product-hunt-gallery-1-positioning-v3.png
docs/launch-assets/product-hunt-gallery-2-demo-v2.png
docs/launch-assets/product-hunt-gallery-3-control-center-v2.png
docs/launch-assets/product-hunt-gallery-4-install-v2.png
```

## First comment

```text
I built SignalWall around a simple idea: the desktop should carry thought, not noise.

Most wallpaper engines are image-first or video-first. SignalWall is typography-first. Every Windows monitor becomes a living surface for quotes and ideas, with motion restrained enough to keep on screen all day.

You can run one thought across every display or give each screen its own quote pack, text theme, color theme, timing, particles, progress, and transition. The control center maps the physical left, center, and right screens, and version 0.3 exports the complete workspace as a shareable preset.

The distribution model is different too. SignalWall is agent-verifiable: Codex, Claude Code, or another local coding agent can inspect the public source, review dependencies and workflows, build locally, and explain security findings before anything runs. Releases also publish SHA-256 checksums, an SPDX SBOM, a manifest, and signed GitHub build provenance.

To be precise about the positioning: quote wallpapers already exist, multi-monitor wallpaper engines already exist, and many Product Hunt products work with coding agents. I could not find another Windows live wallpaper product that combines typography-first design, independent per-screen quote logic, shareable whole-workspace presets, and an agent-verifiable source install. That combination is the category SignalWall is trying to define.

I would love feedback on:

- whether “typography-first live wallpaper” describes the category clearly;
- the independent multi-screen workflow;
- the agent-verifiable distribution model;
- whether the product feels calm enough to live on a daily desktop.
```

## Short share post

```text
I launched SignalWall: typography-first live wallpapers for Windows.

Every screen can carry its own quotes, themes, timing, and motion. Complete setups are shareable as presets. The project is free, open source, telemetry-free, and agent-verifiable through Codex or Claude Code.

https://nestcells.com
https://github.com/Sabertlili/signalwall
```

## Hacker News option

Title:

```text
Show HN: SignalWall – typography-first live wallpapers for Windows
```

URL:

```text
https://github.com/Sabertlili/signalwall
```

Comment:

```text
I built this because most live wallpapers are image-first or video-first, while the desktop is also a useful surface for thought.

SignalWall is a small open-source Windows app that creates one WebView2 wallpaper window per monitor. It is typography-first: quotes, hierarchy, per-screen logic, themes, timing, transitions, and physical monitor order are controlled from one place. Version 0.3 can export the complete setup as a shareable preset.

The public installer is currently unsigned, so the README recommends an agent-verifiable install path: let Codex, Claude Code, or another local coding agent inspect the code, build locally, and review security findings before running it. Releases include hashes, an SPDX SBOM, and signed build provenance.

Feedback on the architecture, security notes, and multi-monitor workflow would be useful.
```
