/**
 * `cs-design spec` — CLI wrapper over SDK getSpec().
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

  console.log();
  console.log(chalk.bold("DESIGN.md Format Specification"));
  console.log(chalk.dim("═".repeat(50)));
  console.log();
  console.log("A DESIGN.md file has two layers:");
  console.log();
  console.log("  1. " + chalk.cyan("YAML front matter") + " — Machine-readable design tokens");
  console.log("     Delimited by --- fences at the top of the file.");
  console.log();
  console.log("  2. " + chalk.cyan("Markdown body") + " — Human-readable design rationale");
  console.log("     Organized into ## sections.");
  console.log();
  console.log(chalk.bold("Token Schema:"));
  console.log(chalk.dim("  version, name, description, colors, typography,"));
  console.log(chalk.dim("  rounded, spacing, components"));
  console.log();
  console.log(chalk.bold("Section Order (canonical):"));
  console.log(chalk.dim("  Overview → Colors → Typography → Layout →"));
  console.log(chalk.dim("  Elevation & Depth → Shapes → Components → Do's and Don'ts"));
  console.log();
  console.log(chalk.bold("Token Types:"));
  console.log(`  ${chalk.cyan("Color")}       Any CSS color (hex, rgb(), oklch(), named)`);
  console.log(`  ${chalk.cyan("Dimension")}   number + unit (px, em, rem)`);
  console.log(`  ${chalk.cyan("Reference")}   {path.to.token}`);
  console.log(`  ${chalk.cyan("Typography")}  fontFamily, fontSize, fontWeight, lineHeight, etc.`);
  console.log();

  if (options.rules) printRulesTable(spec.rules);

  console.log(chalk.dim("Full specification:"));
  console.log(chalk.cyan("  " + spec.specUrl));
  console.log(chalk.dim("  Or run: npx @google/design.md spec"));
  console.log();
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
