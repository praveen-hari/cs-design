/* ═══════════════════════════════════════════════════════════════
   CS Design — Theme Generator Client Logic
   Single-panel: presets + controls on the left, live preview on
   the right. No multi-step navigation.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const vscode = acquireVsCodeApi();
  const root = document.getElementById("wizard-root");

  // ── Presets (received from the extension host) ──
  let PRESETS = [];

  // ── Override option maps ──

  // Full font catalog — each font is loadable via Google Fonts.
  // `value` is the font family name (used as the override key).
  // `stack` is the CSS font-family value written to DESIGN.md.
  const FONT_CATALOG = [
    { value: "Inter", label: "Inter", stack: "'Inter', system-ui, sans-serif" },
    { value: "Roboto", label: "Roboto", stack: "'Roboto', system-ui, sans-serif" },
    { value: "Open Sans", label: "Open Sans", stack: "'Open Sans', system-ui, sans-serif" },
    { value: "Geist", label: "Geist", stack: "'Geist', system-ui, sans-serif" },
    { value: "Poppins", label: "Poppins", stack: "'Poppins', system-ui, sans-serif" },
    { value: "Montserrat", label: "Montserrat", stack: "'Montserrat', system-ui, sans-serif" },
    { value: "Outfit", label: "Outfit", stack: "'Outfit', system-ui, sans-serif" },
    { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans", stack: "'Plus Jakarta Sans', system-ui, sans-serif" },
    { value: "DM Sans", label: "DM Sans", stack: "'DM Sans', system-ui, sans-serif" },
    { value: "IBM Plex Sans", label: "IBM Plex Sans", stack: "'IBM Plex Sans', system-ui, sans-serif" },
    { value: "Nunito", label: "Nunito", stack: "'Nunito', system-ui, sans-serif" },
    { value: "Lato", label: "Lato", stack: "'Lato', system-ui, sans-serif" },
    { value: "Noto Sans", label: "Noto Sans", stack: "'Noto Sans', system-ui, sans-serif" },
    { value: "Nunito Sans", label: "Nunito Sans", stack: "'Nunito Sans', system-ui, sans-serif" },
    { value: "Figtree", label: "Figtree", stack: "'Figtree', system-ui, sans-serif" },
    { value: "Raleway", label: "Raleway", stack: "'Raleway', system-ui, sans-serif" },
    { value: "Public Sans", label: "Public Sans", stack: "'Public Sans', system-ui, sans-serif" },
    { value: "Delius Swash Caps", label: "Delius Swash Caps", stack: "'Delius Swash Caps', cursive" },
    { value: "Barlow", label: "Barlow", stack: "'Barlow', system-ui, sans-serif" },
    { value: "Hind", label: "Hind", stack: "'Hind', system-ui, sans-serif" },
    { value: "Instrument Sans", label: "Instrument Sans", stack: "'Instrument Sans', system-ui, sans-serif" },
    { value: "Manrope", label: "Manrope", stack: "'Manrope', system-ui, sans-serif" },
    { value: "Oxanium", label: "Oxanium", stack: "'Oxanium', system-ui, sans-serif" },
    { value: "Gabriela", label: "Gabriela", stack: "'Gabriela', serif" },
    { value: "Source Code Pro", label: "Source Code Pro (mono)", stack: "'Source Code Pro', 'JetBrains Mono', monospace" },
  ];

  /**
   * Get the best matching font from FONT_CATALOG for a preset.
   * Priority: previewFont → h1 font → body font → "Inter" fallback.
   */
  function getPresetFontValue(preset) {
    if (!preset) return "Inter";

    // 1. Try previewFont (the preset author's intended display font)
    if (preset.previewFont) {
      const byPreview = FONT_CATALOG.find((f) => f.value === preset.previewFont);
      if (byPreview) return byPreview.value;
    }

    // 2. Try heading font (h1)
    const h1Family = preset.designMd.typography.h1?.fontFamily ?? "";
    const h1Name = h1Family.split(",")[0].trim().replace(/['"]/g, "");
    const byH1 = FONT_CATALOG.find((f) => f.value === h1Name);
    if (byH1) return byH1.value;

    // 3. Try body font
    const bodyFamily = preset.designMd.typography.body?.fontFamily ?? "";
    const bodyName = bodyFamily.split(",")[0].trim().replace(/['"]/g, "");
    const byBody = FONT_CATALOG.find((f) => f.value === bodyName);
    if (byBody) return byBody.value;

    // 4. Fallback
    return "Inter";
  }

  function getFontStack(name) {
    const entry = FONT_CATALOG.find((f) => f.value === name);
    return entry?.stack ?? `'${name}', system-ui, sans-serif`;
  }

  const SPACING_OPTIONS = [
    { value: null, label: "Preset default" },
    { value: "compact", label: "Compact (4–24px)" },
    { value: "comfortable", label: "Comfortable (8–32px)" },
    { value: "spacious", label: "Spacious (12–48px)" },
  ];

  const RADIUS_OPTIONS = [
    { value: null, label: "Preset default" },
    { value: "sharp", label: "Sharp (0px)" },
    { value: "subtle", label: "Subtle (4–6px)" },
    { value: "rounded", label: "Rounded (6–10px)" },
    { value: "pill", label: "Pill (8–16px)" },
  ];

  const SHADOW_OPTIONS = [
    { value: null, label: "Preset default" },
    { value: "none", label: "None — flat" },
    { value: "subtle", label: "Subtle" },
    { value: "medium", label: "Medium" },
    { value: "strong", label: "Strong" },
  ];

  const BORDER_OPTIONS = [
    { value: null, label: "Preset default" },
    { value: "thin", label: "Thin (1px)" },
    { value: "medium", label: "Medium (2px)" },
    { value: "thick", label: "Thick (3px)" },
  ];

  const SHADOW_CSS = {
    none: "none",
    subtle: "0 1px 3px rgba(0,0,0,0.08)",
    medium: "0 4px 12px rgba(0,0,0,0.12)",
    strong: "0 8px 24px rgba(0,0,0,0.16)",
  };

  const BORDER_CSS = { thin: "1px", medium: "2px", thick: "3px" };

  const SPACING_VALUES = {
    compact: { xs: "4px", sm: "8px", md: "12px", lg: "16px", xl: "24px" },
    comfortable: { xs: "8px", sm: "12px", md: "16px", lg: "24px", xl: "32px" },
    spacious: { xs: "12px", sm: "16px", md: "24px", lg: "32px", xl: "48px" },
  };

  const RADIUS_VALUES = {
    sharp: { sm: "0px", md: "0px", lg: "0px", xl: "0px" },
    subtle: { sm: "4px", md: "6px", lg: "8px", xl: "12px" },
    rounded: { sm: "6px", md: "10px", lg: "14px", xl: "20px" },
    pill: { sm: "8px", md: "16px", lg: "24px", xl: "32px" },
  };

  // ── State ──
  const state = {
    presetId: null,
    projectName: "My Design System",
    generateDarkMode: true,
    mode: "light", // "light" | "dark"
    colorOverrides: {},
    typographyOverride: null,
    spacingOverride: null,
    radiusOverride: null,
    shadowOverride: null,
    borderWeightOverride: null,
  };

  // ── Helpers ──

  function getPreset(id) {
    return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
  }

  function getActiveColors() {
    const preset = getPreset(state.presetId);
    if (!preset) return {};
    const base = state.mode === "dark" && preset.designMd["colors-dark"]
      ? { ...preset.designMd.colors, ...preset.designMd["colors-dark"] }
      : { ...preset.designMd.colors };
    for (const [k, v] of Object.entries(state.colorOverrides)) {
      if (v) base[k] = v;
    }
    return base;
  }

  function getActiveFont() {
    if (state.typographyOverride) {
      return getFontStack(state.typographyOverride);
    }
    const preset = getPreset(state.presetId);
    return preset?.designMd.typography.body?.fontFamily ?? "'Inter', system-ui, sans-serif";
  }

  function getActiveHeadingFont() {
    if (state.typographyOverride) {
      return getFontStack(state.typographyOverride);
    }
    const preset = getPreset(state.presetId);
    return preset?.designMd.typography.h1?.fontFamily ?? getActiveFont();
  }

  function getActiveCodeFont() {
    const preset = getPreset(state.presetId);
    if (!preset) return "'JetBrains Mono', monospace";
    return preset.designMd.typography.code?.fontFamily ?? "'JetBrains Mono', monospace";
  }

  function getActiveHeadingWeight() {
    const preset = getPreset(state.presetId);
    if (!preset) return 700;
    return preset.styleTraits.headingWeight;
  }

  function getActiveBodyWeight() {
    const preset = getPreset(state.presetId);
    if (!preset) return 400;
    return preset.styleTraits.bodyWeight;
  }

  function getActiveSpacing() {
    const preset = getPreset(state.presetId);
    if (!preset) return SPACING_VALUES.comfortable;
    if (state.spacingOverride && SPACING_VALUES[state.spacingOverride]) {
      return SPACING_VALUES[state.spacingOverride];
    }
    return preset.designMd.spacing;
  }

  function getActiveRadius() {
    const preset = getPreset(state.presetId);
    if (!preset) return RADIUS_VALUES.subtle;
    if (state.radiusOverride && RADIUS_VALUES[state.radiusOverride]) {
      return RADIUS_VALUES[state.radiusOverride];
    }
    return preset.designMd.rounded;
  }

  function getActiveShadow() {
    const preset = getPreset(state.presetId);
    if (!preset) return "none";
    return state.shadowOverride ?? preset.styleTraits.shadows;
  }

  function getActiveBorderWeight() {
    const preset = getPreset(state.presetId);
    if (!preset) return "thin";
    return state.borderWeightOverride ?? preset.styleTraits.borderWeight;
  }

  function getPresetLabel(options, value) {
    const opt = options.find((o) => o.value === value);
    return opt ? opt.label : "Preset default";
  }

  // ── Render ──

  function render() {
    root.innerHTML = `
      <div class="gen-shell">
        ${renderTopBar()}
        <div class="gen-body">
          ${renderControls()}
          ${renderPreview()}
        </div>
      </div>
    `;
    attachListeners();
  }

  // ── Top Bar ──
  function renderTopBar() {
    return `
      <div class="gen-topbar">
        <div class="gen-topbar__title">
          <i class="codicon codicon-paintcan"></i>
          Create Design System
        </div>
        <div class="gen-topbar__actions">
          <button class="gen-btn gen-btn--ghost" data-action="reset">
            <i class="codicon codicon-discard"></i> Reset
          </button>
          <button class="gen-btn gen-btn--ghost" data-action="cancel">
            <i class="codicon codicon-close"></i> Cancel
          </button>
        </div>
      </div>
    `;
  }

  // ── Controls (left) ──
  function renderControls() {
    return `
      <div class="gen-controls">
        <div class="gen-controls-scroll">
          ${renderPresetStrip()}
          <hr class="gen-divider" />
          ${renderModeToggle()}
          <div style="height:20px"></div>
          ${renderColorControls()}
          <div style="height:20px"></div>
          ${renderTypographyControl()}
          <div style="height:16px"></div>
          ${renderScaleControls()}
          <div style="height:16px"></div>
          ${renderShadowBorderControls()}
          <hr class="gen-divider" />
          ${renderProjectControls()}
        </div>
        <div class="gen-controls-footer">
          <button class="gen-btn gen-btn--full" data-action="generate">
            <i class="codicon codicon-check"></i>
            Generate DESIGN.md
          </button>
        </div>
      </div>
    `;
  }

  // ── Preset Strip ──
  function renderPresetStrip() {
    const cards = PRESETS.map((p) => `
      <div class="preset-card ${state.presetId === p.id ? "is-active" : ""}" data-action="select-preset" data-preset="${p.id}">
        <div class="preset-card__swatches">
          ${p.swatches.map((c) => `<div class="preset-card__swatch" style="background:${c};"></div>`).join("")}
        </div>
        <div class="preset-card__body">
          <div class="preset-card__name">${p.name}</div>
          <div class="preset-card__desc">${p.description}</div>
        </div>
      </div>
    `).join("");

    return `
      <div class="gen-section">
        <div class="gen-section__label">Presets</div>
        <div class="preset-strip">${cards}</div>
      </div>
    `;
  }

  // ── Mode Toggle ──
  function renderModeToggle() {
    return `
      <div class="gen-section">
        <div class="gen-section__label">Mode</div>
        <div class="pill-group">
          <button class="pill ${state.mode === "light" ? "is-active" : ""}" data-action="set-mode" data-value="light">
            <i class="codicon codicon-sun"></i> Light
          </button>
          <button class="pill ${state.mode === "dark" ? "is-active" : ""}" data-action="set-mode" data-value="dark">
            <i class="codicon codicon-moon"></i> Dark
          </button>
        </div>
      </div>
    `;
  }

  // ── Color Controls ──
  function renderColorControls() {
    const preset = getPreset(state.presetId);
    if (!preset) return "";
    const colors = getActiveColors();
    const colorKeys = ["primary", "accent", "background", "surface", "border"];

    const rows = colorKeys.map((key) => {
      const val = colors[key] ?? "#000000";
      return `
        <div class="color-row">
          <div class="color-row__swatch" style="background:${val};">
            <input type="color" value="${val}" data-action="set-color" data-key="${key}" />
          </div>
          <div class="color-row__label">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
          <input class="color-row__input" type="text" value="${val}" data-action="set-color-text" data-key="${key}" />
        </div>
      `;
    }).join("");

    return `
      <div class="gen-section">
        <div class="gen-section__label">Colors</div>
        ${rows}
      </div>
    `;
  }

  // ── Typography Control ──
  function renderTypographyControl() {
    const currentFont = state.typographyOverride || getPresetFontValue(getPreset(state.presetId));
    const currentEntry = FONT_CATALOG.find((f) => f.value === currentFont);
    const currentStack = currentEntry?.stack ?? getFontStack(currentFont);
    const currentLabel = currentEntry?.label ?? currentFont;

    const options = FONT_CATALOG.map((f) => {
      const isSelected = currentFont === f.value;
      return `
        <div class="font-picker__option ${isSelected ? "is-selected" : ""}"
             data-action="set-typography" data-value="${f.value}"
             style="font-family: ${f.stack};">
          <span class="font-picker__option-preview">${f.label}</span>
        </div>
      `;
    }).join("");

    return `
      <div class="gen-section">
        <div class="gen-section__label">Typography</div>
        <div class="font-picker" data-font-picker>
          <div class="font-picker__trigger" data-action="toggle-font-picker">
            <span class="font-picker__trigger-preview" style="font-family: ${currentStack};">${currentLabel}</span>
            <i class="codicon codicon-chevron-down font-picker__chevron"></i>
          </div>
          <div class="font-picker__dropdown" data-font-dropdown>
            ${options}
          </div>
        </div>
      </div>
    `;
  }

  // ── Scale Controls (spacing + radius) ──
  function renderScaleControls() {
    return `
      <div class="control-row">
        <div class="control-row__item">
          <div class="control-row__label">Spacing</div>
          <select class="gen-select" data-action="set-spacing">
            ${SPACING_OPTIONS.map((o) =>
              `<option value="${o.value ?? ""}" ${state.spacingOverride === o.value ? "selected" : ""}>${o.label}</option>`
            ).join("")}
          </select>
        </div>
        <div class="control-row__item">
          <div class="control-row__label">Radius</div>
          <select class="gen-select" data-action="set-radius">
            ${RADIUS_OPTIONS.map((o) =>
              `<option value="${o.value ?? ""}" ${state.radiusOverride === o.value ? "selected" : ""}>${o.label}</option>`
            ).join("")}
          </select>
        </div>
      </div>
    `;
  }

  // ── Shadow + Border Controls ──
  function renderShadowBorderControls() {
    return `
      <div class="control-row">
        <div class="control-row__item">
          <div class="control-row__label">Shadows</div>
          <select class="gen-select" data-action="set-shadow">
            ${SHADOW_OPTIONS.map((o) =>
              `<option value="${o.value ?? ""}" ${state.shadowOverride === o.value ? "selected" : ""}>${o.label}</option>`
            ).join("")}
          </select>
        </div>
        <div class="control-row__item">
          <div class="control-row__label">Border Weight</div>
          <select class="gen-select" data-action="set-border">
            ${BORDER_OPTIONS.map((o) =>
              `<option value="${o.value ?? ""}" ${state.borderWeightOverride === o.value ? "selected" : ""}>${o.label}</option>`
            ).join("")}
          </select>
        </div>
      </div>
    `;
  }

  // ── Project Controls ──
  function renderProjectControls() {
    return `
      <div class="gen-section">
        <div class="gen-section__label">Project</div>
        <input class="gen-input" type="text" value="${state.projectName}" placeholder="Project name" data-action="set-project-name" style="margin-bottom:10px;" />
        <label class="gen-checkbox">
          <input type="checkbox" ${state.generateDarkMode ? "checked" : ""} data-action="set-dark-mode" />
          <label>Generate dark mode variant</label>
        </label>
      </div>
    `;
  }

  // ── Live Preview (right) ──
  function renderPreview() {
    const colors = getActiveColors();
    const bodyFont = getActiveFont();
    const headingFont = getActiveHeadingFont();
    const spacing = getActiveSpacing();
    const radius = getActiveRadius();
    const shadow = getActiveShadow();
    const borderWeight = getActiveBorderWeight();
    const headingWeight = getActiveHeadingWeight();
    const bodyWeight = getActiveBodyWeight();

    const border = `${BORDER_CSS[borderWeight] || "1px"} solid ${colors.border || "#E2E8F0"}`;
    const shadowCss = SHADOW_CSS[shadow] || "none";
    const padMd = parseInt(String(spacing.md || "16px"));
    const gapSm = parseInt(String(spacing.sm || "8px"));

    return `
      <div class="gen-preview">
        <div class="gen-preview__label">Live Preview</div>
        <div class="preview-canvas" style="
          --pv-primary: ${colors.primary};
          --pv-secondary: ${colors.secondary};
          --pv-accent: ${colors.accent};
          --pv-background: ${colors.background};
          --pv-surface: ${colors.surface};
          --pv-border: ${colors.border};
          --pv-radius-sm: ${radius.sm || "4px"};
          --pv-radius-md: ${radius.md || "6px"};
          --pv-success: ${colors.success || "#16A34A"};
          --pv-error: ${colors.error || "#DC2626"};
          background: ${colors.background};
          border: ${border};
          border-radius: ${radius.lg || "8px"};
          box-shadow: ${shadowCss};
          font-family: ${bodyFont};
        ">
          <div class="preview-pgroup">
            <div class="preview-card" style="border:${border}; border-radius:${radius.md || "6px"}; box-shadow:${shadowCss}; padding:${padMd}px;">
              <div class="preview-card__title" style="font-family:${headingFont}; font-weight:${headingWeight};">Card Title</div>
              <div class="preview-card__text" style="font-weight:${bodyWeight};">This is sample card content. It shows how your surface color, border, and radius work together.</div>
            </div>
          </div>

          <div class="preview-pgroup">
            <div style="display:flex; gap:${gapSm}px; flex-wrap:wrap;">
              <div class="preview-btn preview-btn--primary" style="border-radius:${radius.md || "6px"}; font-weight:${bodyWeight};">Primary Action</div>
              <div class="preview-btn preview-btn--secondary" style="border-radius:${radius.md || "6px"}; font-weight:${bodyWeight};">Secondary</div>
            </div>
          </div>

          <div class="preview-pgroup">
            <div class="preview-input__label" style="font-weight:${bodyWeight};">Email address</div>
            <div class="preview-input__field" style="border:${border}; border-radius:${radius.sm || "4px"};"></div>
          </div>

          <div class="preview-pgroup">
            <table class="preview-table" style="border:${border};">
              <thead><tr><th>Name</th><th>Status</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td>Item 1</td><td>Active</td><td>$1,200</td></tr>
                <tr><td>Item 2</td><td>Pending</td><td>$890</td></tr>
                <tr><td>Item 3</td><td>Active</td><td>$3,400</td></tr>
              </tbody>
            </table>
          </div>

          <div class="preview-pgroup">
            <div class="preview-nav" style="border:${border}; border-radius:${radius.md || "6px"};">
              <div class="preview-nav__item preview-nav__item--active" style="border-radius:${radius.sm || "4px"}; font-weight:${bodyWeight};">Home</div>
              <div class="preview-nav__item" style="font-weight:${bodyWeight};">Products</div>
              <div class="preview-nav__item" style="font-weight:${bodyWeight};">Settings</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ── Event Listeners ──

  function attachListeners() {
    // Preset selection
    root.querySelectorAll("[data-action='select-preset']").forEach((el) => {
      el.addEventListener("click", () => {
        state.presetId = el.dataset.preset;
        const preset = getPreset(state.presetId);
        // Auto-fill typography from the preset's actual font
        state.typographyOverride = getPresetFontValue(preset);
        // Reset other overrides
        state.colorOverrides = {};
        state.spacingOverride = null;
        state.radiusOverride = null;
        state.shadowOverride = null;
        state.borderWeightOverride = null;
        render();
      });
    });

    // Mode toggle
    root.querySelectorAll("[data-action='set-mode']").forEach((el) => {
      el.addEventListener("click", () => {
        state.mode = el.dataset.value;
        render();
      });
    });

    // Color swatch + text input
    root.querySelectorAll("[data-action='set-color']").forEach((el) => {
      el.addEventListener("input", (e) => {
        state.colorOverrides[el.dataset.key] = e.target.value;
        // Update the text input + swatch without full re-render
        const row = el.closest(".color-row");
        row.querySelector(".color-row__swatch").style.background = e.target.value;
        row.querySelector(".color-row__input").value = e.target.value.toUpperCase();
        updatePreviewOnly();
      });
    });

    root.querySelectorAll("[data-action='set-color-text']").forEach((el) => {
      el.addEventListener("input", (e) => {
        const val = e.target.value;
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          state.colorOverrides[el.dataset.key] = val;
          const row = el.closest(".color-row");
          row.querySelector(".color-row__swatch").style.background = val;
          row.querySelector('input[type="color"]').value = val;
          updatePreviewOnly();
        }
      });
    });

    // Font picker — toggle dropdown
    root.querySelector("[data-action='toggle-font-picker']")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const trigger = e.currentTarget;
      const dropdown = root.querySelector("[data-font-dropdown]");
      const isOpen = dropdown?.classList.contains("is-open");
      // Close all font pickers first
      root.querySelectorAll("[data-font-dropdown]").forEach((d) => d.classList.remove("is-open"));
      root.querySelectorAll(".font-picker__trigger").forEach((t) => t.classList.remove("is-open"));
      // Toggle this one
      if (!isOpen) {
        dropdown?.classList.add("is-open");
        trigger.classList.add("is-open");
      }
    });

    // Font picker — option click
    root.querySelectorAll("[data-font-dropdown] .font-picker__option").forEach((el) => {
      el.addEventListener("click", () => {
        state.typographyOverride = el.dataset.value || null;
        render();
      });
    });

    // Close font picker when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest("[data-font-picker]")) {
        root.querySelectorAll("[data-font-dropdown]").forEach((d) => d.classList.remove("is-open"));
        root.querySelectorAll(".font-picker__trigger").forEach((t) => t.classList.remove("is-open"));
      }
    });

    // Dropdowns
    root.querySelector("[data-action='set-spacing']")?.addEventListener("change", (e) => {
      state.spacingOverride = e.target.value || null;
      updatePreviewOnly();
    });

    root.querySelector("[data-action='set-radius']")?.addEventListener("change", (e) => {
      state.radiusOverride = e.target.value || null;
      updatePreviewOnly();
    });

    root.querySelector("[data-action='set-shadow']")?.addEventListener("change", (e) => {
      state.shadowOverride = e.target.value || null;
      updatePreviewOnly();
    });

    root.querySelector("[data-action='set-border']")?.addEventListener("change", (e) => {
      state.borderWeightOverride = e.target.value || null;
      updatePreviewOnly();
    });

    // Project name
    root.querySelector("[data-action='set-project-name']")?.addEventListener("input", (e) => {
      state.projectName = e.target.value;
    });

    // Dark mode checkbox
    root.querySelector("[data-action='set-dark-mode']")?.addEventListener("change", (e) => {
      state.generateDarkMode = e.target.checked;
    });

    // Actions (buttons)
    root.querySelectorAll("[data-action]").forEach((el) => {
      if (el.tagName !== "BUTTON") return;
      el.addEventListener("click", () => {
        const action = el.dataset.action;
        switch (action) {
          case "reset":
            resetState();
            break;
          case "cancel":
            vscode.postMessage({ command: "cancel" });
            break;
          case "generate":
            handleGenerate();
            break;
        }
      });
    });
  }

  // ── Update only the preview (no full re-render) ──
  function updatePreviewOnly() {
    const previewEl = root.querySelector(".gen-preview");
    if (previewEl) {
      previewEl.outerHTML = renderPreview();
    }
  }

  // ── Reset ──
  function resetState() {
    const preset = PRESETS[0];
    if (!preset) return;
    state.presetId = preset.id;
    state.mode = "light";
    state.generateDarkMode = true;
    state.projectName = "My Design System";
    state.colorOverrides = {};
    state.typographyOverride = getPresetFontValue(preset);
    state.spacingOverride = null;
    state.radiusOverride = null;
    state.shadowOverride = null;
    state.borderWeightOverride = null;
    render();
  }

  // ── Generate ──
  function handleGenerate() {
    const genState = {
      presetId: state.presetId,
      projectName: state.projectName || "My Design System",
      generateDarkMode: state.generateDarkMode,
      colorOverrides: state.colorOverrides,
      typographyOverride: state.typographyOverride,
      spacingOverride: state.spacingOverride,
      radiusOverride: state.radiusOverride,
      shadowOverride: state.shadowOverride,
      borderWeightOverride: state.borderWeightOverride,
    };
    vscode.postMessage({ command: "generate", state: genState });
  }

  // ── Init: request presets from host ──
  window.addEventListener("message", (event) => {
    const msg = event.data;
    if (msg.command === "init" && msg.presets) {
      PRESETS = msg.presets;
      if (PRESETS.length > 0 && !state.presetId) {
        state.presetId = PRESETS[0].id;
        // Auto-fill typography from the first preset's font
        state.typographyOverride = getPresetFontValue(PRESETS[0]);
      }
      render();
    }
  });

  // Tell the host we're ready
  vscode.postMessage({ command: "ready" });

  // Render an initial loading state
  root.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:var(--vscode-descriptionForeground);font-size:14px;">Loading presets…</div>`;
})();
