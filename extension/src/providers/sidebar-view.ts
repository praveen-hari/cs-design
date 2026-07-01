import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { getDesignProject, countTokens, DesignProject } from "../services/design-project.js";
import { getWebviewContent, getNonce } from "../utils/webview-utils.js";
import { CMD, CTX, PATHS } from "../utils/constants.js";

/**
 * Provides the sidebar webview — shows either the empty state
 * or the project tree view depending on whether .designs/ exists.
 */
export class SidebarViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _wizardActive = false;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    this.refresh();

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage((message: { command: string; section?: string; screen?: string; system?: string; prompt?: string }) => {
      switch (message.command) {
        case "openWelcome":
          vscode.commands.executeCommand(CMD.openWelcome);
          break;
        case "openTokenEditor":
          vscode.commands.executeCommand(CMD.openTokenEditor, message.section);
          break;
        case "previewScreen":
          vscode.commands.executeCommand(CMD.previewScreen, message.screen);
          break;
        case "openChat":
          if (message.prompt) {
            vscode.commands.executeCommand("workbench.action.chat.open", {
              query: message.prompt,
              isPartialQuery: false,
            });
            vscode.commands.executeCommand("workbench.action.closeSidebar");
          } else {
            vscode.commands.executeCommand("workbench.action.chat.open");
          }
          break;
        case "createDesignSystem":
          vscode.commands.executeCommand(CMD.createDesignSystem);
          break;
        case "importFromWorkspace":
          vscode.commands.executeCommand("workbench.action.chat.open", {
            query: `Scan this workspace and extract a DESIGN.md design system from existing files.

Look for:
1. **CSS/SCSS files** — extract color variables, font stacks, spacing values, border-radius
2. **Tailwind config** (tailwind.config.js/ts) — extract theme colors, fonts, spacing, borderRadius
3. **Package.json** — detect UI framework (React, Vue, Angular) and component libraries (shadcn, MUI, Ant Design)
4. **Existing theme files** — any tokens.json, theme.ts, variables.css, globals.css

Then create a complete \`.designs/DESIGN.md\` with:
- All discovered color tokens mapped to primary/secondary/accent/background/surface/border/error/warning/success
- Typography scale extracted from the existing fonts and sizes
- Spacing and radius scales
- A colors-dark section if dark mode variables exist

Use \`cs-design_validate\` to confirm the generated DESIGN.md is valid.`,
            isPartialQuery: false,
          });
          vscode.commands.executeCommand("workbench.action.closeSidebar");
          break;
        case "designFromUrl":
          vscode.window.showInputBox({
            prompt: "Enter the website URL to extract a design system from",
            placeHolder: "https://example.com",
            validateInput: (v) => {
              const trimmed = v.trim();
              if (!trimmed) return "URL cannot be empty";
              if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return "URL must start with http:// or https://";
              return undefined;
            },
          }).then((url) => {
            if (url) {
              vscode.commands.executeCommand("workbench.action.chat.open", {
                query: `Extract a DESIGN.md design system from this website: ${url.trim()}\n\nAnalyze the site's colors, typography, spacing, and overall visual style. Create a complete DESIGN.md with all tokens.`,
                isPartialQuery: false,
              });
              vscode.commands.executeCommand("workbench.action.closeSidebar");
            }
          });
          break;
        case "initSystem":
          vscode.commands.executeCommand(CMD.switchSystem, message.system);
          break;
        case "validate":
          vscode.commands.executeCommand(CMD.validate);
          break;
        case "exportTokens":
          vscode.commands.executeCommand(CMD.exportTokens);
          break;
        case "newScreen":
          vscode.commands.executeCommand(CMD.newScreen);
          break;
        case "openDesignMd":
          vscode.commands.executeCommand(CMD.openDesignMd);
          break;
      }
    });
  }

  /**
   * Refresh the sidebar content based on current project state.
   */
  refresh(): void {
    if (!this._view) return;

    // If the wizard is active, show a loading state instead of the empty/project view
    if (this._wizardActive) {
      this._view.webview.html = this._buildWizardActiveHtml();
      return;
    }

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      this._view.webview.html = getWebviewContent(
        this._extensionUri,
        this._view.webview,
        "sidebar-empty.html"
      );
      vscode.commands.executeCommand("setContext", CTX.projectExists, false);
      return;
    }

    const project = getDesignProject(workspaceFolder);

    if (!project.exists) {
      this._view.webview.html = getWebviewContent(
        this._extensionUri,
        this._view.webview,
        "sidebar-empty.html"
      );
      vscode.commands.executeCommand("setContext", CTX.projectExists, false);
      return;
    }

    // Project exists — generate dynamic sidebar with real data
    vscode.commands.executeCommand("setContext", CTX.projectExists, true);
    this._buildProjectHtml(this._view.webview, project).then((html) => {
      if (this._view) this._view.webview.html = html;
    });
  }

  /**
   * Set the wizard-active state.
   *
   * When active, the sidebar shows a "Creating…" loading state instead
   * of the empty state — so the user doesn't see two conflicting UIs
   * (the empty sidebar + the wizard panel) at the same time.
   */
  setWizardActive(active: boolean): void {
    this._wizardActive = active;
    vscode.commands.executeCommand("setContext", CTX.wizardActive, active);
    this.refresh();
  }

  /**
   * Build the "wizard active" loading state HTML.
   *
   * Shown in the sidebar while the visual wizard panel is open.
   */
  private _buildWizardActiveHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--vscode-sideBar-background);
      color: var(--vscode-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      line-height: 1.4;
      -webkit-font-smoothing: antialiased;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      text-align: center;
    }
    .loading-state__spinner {
      width: 28px;
      height: 28px;
      border: 2px solid var(--vscode-panel-border);
      border-top-color: var(--vscode-textLink-foreground);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-state__title {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .loading-state__desc {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      line-height: 1.5;
      max-width: 220px;
    }
  </style>
</head>
<body>
  <div class="loading-state">
    <div class="loading-state__spinner"></div>
    <div class="loading-state__title">Creating design system…</div>
    <div class="loading-state__desc">The wizard is open in the editor. Complete the steps to generate your design system.</div>
  </div>
</body>
</html>`;
  }

  /**
   * Build the sidebar HTML dynamically from real project data.
   */
  private async _buildProjectHtml(webview: vscode.Webview, project: DesignProject): Promise<string> {
    const codiconFontUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "webview", "shared", "codicon.ttf")
    );
    const codiconCssUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "webview", "shared", "codicon.css")
    );

    const colorCount = countTokens(project.colors);
    const typographyCount = countTokens(project.typography);
    const spacingCount = countTokens(project.spacing);
    const roundedCount = countTokens(project.rounded);

    const screenCount = project.screens?.length ?? 0;
    const systemName = project.name ?? "Untitled";

    // ── Validation status (runs real SDK validate) ──
    let validIcon = "codicon-pass-filled";
    let validLabel = "Valid";
    let validColor = "var(--vscode-testing-iconPassed)";
    try {
      const ws = vscode.workspace.workspaceFolders?.[0];
      if (ws) {
        const designMdPath = path.join(ws.uri.fsPath, PATHS.designMd);
        if (fs.existsSync(designMdPath)) {
          const content = fs.readFileSync(designMdPath, "utf-8");
          // Dynamic import to avoid loading SDK at startup
          const sdk = await import("@syncfusion/cs-design/sdk");
          const result = sdk.validate(content);
          if (result.ok) {
            const { errorCount, warningCount } = result.data;
            if (errorCount > 0) {
              validIcon = "codicon-error";
              validLabel = `${errorCount} error${errorCount > 1 ? "s" : ""}`;
              validColor = "var(--vscode-errorForeground)";
            } else if (warningCount > 0) {
              validIcon = "codicon-warning";
              validLabel = `${warningCount} warning${warningCount > 1 ? "s" : ""}`;
              validColor = "var(--vscode-editorWarning-foreground)";
            }
          } else {
            validIcon = "codicon-error";
            validLabel = "Parse error";
            validColor = "var(--vscode-errorForeground)";
          }
        }
      }
    } catch {
      // If SDK fails to load, fall back to basic check
      if (colorCount === 0 || typographyCount === 0) {
        validIcon = "codicon-error";
        validLabel = "Incomplete";
        validColor = "var(--vscode-errorForeground)";
      }
    }

    // ── Screen list items ──
    const screenItems = (project.screens ?? [])
      .map(
        (s) => `
        <div class="tree-item" role="button" tabindex="0" data-cmd="previewScreen" data-value="${s}">
          <div class="tree-item__icon icon--accent"><i class="codicon codicon-browser"></i></div>
          <span class="tree-item__label">${s}</span>
        </div>`
      )
      .join("\n");

    const noScreensMsg =
      screenCount === 0
        ? `<div class="empty-hint">
            <span>No screens yet.</span>
            <a class="empty-hint__link" role="button" tabindex="0" data-cmd="newScreen">Create one →</a>
          </div>`
        : "";

    const nonce = getNonce();
    const cspSource = webview.cspSource;

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
      background: var(--vscode-sideBar-background);
      color: var(--vscode-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      line-height: 1.4;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    /* ── Validation Bar ── */
    .validation-bar {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 12px;
      background: var(--vscode-editor-background);
      border-bottom: 1px solid var(--vscode-panel-border);
      font-size: 11px;
    }
    .validation-bar__status { display: flex; align-items: center; gap: 5px; }
    .validation-bar__status .codicon { font-size: 14px; }
    .validation-bar__system { margin-left: auto; color: var(--vscode-descriptionForeground); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }

    /* ── Section ── */
    .section { border-bottom: 1px solid var(--vscode-panel-border); padding: 4px 0; }
    .section:last-child { border-bottom: none; }

    .section-header {
      display: flex; align-items: center; justify-content: space-between;
      height: 28px; padding: 0 12px 0 0; cursor: pointer; user-select: none;
      transition: background 0.1s;
    }
    .section-header:hover { background: var(--vscode-list-hoverBackground); }
    .section-header__left { display: flex; align-items: center; gap: 6px; min-width: 0; flex: 1; }
    .section-header__chevron {
      width: 22px; height: 28px; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; font-size: 16px; transition: transform 0.15s ease;
    }
    .section.is-collapsed .section-header__chevron { transform: rotate(-90deg); }
    .section.is-collapsed .section-body { display: none; }
    .section-header__label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
    .section-header__badge { font-size: 10px; font-weight: 600; color: var(--vscode-badge-foreground); background: var(--vscode-badge-background); border-radius: 9999px; padding: 0 5px; height: 16px; line-height: 16px; flex-shrink: 0; margin-left: 6px; }
    .section-header__actions { display: flex; gap: 2px; flex-shrink: 0; }

    /* ── Tree Items ── */
    .tree { padding: 4px 0; }
    .tree-item {
      display: flex; align-items: center; height: 28px; padding: 0 12px 0 22px;
      cursor: pointer; user-select: none; transition: background 0.1s; gap: 8px;
    }
    .tree-item:hover { background: var(--vscode-list-hoverBackground); }
    .tree-item:focus-visible { outline: 1px solid var(--vscode-focusBorder); outline-offset: -1px; }
    .tree-item__icon { width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 18px; }
    .tree-item__label { font-size: var(--vscode-font-size); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; }
    .tree-item__detail { font-size: 11px; color: var(--vscode-descriptionForeground); flex-shrink: 0; margin-left: auto; }
    .tree-item__actions { display: none; gap: 2px; flex-shrink: 0; margin-left: auto; }
    .tree-item:hover .tree-item__actions { display: flex; }
    .tree-item:hover .tree-item__detail--hide { display: none; }

    .icon-btn {
      display: flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; border: none; background: transparent;
      color: var(--vscode-foreground); border-radius: 3px; cursor: pointer; opacity: 0.6; font-size: 16px;
    }
    .icon-btn:hover { background: var(--vscode-list-hoverBackground); opacity: 1; }

    .icon--accent { color: var(--vscode-textLink-foreground); }
    .icon--secondary { color: var(--vscode-descriptionForeground); }

    /* ── Empty Hint ── */
    .empty-hint {
      padding: 8px 22px; font-size: 12px; color: var(--vscode-descriptionForeground);
      display: flex; align-items: center; gap: 6px;
    }
    .empty-hint__link {
      color: var(--vscode-textLink-foreground); cursor: pointer;
      text-decoration: none;
    }
    .empty-hint__link:hover { text-decoration: underline; }
  </style>
</head>
<body>

  <!-- Validation Bar -->
  <div class="validation-bar">
    <div class="validation-bar__status" style="color: ${validColor};">
      <i class="codicon ${validIcon}"></i>
      <span>${validLabel}</span>
    </div>
    <span class="validation-bar__system" title="${systemName}">${systemName}</span>
  </div>

  <!-- Design System -->
  <div class="section" data-section="design-system">
    <div class="section-header" role="button" tabindex="0" data-toggle-section>
      <div class="section-header__left">
        <div class="section-header__chevron"><i class="codicon codicon-chevron-down"></i></div>
        <span class="section-header__label">Design System</span>
      </div>
    </div>
    <div class="section-body">
      <div class="tree">
        <div class="tree-item" role="button" tabindex="0" data-cmd="openTokenEditor" data-value="colors">
          <div class="tree-item__icon icon--accent"><i class="codicon codicon-symbol-color"></i></div>
          <span class="tree-item__label">Colors</span>
          <span class="tree-item__detail tree-item__detail--hide">${colorCount}</span>
        </div>
        <div class="tree-item" role="button" tabindex="0" data-cmd="openTokenEditor" data-value="typography">
          <div class="tree-item__icon icon--accent"><i class="codicon codicon-text-size"></i></div>
          <span class="tree-item__label">Typography</span>
          <span class="tree-item__detail tree-item__detail--hide">${typographyCount}</span>
        </div>
        <div class="tree-item" role="button" tabindex="0" data-cmd="openTokenEditor" data-value="spacing">
          <div class="tree-item__icon icon--accent"><i class="codicon codicon-symbol-ruler"></i></div>
          <span class="tree-item__label">Spacing</span>
          <span class="tree-item__detail tree-item__detail--hide">${spacingCount}</span>
        </div>
        <div class="tree-item" role="button" tabindex="0" data-cmd="openTokenEditor" data-value="rounded">
          <div class="tree-item__icon icon--accent"><i class="codicon codicon-primitive-square"></i></div>
          <span class="tree-item__label">Rounded</span>
          <span class="tree-item__detail tree-item__detail--hide">${roundedCount}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Screens -->
  <div class="section" data-section="screens">
    <div class="section-header" role="button" tabindex="0" data-toggle-section>
      <div class="section-header__left">
        <div class="section-header__chevron"><i class="codicon codicon-chevron-down"></i></div>
        <span class="section-header__label">Screens</span>
        ${screenCount > 0 ? `<span class="section-header__badge">${screenCount}</span>` : ""}
      </div>
      <div class="section-header__actions">
        <button class="icon-btn" title="New Screen" data-cmd="newScreen"><i class="codicon codicon-add"></i></button>
      </div>
    </div>
    <div class="section-body">
      <div class="tree">
        ${screenItems}
        ${noScreensMsg}
      </div>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="section" data-section="quick-actions">
    <div class="section-header" role="button" tabindex="0" data-toggle-section>
      <div class="section-header__left">
        <div class="section-header__chevron"><i class="codicon codicon-chevron-down"></i></div>
        <span class="section-header__label">Quick Actions</span>
      </div>
    </div>
    <div class="section-body">
      <div class="tree">
        <div class="tree-item" role="button" tabindex="0" data-cmd="exportTokens">
          <div class="tree-item__icon icon--secondary"><i class="codicon codicon-export"></i></div>
          <span class="tree-item__label">Export Tokens</span>
        </div>
        <div class="tree-item" role="button" tabindex="0" data-cmd="openDesignMd">
          <div class="tree-item__icon icon--secondary"><i class="codicon codicon-file"></i></div>
          <span class="tree-item__label">Open DESIGN.md</span>
        </div>
        <div class="tree-item" role="button" tabindex="0" data-cmd="openChat" data-value="Convert the HTML design screens in .designs/screens/ to production code. Detect the framework from package.json and use the appropriate UI component library.">
          <div class="tree-item__icon icon--secondary"><i class="codicon codicon-code"></i></div>
          <span class="tree-item__label">Generate Production Code</span>
        </div>
      </div>
    </div>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    // ── Section collapse/expand ──
    document.querySelectorAll('[data-toggle-section]').forEach(header => {
      header.addEventListener('click', (e) => {
        // Don't toggle if clicking an action button inside the header
        if (e.target.closest('.icon-btn')) return;
        const section = header.closest('.section');
        if (section) section.classList.toggle('is-collapsed');
      });
    });

    // ── Command handler (click + keyboard) ──
    function handleCommand(item) {
      if (!item) return;
      const cmd = item.dataset.cmd;
      const value = item.dataset.value;
      const msg = { command: cmd };
      if (cmd === 'openTokenEditor') msg.section = value;
      else if (cmd === 'previewScreen') msg.screen = value;
      else if (cmd === 'initSystem') msg.system = value;
      else if (cmd === 'openChat') msg.prompt = value;
      vscode.postMessage(msg);
    }

    // Click handler
    document.addEventListener('click', (e) => {
      const item = e.target.closest('[data-cmd]');
      handleCommand(item);
    });

    // Keyboard handler (Enter / Space on role="button" elements)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const target = e.target;
        if (target.getAttribute('role') === 'button') {
          e.preventDefault();
          // Check if it's a section toggle
          if (target.hasAttribute('data-toggle-section')) {
            const section = target.closest('.section');
            if (section) section.classList.toggle('is-collapsed');
          }
          // Check if it's a command
          const item = target.closest('[data-cmd]');
          handleCommand(item);
        }
      }
    });
  </script>

</body>
</html>`;
  }
}
