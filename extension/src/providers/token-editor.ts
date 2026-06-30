import * as vscode from "vscode";
import { getWebviewContent, getNonce } from "../utils/webview-utils.js";

/**
 * Opens the Token Editor as a webview panel in the editor area.
 * Shows the full design system: colors, typography, spacing, rounded, components.
 */
export function openTokenEditor(
  extensionUri: vscode.Uri,
  scrollToSection?: string
): void {
  // Check if panel already exists — reuse it
  if (tokenEditorPanel) {
    tokenEditorPanel.reveal(vscode.ViewColumn.One);
    if (scrollToSection) {
      tokenEditorPanel.webview.postMessage({
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

  // Get the base HTML and inject scroll-to script
  let html = getWebviewContent(
    extensionUri,
    panel.webview,
    "token-editor.html"
  );

  // Inject message handler script for scrollTo
  const scrollScript = `
<script>
  window.addEventListener('message', event => {
    const message = event.data;
    if (message.command === 'scrollTo' && message.section) {
      const el = document.getElementById(message.section);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
</script>`;

  html = html.replace("</body>", `${scrollScript}\n</body>`);

  panel.webview.html = html;

  // Scroll to section if specified
  if (scrollToSection) {
    setTimeout(() => {
      panel.webview.postMessage({
        command: "scrollTo",
        section: scrollToSection,
      });
    }, 500);
  }

  panel.onDidDispose(() => {
    tokenEditorPanel = undefined;
  });
}

/** Track the single token editor panel instance */
let tokenEditorPanel: vscode.WebviewPanel | undefined;
