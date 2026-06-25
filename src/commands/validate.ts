/**
 * `cs-design validate` — CLI wrapper over SDK validate() + lint().
 *
 * Runs two passes:
 *   1. Structural validation (SDK validate)
 *   2. Deep lint via SDK lint (Google-powered)
 */

import fs from "fs-extra";
import path from "node:path";
import chalk from "chalk";
import { validate } from "../sdk/validator.js";
import { lint } from "../sdk/linter.js";
import { DESIGN_MD } from "../constants.js";
import { requireProject, logSuccess, logWarning, logError, logInfo } from "../utils.js";

export async function validateCommand(): Promise<void> {
  const designsDir = await requireProject();
  const designPath = path.join(designsDir, DESIGN_MD);
  const content = await fs.readFile(designPath, "utf-8");

  // ── Pass 1: Structural validation ──
  const structResult = validate(content);

  if (!structResult.ok) {
    logError(structResult.error);
    process.exit(1);
  }

  const report = structResult.data;

  console.log();
  for (const f of report.findings) {
    if (f.passed) {
      logSuccess(`${f.check}: ${f.message}`);
    } else if (f.severity === "error") {
      logError(`${f.check}: ${f.message}`);
    } else {
      logWarning(`${f.check}: ${f.message}`);
    }
  }

  console.log();
  if (report.valid) {
    const suffix = report.warningCount > 0
      ? ` (${report.warningCount} warning${report.warningCount > 1 ? "s" : ""})`
      : "";
    console.log(chalk.green.bold(`Structural: VALID${suffix}`));
  } else {
    console.log(chalk.red.bold(
      `Structural: INVALID (${report.errorCount} error${report.errorCount > 1 ? "s" : ""}, ${report.warningCount} warning${report.warningCount > 1 ? "s" : ""})`,
    ));
  }

  // ── Pass 2: Deep lint ──
  console.log();
  console.log(chalk.bold("── Deep Lint (powered by @google/design.md) ──"));
  console.log();

  const lintResult = lint(content);

  if (!lintResult.ok) {
    logWarning(`Deep lint skipped: ${lintResult.error}`);
    console.log();
    console.log(report.valid
      ? chalk.green.bold("Result: VALID (structural only)")
      : chalk.red.bold(`Result: INVALID (${report.errorCount} error${report.errorCount > 1 ? "s" : ""}, ${report.warningCount} warning${report.warningCount > 1 ? "s" : ""})`));
    process.exit(report.valid ? 0 : 1);
  }

  const lintData = lintResult.data;
  let deepErrors = 0;
  let deepWarnings = 0;

  if (lintData.findings.length === 0) {
    logSuccess("No additional issues found by deep linter.");
  } else {
    for (const finding of lintData.findings) {
      const pathStr = finding.path ? chalk.dim(` (${finding.path})`) : "";
      if (finding.severity === "error") {
        deepErrors++;
        logError(`${finding.message}${pathStr}`);
      } else if (finding.severity === "warning") {
        deepWarnings++;
        logWarning(`${finding.message}${pathStr}`);
      } else {
        logInfo(`${finding.message}${pathStr}`);
      }
    }
  }

  console.log();

  const totalErrors = report.errorCount + deepErrors;
  const totalWarnings = report.warningCount + deepWarnings;
  const isValid = totalErrors === 0;

  if (isValid) {
    const suffix = totalWarnings > 0
      ? ` (${totalWarnings} warning${totalWarnings > 1 ? "s" : ""})`
      : "";
    console.log(chalk.green.bold(`Result: VALID${suffix}`));
  } else {
    console.log(chalk.red.bold(
      `Result: INVALID (${totalErrors} error${totalErrors > 1 ? "s" : ""}, ${totalWarnings} warning${totalWarnings > 1 ? "s" : ""})`,
    ));
  }

  process.exit(isValid ? 0 : 1);
}
