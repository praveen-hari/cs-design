import * as vscode from "vscode";
import { getWebviewContent } from "../utils/webview-utils.js";

/**
 * Opens the Token Editor as a webview panel in the editor area.
 * Shows the full design system: colors, typography, spacing, rounded, components.
 */
export function openTokenEditor(
  extensionUri: vscode.Uri,
  scrollToSection?: string
): void {
  // Check if panel already exists — reuse it
  const existingPanel = tokenEditorPanel;
  if (existingPanel) {
    existingPanel.reveal(vscode.ViewColumn.One);
    if (scrollToSection) {
      existingPanel.webview.postMessage({
        command: "scrollTo",
        section: scrollToSection,
      });
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

  panel.webview.html = getWebviewContent(
    extensionUri,
    panel.webview,
    "token-editor.html"
  );

  // Scroll to section if specified
  if (scrollToSection) {
    // Small delay to let the webview load
    setTimeout(() => {
      panel.webview.postMessage({
        command: "scrollTo",
        section: scrollToSection,
      });
    }, 300);
  }

  panel.onDidDispose(() => {
    tokenEditorPanel = undefined;
  });
}

/** Track the single token editor panel instance */
let tokenEditorPanel: vscode.WebviewPanel | undefined;
