/**
 * SDK Exporter — Export design tokens to various formats.
 *
 * All functions take parsed YAML or raw content and return strings.
 * No file I/O, no side effects.
 */

import {
  lint as googleLint,
  TailwindV4EmitterHandler,
  serializeTailwindV4,
  DtcgEmitterHandler,
} from "@google/design.md/linter";
import type { DesignYaml, TokenFormat, ExportResult, Result } from "./types.js";
import { parseDesignMd } from "./parser.js";

// ── CSS Custom Properties ──

/**
 * Generate CSS custom properties (:root block) from design tokens.
 * If `colors-dark` is defined, also generates a `[data-theme="dark"]` block
 * and a `@media (prefers-color-scheme: dark)` block.
 */
export function generateCss(yaml: DesignYaml): string {
  const lines: string[] = ["/* Light theme (default) */", ":root {"];

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

  // ── Dark theme ──
  const darkColors = yaml["colors-dark"];
  if (darkColors && Object.keys(darkColors).length > 0) {
    lines.push("");
    lines.push("/* Dark theme — activated via data-theme=\"dark\" attribute */");
    lines.push('[data-theme="dark"] {');
    for (const [key, value] of Object.entries(darkColors)) {
      lines.push(`  --color-${key}: ${value};`);
    }
    lines.push("}");
    lines.push("");
    lines.push("/* Dark theme — auto-activated via OS preference */");
    lines.push("@media (prefers-color-scheme: dark) {");
    lines.push("  :root:not([data-theme=\"light\"]) {");
    for (const [key, value] of Object.entries(darkColors)) {
      lines.push(`    --color-${key}: ${value};`);
    }
    lines.push("  }");
    lines.push("}");
  }

  return lines.join("\n") + "\n";
}

// ── Tailwind v3 Theme Config ──

/**
 * Generate a Tailwind v3 theme.extend config object from design tokens.
 */
export function generateTailwind(yaml: DesignYaml): string {
  const theme: Record<string, unknown> = {};

  if (yaml.colors) {
    const colors: Record<string, unknown> = { ...yaml.colors };
    // Nest dark mode colors under a "dark" key
    const darkColors = yaml["colors-dark"];
    if (darkColors) {
      colors.dark = { ...darkColors };
    }
    theme.colors = colors;
  }

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
      if (token.lineHeight !== undefined) meta.lineHeight = String(token.lineHeight);
      if (token.letterSpacing) meta.letterSpacing = token.letterSpacing;
      if (token.fontWeight !== undefined) meta.fontWeight = String(token.fontWeight);
      fontSize[key] = [token.fontSize, meta];
    }

    theme.fontFamily = fontFamily;
    theme.fontSize = fontSize;
  }

  if (yaml.rounded) {
    theme.borderRadius = { ...yaml.rounded };
  }

  if (yaml.spacing) {
    theme.spacing = { ...yaml.spacing };
  }

  return `/** @type {import('tailwindcss').Config['theme']} */\nexport default ${JSON.stringify(theme, null, 2)};\n`;
}

// ── Flat JSON ──

/**
 * Generate flat JSON key-value pairs from design tokens.
 */
export function generateJson(yaml: DesignYaml): string {
  const tokens: Record<string, string | number> = {};

  if (yaml.colors) {
    for (const [key, value] of Object.entries(yaml.colors)) {
      tokens[`color.${key}`] = value;
    }
  }

  // Dark mode colors
  const darkColors = yaml["colors-dark"];
  if (darkColors) {
    for (const [key, value] of Object.entries(darkColors)) {
      tokens[`color-dark.${key}`] = value;
    }
  }

  if (yaml.typography) {
    for (const [key, token] of Object.entries(yaml.typography)) {
      tokens[`font.${key}.family`] = token.fontFamily;
      tokens[`font.${key}.size`] = token.fontSize;
      if (token.fontWeight !== undefined) tokens[`font.${key}.weight`] = token.fontWeight;
      if (token.lineHeight !== undefined) tokens[`font.${key}.lineHeight`] = token.lineHeight;
      if (token.letterSpacing) tokens[`font.${key}.letterSpacing`] = token.letterSpacing;
    }
  }

  if (yaml.rounded) {
    for (const [key, value] of Object.entries(yaml.rounded)) {
      tokens[`radius.${key}`] = value;
    }
  }

  if (yaml.spacing) {
    for (const [key, value] of Object.entries(yaml.spacing)) {
      tokens[`space.${key}`] = value;
    }
  }

  return JSON.stringify(tokens, null, 2) + "\n";
}

// ── Tailwind v4 CSS @theme (Google-powered) ──

/**
 * Generate Tailwind v4 CSS @theme block from raw DESIGN.md content.
 */
export function generateCssTailwind(content: string): Result<string> {
  try {
    const report = googleLint(content);
    const handler = new TailwindV4EmitterHandler();
    const result = handler.execute(report.designSystem);
    if (!result.success) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true, data: serializeTailwindV4(result.data.theme) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ── W3C DTCG (Google-powered) ──

/**
 * Generate W3C Design Tokens (DTCG) JSON from raw DESIGN.md content.
 */
export function generateDtcg(content: string): Result<string> {
  try {
    const report = googleLint(content);
    const handler = new DtcgEmitterHandler();
    const result = handler.execute(report.designSystem);
    if (!result.success) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true, data: JSON.stringify(result.data, null, 2) + "\n" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ── Unified export function ──

/** File extension mapping for each format. */
const FORMAT_EXTENSIONS: Record<TokenFormat, string> = {
  css: "css",
  tailwind: "theme.js",
  json: "json",
  "css-tailwind": "css",
  dtcg: "tokens.json",
};

/**
 * Export design tokens from a DESIGN.md string to any supported format.
 *
 * This is the main entry point for token export. It handles all formats
 * uniformly — both YAML-based (css, tailwind, json) and Google-powered
 * (css-tailwind, dtcg).
 *
 * @param content - Raw DESIGN.md file content
 * @param format  - Target format
 * @returns Result containing the exported content and metadata
 *
 * @example
 * ```ts
 * import { exportTokens } from "@syncfusion/cs-design/sdk";
 *
 * const result = exportTokens(designMdContent, "css");
 * if (result.ok) {
 *   console.log(result.data.content);    // ":root { --color-primary: #1A1C1E; ... }"
 *   console.log(result.data.extension);  // "css"
 * }
 *
 * // Tailwind v4 CSS
 * const tw4 = exportTokens(designMdContent, "css-tailwind");
 *
 * // W3C DTCG
 * const dtcg = exportTokens(designMdContent, "dtcg");
 * ```
 */
export function exportTokens(content: string, format: TokenFormat): Result<ExportResult> {
  const extension = FORMAT_EXTENSIONS[format];
  if (!extension) {
    return {
      ok: false,
      error: `Unknown format "${format}". Supported: ${Object.keys(FORMAT_EXTENSIONS).join(", ")}`,
    };
  }

  // Google-powered formats work on raw content
  if (format === "css-tailwind") {
    const result = generateCssTailwind(content);
    if (!result.ok) return result;
    return { ok: true, data: { content: result.data, format, extension } };
  }

  if (format === "dtcg") {
    const result = generateDtcg(content);
    if (!result.ok) return result;
    return { ok: true, data: { content: result.data, format, extension } };
  }

  // YAML-based formats need parsed YAML
  const parsed = parseDesignMd(content);
  if (!parsed.ok) return parsed;

  const generators: Record<string, (yaml: DesignYaml) => string> = {
    css: generateCss,
    tailwind: generateTailwind,
    json: generateJson,
  };

  const generator = generators[format];
  if (!generator) {
    return { ok: false, error: `No generator for format "${format}"` };
  }

  try {
    const output = generator(parsed.data.yaml);
    return { ok: true, data: { content: output, format, extension } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
