const app = {
  config: null,
  screens: [],
  activeTextTheme: 0,
  activeColorTheme: 0,
  dirty: false,
  requestIndex: 0,
  pendingRequests: new Map()
};

const $ = (id) => document.getElementById(id);

const els = {
  notice: $("notice"),
  setupSummary: $("setupSummary"),
  themeToggleBtn: $("themeToggleBtn"),
  importPresetBtn: $("importPresetBtn"),
  exportPresetBtn: $("exportPresetBtn"),
  presetFileInput: $("presetFileInput"),
  quoteSeconds: $("quoteSeconds"),
  quoteSecondsValue: $("quoteSecondsValue"),
  textScale: $("textScale"),
  textScaleValue: $("textScaleValue"),
  particleAmount: $("particleAmount"),
  particleAmountValue: $("particleAmountValue"),
  particleSpeed: $("particleSpeed"),
  particleSpeedValue: $("particleSpeedValue"),
  gridOpacity: $("gridOpacity"),
  gridOpacityValue: $("gridOpacityValue"),
  transitionEffect: $("transitionEffect"),
  progressVisible: $("progressVisible"),
  randomOrder: $("randomOrder"),
  quoteDisplayMode: $("quoteDisplayMode"),
  textThemeMode: $("textThemeMode"),
  colorThemeMode: $("colorThemeMode"),
  globalTextTheme: $("globalTextTheme"),
  globalColorTheme: $("globalColorTheme"),
  screenGrid: $("screenGrid"),
  textThemeSelect: $("textThemeSelect"),
  textThemeName: $("textThemeName"),
  quoteInput: $("quoteInput"),
  authorInput: $("authorInput"),
  quoteList: $("quoteList"),
  colorThemeSelect: $("colorThemeSelect"),
  colorThemeName: $("colorThemeName"),
  colorFields: $("colorFields"),
  palettePreview: $("palettePreview"),
  previewKicker: $("previewKicker"),
  previewQuote: $("previewQuote"),
  previewAuthor: $("previewAuthor")
};

const settingFields = [
  ["quoteSeconds", "s"],
  ["textScale", "%"],
  ["particleAmount", ""],
  ["particleSpeed", ""],
  ["gridOpacity", "%"]
];

const transitionEffects = ["none", "fade", "slide", "rise", "scale", "glitch", "random"];

const colorFields = [
  ["Text 1", "text.0"],
  ["Text 2", "text.1"],
  ["Text 3", "text.2"],
  ["Accent 1", "accents.0"],
  ["Accent 2", "accents.1"],
  ["Accent 3", "accents.2"],
  ["Top", "background.top"],
  ["Middle", "background.middle"],
  ["Bottom", "background.bottom"]
];

const positionLabels = ["Left", "Middle", "Right"];
const presetFormat = "signalwall-preset";
const maxPresetBytes = 2 * 1024 * 1024;

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function clamp(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function normalizeTransitionEffect(value) {
  const effect = String(value || "fade").trim();
  return transitionEffects.includes(effect) ? effect : "fade";
}

function safeId(label) {
  return String(label || "theme")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "theme";
}

function uniqueId(label, items) {
  const base = safeId(label);
  const used = new Set(items.map((item) => item.id));
  let id = base;
  let index = 2;
  while (used.has(id)) {
    id = `${base}-${index}`;
    index += 1;
  }
  return id;
}

function getPath(object, path) {
  return path.split(".").reduce((current, key) => current?.[key], object);
}

function setPath(object, path, value) {
  const keys = path.split(".");
  let current = object;
  keys.slice(0, -1).forEach((key) => {
    current = current[key];
  });
  current[keys[keys.length - 1]] = value;
}

function isHex(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || ""));
}

function isSafeColor(value) {
  return /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%+-]+\))$/i.test(String(value || "").trim());
}

function safeText(value, fallback, maxLength) {
  const text = String(value ?? "").trim();
  return (text || fallback).slice(0, maxLength);
}

function safeColor(value, fallback) {
  const color = String(value || "").trim();
  return isSafeColor(color) ? color : fallback;
}

function safeThemeReference(value, fallback, validIds) {
  const reference = String(value || "");
  return validIds.has(reference) ? reference : fallback;
}

function normalizeImportedConfig(candidate) {
  const source = candidate?.format === presetFormat ? candidate.config : candidate;
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    throw new Error("This file does not contain a SignalWall preset.");
  }
  if (!Array.isArray(source.textThemes) || !source.textThemes.length) {
    throw new Error("The preset needs at least one text theme.");
  }
  if (!Array.isArray(source.colorThemes) || !source.colorThemes.length) {
    throw new Error("The preset needs at least one color theme.");
  }

  const textThemes = source.textThemes.slice(0, 50).map((theme, themeIndex, themes) => {
    const label = safeText(theme?.label, `Text ${themeIndex + 1}`, 80);
    const previous = themes.slice(0, themeIndex).map((item, index) => ({
      id: safeText(item?.id, `text-${index + 1}`, 80)
    }));
    const id = uniqueId(safeText(theme?.id, label, 80), previous);
    const quotes = Array.isArray(theme?.quotes) ? theme.quotes.slice(0, 500) : [];
    return {
      id,
      label,
      quotes: (quotes.length ? quotes : [{ text: "New quote", author: "Note" }]).map((quote) => ({
        text: safeText(quote?.text, "New quote", 1000),
        author: safeText(quote?.author, "", 160)
      }))
    };
  });

  const colorThemes = source.colorThemes.slice(0, 50).map((theme, themeIndex, themes) => {
    const label = safeText(theme?.label, `Colors ${themeIndex + 1}`, 80);
    const previous = themes.slice(0, themeIndex).map((item, index) => ({
      id: safeText(item?.id, `colors-${index + 1}`, 80)
    }));
    const id = uniqueId(safeText(theme?.id, label, 80), previous);
    const text = Array.isArray(theme?.text) ? theme.text : [];
    const accents = Array.isArray(theme?.accents) ? theme.accents : [];
    const particles = Array.isArray(theme?.particles) ? theme.particles : accents;
    const background = theme?.background || {};
    return {
      id,
      label,
      text: [
        safeColor(text[0], "#fff8ed"),
        safeColor(text[1], "#f1cf94"),
        safeColor(text[2], "#d5faf3")
      ],
      muted: safeColor(theme?.muted, "rgba(244,239,228,0.62)"),
      accents: [
        safeColor(accents[0], "#f0b35a"),
        safeColor(accents[1], "#5fc4b8"),
        safeColor(accents[2], "#d86c77")
      ],
      particles: [
        safeColor(particles[0], "#f0b35a"),
        safeColor(particles[1], "#5fc4b8"),
        safeColor(particles[2], "#d86c77")
      ],
      background: {
        top: safeColor(background.top, "#0a0b0c"),
        middle: safeColor(background.middle, "#12100d"),
        bottom: safeColor(background.bottom, "#081011"),
        glowA: safeColor(background.glowA, "rgba(216,108,119,0.18)"),
        glowB: safeColor(background.glowB, "rgba(95,196,184,0.16)"),
        glowC: safeColor(background.glowC, "rgba(240,179,90,0.18)")
      }
    };
  });

  const sourceDefaults = source.defaults || {};
  const sourceSettings = sourceDefaults.settings || {};
  const textIds = new Set(textThemes.map((theme) => theme.id));
  const colorIds = new Set(colorThemes.map((theme) => theme.id));
  const firstText = textThemes[0].id;
  const firstColor = colorThemes[0].id;
  const screenOrder = Array.isArray(sourceDefaults.screenOrder)
    ? sourceDefaults.screenOrder.map(Number).filter((value, index, values) =>
      value >= 1 && value <= 3 && values.indexOf(value) === index)
    : [];
  [2, 3, 1].forEach((value) => {
    if (!screenOrder.includes(value)) screenOrder.push(value);
  });

  const screenTextThemes = {};
  const screenColorThemes = {};
  [1, 2, 3].forEach((index) => {
    screenTextThemes[`screen${index}`] = safeThemeReference(
      sourceDefaults.screenTextThemes?.[`screen${index}`],
      firstText,
      textIds
    );
    screenColorThemes[`screen${index}`] = safeThemeReference(
      sourceDefaults.screenColorThemes?.[`screen${index}`],
      firstColor,
      colorIds
    );
  });

  return {
    version: 1,
    defaults: {
      settings: {
        quoteSeconds: clamp(sourceSettings.quoteSeconds, 30, 5, 300),
        textScale: clamp(sourceSettings.textScale, 100, 60, 160),
        particleAmount: clamp(sourceSettings.particleAmount, 65, 0, 120),
        particleSpeed: clamp(sourceSettings.particleSpeed, 100, 0, 200),
        gridOpacity: clamp(sourceSettings.gridOpacity, 46, 0, 100),
        progressVisible: sourceSettings.progressVisible !== false,
        randomOrder: sourceSettings.randomOrder !== false,
        transitionEffect: normalizeTransitionEffect(sourceSettings.transitionEffect)
      },
      screenOrder: screenOrder.slice(0, 3),
      quoteDisplayMode: Number(sourceDefaults.quoteDisplayMode) === 0 ? 0 : 1,
      textThemeMode: Number(sourceDefaults.textThemeMode) === 0 ? 0 : 1,
      colorThemeMode: Number(sourceDefaults.colorThemeMode) === 0 ? 0 : 1,
      globalTextTheme: safeThemeReference(sourceDefaults.globalTextTheme, firstText, textIds),
      globalColorTheme: safeThemeReference(sourceDefaults.globalColorTheme, firstColor, colorIds),
      screenTextThemes,
      screenColorThemes
    },
    textThemes,
    colorThemes
  };
}

function showNotice(message, type = "ok") {
  els.notice.textContent = message;
  els.notice.hidden = false;
  els.notice.classList.toggle("error", type === "error");
  window.clearTimeout(showNotice.timer);
  showNotice.timer = window.setTimeout(() => {
    els.notice.hidden = true;
  }, 4200);
}

function markDirty() {
  app.dirty = true;
}

function defaults() {
  app.config.defaults = app.config.defaults || {};
  app.config.defaults.settings = app.config.defaults.settings || {};
  app.config.defaults.screenTextThemes = app.config.defaults.screenTextThemes || {};
  app.config.defaults.screenColorThemes = app.config.defaults.screenColorThemes || {};
  return app.config.defaults;
}

function settings() {
  const d = defaults();
  d.settings.quoteSeconds = clamp(d.settings.quoteSeconds, 12, 5, 300);
  d.settings.textScale = clamp(d.settings.textScale, 100, 60, 160);
  d.settings.particleAmount = clamp(d.settings.particleAmount, 65, 0, 120);
  d.settings.particleSpeed = clamp(d.settings.particleSpeed, 100, 0, 200);
  d.settings.gridOpacity = clamp(d.settings.gridOpacity, 46, 0, 100);
  d.settings.progressVisible = Boolean(d.settings.progressVisible);
  d.settings.randomOrder = d.settings.randomOrder !== false;
  d.settings.transitionEffect = normalizeTransitionEffect(d.settings.transitionEffect);
  return d.settings;
}

function themeOptions(themes) {
  return themes.map((theme, index) => `<option value="${index}">${escapeHtml(theme.label)}</option>`).join("");
}

function themeIndexById(themes, id, fallback = 0) {
  const index = themes.findIndex((theme) => theme.id === id);
  return index >= 0 ? index : Math.min(Math.max(fallback, 0), Math.max(themes.length - 1, 0));
}

function themeIdByIndex(themes, index) {
  return themes[Math.min(Math.max(Number(index), 0), themes.length - 1)]?.id || "";
}

function screenX(screen) {
  const match = String(screen.bounds || "").match(/^\s*(-?\d+)/);
  return match ? Number(match[1]) : screen.index;
}

function screenOrder() {
  const d = defaults();
  const indexes = (app.screens.length ? app.screens : [1, 2, 3].map((index) => ({ index, name: `Screen ${index}` }))).map((screen) => screen.index);
  const fallback = [...(app.screens.length ? app.screens : indexes.map((index) => ({ index }))).values()]
    .map((screen) => typeof screen === "number" ? { index: screen } : screen)
    .sort((a, b) => screenX(a) - screenX(b))
    .map((screen) => screen.index);
  const saved = Array.isArray(d.screenOrder) ? d.screenOrder.map(Number).filter((index) => indexes.includes(index)) : [];
  const order = [...saved, ...fallback.filter((index) => !saved.includes(index))].slice(0, indexes.length);
  d.screenOrder = order;
  return order;
}

function orderedScreens() {
  const screens = app.screens.length ? app.screens : [1, 2, 3].map((index) => ({ index, name: `Screen ${index}`, primary: index === 3, bounds: "" }));
  const byIndex = new Map(screens.map((screen) => [screen.index, screen]));
  return screenOrder().map((index) => byIndex.get(index)).filter(Boolean);
}

function previewStyle(theme) {
  const bg = theme?.background || {};
  return `background: linear-gradient(135deg, ${bg.top || "#0a0b0c"}, ${bg.middle || "#12100d"} 58%, ${bg.bottom || "#081011"});`;
}

function textStyle(theme) {
  const text = theme?.text || ["#fff8ed", "#f1cf94", "#d5faf3"];
  return `background: linear-gradient(92deg, ${text[0]}, ${text[1]}, ${text[2]}); -webkit-background-clip: text; background-clip: text; color: transparent;`;
}

function updateSummary() {
  const d = defaults();
  const s = settings();
  const quote = d.quoteDisplayMode ? "different quotes" : "same quote";
  const text = d.textThemeMode ? "text per screen" : "one text theme";
  const color = d.colorThemeMode ? "colors per screen" : "one color theme";
  els.setupSummary.textContent = `${s.quoteSeconds}s, ${quote}, ${text}, ${color}`;
}

function renderSettings() {
  const s = settings();
  settingFields.forEach(([key, suffix]) => {
    els[key].value = s[key];
    els[`${key}Value`].textContent = `${s[key]}${suffix}`;
  });
  els.transitionEffect.value = s.transitionEffect;
  els.progressVisible.checked = s.progressVisible;
  els.randomOrder.checked = s.randomOrder;
}

function renderModes() {
  const d = defaults();
  els.quoteDisplayMode.value = d.quoteDisplayMode ?? 1;
  els.textThemeMode.value = d.textThemeMode ?? 1;
  els.colorThemeMode.value = d.colorThemeMode ?? 1;
}

function renderThemeSelectors() {
  const d = defaults();
  els.globalTextTheme.innerHTML = themeOptions(app.config.textThemes);
  els.globalColorTheme.innerHTML = themeOptions(app.config.colorThemes);
  els.textThemeSelect.innerHTML = themeOptions(app.config.textThemes);
  els.colorThemeSelect.innerHTML = themeOptions(app.config.colorThemes);

  els.globalTextTheme.value = themeIndexById(app.config.textThemes, d.globalTextTheme, 0);
  els.globalColorTheme.value = themeIndexById(app.config.colorThemes, d.globalColorTheme, 0);
  els.textThemeSelect.value = app.activeTextTheme;
  els.colorThemeSelect.value = app.activeColorTheme;
}

function readControlsToConfig() {
  const d = defaults();
  const s = settings();
  settingFields.forEach(([key]) => {
    s[key] = Number(els[key].value);
  });
  s.transitionEffect = normalizeTransitionEffect(els.transitionEffect.value);
  s.progressVisible = els.progressVisible.checked;
  s.randomOrder = els.randomOrder.checked;

  d.quoteDisplayMode = Number(els.quoteDisplayMode.value);
  d.textThemeMode = Number(els.textThemeMode.value);
  d.colorThemeMode = Number(els.colorThemeMode.value);
  d.globalTextTheme = themeIdByIndex(app.config.textThemes, els.globalTextTheme.value);
  d.globalColorTheme = themeIdByIndex(app.config.colorThemes, els.globalColorTheme.value);

  [1, 2, 3].forEach((index) => {
    const textSelect = $(`screen${index}TextTheme`);
    const colorSelect = $(`screen${index}ColorTheme`);
    if (textSelect) d.screenTextThemes[`screen${index}`] = themeIdByIndex(app.config.textThemes, textSelect.value);
    if (colorSelect) d.screenColorThemes[`screen${index}`] = themeIdByIndex(app.config.colorThemes, colorSelect.value);
  });
}

function renderScreens() {
  const d = defaults();
  const screens = orderedScreens();
  const order = screenOrder();
  els.screenGrid.innerHTML = screens.map((screen, position) => {
    const textIndex = themeIndexById(app.config.textThemes, d.screenTextThemes[`screen${screen.index}`], screen.index - 1);
    const colorIndex = themeIndexById(app.config.colorThemes, d.screenColorThemes[`screen${screen.index}`], screen.index === 2 ? 1 : 0);
    const textTheme = app.config.textThemes[textIndex] || app.config.textThemes[0];
    const colorTheme = app.config.colorThemes[colorIndex] || app.config.colorThemes[0];
    const quote = textTheme?.quotes?.[0] || { text: "Every pixel argues for attention.", author: "Design note" };
    const positionOptions = positionLabels.map((label, index) => `<option value="${index}"${index === position ? " selected" : ""}>${label}</option>`).join("");
    return `
      <article class="screen-card">
        <div class="screen-title">
          <div>
            <strong>Screen ${screen.index}</strong>
            <small>${escapeHtml(screen.name)}${screen.primary ? " - primary" : ""}</small>
          </div>
          <span class="position-pill">${positionLabels[position]}</span>
        </div>
        <div class="screen-preview" style="${previewStyle(colorTheme)}">
          <span>${escapeHtml(textTheme.label)} 01</span>
          <b style="${textStyle(colorTheme)}">${escapeHtml(quote.text)}</b>
          <em>${escapeHtml(quote.author || textTheme.label)}</em>
        </div>
        <label>
          Column
          <select data-position-screen="${screen.index}">${positionOptions}</select>
        </label>
        <label>
          Text theme
          <select id="screen${screen.index}TextTheme">${themeOptions(app.config.textThemes)}</select>
        </label>
        <label>
          Color theme
          <select id="screen${screen.index}ColorTheme">${themeOptions(app.config.colorThemes)}</select>
        </label>
      </article>
    `;
  }).join("");

  order.forEach((screenIndex, position) => {
    const textSelect = $(`screen${screenIndex}TextTheme`);
    const colorSelect = $(`screen${screenIndex}ColorTheme`);
    if (!textSelect || !colorSelect) return;
    textSelect.value = themeIndexById(app.config.textThemes, d.screenTextThemes[`screen${screenIndex}`], screenIndex - 1);
    colorSelect.value = themeIndexById(app.config.colorThemes, d.screenColorThemes[`screen${screenIndex}`], screenIndex === 2 ? 1 : 0);
    textSelect.addEventListener("change", handleChange);
    colorSelect.addEventListener("change", handleChange);
    const positionSelect = els.screenGrid.querySelector(`[data-position-screen="${screenIndex}"]`);
    positionSelect.addEventListener("change", () => moveScreenColumn(screenIndex, Number(positionSelect.value), position));
  });
}

function moveScreenColumn(screenIndex, nextPosition, previousPosition) {
  const d = defaults();
  const order = screenOrder();
  if (nextPosition === previousPosition) return;
  const otherScreen = order[nextPosition];
  order[nextPosition] = screenIndex;
  order[previousPosition] = otherScreen;
  d.screenOrder = order;
  markDirty();
  renderScreens();
}

function renderTextEditor() {
  const theme = app.config.textThemes[app.activeTextTheme] || app.config.textThemes[0];
  els.textThemeName.value = theme.label;
  els.quoteList.innerHTML = theme.quotes.map((quote, index) => `
    <article class="quote-item">
      <div>
        <label>
          Quote
          <textarea rows="2" data-quote-field="text" data-index="${index}">${escapeHtml(quote.text)}</textarea>
        </label>
        <label>
          Signature
          <input data-quote-field="author" data-index="${index}" value="${escapeHtml(quote.author || "")}">
        </label>
      </div>
      <div class="quote-actions">
        <button class="ghost" data-move-up="${index}" type="button">Up</button>
        <button class="ghost" data-move-down="${index}" type="button">Down</button>
        <button class="danger" data-delete-quote="${index}" type="button">Delete</button>
      </div>
    </article>
  `).join("");

  els.quoteList.querySelectorAll("[data-quote-field]").forEach((input) => {
    input.addEventListener("input", () => {
      theme.quotes[Number(input.dataset.index)][input.dataset.quoteField] = input.value;
      markDirty();
      renderScreens();
    });
  });

  els.quoteList.querySelectorAll("[data-delete-quote]").forEach((button) => {
    button.addEventListener("click", () => {
      if (theme.quotes.length <= 1) return showNotice("Keep at least one quote.", "error");
      theme.quotes.splice(Number(button.dataset.deleteQuote), 1);
      markDirty();
      renderTextEditor();
      renderScreens();
    });
  });

  els.quoteList.querySelectorAll("[data-move-up]").forEach((button) => {
    button.addEventListener("click", () => moveQuote(Number(button.dataset.moveUp), -1));
  });
  els.quoteList.querySelectorAll("[data-move-down]").forEach((button) => {
    button.addEventListener("click", () => moveQuote(Number(button.dataset.moveDown), 1));
  });
}

function moveQuote(index, direction) {
  const theme = app.config.textThemes[app.activeTextTheme];
  const next = index + direction;
  if (next < 0 || next >= theme.quotes.length) return;
  [theme.quotes[index], theme.quotes[next]] = [theme.quotes[next], theme.quotes[index]];
  markDirty();
  renderTextEditor();
  renderScreens();
}

function renderColorEditor() {
  const theme = app.config.colorThemes[app.activeColorTheme] || app.config.colorThemes[0];
  els.colorThemeName.value = theme.label;
  els.colorFields.innerHTML = colorFields.map(([label, path]) => {
    const value = getPath(theme, path) || "#ffffff";
    const color = isHex(value) ? value : "#ffffff";
    return `
      <div class="color-control">
        <input type="color" data-color-pick="${path}" value="${escapeHtml(color)}">
        <label>
          ${escapeHtml(label)}
          <input data-color-text="${path}" value="${escapeHtml(value)}">
        </label>
      </div>
    `;
  }).join("");

  els.colorFields.querySelectorAll("[data-color-pick]").forEach((input) => {
    input.addEventListener("input", () => {
      const theme = app.config.colorThemes[app.activeColorTheme];
      setPath(theme, input.dataset.colorPick, input.value);
      if (input.dataset.colorPick.startsWith("accents.")) {
        const index = input.dataset.colorPick.split(".")[1];
        setPath(theme, `particles.${index}`, input.value);
      }
      const textInput = els.colorFields.querySelector(`[data-color-text="${input.dataset.colorPick}"]`);
      if (textInput) textInput.value = input.value;
      markDirty();
      updatePalettePreview();
      renderScreens();
    });
  });

  els.colorFields.querySelectorAll("[data-color-text]").forEach((input) => {
    input.addEventListener("input", () => {
      setPath(app.config.colorThemes[app.activeColorTheme], input.dataset.colorText, input.value);
      markDirty();
      updatePalettePreview();
      renderScreens();
    });
  });

  updatePalettePreview();
}

function updatePalettePreview() {
  const colorTheme = app.config.colorThemes[app.activeColorTheme] || app.config.colorThemes[0];
  const textTheme = app.config.textThemes[app.activeTextTheme] || app.config.textThemes[0];
  const quote = textTheme?.quotes?.[0] || { text: "Every pixel argues for attention.", author: "Design note" };
  els.palettePreview.style = previewStyle(colorTheme);
  els.previewKicker.textContent = `${colorTheme.label} preview`;
  els.previewQuote.textContent = quote.text;
  els.previewQuote.style = textStyle(colorTheme);
  els.previewAuthor.textContent = quote.author || textTheme.label;
}

function renderAll() {
  renderSettings();
  renderModes();
  renderThemeSelectors();
  renderScreens();
  renderTextEditor();
  renderColorEditor();
  updateSummary();
}

function handleChange() {
  readControlsToConfig();
  markDirty();
  renderSettings();
  renderScreens();
  updateSummary();
}

function setUiTheme(theme) {
  document.body.dataset.uiTheme = theme;
  els.themeToggleBtn.textContent = theme === "light" ? "Dark" : "Light";
  localStorage.setItem("quote-signal-ui-theme", theme);
}

function hasNativeHost() {
  return Boolean(window.chrome?.webview);
}

function nativeRequest(type, payload = {}) {
  return new Promise((resolve, reject) => {
    const id = `signalwall-${Date.now()}-${app.requestIndex += 1}`;
    app.pendingRequests.set(id, { resolve, reject });
    window.chrome.webview.postMessage({ id, type, payload });
  });
}

async function apiRequest(type, payload = {}) {
  if (hasNativeHost()) {
    return nativeRequest(type, payload);
  }

  const routes = {
    state: ["/api/state", "GET"],
    save: ["/api/save", "POST"],
    reload: ["/api/reload", "POST"]
  };
  const [url, method] = routes[type] || [];
  if (!url) throw new Error(`Unknown request: ${type}`);

  const response = await fetch(url, {
    method,
    headers: method === "POST" ? { "Content-Type": "application/json" } : undefined,
    body: method === "POST" ? JSON.stringify(payload) : undefined
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Request failed");
  return result;
}

if (hasNativeHost()) {
  window.chrome.webview.addEventListener("message", (event) => {
    const response = event.data || {};
    const request = app.pendingRequests.get(response.id);
    if (!request) return;
    app.pendingRequests.delete(response.id);
    if (response.ok) request.resolve(response.payload || {});
    else request.reject(new Error(response.error || "SignalWall request failed"));
  });
}

async function loadState() {
  const payload = await apiRequest("state");
  app.config = payload.config;
  app.screens = payload.screens || [];
  defaults();
  settings();
  renderAll();
}

async function saveAndApply() {
  readControlsToConfig();
  const payload = await apiRequest("save", { config: app.config });
  app.dirty = false;
  showNotice(`Saved and applied at ${payload.savedAt}.`);
}

async function reloadWallpaper() {
  const payload = await apiRequest("reload");
  showNotice(`Wallpaper reload sent at ${payload.reloadedAt}.`);
}

function exportPreset() {
  readControlsToConfig();
  const payload = {
    format: presetFormat,
    version: 1,
    exportedAt: new Date().toISOString(),
    config: app.config
  };
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `signalwall-preset-${date}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  showNotice("Preset exported.");
}

async function importPreset(file) {
  if (!file) return;
  if (file.size > maxPresetBytes) {
    throw new Error("Preset files must be smaller than 2 MB.");
  }

  const content = await file.text();
  const parsed = JSON.parse(content);
  app.config = normalizeImportedConfig(parsed);
  app.activeTextTheme = 0;
  app.activeColorTheme = 0;
  app.dirty = true;
  renderAll();
  showNotice("Preset imported. Review it, then choose Save and apply.");
}

settingFields.forEach(([key]) => {
  els[key].addEventListener("input", handleChange);
});
els.progressVisible.addEventListener("change", handleChange);
els.randomOrder.addEventListener("change", handleChange);
els.transitionEffect.addEventListener("change", handleChange);
els.quoteDisplayMode.addEventListener("change", handleChange);
els.textThemeMode.addEventListener("change", handleChange);
els.colorThemeMode.addEventListener("change", handleChange);
els.globalTextTheme.addEventListener("change", handleChange);
els.globalColorTheme.addEventListener("change", handleChange);

els.themeToggleBtn.addEventListener("click", () => {
  setUiTheme(document.body.dataset.uiTheme === "light" ? "dark" : "light");
});

els.exportPresetBtn.addEventListener("click", exportPreset);
els.importPresetBtn.addEventListener("click", () => els.presetFileInput.click());
els.presetFileInput.addEventListener("change", async () => {
  try {
    await importPreset(els.presetFileInput.files?.[0]);
  } catch (error) {
    showNotice(error instanceof SyntaxError ? "The selected file is not valid JSON." : error.message, "error");
  } finally {
    els.presetFileInput.value = "";
  }
});

els.textThemeSelect.addEventListener("change", () => {
  app.activeTextTheme = Number(els.textThemeSelect.value);
  renderTextEditor();
  updatePalettePreview();
});

els.colorThemeSelect.addEventListener("change", () => {
  app.activeColorTheme = Number(els.colorThemeSelect.value);
  renderColorEditor();
});

els.textThemeName.addEventListener("input", () => {
  app.config.textThemes[app.activeTextTheme].label = els.textThemeName.value || app.config.textThemes[app.activeTextTheme].id;
  markDirty();
  renderThemeSelectors();
  renderScreens();
});

els.colorThemeName.addEventListener("input", () => {
  app.config.colorThemes[app.activeColorTheme].label = els.colorThemeName.value || app.config.colorThemes[app.activeColorTheme].id;
  markDirty();
  renderThemeSelectors();
  renderScreens();
});

$("addTextThemeBtn").addEventListener("click", () => {
  const label = prompt("Text theme name");
  if (!label) return;
  app.config.textThemes.push({
    id: uniqueId(label, app.config.textThemes),
    label,
    quotes: [{ text: "New quote", author: "Note" }]
  });
  app.activeTextTheme = app.config.textThemes.length - 1;
  markDirty();
  renderAll();
});

$("deleteTextThemeBtn").addEventListener("click", () => {
  if (app.config.textThemes.length <= 1) return showNotice("Keep at least one text theme.", "error");
  if (!confirm("Delete this text theme?")) return;
  app.config.textThemes.splice(app.activeTextTheme, 1);
  app.activeTextTheme = Math.max(0, app.activeTextTheme - 1);
  markDirty();
  renderAll();
});

$("addQuoteBtn").addEventListener("click", () => {
  const lines = els.quoteInput.value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return showNotice("Write at least one phrase.", "error");
  const author = els.authorInput.value.trim();
  const newQuotes = lines.map((text) => ({ text, author }));
  app.config.textThemes[app.activeTextTheme].quotes.unshift(...newQuotes);
  els.quoteInput.value = "";
  els.authorInput.value = "";
  markDirty();
  renderTextEditor();
  renderScreens();
  showNotice(`${lines.length} quote${lines.length > 1 ? "s" : ""} added.`);
});

$("addColorThemeBtn").addEventListener("click", () => {
  const label = prompt("Color theme name");
  if (!label) return;
  const source = JSON.parse(JSON.stringify(app.config.colorThemes[app.activeColorTheme] || app.config.colorThemes[0]));
  source.id = uniqueId(label, app.config.colorThemes);
  source.label = label;
  app.config.colorThemes.push(source);
  app.activeColorTheme = app.config.colorThemes.length - 1;
  markDirty();
  renderAll();
});

$("deleteColorThemeBtn").addEventListener("click", () => {
  if (app.config.colorThemes.length <= 1) return showNotice("Keep at least one color theme.", "error");
  if (!confirm("Delete this color theme?")) return;
  app.config.colorThemes.splice(app.activeColorTheme, 1);
  app.activeColorTheme = Math.max(0, app.activeColorTheme - 1);
  markDirty();
  renderAll();
});

$("saveBtn").addEventListener("click", async () => {
  try {
    await saveAndApply();
  } catch (error) {
    showNotice(error.message, "error");
  }
});

$("reloadBtn").addEventListener("click", async () => {
  try {
    await reloadWallpaper();
  } catch (error) {
    showNotice(error.message, "error");
  }
});

window.addEventListener("beforeunload", (event) => {
  if (!app.dirty) return;
  event.preventDefault();
  event.returnValue = "";
});

setUiTheme(localStorage.getItem("quote-signal-ui-theme") || "dark");
loadState().catch((error) => showNotice(error.message, "error"));
