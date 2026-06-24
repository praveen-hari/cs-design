/**
 * `cs-design apply` command — Re-export tokens.css from the updated DESIGN.md.
 *
 * Screens link to tokens.css via <link rel="stylesheet" href="../tokens.css" />,
 * so re-exporting the file is all that's needed — no HTML patching required.
 */

import fs from "fs-extra";
import path from "node:path";
import ora from "ora";
import { SCREENS_DIR, DESIGN_MD } from "../constants.js";
import { requireProject, readProjectDesignMd, logSuccess, logError, logInfo } from "../utils.js";
import type { DesignYaml } from "../types.js";

/**
 * Generate the :root CSS block from design tokens.
 */
function generateRootBlock(yaml: DesignYaml): string {
  const lines: string[] = [":root {"];

  if (yaml.colors) {
    lines.push("  /* Colors */");
    for (const [key, value] of Object.entries(yaml.colors)) {
      lines.push(`  --color-${key}: ${value};`);
    }
    lines.push("");
  }

  if (yaml.typography) {
    lines.push("  /* Typography */");
    for (const [key, token] of Object.entries(yaml.typography)) {
      lines.push(`  --font-${key}-family: '${token.fontFamily}', sans-serif;`);
      lines.push(`  --font-${key}-size: ${token.fontSize};`);
      if (token.fontWeight !== undefined) {
        lines.push(`  --font-${key}-weight: ${token.fontWeight};`);
      }
      if (token.lineHeight !== undefined) {
        lines.push(`  --font-${key}-line-height: ${token.lineHeight};`);
      }
      if (token.letterSpacing) {
        lines.push(`  --font-${key}-letter-spacing: ${token.letterSpacing};`);
      }
    }
    lines.push("");
  }

  if (yaml.rounded) {
    lines.push("  /* Border Radius */");
    for (const [key, value] of Object.entries(yaml.rounded)) {
      lines.push(`  --radius-${key}: ${value};`);
    }
    lines.push("");
  }

  if (yaml.spacing) {
    lines.push("  /* Spacing */");
    for (const [key, value] of Object.entries(yaml.spacing)) {
      lines.push(`  --space-${key}: ${value};`);
    }
    lines.push("");
  }

  lines.push("}");
  return lines.join("\n");
}

export async function applyCommand(): Promise<void> {
  const designsDir = await requireProject();
  const parsed = await readProjectDesignMd(designsDir);

  if (!parsed) {
    logError(
      `Could not parse ${DESIGN_MD}. Ensure it has valid YAML front matter.`
    );
    process.exit(1);
  }

  const spinner = ora("Applying design system...").start();

  try {
    // 1. Generate and write tokens.css
    spinner.text = "Exporting tokens.css...";
    const newRootBlock = generateRootBlock(parsed.yaml);
    const tokensPath = path.join(designsDir, "tokens.css");
    await fs.writeFile(tokensPath, newRootBlock + "\n", "utf-8");

    // 2. Count screens that will pick up the change
    const screensDir = path.join(designsDir, SCREENS_DIR);
    let screenCount = 0;

    if (await fs.pathExists(screensDir)) {
      const files = await fs.readdir(screensDir);
      screenCount = files.filter((f) => f.endsWith(".html")).length;
    }

    spinner.succeed("Design system applied!");
    console.log();
    logSuccess(`tokens.css exported → ${tokensPath}`);

    if (screenCount > 0) {
      logSuccess(
        `${screenCount} screen${screenCount !== 1 ? "s" : ""} will use the updated tokens via <link href="../tokens.css" />`
      );
    } else {
      logInfo("No screens found yet. Generate screens using the cs-design skill.");
    }

    console.log();
  } catch (error) {
    spinner.fail("Apply failed.");
    const message = error instanceof Error ? error.message : String(error);
    logError(message);
    process.exit(1);
  }
}
