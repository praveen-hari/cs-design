import * as vscode from "vscode";
import { getNonce } from "../utils/webview-utils.js";
import { getDesignProject, countTokens, DesignProject } from "../services/design-project.js";

/**
 * Opens the Token Editor as a webview panel in the editor area.
 * Generates dynamic HTML from real DESIGN.md data with full VS Code theme support.
 */
export function openTokenEditor(
  extensionUri: vscode.Uri,
  scrollToSection?: string
): void {
  if (tokenEditorPanel) {
    tokenEditorPanel.reveal(vscode.ViewColumn.One);
    if (scrollToSection) {
      tokenEditorPanel.webview.postMessage({ command: "scrollTo", section: scrollToSection });
    }
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    "csDesign.tokenEditor",
    "Design System",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [extensionUri],
    }
  );

  tokenEditorPanel = panel;

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  const project = workspaceFolder ? getDesignProject(workspaceFolder) : { exists: false } as DesignProject;

  panel.webview.html = buildTokenEditorHtml(panel.webview, extensionUri, project);

  if (scrollToSection) {
    setTimeout(() => {
      panel.webview.postMessage({ command: "scrollTo", section: scrollToSection });
    }, 500);
  }

  panel.onDidDispose(() => { tokenEditorPanel = undefined; });
}

let tokenEditorPanel: vscode.WebviewPanel | undefined;

function buildTokenEditorHtml(webview: vscode.Webview, extensionUri: vscode.Uri, project: DesignProject): string {
  const nonce = getNonce();
  const cspSource = webview.cspSource;
  const codiconFontUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "webview", "shared", "codicon.ttf"));
  const codiconCssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "webview", "shared", "codicon.css"));

  const name = project.name ?? "Untitled";
  const desc = project.description ?? "";
  const colors = project.colors ?? {};
  const typography = project.typography ?? {};
  const spacing = project.spacing ?? {};
  const rounded = project.rounded ?? {};


  // ── Build color swatches ──
  const colorEntries = Object.entries(colors);
  const colorSwatches = colorEntries.map(([k, v]) => `
    <div class="color-swatch" tabindex="0" title="${k}: ${v}">
      <div class="color-swatch__preview" style="background:${v};"></div>
      <div class="color-swatch__info">
        <div class="color-swatch__name">${k}</div>
        <div class="color-swatch__hex">${v}</div>
      </div>
    </div>`).join("");

  // ── Build typography items ──
  const typeEntries = Object.entries(typography);
  const typeItems = typeEntries.map(([k, v]: [string, any]) => {
    const family = v.fontFamily ?? "system-ui";
    const size = v.fontSize ?? "16px";
    const weight = v.fontWeight ?? 400;
    const lh = v.lineHeight ?? 1.4;
    const isCode = k === "code";
    const fontStyle = isCode
      ? `font-family:'Cascadia Code','Fira Code',Menlo,monospace;font-size:${size};font-weight:${weight};line-height:${lh};background:var(--vscode-textCodeBlock-background);padding:8px 10px;border-radius:4px;`
      : `font-size:${size};font-weight:${weight};line-height:${lh};`;
    const sample = isCode ? "const result = await fetchData({ limit: 20 });" : "The quick brown fox jumps over the lazy dog";
    return `
    <div class="type-item">
      <div class="type-item__label">${k.toUpperCase()}</div>
      <div class="type-item__sample" style="${fontStyle}">${sample}</div>
      <div class="type-item__meta">${family} · ${size} · ${weight} · ${lh} lh</div>
    </div>`;
  }).join("");

  // ── Build spacing rows ──
  const spacingEntries = Object.entries(spacing);
  const maxSpacing = Math.max(...spacingEntries.map(([, v]) => parseInt(v as string) || 0), 1);
  const spacingRows = spacingEntries.map(([k, v]) => {
    const px = parseInt(v as string) || 0;
    const barWidth = Math.max((px / maxSpacing) * 200, 4);
    return `<div class="scale-row"><span class="scale-row__label">${k}</span><div class="scale-row__bar" style="width:${barWidth}px;"></div><span class="scale-row__value">${v}</span></div>`;
  }).join("");

  // ── Build rounded boxes ──
  const roundedEntries = Object.entries(rounded);
  const roundedBoxes = roundedEntries.map(([k, v]) => `
    <div class="rounded-item">
      <div class="rounded-item__box" style="border-radius:${v};"></div>
      <div class="rounded-item__label">${k}</div>
      <div class="rounded-item__value">${v}</div>
    </div>`).join("");

  // Components section removed — too complex to preview generically.
  // Users see components in action via screen previews in the browser.

  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline'; font-src ${cspSource}; script-src 'nonce-${nonce}';" />
  <link rel="stylesheet" href="${codiconCssUri}" />
  <style>
    @font-face { font-family: "codicon"; font-display: block; src: url("${codiconFontUri}") format("truetype"); }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: var(--vscode-editor-background);
      color: var(--vscode-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      line-height: 1.4;
      -webkit-font-smoothing: antialiased;
    }

    .page { max-width: 720px; margin: 0 auto; padding: 24px 32px 64px; }

    /* Header */
    .header { margin-bottom: 32px; padding-bottom: 20px; border-bottom: 1px solid var(--vscode-panel-border); }
    .header__name { font-size: 26px; font-weight: 400; margin-bottom: 4px; line-height: 1.3; }
    .header__desc { color: var(--vscode-descriptionForeground); margin-bottom: 12px; line-height: 1.5; }
    .header__meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--vscode-descriptionForeground); flex-wrap: wrap; margin-bottom: 16px; }
    .header__meta--valid { color: var(--vscode-testing-iconPassed); }
    .header__meta-sep { color: var(--vscode-panel-border); }
    .header__actions { display: flex; gap: 8px; flex-wrap: wrap; }

    .btn {
      display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 12px;
      border: 1px solid var(--vscode-panel-border); border-radius: 4px; background: transparent;
      color: var(--vscode-foreground); font-family: inherit; font-size: 12px; cursor: pointer; white-space: nowrap;
    }
    .btn:hover { background: var(--vscode-list-hoverBackground); }
    .btn:focus-visible { outline: 1px solid var(--vscode-focusBorder); outline-offset: 1px; }
    .btn .codicon { font-size: 14px; }

    /* Section */
    .section { margin-bottom: 36px; }
    .section__header { display: flex; align-items: baseline; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid var(--vscode-panel-border); margin-bottom: 16px; }
    .section__title { font-size: 20px; font-weight: 600; line-height: 1.3; }
    .section__count { font-size: 12px; color: var(--vscode-descriptionForeground); }
    .section__subtitle { font-size: 14px; font-weight: 600; color: var(--vscode-descriptionForeground); margin-bottom: 10px; margin-top: 20px; }

    /* Color Swatches */
    .color-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .color-swatch { border: 1px solid var(--vscode-panel-border); border-radius: 6px; overflow: hidden; cursor: pointer; background: var(--vscode-editor-background); }
    .color-swatch:hover { border-color: var(--vscode-textLink-foreground); }
    .color-swatch__preview { height: 40px; width: 100%; }
    .color-swatch__info { padding: 6px 8px; }
    .color-swatch__name { font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.4; }
    .color-swatch__hex { font-size: 10px; color: var(--vscode-descriptionForeground); font-family: 'Cascadia Code', Menlo, monospace; line-height: 1.4; }

    /* Typography */
    .type-list { display: flex; flex-direction: column; gap: 2px; }
    .type-item { padding: 12px 16px; background: var(--vscode-sideBar-background); border: 1px solid var(--vscode-panel-border); border-radius: 6px; }
    .type-item__label { font-size: 11px; color: var(--vscode-textLink-foreground); text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; margin-bottom: 4px; }
    .type-item__sample { margin-bottom: 6px; }
    .type-item__meta { font-size: 11px; color: var(--vscode-descriptionForeground); }

    /* Scale rows (spacing + type scale) */
    .scale-chart { display: flex; flex-direction: column; gap: 4px; margin-top: 16px; }
    .scale-row { display: flex; align-items: center; gap: 10px; height: 22px; }
    .scale-row__label { width: 36px; font-size: 12px; color: var(--vscode-descriptionForeground); text-align: right; flex-shrink: 0; }
    .scale-row__bar { height: 12px; background: var(--vscode-textLink-foreground); border-radius: 2px; opacity: 0.6; }
    .scale-row__value { font-size: 11px; color: var(--vscode-descriptionForeground); font-family: 'Cascadia Code', Menlo, monospace; flex-shrink: 0; }

    /* Rounded */
    .rounded-grid { display: flex; gap: 12px; flex-wrap: wrap; }
    .rounded-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .rounded-item__box { width: 64px; height: 64px; background: var(--vscode-sideBar-background); border: 1.5px solid var(--vscode-textLink-foreground); opacity: 0.8; }
    .rounded-item__label { font-size: 11px; font-weight: 500; text-align: center; }
    .rounded-item__value { font-size: 10px; color: var(--vscode-descriptionForeground); font-family: 'Cascadia Code', Menlo, monospace; }


  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header" id="overview">
    <h1 class="header__name">${name}</h1>
    <p class="header__desc">${desc}</p>
    <div class="header__meta">
      <span class="header__meta--valid"><i class="codicon codicon-pass-filled"></i></span>
      <span class="header__meta--valid">Valid</span>
      <span class="header__meta-sep">·</span>
      <span>${countTokens(project.colors)} colors</span>
      <span class="header__meta-sep">·</span>
      <span>${countTokens(project.typography)} typography</span>
      <span class="header__meta-sep">·</span>
      <span>${countTokens(project.spacing)} spacing</span>
      <span class="header__meta-sep">·</span>
      <span>${countTokens(project.rounded)} rounded</span>
    </div>
  </div>

  <!-- Colors -->
  <div class="section" id="colors">
    <div class="section__header">
      <h2 class="section__title">Colors</h2>
      <span class="section__count">${colorEntries.length} tokens</span>
    </div>
    <div class="color-grid">${colorSwatches}</div>
  </div>

  <!-- Typography -->
  <div class="section" id="typography">
    <div class="section__header">
      <h2 class="section__title">Typography</h2>
      <span class="section__count">${typeEntries.length} scales</span>
    </div>
    <div class="type-list">${typeItems}</div>
  </div>

  <!-- Spacing -->
  <div class="section" id="spacing">
    <div class="section__header">
      <h2 class="section__title">Spacing</h2>
      <span class="section__count">${spacingEntries.length} levels</span>
    </div>
    <div class="scale-chart">${spacingRows}</div>
  </div>

  <!-- Rounded -->
  <div class="section" id="rounded">
    <div class="section__header">
      <h2 class="section__title">Rounded</h2>
      <span class="section__count">${roundedEntries.length} levels</span>
    </div>
    <div class="rounded-grid">${roundedBoxes}</div>
  </div>



</div>

<script nonce="${nonce}">
  window.addEventListener('message', event => {
    const msg = event.data;
    if (msg.command === 'scrollTo' && msg.section) {
      const el = document.getElementById(msg.section);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
</script>
</body>
</html>`;
}

