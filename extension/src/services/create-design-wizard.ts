import * as vscode from "vscode";
import { openWizardPanel } from "../providers/wizard-panel.js";
import type { SidebarViewProvider } from "../providers/sidebar-view.js";

/**
 * Guided wizard for creating a new design system.
 *
 * Opens a full-screen visual webview panel with preview cards,
 * live component preview, and step navigation. The panel handles
 * scaffolding the DESIGN.md and opening chat with a contextual prompt.
 */

// ── Wizard state (kept for backward compatibility with imports) ──

export interface WizardAnswers {
  projectName: string;
  brandStyle: "minimal" | "corporate" | "bold" | "playful" | "custom";
  colorPreference: "light" | "dark" | "auto";
  typographyStyle: "sans" | "serif" | "mono" | "mixed";
  spacingScale: "compact" | "comfortable" | "spacious";
  startingPoint: "blank" | "modern-minimal" | "corporate-clean" | "bold-creative";
}

/**
 * Run the full create-design-system wizard.
 *
 * Opens a full-screen visual webview panel with preview cards,
 * live component preview, and step navigation. The panel handles
 * scaffolding the DESIGN.md and opening chat with a contextual prompt.
 *
 * @param sidebarProvider  The sidebar view provider (to toggle loading state).
 * @returns `true` if the wizard completed successfully, `false` if
 *          the user cancelled at any step.
 */
export async function runCreateDesignWizard(
  sidebarProvider?: SidebarViewProvider
): Promise<boolean> {
  const ws = vscode.workspace.workspaceFolders?.[0];
  if (!ws) {
    vscode.window.showErrorMessage("Open a workspace folder first.");
    return false;
  }

  const extension = vscode.extensions.getExtension("syncfusion.cs-design");
  const extensionUri = extension?.extensionUri ?? vscode.Uri.file("");

  await openWizardPanel(
    extensionUri,
    () => {
      // Refresh sidebar after generation
      vscode.commands.executeCommand("csDesign.refresh");
    },
    sidebarProvider
  );

  return true;
}

