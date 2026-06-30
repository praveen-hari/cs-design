import * as vscode from "vscode";
import { PATHS } from "../utils/constants.js";

/**
 * Creates a file system watcher on the .designs/ folder.
 * Fires callbacks when design files change so the UI can react.
 */
export function createDesignWatcher(
  workspaceFolder: vscode.WorkspaceFolder,
  onChange: () => void
): vscode.Disposable {
  const pattern = new vscode.RelativePattern(
    workspaceFolder,
    `${PATHS.designsDir}/**`
  );

  const watcher = vscode.workspace.createFileSystemWatcher(pattern);

  watcher.onDidCreate(onChange);
  watcher.onDidChange(onChange);
  watcher.onDidDelete(onChange);

  return watcher;
}
