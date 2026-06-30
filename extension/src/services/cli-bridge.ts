import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";

const execAsync = promisify(exec);

/**
 * Bridge to the cs-design CLI.
 * Uses the bundled CLI from node_modules — no global installation needed.
 */
export class CliBridge {
  private cliBin: string;

  constructor(private workspacePath: string, extensionPath: string) {
    // Use the bundled CLI from node_modules
    this.cliBin = path.join(
      extensionPath,
      "node_modules",
      "@syncfusion",
      "cs-design",
      "dist",
      "cli.js"
    );
  }

  private async run(args: string): Promise<{ success: boolean; output: string }> {
    try {
      const { stdout } = await execAsync(`node "${this.cliBin}" ${args}`, {
        cwd: this.workspacePath,
      });
      return { success: true, output: stdout };
    } catch (error: any) {
      return { success: false, output: error.stdout || error.message };
    }
  }

  async validate(): Promise<{ success: boolean; output: string }> {
    return this.run("validate");
  }

  async exportTokens(
    format: "css" | "tailwind" | "json" | "css-tailwind" | "dtcg"
  ): Promise<{ success: boolean; output: string }> {
    return this.run(`export tokens --format ${format}`);
  }

  async init(
    name: string,
    system?: string
  ): Promise<{ success: boolean; output: string }> {
    const systemFlag = system ? ` --system ${system}` : "";
    return this.run(`init "${name}"${systemFlag}`);
  }

  async apply(): Promise<{ success: boolean; output: string }> {
    return this.run("apply");
  }
}
