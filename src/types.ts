/**
 * Legacy type definitions — re-exported from SDK for backward compatibility.
 *
 * New code should import from "@syncfusion/cs-design/sdk" or "../sdk/types.js".
 */

// Re-export all SDK types
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

// Legacy aliases — these existed before the SDK refactor.
// The SDK uses different names for some types.
export type { ValidationFinding as ValidationResult } from "./sdk/types.js";
export type { Severity as ValidationSeverity } from "./sdk/types.js";

/**
 * @deprecated Use ValidationReport from SDK instead.
 * This legacy type has `results` instead of `findings`.
 */
export interface ValidationReport {
  results: import("./sdk/types.js").ValidationFinding[];
  valid: boolean;
  errorCount: number;
  warningCount: number;
}
