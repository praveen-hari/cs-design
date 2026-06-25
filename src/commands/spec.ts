/**
 * `cs-design spec` — CLI wrapper over SDK getSpec().
 *
 * Outputs the full DESIGN.md format specification so agents can
 * create or edit DESIGN.md files correctly.
 */

import chalk from "chalk";
import { getSpec } from "../sdk/spec.js";
import type { LintRuleInfo } from "../sdk/types.js";

export interface SpecOptions {
  rules: boolean;
  rulesOnly: boolean;
  format: string;
}

export async function specCommand(options: SpecOptions): Promise<void> {
  const spec = getSpec();

  if (options.format === "json") {
    const output: Record<string, unknown> = {};
    if (options.rulesOnly) {
      output.rules = spec.rules;
    } else {
      output.spec = spec.fullSpec;
      output.format = spec.format;
      output.specUrl = spec.specUrl;
      if (options.rules) output.rules = spec.rules;
    }
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  // Markdown output
  if (options.rulesOnly) {
    printRulesTable(spec.rules);
    return;
  }

  // Output the full specification text
  console.log(spec.fullSpec);

  if (options.rules) printRulesTable(spec.rules);
}

function printRulesTable(rules: LintRuleInfo[]): void {
  console.log(chalk.bold("Active Linting Rules:"));
  console.log();
  const nameWidth = Math.max(...rules.map((r) => r.name.length), 4) + 2;
  const sevWidth = 10;
  console.log(`  ${chalk.bold("Rule".padEnd(nameWidth))} ${chalk.bold("Severity".padEnd(sevWidth))} ${chalk.bold("Description")}`);
  console.log(`  ${"─".repeat(nameWidth)} ${"─".repeat(sevWidth)} ${"─".repeat(40)}`);
  for (const rule of rules) {
    const sevColor = rule.severity === "error" ? chalk.red : rule.severity === "warning" ? chalk.yellow : chalk.blue;
    console.log(`  ${chalk.cyan(rule.name.padEnd(nameWidth))} ${sevColor(rule.severity.padEnd(sevWidth))} ${rule.description}`);
  }
  console.log();
}
