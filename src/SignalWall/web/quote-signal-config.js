window.QUOTE_SIGNAL_CONFIG = {
  "version": 1,
  "defaults": {
    "settings": {
      "quoteSeconds": 300,
      "textScale": 100,
      "particleAmount": 65,
      "particleSpeed": 100,
      "gridOpacity": 46,
      "progressVisible": true,
      "randomOrder": true,
      "transitionEffect": "fade"
    },
    "screenOrder": [
      2,
      3,
      1
    ],
    "quoteDisplayMode": 1,
    "textThemeMode": 1,
    "colorThemeMode": 1,
    "globalTextTheme": "design",
    "globalColorTheme": "signal",
    "screenTextThemes": {
      "screen1": "strategy",
      "screen2": "design",
      "screen3": "focus"
    },
    "screenColorThemes": {
      "screen1": "signal",
      "screen2": "paperDark",
      "screen3": "paperLight"
    }
  },
  "textThemes": [
    {
      "id": "design",
      "label": "Design",
      "quotes": [
        {
          "text": "Every pixel argues for attention. Most should lose.",
          "author": "Design note"
        },
        {
          "text": "Clarity is a design decision.",
          "author": "Working principle"
        },
        {
          "text": "Motion should reveal, not perform.",
          "author": "Animation rule"
        }
      ]
    },
    {
      "id": "focus",
      "label": "Focus",
      "quotes": [
        {
          "text": "Attention is the budget. Spend it on meaning.",
          "author": "Focus note"
        },
        {
          "text": "Reduce until the signal has nowhere to hide.",
          "author": "Editing rule"
        },
        {
          "text": "Do fewer things with more consequence.",
          "author": "Operating rule"
        }
      ]
    },
    {
      "id": "strategy",
      "label": "Strategy",
      "quotes": [
        {
          "text": "Good systems make the next action obvious.",
          "author": "Systems note"
        },
        {
          "text": "A plan is useful only when it changes behavior.",
          "author": "Strategy note"
        },
        {
          "text": "The constraint is part of the design.",
          "author": "Strategy note"
        }
      ]
    }
  ],
  "colorThemes": [
    {
      "id": "signal",
      "label": "Signal",
      "text": [
        "#fff8ed",
        "#f1cf94",
        "#d5faf3"
      ],
      "muted": "rgba(244,239,228,0.62)",
      "accents": [
        "#f0b35a",
        "#5fc4b8",
        "#d86c77"
      ],
      "particles": [
        "#f0b35a",
        "#5fc4b8",
        "#d86c77"
      ],
      "background": {
        "top": "#0a0b0c",
        "middle": "#12100d",
        "bottom": "#081011",
        "glowA": "rgba(216,108,119,0.18)",
        "glowB": "rgba(95,196,184,0.16)",
        "glowC": "rgba(240,179,90,0.18)"
      }
    },
    {
      "id": "paperDark",
      "label": "Paper Dark",
      "text": [
        "#fffaf0",
        "#d9d0b2",
        "#bde0d8"
      ],
      "muted": "rgba(248,241,223,0.60)",
      "accents": [
        "#d9b56f",
        "#94c7bd",
        "#b58bd7"
      ],
      "particles": [
        "#d9b56f",
        "#94c7bd",
        "#b58bd7"
      ],
      "background": {
        "top": "#0e0d0a",
        "middle": "#171410",
        "bottom": "#0a0d0d",
        "glowA": "rgba(217,181,111,0.14)",
        "glowB": "rgba(148,199,189,0.12)",
        "glowC": "rgba(181,139,215,0.10)"
      }
    },
    {
      "id": "paperLight",
      "label": "Paper Light",
      "text": [
        "#20252a",
        "#546463",
        "#82643b"
      ],
      "muted": "rgba(31,37,40,0.62)",
      "accents": [
        "#2b6f73",
        "#9c6b2f",
        "#735d91"
      ],
      "particles": [
        "#2b6f73",
        "#9c6b2f",
        "#735d91"
      ],
      "background": {
        "top": "#f7f3ea",
        "middle": "#fffdf7",
        "bottom": "#e8efec",
        "glowA": "rgba(43,111,115,0.13)",
        "glowB": "rgba(156,107,47,0.11)",
        "glowC": "rgba(115,93,145,0.10)"
      }
    }
  ]
};
