import * as vscode from "vscode";
import { SidebarViewProvider } from "./providers/sidebar-view.js";
import { openWelcomeTab } from "./providers/welcome-view.js";
import { openTokenEditor } from "./providers/token-editor.js";
import { CliBridge } from "./services/cli-bridge.js";
import { createDesignWatcher } from "./services/file-watcher.js";
import { previewScreen, openDesignMd } from "./services/preview.js";
import { getDesignProject } from "./services/design-project.js";
import { CMD, CTX, VIEW_ID } from "./utils/constants.js";

export function activate(context: vscode.ExtensionContext) {
  const extensionUri = context.extensionUri;
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  // ── Sidebar View ──
  const sidebarProvider = new SidebarViewProvider(extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(VIEW_ID, sidebarProvider)
  );

  // ── Set initial context ──
  if (workspaceFolder) {
    const project = getDesignProject(workspaceFolder);
    vscode.commands.executeCommand("setContext", CTX.projectExists, project.exists);
  }

  // ── File Watcher ──
  if (workspaceFolder) {
    const watcher = createDesignWatcher(workspaceFolder, () => {
      sidebarProvider.refresh();

      // Update context
      const project = getDesignProject(workspaceFolder);
      vscode.commands.executeCommand("setContext", CTX.projectExists, project.exists);
    });
    context.subscriptions.push(watcher);
  }

  // ── CLI Bridge ──
  const cli = workspaceFolder
    ? new CliBridge(workspaceFolder.uri.fsPath)
    : undefined;

  // ── Status Bar ──
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.command = CMD.validate;
  updateStatusBar(statusBarItem, workspaceFolder);
  context.subscriptions.push(statusBarItem);

  // ── Commands ──

  // Welcome Tab
  context.subscriptions.push(
    vscode.commands.registerCommand(CMD.openWelcome, () => {
      openWelcomeTab(extensionUri);
    })
  );

  // Token Editor
  context.subscriptions.push(
    vscode.commands.registerCommand(CMD.openTokenEditor, (section?: string) => {
      openTokenEditor(extensionUri, section);
    })
  );

  // Validate
  context.subscriptions.push(
    vscode.commands.registerCommand(CMD.validate, async () => {
      if (!cli) return;
      const result = await cli.validate();
      if (result.success) {
        vscode.window.showInformationMessage("✅ Design system is valid");
        statusBarItem.text = "$(pass-filled) CS Design";
        statusBarItem.backgroundColor = undefined;
      } else {
        vscode.window.showWarningMessage("⚠️ Validation issues found");
        statusBarItem.text = "$(warning) CS Design";
        statusBarItem.backgroundColor = new vscode.ThemeColor(
          "statusBarItem.warningBackground"
        );
      }
    })
  );

  // Export Tokens
  context.subscriptions.push(
    vscode.commands.registerCommand(CMD.exportTokens, async () => {
      if (!cli) return;
      const format = await vscode.window.showQuickPick(
        [
          { label: "CSS", description: "CSS custom properties", value: "css" },
          { label: "Tailwind v3", description: "theme.extend config", value: "tailwind" },
          { label: "Tailwind v4", description: "CSS @theme block", value: "css-tailwind" },
          { label: "JSON", description: "Flat key-value pairs", value: "json" },
          { label: "DTCG", description: "W3C Design Tokens format", value: "dtcg" },
        ],
        { placeHolder: "Choose export format" }
      );
      if (!format) return;
      const result = await cli.exportTokens(format.value as any);
      if (result.success) {
        vscode.window.showInformationMessage(`✅ Tokens exported as ${format.label}`);
      } else {
        vscode.window.showErrorMessage(`❌ Export failed: ${result.output}`);
      }
    })
  );

  // Preview Screen
  context.subscriptions.push(
    vscode.commands.registerCommand(CMD.previewScreen, async (screenName?: string) => {
      if (!workspaceFolder) return;
      if (!screenName) {
        const project = getDesignProject(workspaceFolder);
        if (!project.screens?.length) {
          vscode.window.showInformationMessage("No screens to preview");
          return;
        }
        const pick = await vscode.window.showQuickPick(project.screens, {
          placeHolder: "Choose a screen to preview",
        });
        if (!pick) return;
        screenName = pick;
      }
      await previewScreen(workspaceFolder, screenName);
    })
  );

  // New Screen (opens chat)
  context.subscriptions.push(
    vscode.commands.registerCommand(CMD.newScreen, () => {
      vscode.commands.executeCommand("workbench.action.chat.open");
    })
  );

  // Switch Design System
  context.subscriptions.push(
    vscode.commands.registerCommand(CMD.switchSystem, async (system?: string) => {
      if (!cli) return;
      if (!system) {
        system = await vscode.window.showQuickPick(
          ["modern-minimal", "corporate-clean", "bold-creative"],
          { placeHolder: "Choose a design system" }
        ) as string | undefined;
      }
      if (!system) return;
      const name = workspaceFolder?.name || "My Project";
      const result = await cli.init(name, system);
      if (result.success) {
        await cli.exportTokens("css");
        vscode.window.showInformationMessage(`✅ Switched to ${system}`);
        sidebarProvider.refresh();
      }
    })
  );

  // Refresh
  context.subscriptions.push(
    vscode.commands.registerCommand(CMD.refresh, () => {
      sidebarProvider.refresh();
      updateStatusBar(statusBarItem, workspaceFolder);
    })
  );

  // ── Auto-open Welcome Tab if no project ──
  if (workspaceFolder) {
    const project = getDesignProject(workspaceFolder);
    if (!project.exists) {
      // Small delay to let the UI settle
      setTimeout(() => openWelcomeTab(extensionUri), 500);
    }
  }
}

export function deactivate() {}

/**
 * Update the status bar based on project state.
 */
function updateStatusBar(
  item: vscode.StatusBarItem,
  workspaceFolder?: vscode.WorkspaceFolder
): void {
  if (!workspaceFolder) {
    item.hide();
    return;
  }

  const project = getDesignProject(workspaceFolder);
  if (!project.exists) {
    item.hide();
    return;
  }

  item.text = `$(pass-filled) CS Design: ${project.name || "Untitled"}`;
  item.tooltip = `Design System: ${project.name}\nClick to validate`;
  item.show();
}
