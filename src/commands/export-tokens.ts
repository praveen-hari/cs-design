/**
 * `cs-design export tokens` command — Export design tokens to CSS, Tailwind, or JSON.
 */

import fs from "fs-extra";
import path from "node:path";
import chalk from "chalk";
import ora from "ora";
import type { DesignYaml, TokenFormat } from "../types.js";
import { requireProject, readProjectDesignMd, logError } from "../utils.js";

// ── CSS export ──

function generateCssTokens(yaml: DesignYaml): string {
  const lines: string[] = [":root {"];

  // Colors
  if (yaml.colors) {
    lines.push("  /* Colors */");
    for (const [key, value] of Object.entries(yaml.colors)) {
      lines.push(`  --color-${key}: ${value};`);
    }
    lines.push("");
  }

  // Typography
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

  // Rounded
  if (yaml.rounded) {
    lines.push("  /* Border Radius */");
    for (const [key, value] of Object.entries(yaml.rounded)) {
      lines.push(`  --radius-${key}: ${value};`);
    }
    lines.push("");
  }

  // Spacing
  if (yaml.spacing) {
    lines.push("  /* Spacing */");
    for (const [key, value] of Object.entries(yaml.spacing)) {
      lines.push(`  --space-${key}: ${value};`);
    }
    lines.push("");
  }

  lines.push("}");
  return lines.join("\n") + "\n";
}

// ── Tailwind export ──

function generateTailwindTheme(yaml: DesignYaml): string {
  const theme: Record<string, unknown> = {};

  // Colors
  if (yaml.colors) {
    theme.colors = { ...yaml.colors };
  }

  // Font families
  if (yaml.typography) {
    const fontFamily: Record<string, string[]> = {};
    const fontSize: Record<string, [string, Record<string, string>]> = {};

    const seenFamilies = new Set<string>();
    for (const [key, token] of Object.entries(yaml.typography)) {
      if (!seenFamilies.has(token.fontFamily)) {
        const familyKey = token.fontFamily.toLowerCase().replace(/\s+/g, "-");
        fontFamily[familyKey] = [token.fontFamily, "sans-serif"];
        seenFamilies.add(token.fontFamily);
      }

      const meta: Record<string, string> = {};
      if (token.lineHeight !== undefined) {
        meta.lineHeight = String(token.lineHeight);
      }
      if (token.letterSpacing) {
        meta.letterSpacing = token.letterSpacing;
      }
      if (token.fontWeight !== undefined) {
        meta.fontWeight = String(token.fontWeight);
      }
      fontSize[key] = [token.fontSize, meta];
    }

    theme.fontFamily = fontFamily;
    theme.fontSize = fontSize;
  }

  // Border radius
  if (yaml.rounded) {
    theme.borderRadius = { ...yaml.rounded };
  }

  // Spacing
  if (yaml.spacing) {
    theme.spacing = { ...yaml.spacing };
  }

  const output = `/** @type {import('tailwindcss').Config['theme']} */
export default ${JSON.stringify(theme, null, 2)};
`;
  return output;
}

// ── JSON export ──

function generateJsonTokens(yaml: DesignYaml): string {
  const tokens: Record<string, string | number> = {};

  // Colors
  if (yaml.colors) {
    for (const [key, value] of Object.entries(yaml.colors)) {
      tokens[`color.${key}`] = value;
    }
  }

  // Typography
  if (yaml.typography) {
    for (const [key, token] of Object.entries(yaml.typography)) {
      tokens[`font.${key}.family`] = token.fontFamily;
      tokens[`font.${key}.size`] = token.fontSize;
      if (token.fontWeight !== undefined) {
        tokens[`font.${key}.weight`] = token.fontWeight;
      }
      if (token.lineHeight !== undefined) {
        tokens[`font.${key}.lineHeight`] = token.lineHeight;
      }
      if (token.letterSpacing) {
        tokens[`font.${key}.letterSpacing`] = token.letterSpacing;
      }
    }
  }

  // Rounded
  if (yaml.rounded) {
    for (const [key, value] of Object.entries(yaml.rounded)) {
      tokens[`radius.${key}`] = value;
    }
  }

  // Spacing
  if (yaml.spacing) {
    for (const [key, value] of Object.entries(yaml.spacing)) {
      tokens[`space.${key}`] = value;
    }
  }

  return JSON.stringify(tokens, null, 2) + "\n";
}

// ── Command handler ──

export interface ExportTokensOptions {
  format: TokenFormat;
  out?: string;
}

const FORMAT_CONFIG: Record<
  TokenFormat,
  { ext: string; generator: (yaml: DesignYaml) => string }
> = {
  css: { ext: "css", generator: generateCssTokens },
  tailwind: { ext: "theme.js", generator: generateTailwindTheme },
  json: { ext: "json", generator: generateJsonTokens },
};

export async function exportTokensCommand(
  options: ExportTokensOptions
): Promise<void> {
  const designsDir = await requireProject();
  const parsed = await readProjectDesignMd(designsDir);

  if (!parsed) {
    logError(
      "Could not parse DESIGN.md. Ensure it has valid YAML front matter."
    );
    process.exit(1);
  }

  const format = options.format;
  const config = FORMAT_CONFIG[format];

  if (!config) {
    logError(
      `Unknown format "${format}". Supported: ${Object.keys(FORMAT_CONFIG).join(", ")}`
    );
    process.exit(1);
  }

  const spinner = ora(`Exporting tokens as ${format}...`).start();

  try {
    const content = config.generator(parsed.yaml);
    const outputPath =
      options.out || path.join(designsDir, `tokens.${config.ext}`);

    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, content, "utf-8");

    spinner.succeed(`Tokens exported to ${chalk.cyan(outputPath)}`);
  } catch (error) {
    spinner.fail("Export failed.");
    const message = error instanceof Error ? error.message : String(error);
    logError(message);
    process.exit(1);
  }
}
