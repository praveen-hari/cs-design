/**
 * `cs-design apply` command — Re-export tokens and update all screens.
 *
 * When the design system (DESIGN.md) changes, this command:
 * 1. Re-exports tokens.css from the updated DESIGN.md
 * 2. Finds all HTML screens in .designs/screens/
 * 3. Replaces the :root { ... } block in each screen with the new tokens
 *
 * This works because screens use CSS variables (var(--color-primary), etc.)
 * instead of hardcoded hex values.
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

/**
 * Replace the :root { ... } block in an HTML file's <style> tag.
 * Returns true if the file was updated, false if no :root block was found.
 */
function updateRootInHtml(html: string, newRootBlock: string): { updated: boolean; content: string } {
  // Match :root { ... } block (handles multiline, nested braces not expected in :root)
  const rootRegex = /:root\s*\{[^}]*\}/s;
  if (rootRegex.test(html)) {
    return {
      updated: true,
      content: html.replace(rootRegex, newRootBlock),
    };
  }
  return { updated: false, content: html };
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
    // 1. Generate new :root block
    const newRootBlock = generateRootBlock(parsed.yaml);

    // 2. Re-export tokens.css
    spinner.text = "Exporting tokens.css...";
    const tokensPath = path.join(designsDir, "tokens.css");
    await fs.writeFile(tokensPath, newRootBlock + "\n", "utf-8");

    // 3. Find and update all HTML screens
    spinner.text = "Updating screens...";
    const screensDir = path.join(designsDir, SCREENS_DIR);
    let updatedCount = 0;
    let skippedCount = 0;

    if (await fs.pathExists(screensDir)) {
      const files = await fs.readdir(screensDir);
      const htmlFiles = files.filter((f) => f.endsWith(".html"));

      for (const file of htmlFiles) {
        const filePath = path.join(screensDir, file);
        const html = await fs.readFile(filePath, "utf-8");
        const result = updateRootInHtml(html, newRootBlock);

        if (result.updated) {
          await fs.writeFile(filePath, result.content, "utf-8");
          updatedCount++;
        } else {
          skippedCount++;
        }
      }
    }

    spinner.succeed("Design system applied!");
    console.log();
    logSuccess(`tokens.css exported`);

    if (updatedCount > 0) {
      logSuccess(
        `${updatedCount} screen${updatedCount !== 1 ? "s" : ""} updated with new tokens`
      );
    }

    if (skippedCount > 0) {
      logInfo(
        `${skippedCount} screen${skippedCount !== 1 ? "s" : ""} skipped (no :root block found — use CSS variables for auto-updates)`
      );
    }

    if (updatedCount === 0 && skippedCount === 0) {
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
