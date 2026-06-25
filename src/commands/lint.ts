/**
 * `cs-design lint` — CLI wrapper over SDK lint().
 */

import fs from "fs-extra";
import path from "node:path";
import chalk from "chalk";
import { lint } from "../sdk/linter.js";
import type { Severity } from "../sdk/types.js";
import { DESIGN_MD } from "../constants.js";
import { requireProject, logSuccess, logError } from "../utils.js";

export interface LintOptions {
  json: boolean;
  file?: string;
}

function severityIcon(severity: Severity): string {
  switch (severity) {
    case "error": return chalk.red("✖");
    case "warning": return chalk.yellow("⚠");
    case "info": return chalk.blue("ℹ");
    default: return chalk.dim("·");
  }
}

function severityColor(severity: Severity): (text: string) => string {
  switch (severity) {
    case "error": return chalk.red;
    case "warning": return chalk.yellow;
    case "info": return chalk.blue;
    default: return chalk.dim;
  }
}

export async function lintCommand(options: LintOptions): Promise<void> {
  let filePath: string;

  if (options.file) {
    filePath = path.resolve(options.file);
  } else {
    const designsDir = await requireProject();
    filePath = path.join(designsDir, DESIGN_MD);
  }

  if (!(await fs.pathExists(filePath))) {
    logError(`File not found: ${filePath}`);
    process.exit(1);
  }

  const content = await fs.readFile(filePath, "utf-8");
  const result = lint(content);

  if (!result.ok) {
    logError(result.error);
    process.exit(1);
  }

  const report = result.data;

  // JSON output mode
  if (options.json) {
    console.log(JSON.stringify({
      findings: report.findings,
      summary: report.summary,
      sections: report.sections,
    }, null, 2));
    process.exit(report.summary.errors > 0 ? 1 : 0);
  }

  // Pretty output
  console.log();
  console.log(chalk.bold(`Linting: ${chalk.cyan(path.relative(process.cwd(), filePath))}`));
  console.log();

  if (report.findings.length === 0) {
    logSuccess("No issues found — DESIGN.md is clean!");
  } else {
    const errors = report.findings.filter((f) => f.severity === "error");
    const warnings = report.findings.filter((f) => f.severity === "warning");
    const infos = report.findings.filter((f) => f.severity === "info");

    for (const finding of report.findings) {
      const icon = severityIcon(finding.severity);
      const color = severityColor(finding.severity);
      const pathStr = finding.path ? chalk.dim(` (${finding.path})`) : "";
      console.log(`  ${icon} ${color(finding.message)}${pathStr}`);
    }

    console.log();
    const parts: string[] = [];
    if (errors.length > 0) parts.push(chalk.red(`${errors.length} error${errors.length > 1 ? "s" : ""}`));
    if (warnings.length > 0) parts.push(chalk.yellow(`${warnings.length} warning${warnings.length > 1 ? "s" : ""}`));
    if (infos.length > 0) parts.push(chalk.blue(`${infos.length} info`));
    console.log(`  ${parts.join(", ")}`);
  }

  // Design system summary
  const ds = report.designSystem;
  console.log();
  console.log(chalk.bold("Design System:"));
  if (ds.name) console.log(`  Name: ${chalk.cyan(ds.name)}`);
  console.log(`  Colors: ${ds.colors} tokens`);
  console.log(`  Typography: ${ds.typography} tokens`);
  console.log(`  Rounded: ${ds.rounded} tokens`);
  console.log(`  Spacing: ${ds.spacing} tokens`);
  console.log(`  Components: ${ds.components} defined`);
  console.log(`  Sections: ${report.sections.length} (${report.sections.join(", ") || "none"})`);
  console.log();

  process.exit(report.summary.errors > 0 ? 1 : 0);
}
