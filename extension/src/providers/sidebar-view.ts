import * as vscode from "vscode";
import { getDesignProject, countTokens, DesignProject } from "../services/design-project.js";
import { getWebviewContent } from "../utils/webview-utils.js";
import { CMD, CTX } from "../utils/constants.js";

/**
 * Provides the sidebar webview — shows either the empty state
 * or the project tree view depending on whether .designs/ exists.
 */
export class SidebarViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

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
    webviewView.webview.onDidReceiveMessage((message: { command: string; section?: string; screen?: string; system?: string }) => {
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
          vscode.commands.executeCommand("workbench.action.chat.open");
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
          vscode.commands.executeCommand(CMD.openTokenEditor);
          break;
      }
    });
  }

  /**
   * Refresh the sidebar content based on current project state.
   */
  refresh(): void {
    if (!this._view) return;

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
    this._view.webview.html = this._buildProjectHtml(this._view.webview, project);
  }

  /**
   * Build the sidebar HTML dynamically from real project data.
   */
  private _buildProjectHtml(webview: vscode.Webview, project: DesignProject): string {
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
    const componentCount = countTokens(project.components);
    const screenCount = project.screens?.length ?? 0;
    const systemName = project.name ?? "Untitled";

    // Build screen list items
    const screenItems = (project.screens ?? [])
      .map(
        (s) => `
        <div class="tree-item" role="button" tabindex="0" onclick="send('previewScreen','${s}')">
          <div class="tree-item__icon icon--warning"><i class="codicon codicon-browser"></i></div>
          <span class="tree-item__label">${s}</span>
          <div class="tree-item__actions">
            <button class="icon-btn" title="Preview in Browser" onclick="event.stopPropagation(); send('previewScreen','${s}')"><i class="codicon codicon-open-preview"></i></button>
          </div>
        </div>`
      )
      .join("\n");

    const noScreensMsg =
      screenCount === 0
        ? `<div class="empty-hint">No screens yet. Ask the agent to design one.</div>`
        : "";

    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="${codiconCssUri}" />
  <style>
    @font-face { font-family: "codicon"; font-display: block; src: url("${codiconFontUri}") format("truetype"); }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--vscode-sideBar-background, #252526);
      color: var(--vscode-foreground, #CCCCCC);
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      line-height: 1.4;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    /* Validation Bar */
    .validation-bar {
      display: flex; align-items: center; gap: 8px;
      padding: 4px 12px;
      background: var(--vscode-editor-background, #1E1E1E);
      border-bottom: 1px solid var(--vscode-panel-border, #3C3C3C);
      font-size: 11px;
    }
    .validation-bar__status { display: flex; align-items: center; gap: 5px; color: var(--vscode-testing-iconPassed, #4EC9B0); }
    .validation-bar__status .codicon { font-size: 14px; }
    .validation-bar__system { margin-left: auto; color: var(--vscode-descriptionForeground, #858585); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Section */
    .section { border-bottom: 1px solid var(--vscode-panel-border, #3C3C3C); }
    .section:last-child { border-bottom: none; }

    .section-header {
      display: flex; align-items: center; justify-content: space-between;
      height: 22px; padding: 0 10px 0 0; cursor: pointer; user-select: none;
      transition: background 0.1s;
    }
    .section-header:hover { background: var(--vscode-list-hoverBackground, #2A2D2E); }
    .section-header__left { display: flex; align-items: center; gap: 4px; min-width: 0; flex: 1; }
    .section-header__chevron { width: 20px; height: 22px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; }
    .section-header__label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
    .section-header__badge { font-size: 10px; font-weight: 600; color: #fff; background: var(--vscode-badge-background, #4D4D4D); border-radius: 9999px; padding: 0 5px; height: 16px; line-height: 16px; flex-shrink: 0; margin-left: 6px; }

    /* Tree Items */
    .tree { padding: 2px 0; }
    .tree-item {
      display: flex; align-items: center; height: 22px; padding: 0 10px 0 20px;
      cursor: pointer; user-select: none; transition: background 0.1s; gap: 6px;
    }
    .tree-item:hover { background: var(--vscode-list-hoverBackground, #2A2D2E); }
    .tree-item:focus-visible { outline: 1px solid var(--vscode-focusBorder, #007FD4); outline-offset: -1px; }
    .tree-item__icon { width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; }
    .tree-item__label { font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; }
    .tree-item__detail { font-size: 11px; color: var(--vscode-descriptionForeground, #858585); flex-shrink: 0; margin-left: auto; }
    .tree-item__actions { display: none; gap: 2px; flex-shrink: 0; margin-left: auto; }
    .tree-item:hover .tree-item__actions { display: flex; }
    .tree-item:hover .tree-item__detail--hide { display: none; }

    .icon-btn {
      display: flex; align-items: center; justify-content: center;
      width: 18px; height: 18px; border: none; background: transparent;
      color: var(--vscode-foreground, #CCCCCC); border-radius: 2px; cursor: pointer; opacity: 0.7; font-size: 14px;
    }
    .icon-btn:hover { background: var(--vscode-list-hoverBackground, #2A2D2E); opacity: 1; }

    .icon--accent { color: var(--vscode-textLink-foreground, #0078D4); }
    .icon--warning { color: var(--vscode-editorWarning-foreground, #CCA700); }
    .icon--secondary { color: var(--vscode-descriptionForeground, #858585); }

    .empty-hint { padding: 6px 20px; font-size: 11px; color: var(--vscode-descriptionForeground, #858585); font-style: italic; }
  </style>
</head>
<body>

  <div class="validation-bar">
    <div class="validation-bar__status">
      <i class="codicon codicon-pass-filled"></i>
      <span>Valid</span>
    </div>
    <span class="validation-bar__system">${systemName}</span>
  </div>

  <!-- Design System -->
  <div class="section">
    <div class="section-header" role="button" tabindex="0">
      <div class="section-header__left">
        <div class="section-header__chevron"><i class="codicon codicon-chevron-down"></i></div>
        <span class="section-header__label">Design System</span>
      </div>
    </div>
    <div class="section-body">
      <div class="tree">
        <div class="tree-item" role="button" tabindex="0" onclick="send('openTokenEditor','colors')">
          <div class="tree-item__icon icon--accent"><i class="codicon codicon-symbol-color"></i></div>
          <span class="tree-item__label">Colors</span>
          <span class="tree-item__detail tree-item__detail--hide">${colorCount}</span>
          <div class="tree-item__actions"><button class="icon-btn" onclick="event.stopPropagation(); send('openTokenEditor','colors')"><i class="codicon codicon-go-to-file"></i></button></div>
        </div>
        <div class="tree-item" role="button" tabindex="0" onclick="send('openTokenEditor','typography')">
          <div class="tree-item__icon icon--accent"><i class="codicon codicon-text-size"></i></div>
          <span class="tree-item__label">Typography</span>
          <span class="tree-item__detail tree-item__detail--hide">${typographyCount}</span>
          <div class="tree-item__actions"><button class="icon-btn" onclick="event.stopPropagation(); send('openTokenEditor','typography')"><i class="codicon codicon-go-to-file"></i></button></div>
        </div>
        <div class="tree-item" role="button" tabindex="0" onclick="send('openTokenEditor','spacing')">
          <div class="tree-item__icon icon--accent"><i class="codicon codicon-symbol-ruler"></i></div>
          <span class="tree-item__label">Spacing</span>
          <span class="tree-item__detail tree-item__detail--hide">${spacingCount}</span>
          <div class="tree-item__actions"><button class="icon-btn" onclick="event.stopPropagation(); send('openTokenEditor','spacing')"><i class="codicon codicon-go-to-file"></i></button></div>
        </div>
        <div class="tree-item" role="button" tabindex="0" onclick="send('openTokenEditor','rounded')">
          <div class="tree-item__icon icon--accent"><i class="codicon codicon-primitive-square"></i></div>
          <span class="tree-item__label">Rounded</span>
          <span class="tree-item__detail tree-item__detail--hide">${roundedCount}</span>
          <div class="tree-item__actions"><button class="icon-btn" onclick="event.stopPropagation(); send('openTokenEditor','rounded')"><i class="codicon codicon-go-to-file"></i></button></div>
        </div>
        <div class="tree-item" role="button" tabindex="0" onclick="send('openTokenEditor','components')">
          <div class="tree-item__icon icon--accent"><i class="codicon codicon-symbol-class"></i></div>
          <span class="tree-item__label">Components</span>
          <span class="tree-item__detail tree-item__detail--hide">${componentCount}</span>
          <div class="tree-item__actions"><button class="icon-btn" onclick="event.stopPropagation(); send('openTokenEditor','components')"><i class="codicon codicon-go-to-file"></i></button></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Screens -->
  <div class="section">
    <div class="section-header" role="button" tabindex="0">
      <div class="section-header__left">
        <div class="section-header__chevron"><i class="codicon codicon-chevron-down"></i></div>
        <span class="section-header__label">Screens</span>
        ${screenCount > 0 ? `<span class="section-header__badge">${screenCount}</span>` : ""}
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
  <div class="section">
    <div class="section-header" role="button" tabindex="0">
      <div class="section-header__left">
        <div class="section-header__chevron"><i class="codicon codicon-chevron-down"></i></div>
        <span class="section-header__label">Quick Actions</span>
      </div>
    </div>
    <div class="section-body">
      <div class="tree">
        <div class="tree-item" role="button" tabindex="0" onclick="send('exportTokens')">
          <div class="tree-item__icon icon--secondary"><i class="codicon codicon-export"></i></div>
          <span class="tree-item__label">Export Tokens</span>
        </div>
        <div class="tree-item" role="button" tabindex="0" onclick="send('initSystem')">
          <div class="tree-item__icon icon--secondary"><i class="codicon codicon-arrow-swap"></i></div>
          <span class="tree-item__label">Switch Design System</span>
        </div>
        <div class="tree-item" role="button" tabindex="0" onclick="send('openDesignMd')">
          <div class="tree-item__icon icon--secondary"><i class="codicon codicon-file"></i></div>
          <span class="tree-item__label">Open DESIGN.md</span>
        </div>
        <div class="tree-item" role="button" tabindex="0" onclick="send('openChat')">
          <div class="tree-item__icon icon--secondary"><i class="codicon codicon-code"></i></div>
          <span class="tree-item__label">Generate Production Code</span>
        </div>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    function send(command, value) {
      const msg = { command };
      if (command === 'openTokenEditor') msg.section = value;
      else if (command === 'previewScreen') msg.screen = value;
      else if (command === 'initSystem') msg.system = value;
      vscode.postMessage(msg);
    }
  </script>

</body>
</html>`;
  }
}
