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

  // Convert all relative paths to webview URIs
  const webviewBaseUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "webview")
  );

  // Replace href="../tokens.css" with webview URI
  html = html.replace(
    /href="\.\.\/tokens\.css"/g,
    `href="${webviewBaseUri}/tokens.css"`
  );

  // Replace href="shared/codicon.css" with webview URI
  html = html.replace(
    /href="shared\/codicon\.css"/g,
    `href="${webviewBaseUri}/shared/codicon.css"`
  );

  // Fix codicon font path inside CSS — the @font-face src url needs to be absolute
  // We inject a <style> override to point the font to the correct webview URI
  const codiconFontUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "webview", "shared", "codicon.ttf")
  );
  html = html.replace(
    "</head>",
    `<style>@font-face { font-family: "codicon"; font-display: block; src: url("${codiconFontUri}") format("truetype"); }</style>\n</head>`
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
