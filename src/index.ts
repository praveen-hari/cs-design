/**
 * @syncfusion/cs-design — Public API.
 *
 * This module re-exports the SDK (pure functions) plus CLI-specific
 * utilities for backward compatibility. For pure programmatic usage,
 * prefer importing from "@syncfusion/cs-design/sdk" directly.
 *
 * @example
 * ```ts
 * // SDK (pure functions — recommended for embedding)
 * import { parseDesignMd, validate, lint, diff, exportTokens } from "@syncfusion/cs-design/sdk";
 *
 * // Main entry (includes SDK + CLI utilities)
 * import { parseDesignMd, validate, lint } from "@syncfusion/cs-design";
 * ```
 */

// ── Re-export the entire SDK ──
export * from "./sdk/index.js";

// ── Legacy types (re-exported from SDK for backward compat) ──
// These are the same types, just re-exported so existing imports don't break.
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
  DesignSystemMeta,
  TokenFormat,
} from "./sdk/types.js";

// ── Constants (CLI paths — not part of SDK) ──
export {
  DESIGNS_DIR,
  DESIGN_MD,
  PROJECT_JSON,
  SCREENS_DIR,
  DEFAULT_SYSTEM,
  getGlobalDir,
  getGlobalSystemsDir,
  getDesignsDir,
} from "./constants.js";

// ── File-system utilities (CLI-only, not in SDK) ──
export {
  readDesignMd,
  requireProject,
  readProjectJson,
  readProjectDesignMd,
} from "./utils.js";

// ── Design system resolution (file-system aware) ──
export {
  getBuiltinSystems,
  getBuiltinSystem,
  getInstalledSystems,
  resolveSystem,
  getAllSystems,
} from "./systems/index.js";
