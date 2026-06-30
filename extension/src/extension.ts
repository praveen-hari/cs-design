import * as vscode from "vscode";
import { SidebarViewProvider } from "./providers/sidebar-view.js";

import { openTokenEditor } from "./providers/token-editor.js";
import { registerTools } from "./tools/index.js";
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

  // ── Register Language Model Tools ──
  registerTools(context);

  // ── Status Bar ──
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.command = CMD.validate;
  updateStatusBar(statusBarItem, workspaceFolder);
  context.subscriptions.push(statusBarItem);

  // ── Commands ──

  // Welcome (opens sidebar focus)
  context.subscriptions.push(
    vscode.commands.registerCommand(CMD.openWelcome, () => {
      vscode.commands.executeCommand("csDesign.explorer.focus");
    })
  );

  // Token Editor
  context.subscriptions.push(
    vscode.commands.registerCommand(CMD.openTokenEditor, (section?: string) => {
      openTokenEditor(extensionUri, section);
    })
  );

  // Open DESIGN.md in editor
  context.subscriptions.push(
    vscode.commands.registerCommand(CMD.openDesignMd, () => {
      if (workspaceFolder) {
        openDesignMd(workspaceFolder);
      }
    })
  );

  // Validate — invokes the registered tool directly
  context.subscriptions.push(
    vscode.commands.registerCommand(CMD.validate, async () => {
      try {
        const result = await vscode.lm.invokeTool("cs-design_validate", { input: {} });
        const text = (result as any).content?.[0]?.value ?? "Validation complete";
        if (text.includes("✅")) {
          vscode.window.showInformationMessage(text.split("\n")[0]);
          statusBarItem.text = "$(pass-filled) CS Design";
          statusBarItem.backgroundColor = undefined;
        } else {
          vscode.window.showWarningMessage(text.split("\n")[0]);
          statusBarItem.text = "$(warning) CS Design";
          statusBarItem.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
        }
      } catch {
        vscode.window.showErrorMessage("Validation failed");
      }
    })
  );

  // Export Tokens — invokes the registered tool
  context.subscriptions.push(
    vscode.commands.registerCommand(CMD.exportTokens, async () => {
      const format = await vscode.window.showQuickPick(
        [
          { label: "CSS", description: "CSS custom properties", detail: "css" },
          { label: "Tailwind v3", description: "theme.extend config", detail: "tailwind" },
          { label: "Tailwind v4", description: "CSS @theme block", detail: "css-tailwind" },
          { label: "JSON", description: "Flat key-value pairs", detail: "json" },
          { label: "DTCG", description: "W3C Design Tokens format", detail: "dtcg" },
        ],
        { placeHolder: "Choose export format" }
      );
      if (!format) return;
      try {
        const result = await vscode.lm.invokeTool("cs-design_exportTokens", { input: { format: format.detail } });
        const text = (result as any).content?.[0]?.value ?? "Export complete";
        vscode.window.showInformationMessage(text);
      } catch {
        vscode.window.showErrorMessage("Export failed");
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
      vscode.commands.executeCommand("workbench.action.chat.open", {
        query: "Generate a new UI screen using the DESIGN.md design tokens. Save it to .designs/screens/. What kind of screen? (e.g., dashboard, landing page, settings, form, data table)",
        isPartialQuery: true,
      });
    })
  );

  // Switch Design System — invokes the registered tool
  context.subscriptions.push(
    vscode.commands.registerCommand(CMD.switchSystem, async (system?: string) => {
      if (!system) {
        system = await vscode.window.showQuickPick(
          ["modern-minimal", "corporate-clean", "bold-creative"],
          { placeHolder: "Choose a design system" }
        ) as string | undefined;
      }
      if (!system) return;
      const name = workspaceFolder?.name || "My Project";
      try {
        const result = await vscode.lm.invokeTool("cs-design_init", { input: { name, system } });
        const text = (result as any).content?.[0]?.value ?? "Done";
        vscode.window.showInformationMessage(text.split("\n")[0]);
        sidebarProvider.refresh();
      } catch {
        vscode.window.showErrorMessage("Failed to switch design system");
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
