/**
 * Shared constants for cs-design CLI.
 */

import path from "node:path";
import os from "node:os";

/** Name of the project-local designs directory */
export const DESIGNS_DIR = ".designs";

/** Name of the design system file */
export const DESIGN_MD = "DESIGN.md";

/** Name of the project metadata file */
export const PROJECT_JSON = "project.json";

/** Name of the agent skill file */
export const SKILL_MD = "SKILL.md";

/** Name of the screens subdirectory */
export const SCREENS_DIR = "screens";

/** Default design system ID */
export const DEFAULT_SYSTEM = "modern-minimal";

/** Global config directory name */
export const GLOBAL_DIR_NAME = ".cs-design";

/** Environment variable to override global config directory */
export const ENV_HOME = "CS_DESIGN_HOME";

/** Resolve the global config directory */
export function getGlobalDir(): string {
  return process.env[ENV_HOME] || path.join(os.homedir(), GLOBAL_DIR_NAME);
}

/** Resolve the global systems directory */
export function getGlobalSystemsDir(): string {
  return path.join(getGlobalDir(), "systems");
}

/** Resolve the project designs directory from a base path */
export function getDesignsDir(basePath: string = process.cwd()): string {
  return path.join(basePath, DESIGNS_DIR);
}

/** Canonical markdown sections in DESIGN.md */
export const CANONICAL_SECTIONS = [
  "Overview",
  "Colors",
  "Typography",
  "Layout",
  "Elevation & Depth",
  "Shapes",
  "Components",
  "Do's and Don'ts",
] as const;

/** Exit codes */
export const EXIT = {
  SUCCESS: 0,
  ERROR: 1,
  MISSING_ARG: 2,
} as const;
