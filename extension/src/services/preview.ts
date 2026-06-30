import * as vscode from "vscode";
import * as path from "path";
import { PATHS } from "../utils/constants.js";

/**
 * Opens an HTML screen in the integrated browser for preview.
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

  const fileUri = vscode.Uri.file(screenPath);

  // Open in the integrated browser using the simple external open
  // Code Studio's integrated browser handles file:// URIs
  await vscode.env.openExternal(fileUri);
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

  const doc = await vscode.workspace.openTextDocument(designMdPath);
  await vscode.window.showTextDocument(doc);
}
