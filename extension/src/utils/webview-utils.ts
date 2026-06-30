import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

/**
 * Load an HTML file from the webview/ folder and prepare it for use in a webview.
 * Replaces resource URIs so CSS/images load correctly.
 */
export function getWebviewContent(
  extensionUri: vscode.Uri,
  webview: vscode.Webview,
  htmlFileName: string
): string {
  const htmlPath = path.join(
    extensionUri.fsPath,
    "webview",
    htmlFileName
  );

  let html = fs.readFileSync(htmlPath, "utf-8");

  // Replace relative paths with webview URIs
  const webviewUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "webview")
  );

  // Replace href="../tokens.css" with webview URI
  html = html.replace(
    /href="\.\.\/tokens\.css"/g,
    `href="${webviewUri}/tokens.css"`
  );

  // Replace codicon CDN with local bundled version if available
  const codiconUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "webview", "shared", "codicon.css")
  );
  html = html.replace(
    /href="https:\/\/microsoft\.github\.io\/vscode-codicons\/dist\/codicon\.css"/g,
    `href="${codiconUri}"`
  );

  return html;
}

/**
 * Get the nonce for Content Security Policy in webviews.
 */
export function getNonce(): string {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
