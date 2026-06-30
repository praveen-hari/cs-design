import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as yaml from "js-yaml";
import { PATHS } from "../utils/constants.js";

export interface DesignProject {
  exists: boolean;
  name?: string;
  description?: string;
  colors?: Record<string, string>;
  typography?: Record<string, any>;
  spacing?: Record<string, string>;
  rounded?: Record<string, string>;
  components?: Record<string, any>;
  screens?: string[];
  validationStatus?: "valid" | "warning" | "error";
}

/**
 * Reads and parses the .designs/ folder to get the current design project state.
 */
export function getDesignProject(
  workspaceFolder: vscode.WorkspaceFolder
): DesignProject {
  const designMdPath = path.join(
    workspaceFolder.uri.fsPath,
    PATHS.designMd
  );

  if (!fs.existsSync(designMdPath)) {
    return { exists: false };
  }

  try {
    const content = fs.readFileSync(designMdPath, "utf-8");

    // Extract YAML front matter
    const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!yamlMatch) {
      return { exists: true };
    }

    const tokens = yaml.load(yamlMatch[1]) as Record<string, any>;

    // Get screen files
    const screensDir = path.join(
      workspaceFolder.uri.fsPath,
      PATHS.screensDir
    );
    let screens: string[] = [];
    if (fs.existsSync(screensDir)) {
      screens = fs
        .readdirSync(screensDir)
        .filter((f) => f.endsWith(".html"))
        .sort();
    }

    return {
      exists: true,
      name: tokens.name,
      description: tokens.description,
      colors: tokens.colors,
      typography: tokens.typography,
      spacing: tokens.spacing,
      rounded: tokens.rounded,
      components: tokens.components,
      screens,
    };
  } catch {
    return { exists: true };
  }
}

/**
 * Count tokens in a section.
 */
export function countTokens(obj: Record<string, any> | undefined): number {
  return obj ? Object.keys(obj).length : 0;
}
