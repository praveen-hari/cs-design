/**
 * `cs-design diff` — CLI wrapper over SDK diff().
 */

import fs from "fs-extra";
import path from "node:path";
import chalk from "chalk";
import { diff } from "../sdk/differ.js";
import type { TokenDiff } from "../sdk/types.js";
import { logError } from "../utils.js";

export interface DiffOptions {
  json: boolean;
}

function hasChanges(d: TokenDiff): boolean {
  return d.added.length > 0 || d.removed.length > 0 || d.modified.length > 0;
}

function printTokenDiff(label: string, d: TokenDiff): void {
  if (!hasChanges(d)) return;
  console.log(`  ${chalk.bold(label)}:`);
  for (const key of d.added) console.log(`    ${chalk.green("+ " + key)}`);
  for (const key of d.removed) console.log(`    ${chalk.red("- " + key)}`);
  for (const key of d.modified) console.log(`    ${chalk.yellow("~ " + key)}`);
}

export async function diffCommand(
  beforePath: string,
  afterPath: string,
  options: DiffOptions,
): Promise<void> {
  const resolvedBefore = path.resolve(beforePath);
  const resolvedAfter = path.resolve(afterPath);

  if (!(await fs.pathExists(resolvedBefore))) {
    logError(`File not found: ${resolvedBefore}`);
    process.exit(1);
  }
  if (!(await fs.pathExists(resolvedAfter))) {
    logError(`File not found: ${resolvedAfter}`);
    process.exit(1);
  }

  const beforeContent = await fs.readFile(resolvedBefore, "utf-8");
  const afterContent = await fs.readFile(resolvedAfter, "utf-8");

  const result = diff(beforeContent, afterContent);

  if (!result.ok) {
    logError(result.error);
    process.exit(1);
  }

  const data = result.data;

  // JSON output
  if (options.json) {
    console.log(JSON.stringify(data, null, 2));
    process.exit(data.regression ? 1 : 0);
  }

  // Pretty output
  console.log();
  console.log(
    chalk.bold("Comparing: ") +
    chalk.cyan(path.relative(process.cwd(), resolvedBefore)) +
    chalk.dim(" → ") +
    chalk.cyan(path.relative(process.cwd(), resolvedAfter)),
  );
  console.log();

  const sections = ["colors", "typography", "rounded", "spacing", "components"] as const;
  let anyChanges = false;
  for (const section of sections) {
    const d = data.tokens[section];
    if (hasChanges(d)) {
      anyChanges = true;
      printTokenDiff(section.charAt(0).toUpperCase() + section.slice(1), d);
    }
  }

  if (!anyChanges) {
    console.log(chalk.green("  No token changes detected."));
  }

  console.log();
  console.log(chalk.bold("Findings:"));
  const de = data.findings.delta.errors;
  const dw = data.findings.delta.warnings;
  const errStr = de === 0 ? chalk.dim("errors: 0") : de > 0 ? chalk.red(`errors: +${de}`) : chalk.green(`errors: ${de}`);
  const warnStr = dw === 0 ? chalk.dim("warnings: 0") : dw > 0 ? chalk.red(`warnings: +${dw}`) : chalk.green(`warnings: ${dw}`);
  console.log(`  ${errStr}, ${warnStr}`);

  console.log();
  if (data.regression) {
    console.log(chalk.red.bold("⚠ REGRESSION DETECTED — new errors or warnings introduced."));
  } else {
    console.log(chalk.green.bold("✅ No regressions."));
  }
  console.log();

  process.exit(data.regression ? 1 : 0);
}
