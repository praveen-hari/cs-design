import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { PATHS } from "../utils/constants.js";

/**
 * Opens an HTML screen in the integrated browser for preview.
 * Tries Simple Browser first, falls back to external browser.
 */
export async function previewScreen(
  workspaceFolder: vscode.WorkspaceFolder,
  screenFileName: string
): Promise<void> {
  const screenPath = path.join(
    workspaceFolder.uri.fsPath,
    PATHS.screensDir,
    screenFileName
  );

  if (!fs.existsSync(screenPath)) {
    vscode.window.showErrorMessage(`Screen not found: ${screenFileName}`);
    return;
  }

  const fileUri = vscode.Uri.file(screenPath);

  try {
    // Try Code Studio's Simple Browser (integrated)
    await vscode.commands.executeCommand("simpleBrowser.show", fileUri.toString());
  } catch {
    // Fallback: open in external browser
    await vscode.env.openExternal(fileUri);
  }
}

/**
 * Opens the DESIGN.md file in the editor.
 */
export async function openDesignMd(
  workspaceFolder: vscode.WorkspaceFolder
): Promise<void> {
  const designMdPath = path.join(
    workspaceFolder.uri.fsPath,
    PATHS.designMd
  );

  if (!fs.existsSync(designMdPath)) {
    vscode.window.showErrorMessage("DESIGN.md not found");
    return;
  }

  const doc = await vscode.workspace.openTextDocument(designMdPath);
  await vscode.window.showTextDocument(doc);
}
