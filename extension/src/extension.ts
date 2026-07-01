import * as vscode from "vscode";
import { SidebarViewProvider } from "./providers/sidebar-view.js";

import { openTokenEditor } from "./providers/token-editor.js";
import { registerTools } from "./tools/index.js";
import { createDesignWatcher } from "./services/file-watcher.js";
import { previewScreen, openDesignMd } from "./services/preview.js";
import { getDesignProject } from "./services/design-project.js";
import { runCreateDesignWizard } from "./services/create-design-wizard.js";
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

  // Create Design System — guided wizard
  context.subscriptions.push(
    vscode.commands.registerCommand(CMD.createDesignSystem, async () => {
      await runCreateDesignWizard(sidebarProvider);
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
        const result = await vscode.lm.invokeTool("cs-design_validate", { toolInvocationToken: undefined, input: {} });
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
        const result = await vscode.lm.invokeTool("cs-design_exportTokens", { toolInvocationToken: undefined, input: { format: format.detail } });
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

  // New Screen — ask user what screen to create, then auto-send to agent
  context.subscriptions.push(
    vscode.commands.registerCommand(CMD.newScreen, async () => {
      const screenType = await vscode.window.showQuickPick(
        [
          { label: "$(layout) Dashboard", description: "Charts, stats, KPIs, data overview", detail: "dashboard" },
          { label: "$(table) Data Table", description: "Sortable table with filters, pagination", detail: "data-table" },
          { label: "$(edit) Form", description: "Input form with validation, labels, submit", detail: "form" },
          { label: "$(gear) Settings", description: "Settings page with sections, toggles, inputs", detail: "settings" },
          { label: "$(account) Login / Auth", description: "Login, signup, or forgot password screen", detail: "auth" },
          { label: "$(home) Landing Page", description: "Hero section, features, CTA, testimonials", detail: "landing" },
          { label: "$(list-flat) List / Feed", description: "Card list, feed, or timeline view", detail: "list" },
          { label: "$(preview) Detail Page", description: "Single item detail with sidebar or tabs", detail: "detail" },
          { label: "$(error) Error / Empty", description: "404, error state, or empty state screen", detail: "error" },
          { label: "$(pencil) Custom", description: "Describe your own screen", detail: "custom" },
        ],
        {
          placeHolder: "What kind of screen do you want to create?",
          title: "New Screen",
        }
      );

      if (!screenType) return;

      let screenDesc = screenType.label.replace(/\$\([^)]+\)\s*/, "");

      if (screenType.detail === "custom") {
        const custom = await vscode.window.showInputBox({
          prompt: "Describe the screen you want to create",
          placeHolder: "e.g., User profile page with avatar, bio, and activity feed",
        });
        if (!custom) return;
        screenDesc = custom;
      }

      vscode.commands.executeCommand("workbench.action.chat.open", {
        query: `I want to create a new UI screen: **${screenDesc}**

Follow the **design-screens** skill workflow. Before you start designing:

1. **Ask me 3–4 quick questions** to understand what I need:
   - What data or content should this screen show?
   - What actions should the user be able to take?
   - Any specific layout preference (sidebar, tabs, cards, split view)?
   - Should it match an existing screen or be standalone?

2. **Don't start designing until I've answered.**

After I answer, follow the skill procedure:
- Read \`.designs/DESIGN.md\` for design tokens
- Run \`cs-design_validate\` to check the design system
- Export tokens with \`cs-design_exportTokens\` (format: css)
- Generate the HTML screen following the skill's Path A rules
- Save to \`.designs/screens/${screenType.detail === "custom" ? "custom-screen" : screenType.detail}.html\`
- Link to \`../tokens.css\` — never hardcode colors, fonts, or spacing
- Use semantic HTML, realistic content, responsive (375px–1440px)`,
        isPartialQuery: false,
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
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Creating "${name}" with ${system}…`,
          cancellable: false,
        },
        async () => {
          try {
            const result = await vscode.lm.invokeTool("cs-design_init", { toolInvocationToken: undefined, input: { name, system } });
            const text = (result as any).content?.[0]?.value ?? "Done";
            vscode.window.showInformationMessage(text.split("\n")[0]);
            sidebarProvider.refresh();
          } catch {
            vscode.window.showErrorMessage("Failed to switch design system");
          }
        }
      );
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
