/**
 * Shared utility functions for cs-design CLI.
 */

import fs from "fs-extra";
import path from "node:path";
import yaml from "js-yaml";
import chalk from "chalk";
import type { DesignYaml } from "./types.js";
import { DESIGNS_DIR, DESIGN_MD, PROJECT_JSON, getDesignsDir } from "./constants.js";

// ── DESIGN.md parsing ──

/**
 * Parse a DESIGN.md file into its YAML front matter and markdown body.
 * Returns null if the file has no valid front matter.
 */
export function parseDesignMd(content: string): {
  yaml: DesignYaml;
  markdown: string;
  rawYaml: string;
} | null {
  const fmRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = content.match(fmRegex);
  if (!match) return null;

  const rawYaml = match[1];
  const markdown = match[2];

  try {
    const parsed = yaml.load(rawYaml) as DesignYaml;
    if (!parsed || typeof parsed !== "object") return null;
    return { yaml: parsed, markdown, rawYaml };
  } catch {
    return null;
  }
}

/**
 * Read and parse a DESIGN.md file from disk.
 */
export async function readDesignMd(filePath: string): Promise<{
  yaml: DesignYaml;
  markdown: string;
  rawYaml: string;
} | null> {
  if (!(await fs.pathExists(filePath))) return null;
  const content = await fs.readFile(filePath, "utf-8");
  return parseDesignMd(content);
}

// ── Project resolution ──

/**
 * Ensure we're inside a cs-design project (has .designs/ directory).
 * Returns the resolved .designs/ path or throws.
 */
export async function requireProject(basePath: string = process.cwd()): Promise<string> {
  const designsDir = getDesignsDir(basePath);
  if (!(await fs.pathExists(designsDir))) {
    throw new Error(
      `No ${DESIGNS_DIR}/ directory found. Run ${chalk.cyan("cs-design init")} first.`
    );
  }
  return designsDir;
}

/**
 * Read the project.json from the .designs/ directory.
 */
export async function readProjectJson(designsDir: string): Promise<Record<string, unknown> | null> {
  const projectPath = path.join(designsDir, PROJECT_JSON);
  if (!(await fs.pathExists(projectPath))) return null;
  return fs.readJson(projectPath);
}

// ── Hex color validation ──

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export function isValidHexColor(value: string): boolean {
  return HEX_COLOR_REGEX.test(value);
}

// ── Markdown section extraction ──

/**
 * Extract all H2 section headings from markdown content.
 */
export function extractMarkdownSections(markdown: string): string[] {
  const headingRegex = /^## (.+)$/gm;
  const sections: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(markdown)) !== null) {
    sections.push(match[1].trim());
  }
  return sections;
}

// ── Logging helpers ──

export function logSuccess(message: string): void {
  console.log(chalk.green("✅") + " " + message);
}

export function logWarning(message: string): void {
  console.log(chalk.yellow("⚠️ ") + " " + message);
}

export function logError(message: string): void {
  console.error(chalk.red("✖") + " " + message);
}

export function logInfo(message: string): void {
  console.log(chalk.blue("ℹ") + " " + message);
}

/**
 * Read the DESIGN.md from the project's .designs/ directory.
 */
export async function readProjectDesignMd(designsDir: string) {
  const designPath = path.join(designsDir, DESIGN_MD);
  return readDesignMd(designPath);
}
