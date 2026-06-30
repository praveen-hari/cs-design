import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Bridge to the cs-design CLI.
 * Runs CLI commands in the workspace folder and returns results.
 */
export class CliBridge {
  constructor(private workspacePath: string) {}

  /**
   * Check if cs-design CLI is available.
   */
  async isInstalled(): Promise<boolean> {
    try {
      await execAsync("cs-design --version", { cwd: this.workspacePath });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Run cs-design validate.
   */
  async validate(): Promise<{ success: boolean; output: string }> {
    try {
      const { stdout } = await execAsync("cs-design validate", {
        cwd: this.workspacePath,
      });
      return { success: true, output: stdout };
    } catch (error: any) {
      return { success: false, output: error.stdout || error.message };
    }
  }

  /**
   * Run cs-design export tokens.
   */
  async exportTokens(
    format: "css" | "tailwind" | "json" | "css-tailwind" | "dtcg"
  ): Promise<{ success: boolean; output: string }> {
    try {
      const { stdout } = await execAsync(
        `cs-design export tokens --format ${format}`,
        { cwd: this.workspacePath }
      );
      return { success: true, output: stdout };
    } catch (error: any) {
      return { success: false, output: error.stdout || error.message };
    }
  }

  /**
   * Run cs-design init.
   */
  async init(
    name: string,
    system?: string
  ): Promise<{ success: boolean; output: string }> {
    try {
      const systemFlag = system ? ` --system ${system}` : "";
      const { stdout } = await execAsync(
        `cs-design init "${name}"${systemFlag}`,
        { cwd: this.workspacePath }
      );
      return { success: true, output: stdout };
    } catch (error: any) {
      return { success: false, output: error.stdout || error.message };
    }
  }

  /**
   * Run cs-design apply.
   */
  async apply(): Promise<{ success: boolean; output: string }> {
    try {
      const { stdout } = await execAsync("cs-design apply", {
        cwd: this.workspacePath,
      });
      return { success: true, output: stdout };
    } catch (error: any) {
      return { success: false, output: error.stdout || error.message };
    }
  }
}
