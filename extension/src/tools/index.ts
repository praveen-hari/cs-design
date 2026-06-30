import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { PATHS } from "../utils/constants.js";

/**
 * Lazy-load the ESM SDK via dynamic import.
 * Cached after first load.
 */
let sdkCache: any = null;
async function getSDK() {
  if (!sdkCache) {
    sdkCache = await import("@syncfusion/cs-design/sdk");
  }
  return sdkCache;
}

function getWorkspacePath(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

function readDesignMd(): string | undefined {
  const ws = getWorkspacePath();
  if (!ws) return undefined;
  const p = path.join(ws, PATHS.designMd);
  if (!fs.existsSync(p)) return undefined;
  return fs.readFileSync(p, "utf-8");
}

/**
 * Register all cs-design Language Model Tools.
 */
export function registerTools(context: vscode.ExtensionContext): void {

  // ── cs-design_init ──
  context.subscriptions.push(
    vscode.lm.registerTool("cs-design_init", {
      async invoke(options: vscode.LanguageModelToolInvocationOptions<{ name: string; system?: string }>, _token) {
        const { name, system } = options.input;
        const ws = getWorkspacePath();
        if (!ws) {
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart("No workspace folder open.")
          ]);
        }

        try {
          const sdk = await getSDK();
          const systemId = system || "modern-minimal";
          const content = sdk.getBuiltinSystemContent(systemId);
          if (!content.ok) {
            return new vscode.LanguageModelToolResult([
              new vscode.LanguageModelTextPart(`Unknown system: ${systemId}. Available: modern-minimal, corporate-clean, bold-creative`)
            ]);
          }

          // Create .designs/ folder structure
          const designsDir = path.join(ws, PATHS.designsDir);
          const screensDir = path.join(ws, PATHS.screensDir);
          fs.mkdirSync(designsDir, { recursive: true });
          fs.mkdirSync(screensDir, { recursive: true });

          // Write DESIGN.md
          fs.writeFileSync(path.join(ws, PATHS.designMd), content.data, "utf-8");

          // Write project.json
          const projectJson = {
            name,
            system: systemId,
            createdAt: new Date().toISOString(),
            screens: [],
          };
          fs.writeFileSync(path.join(ws, PATHS.projectJson), JSON.stringify(projectJson, null, 2), "utf-8");

          // Export tokens.css
          const exportResult = sdk.exportTokens(content.data, "css");
          if (exportResult.ok) {
            fs.writeFileSync(path.join(ws, PATHS.tokensCss), exportResult.data.output, "utf-8");
          }

          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(`Design project "${name}" created with ${systemId} system.\nFiles: .designs/DESIGN.md, .designs/tokens.css, .designs/project.json`)
          ]);
        } catch (error: any) {
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(`Error: ${error.message}`)
          ]);
        }
      }
    })
  );

  // ── cs-design_validate ──
  context.subscriptions.push(
    vscode.lm.registerTool("cs-design_validate", {
      async invoke(_options, _token) {
        const content = readDesignMd();
        if (!content) {
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart("No .designs/DESIGN.md found in workspace.")
          ]);
        }

        try {
          const sdk = await getSDK();
          const result = sdk.validate(content);
          if (result.ok) {
            const report = result.data;
            const findings = report.findings || [];
            const errors = findings.filter((f: any) => f.severity === "error");
            const warnings = findings.filter((f: any) => f.severity === "warning");

            if (errors.length === 0) {
              return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`✅ Design system is valid. ${warnings.length} warning(s).\n${warnings.map((w: any) => `⚠️ ${w.message}`).join("\n")}`)
              ]);
            } else {
              return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`❌ Validation failed. ${errors.length} error(s), ${warnings.length} warning(s).\n${errors.map((e: any) => `❌ ${e.message}`).join("\n")}\n${warnings.map((w: any) => `⚠️ ${w.message}`).join("\n")}`)
              ]);
            }
          } else {
            return new vscode.LanguageModelToolResult([
              new vscode.LanguageModelTextPart(`Validation error: ${result.error}`)
            ]);
          }
        } catch (error: any) {
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(`Error: ${error.message}`)
          ]);
        }
      }
    })
  );

  // ── cs-design_exportTokens ──
  context.subscriptions.push(
    vscode.lm.registerTool("cs-design_exportTokens", {
      async invoke(options: vscode.LanguageModelToolInvocationOptions<{ format: string }>, _token) {
        const content = readDesignMd();
        if (!content) {
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart("No .designs/DESIGN.md found in workspace.")
          ]);
        }

        const ws = getWorkspacePath()!;
        const format = options.input.format || "css";

        try {
          const sdk = await getSDK();
          const result = sdk.exportTokens(content, format);
          if (result.ok) {
            const outputPath = format === "css" ? PATHS.tokensCss : `.designs/tokens.${format}`;
            fs.writeFileSync(path.join(ws, outputPath), result.data.output, "utf-8");
            return new vscode.LanguageModelToolResult([
              new vscode.LanguageModelTextPart(`✅ Tokens exported as ${format} to ${outputPath}`)
            ]);
          } else {
            return new vscode.LanguageModelToolResult([
              new vscode.LanguageModelTextPart(`Export error: ${result.error}`)
            ]);
          }
        } catch (error: any) {
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(`Error: ${error.message}`)
          ]);
        }
      }
    })
  );

  // ── cs-design_lint ──
  context.subscriptions.push(
    vscode.lm.registerTool("cs-design_lint", {
      async invoke(_options, _token) {
        const content = readDesignMd();
        if (!content) {
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart("No .designs/DESIGN.md found in workspace.")
          ]);
        }

        try {
          const sdk = await getSDK();
          const result = sdk.lint(content);
          if (result.ok) {
            const findings = result.data.findings || [];
            if (findings.length === 0) {
              return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart("✅ No lint issues found.")
              ]);
            }
            const output = findings.map((f: any) =>
              `${f.severity === "error" ? "❌" : "⚠️"} [${f.rule}] ${f.message}`
            ).join("\n");
            return new vscode.LanguageModelToolResult([
              new vscode.LanguageModelTextPart(`Lint results:\n${output}`)
            ]);
          } else {
            return new vscode.LanguageModelToolResult([
              new vscode.LanguageModelTextPart(`Lint error: ${result.error}`)
            ]);
          }
        } catch (error: any) {
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(`Error: ${error.message}`)
          ]);
        }
      }
    })
  );

  // ── cs-design_listSystems ──
  context.subscriptions.push(
    vscode.lm.registerTool("cs-design_listSystems", {
      async invoke(_options, _token) {
        try {
          const sdk = await getSDK();
          const systems = sdk.listBuiltinSystems();
          const list = systems.map((s: any) => `• ${s.id}: ${s.name} — ${s.description}`).join("\n");
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(`Available design systems:\n${list}`)
          ]);
        } catch (error: any) {
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(`Error: ${error.message}`)
          ]);
        }
      }
    })
  );

  // ── cs-design_getSpec ──
  context.subscriptions.push(
    vscode.lm.registerTool("cs-design_getSpec", {
      async invoke(_options, _token) {
        try {
          const sdk = await getSDK();
          const spec = sdk.getSpec();
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(spec)
          ]);
        } catch (error: any) {
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(`Error: ${error.message}`)
          ]);
        }
      }
    })
  );
}
