import * as vscode from "vscode";
import { getDesignProject, countTokens } from "../services/design-project.js";
import { getWebviewContent } from "../utils/webview-utils.js";
import { VIEW_ID, CMD, CTX } from "../utils/constants.js";

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
    webviewView.webview.onDidReceiveMessage((message) => {
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

    // Project exists — show project view
    vscode.commands.executeCommand("setContext", CTX.projectExists, true);

    // For now, load the static HTML. In the future, inject dynamic data.
    this._view.webview.html = getWebviewContent(
      this._extensionUri,
      this._view.webview,
      "sidebar-project.html"
    );
  }
}
