/**
 * Theme Generator panel — single-screen design system generator.
 *
 * Loads presets from JSON files, sends them to a webview that renders
 * a compact control panel + live preview, and scaffolds a DESIGN.md
 * from the selected preset + any user overrides.
 */

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { getNonce } from "../utils/webview-utils.js";
import { PATHS } from "../utils/constants.js";
import { loadPresets } from "../presets/loader.js";
import type { Preset } from "../presets/types.js";
import type { SidebarViewProvider } from "./sidebar-view.js";

let wizardPanel: vscode.WebviewPanel | undefined;

/**
 * Open the theme generator panel.
 *
 * @param extensionUri The extension's root URI (for loading webview assets).
 * @param onGenerated  Callback invoked after the user clicks "Generate".
 * @param sidebar      The sidebar view provider (to toggle loading state).
 */
export async function openWizardPanel(
  extensionUri: vscode.Uri,
  onGenerated?: () => void,
  sidebar?: SidebarViewProvider
): Promise<void> {
  if (wizardPanel) {
    wizardPanel.reveal(vscode.ViewColumn.One);
    return;
  }

  // ── Load presets from JSON files ──
  const presets = await loadPresets(extensionUri);

  const panel = vscode.window.createWebviewPanel(
    "csDesign.wizard",
    "Create Design System",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [extensionUri],
    }
  );

  wizardPanel = panel;
  panel.webview.html = buildWizardHtml(panel.webview, extensionUri);

  // Close the sidebar so the user focuses on the generator
  sidebar?.setWizardActive(true);
  vscode.commands.executeCommand("workbench.action.closeSidebar");

  // ── Handle messages from the webview ──
  panel.webview.onDidReceiveMessage(
    async (msg: { command: string; state?: GeneratorState }) => {
      switch (msg.command) {
        case "ready":
          // Webview is ready — send presets
          panel.webview.postMessage({ command: "init", presets });
          break;
        case "generate": {
          if (!msg.state) return;
          const ws = vscode.workspace.workspaceFolders?.[0];
          if (!ws) {
            vscode.window.showErrorMessage("Open a workspace folder first.");
            return;
          }
          await scaffoldFromGenerator(ws.uri.fsPath, msg.state, presets);
          panel.dispose();
          onGenerated?.();
          break;
        }
        case "cancel":
          panel.dispose();
          break;
      }
    }
  );

  panel.onDidDispose(() => {
    wizardPanel = undefined;
    sidebar?.setWizardActive(false);
    vscode.commands.executeCommand("csDesign.explorer.focus");
  });
}

// ── Generator state (sent from the webview on "generate") ──

export interface GeneratorState {
  /** Selected preset ID. */
  presetId: string;
  /** Project name (user-editable). */
  projectName: string;
  /** Whether to generate the colors-dark section. */
  generateDarkMode: boolean;
  /** Color overrides (null = use preset value). */
  colorOverrides: Record<string, string | null>;
  /** Typography override (null = use preset). */
  typographyOverride: string | null;
  /** Spacing override (null = use preset). */
  spacingOverride: string | null;
  /** Radius override (null = use preset). */
  radiusOverride: string | null;
  /** Shadow override (null = use preset). */
  shadowOverride: string | null;
  /** Border weight override (null = use preset). */
  borderWeightOverride: string | null;
}

// ── HTML builder ──

function buildWizardHtml(
  webview: vscode.Webview,
  extensionUri: vscode.Uri
): string {
  const nonce = getNonce();
  const cspSource = webview.cspSource;
  const codiconFontUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "webview", "shared", "codicon.ttf")
  );
  const codiconCssUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "webview", "shared", "codicon.css")
  );
  const wizardCssUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "webview", "wizard", "wizard.css")
  );
  const wizardJsUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "webview", "wizard", "wizard.js")
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; style-src ${cspSource} 'unsafe-inline' https://fonts.googleapis.com; font-src ${cspSource} https://fonts.gstatic.com data:; script-src 'nonce-${nonce}'; img-src ${cspSource} data:;" />
  <link rel="stylesheet" href="${codiconCssUri}" />
  <link rel="stylesheet" href="${wizardCssUri}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Delius+Swash+Caps&family=Figtree:wght@400;500;600;700&family=Gabriela&family=Geist:wght@400;500;600;700&family=Hind:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Lato:wght@400;500;700&family=Manrope:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&family=Nunito+Sans:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Oxanium:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Public+Sans:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Source+Code+Pro:wght@400;500;600&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    @font-face { font-family: "codicon"; font-display: block; src: url("${codiconFontUri}") format("truetype"); }
  </style>
</head>
<body>
  <div id="wizard-root"></div>
  <script nonce="${nonce}" src="${wizardJsUri}"></script>
</body>
</html>`;
}

// ── Scaffolding ──

/**
 * Scaffold DESIGN.md, project.json, and tokens.css from the
 * generator state + preset data.
 */
async function scaffoldFromGenerator(
  workspacePath: string,
  state: GeneratorState,
  presets: Preset[]
): Promise<void> {
  const preset = presets.find((p) => p.id === state.presetId) ?? presets[0];
  if (!preset) {
    vscode.window.showErrorMessage(`Unknown preset: ${state.presetId}`);
    return;
  }

  const designsDir = path.join(workspacePath, PATHS.designsDir);
  const screensDir = path.join(workspacePath, PATHS.screensDir);
  fs.mkdirSync(designsDir, { recursive: true });
  fs.mkdirSync(screensDir, { recursive: true });

  const content = buildDesignMdFromPreset(preset, state);
  fs.writeFileSync(path.join(workspacePath, PATHS.designMd), content, "utf-8");

  const projectJson = {
    name: state.projectName,
    system: preset.id,
    createdAt: new Date().toISOString(),
    screens: [],
  };
  fs.writeFileSync(
    path.join(workspacePath, PATHS.projectJson),
    JSON.stringify(projectJson, null, 2),
    "utf-8"
  );

  // Export tokens.css via SDK
  try {
    const sdk = await import("@syncfusion/cs-design/sdk");
    const exportResult = sdk.exportTokens(content, "css");
    if (exportResult.ok) {
      fs.writeFileSync(
        path.join(workspacePath, PATHS.tokensCss),
        exportResult.data.content,
        "utf-8"
      );
    }
  } catch {
    // Non-fatal — tokens.css can be regenerated
  }

  // Open chat with a focused, contextual prompt — auto-send
  const prompt = buildChatPrompt(preset, state);
  await vscode.commands.executeCommand("workbench.action.chat.open", {
    query: prompt,
    isPartialQuery: false,
  });
}

// ── Override resolution ──

/**
 * Font catalog — maps font family names to their CSS font-stack.
 * Used when the user overrides typography via the dropdown.
 * The key is the font name (matches the dropdown value in wizard.js).
 */
const FONT_STACKS: Record<string, string> = {
  "Inter": "'Inter', system-ui, sans-serif",
  "Roboto": "'Roboto', system-ui, sans-serif",
  "Open Sans": "'Open Sans', system-ui, sans-serif",
  "Geist": "'Geist', system-ui, sans-serif",
  "Poppins": "'Poppins', system-ui, sans-serif",
  "Montserrat": "'Montserrat', system-ui, sans-serif",
  "Outfit": "'Outfit', system-ui, sans-serif",
  "Plus Jakarta Sans": "'Plus Jakarta Sans', system-ui, sans-serif",
  "DM Sans": "'DM Sans', system-ui, sans-serif",
  "IBM Plex Sans": "'IBM Plex Sans', system-ui, sans-serif",
  "Nunito": "'Nunito', system-ui, sans-serif",
  "Lato": "'Lato', system-ui, sans-serif",
  "Noto Sans": "'Noto Sans', system-ui, sans-serif",
  "Nunito Sans": "'Nunito Sans', system-ui, sans-serif",
  "Figtree": "'Figtree', system-ui, sans-serif",
  "Raleway": "'Raleway', system-ui, sans-serif",
  "Public Sans": "'Public Sans', system-ui, sans-serif",
  "Delius Swash Caps": "'Delius Swash Caps', cursive",
  "Barlow": "'Barlow', system-ui, sans-serif",
  "Hind": "'Hind', system-ui, sans-serif",
  "Instrument Sans": "'Instrument Sans', system-ui, sans-serif",
  "Manrope": "'Manrope', system-ui, sans-serif",
  "Oxanium": "'Oxanium', system-ui, sans-serif",
  "Gabriela": "'Gabriela', serif",
  "Source Code Pro": "'Source Code Pro', 'JetBrains Mono', monospace",
};

const SPACING_OVERRIDES: Record<string, Record<string, string>> = {
  compact: { xs: "4px", sm: "8px", md: "12px", lg: "16px", xl: "24px" },
  comfortable: { xs: "8px", sm: "12px", md: "16px", lg: "24px", xl: "32px" },
  spacious: { xs: "12px", sm: "16px", md: "24px", lg: "32px", xl: "48px" },
};

const RADIUS_OVERRIDES: Record<string, Record<string, string>> = {
  sharp: { sm: "0px", md: "0px", lg: "0px", xl: "0px", full: "9999px" },
  subtle: { sm: "4px", md: "6px", lg: "8px", xl: "12px", full: "9999px" },
  rounded: { sm: "6px", md: "10px", lg: "14px", xl: "20px", full: "9999px" },
  pill: { sm: "8px", md: "16px", lg: "24px", xl: "32px", full: "9999px" },
};

// ── DESIGN.md builder ──

function buildDesignMdFromPreset(preset: Preset, state: GeneratorState): string {
  const dm = preset.designMd;

  // ── Resolve colors (preset + overrides) ──
  const colors: Record<string, string> = { ...dm.colors };
  for (const [key, val] of Object.entries(state.colorOverrides)) {
    if (val) colors[key] = val;
  }

  // ── Resolve typography ──
  let typography = dm.typography;
  if (state.typographyOverride && FONT_STACKS[state.typographyOverride]) {
    const fontFamily = FONT_STACKS[state.typographyOverride]!;
    const baseBody = dm.typography.body ?? dm.typography[Object.keys(dm.typography)[0]!]!;
    typography = {
      h1: { ...baseBody, fontFamily, fontWeight: 700, fontSize: "36px", lineHeight: 1.2, letterSpacing: "-0.02em" },
      h2: { ...baseBody, fontFamily, fontWeight: 600, fontSize: "28px", lineHeight: 1.3, letterSpacing: "-0.01em" },
      h3: { ...baseBody, fontFamily, fontWeight: 600, fontSize: "22px", lineHeight: 1.4 },
      body: { ...baseBody, fontFamily, fontWeight: 400, fontSize: "16px", lineHeight: 1.5 },
      small: { ...baseBody, fontFamily, fontWeight: 400, fontSize: "14px", lineHeight: 1.4 },
      caption: { ...baseBody, fontFamily, fontWeight: 400, fontSize: "12px", lineHeight: 1.4 },
      code: { fontFamily: "'JetBrains Mono', 'Cascadia Code', Menlo, Consolas, monospace", fontSize: "14px", fontWeight: 400, lineHeight: 1.5 },
    };
  }

  // ── Resolve spacing ──
  const spacing = state.spacingOverride && SPACING_OVERRIDES[state.spacingOverride]
    ? SPACING_OVERRIDES[state.spacingOverride]!
    : dm.spacing;

  // ── Resolve radius ──
  const rounded = state.radiusOverride && RADIUS_OVERRIDES[state.radiusOverride]
    ? RADIUS_OVERRIDES[state.radiusOverride]!
    : dm.rounded;

  // ── Resolve colors-dark ──
  const darkSection = state.generateDarkMode && dm["colors-dark"]
    ? buildDarkSection(dm["colors-dark"]!)
    : "";

  return `---
version: alpha
name: "${state.projectName}"
description: "${dm.description ?? preset.description}"

${formatColorsYaml(colors)}${darkSection}${formatTypographyYaml(typography)}
${formatScaleYaml("rounded", rounded)}
${formatScaleYaml("spacing", spacing)}
---

## Overview

**${state.projectName}** is a design system based on the "${preset.name}" preset.

- **Preset:** ${preset.name} (${preset.category})
- **Typography:** ${state.typographyOverride ?? "preset default"}
- **Spacing:** ${state.spacingOverride ?? "preset default"}
- **Corner radius:** ${state.radiusOverride ?? "preset default"}
- **Shadows:** ${state.shadowOverride ?? "preset default"}
- **Border weight:** ${state.borderWeightOverride ?? "preset default"}
- **Dark mode:** ${state.generateDarkMode ? "Yes" : "No"}

## Colors

Color palette based on the "${preset.name}" preset. Adjust hex values to match your brand precisely.

## Typography

Typography scale ranges from 12px (caption) to ${typography.h1?.fontSize ?? "36px"} (h1).

## Layout

Spacing scale: ${spacing.xs ?? "8px"} → ${spacing.xl ?? "32px"}.

## Elevation & Depth

Define your shadow strategy here. For flat designs, use subtle borders instead of shadows.

## Shapes

Corner radius scale: ${rounded.sm ?? "4px"} → ${rounded.full ?? "9999px"}.

## Components

Define component atoms here: buttons, inputs, cards, chips, alerts, etc.

## Do's and Don'ts

Add practical guidelines as the system evolves.
`;
}

function formatColorsYaml(colors: Record<string, string>): string {
  const entries = Object.entries(colors)
    .map(([k, v]) => `  ${k}: "${v}"`)
    .join("\n");
  return `colors:\n${entries}\n`;
}

function buildDarkSection(dark: Record<string, string>): string {
  const entries = Object.entries(dark)
    .map(([k, v]) => `  ${k}: "${v}"`)
    .join("\n");
  return `colors-dark:\n${entries}\n\n`;
}

function formatTypographyYaml(typo: Record<string, any>): string {
  const entries = Object.entries(typo)
    .map(([key, t]) => {
      const parts = [`    fontFamily: "${t.fontFamily}"`, `    fontSize: "${t.fontSize}"`];
      if (t.fontWeight !== undefined) parts.push(`    fontWeight: ${t.fontWeight}`);
      if (t.lineHeight !== undefined) parts.push(`    lineHeight: ${t.lineHeight}`);
      if (t.letterSpacing !== undefined) parts.push(`    letterSpacing: "${t.letterSpacing}"`);
      return `  ${key}:\n${parts.join("\n")}`;
    })
    .join("\n");
  return `typography:\n${entries}\n\n`;
}

function formatScaleYaml(name: string, scale: Record<string, string>): string {
  const entries = Object.entries(scale)
    .map(([k, v]) => `  ${k}: "${v}"`)
    .join("\n");
  return `${name}:\n${entries}\n`;
}

// ── Chat prompt builder ──

function buildChatPrompt(preset: Preset, state: GeneratorState): string {
  const overrides: string[] = [];
  if (state.typographyOverride) overrides.push(`Typography: ${state.typographyOverride}`);
  if (state.spacingOverride) overrides.push(`Spacing: ${state.spacingOverride}`);
  if (state.radiusOverride) overrides.push(`Radius: ${state.radiusOverride}`);
  if (state.shadowOverride) overrides.push(`Shadows: ${state.shadowOverride}`);
  if (state.borderWeightOverride) overrides.push(`Border weight: ${state.borderWeightOverride}`);

  const overridesText = overrides.length > 0
    ? `\n• **Overrides:** ${overrides.join(" · ")}`
    : "\n• **Overrides:** None (pure preset)";

  return `I just created a DESIGN.md using the theme generator. Here's what I chose:

• **Project:** ${state.projectName}
• **Preset:** ${preset.name} — ${preset.description}
• **Category:** ${preset.category}
• **Accent color:** ${preset.designMd.colors.accent}
• **Dark mode:** ${state.generateDarkMode ? "Yes" : "No"}${overridesText}

The file is at \`.designs/DESIGN.md\`. Please:

1. **Review** the current DESIGN.md and tell me what looks good vs. what needs work.
2. **Ask me 2–3 clarifying questions** about my brand (e.g., specific hex values, font preferences, or component needs) before making changes.
3. After I answer, **refine the DESIGN.md** and run \`cs-design_validate\` to confirm it's valid.

Don't overwrite everything — build on what's there.`;
}
