/**
 * SDK Parser — Pure DESIGN.md parsing with no I/O.
 *
 * All functions take string input and return typed results.
 * No file system access, no process.exit, no console output.
 */

import yaml from "js-yaml";
import type { DesignYaml, ParsedDesignMd, Result } from "./types.js";

/**
 * Parse a DESIGN.md string into its YAML front matter and markdown body.
 *
 * @param content - Raw DESIGN.md file content
 * @returns Result containing parsed YAML, markdown body, and raw YAML string
 *
 * @example
 * ```ts
 * import { parseDesignMd } from "@syncfusion/cs-design/sdk";
 *
 * const result = parseDesignMd(fileContent);
 * if (result.ok) {
 *   console.log(result.data.yaml.name);       // "Modern Minimal"
 *   console.log(result.data.yaml.colors);      // { primary: "#1A1C1E", ... }
 *   console.log(result.data.markdown);          // "## Overview\n..."
 * }
 * ```
 */
export function parseDesignMd(content: string): Result<ParsedDesignMd> {
  const fmRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = content.match(fmRegex);

  if (!match) {
    return {
      ok: false,
      error: "No valid YAML front matter found. Expected --- delimited block at the top of the file.",
    };
  }

  const rawYaml = match[1]!;
  const markdown = match[2]!;

  try {
    const parsed = yaml.load(rawYaml) as DesignYaml;
    if (!parsed || typeof parsed !== "object") {
      return { ok: false, error: "YAML front matter parsed to a non-object value." };
    }
    return { ok: true, data: { yaml: parsed, markdown, rawYaml } };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `YAML parse error: ${message}` };
  }
}

/**
 * Check if a string is a valid hex color (#RRGGBB).
 */
export function isValidHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

/**
 * Extract all H2 section headings from markdown content.
 *
 * @example
 * ```ts
 * extractMarkdownSections("## Overview\n...\n## Colors\n...");
 * // → ["Overview", "Colors"]
 * ```
 */
export function extractMarkdownSections(markdown: string): string[] {
  const headingRegex = /^## (.+)$/gm;
  const sections: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(markdown)) !== null) {
    sections.push(match[1]!.trim());
  }
  return sections;
}
