const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/SignalWall/web/control-center.js", "utf8");
const pureSource = source.split("function showNotice")[0];
const elementStub = {};
const context = vm.createContext({
  console,
  document: {
    getElementById: () => elementStub
  }
});

vm.runInContext(
  `${pureSource}\nthis.normalizeImportedConfigForTest = normalizeImportedConfig;`,
  context
);

const normalize = context.normalizeImportedConfigForTest;

assert.throws(
  () => normalize({ defaults: {}, textThemes: [], colorThemes: [] }),
  /at least one text theme/
);

const result = normalize({
  defaults: {
    settings: {
      quoteSeconds: 999,
      textScale: 1,
      particleAmount: 999,
      transitionEffect: "javascript:alert(1)"
    },
    screenOrder: [1, 1, 9]
  },
  textThemes: [
    {
      id: "focus",
      label: "Focus",
      quotes: [{ text: "Safe quote", author: "Focus note" }]
    },
    {
      id: "focus",
      label: "Focus duplicate",
      quotes: [{ text: "Another quote" }]
    }
  ],
  colorThemes: [
    {
      id: "unsafe",
      label: "Unsafe",
      text: ["url(https://example.invalid)", "#123456", "rgba(1,2,3,.4)"],
      accents: ["#abcdef", "red; background:url(x)", "#fedcba"],
      background: {
        top: "\" onmouseover=\"alert(1)",
        middle: "#112233",
        bottom: "url(https://example.invalid)"
      }
    }
  ]
});

assert.equal(result.defaults.settings.quoteSeconds, 300);
assert.equal(result.defaults.settings.textScale, 60);
assert.equal(result.defaults.settings.particleAmount, 120);
assert.equal(result.defaults.settings.transitionEffect, "fade");
assert.deepEqual(Array.from(result.defaults.screenOrder), [1, 2, 3]);
assert.equal(result.colorThemes[0].text[0], "#fff8ed");
assert.equal(result.colorThemes[0].text[1], "#123456");
assert.equal(result.colorThemes[0].background.top, "#0a0b0c");
assert.equal(result.colorThemes[0].background.bottom, "#081011");
assert.notEqual(result.textThemes[0].id, result.textThemes[1].id);

const wrapped = normalize({
  format: "signalwall-preset",
  version: 1,
  config: {
    defaults: {},
    textThemes: [
      {
        id: "design",
        label: "Design",
        quotes: [{ text: "Every pixel should earn its place." }]
      }
    ],
    colorThemes: [
      {
        id: "signal",
        label: "Signal"
      }
    ]
  }
});

assert.equal(wrapped.textThemes[0].quotes[0].text, "Every pixel should earn its place.");
console.log("Control-center preset tests passed.");
