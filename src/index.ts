/**
 * cs-design — Public API.
 *
 * This module exports the programmatic API for use as a library.
 * For CLI usage, see ./cli.ts.
 */

// Types
export type {
  DesignYaml,
  DesignColors,
  DesignTypography,
  DesignRounded,
  DesignSpacing,
  DesignComponents,
  TypographyToken,
  ComponentToken,
  ProjectJson,
  ScreenEntry,
  ValidationResult,
  ValidationReport,
  ValidationSeverity,
  DesignSystemMeta,
  TokenFormat,
} from "./types.js";

// Utilities
export {
  parseDesignMd,
  readDesignMd,
  isValidHexColor,
  extractMarkdownSections,
} from "./utils.js";

// Constants
export {
  DESIGNS_DIR,
  DESIGN_MD,
  PROJECT_JSON,
  SKILL_MD,
  SCREENS_DIR,
  DEFAULT_SYSTEM,
  getGlobalDir,
  getGlobalSystemsDir,
  getDesignsDir,
  CANONICAL_SECTIONS,
} from "./constants.js";

// Systems
export {
  getBuiltinSystems,
  getBuiltinSystem,
  getInstalledSystems,
  resolveSystem,
  getAllSystems,
} from "./systems/index.js";

// Commands (programmatic access)
export { initCommand } from "./commands/init.js";
export { validateCommand } from "./commands/validate.js";
export { screensListCommand } from "./commands/screens.js";
export {
  systemsListCommand,
  systemsInstallCommand,
  systemsCreateCommand,
} from "./commands/systems.js";
export { exportTokensCommand } from "./commands/export-tokens.js";
