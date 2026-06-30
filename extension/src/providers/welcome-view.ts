import * as vscode from "vscode";
import { getWebviewContent } from "../utils/webview-utils.js";
import { CMD } from "../utils/constants.js";

/**
 * Opens the Welcome Tab as a webview panel in the editor area.
 */
export function openWelcomeTab(extensionUri: vscode.Uri): void {
  const panel = vscode.window.createWebviewPanel(
    "csDesign.welcome",
    "Welcome to CS Design",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [extensionUri],
    }
  );

  panel.webview.html = getWebviewContent(
    extensionUri,
    panel.webview,
    "welcome-tab.html"
  );

  // Handle messages from the welcome tab
  panel.webview.onDidReceiveMessage((message) => {
    switch (message.command) {
      case "openChat":
        vscode.commands.executeCommand("workbench.action.chat.open");
        break;
      case "initSystem":
        vscode.commands.executeCommand(CMD.switchSystem, message.system);
        break;
    }
  });
}
