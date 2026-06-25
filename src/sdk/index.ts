/**
 * @syncfusion/cs-design SDK — Pure programmatic API.
 *
 * This module provides the complete cs-design functionality as pure functions
 * with no side effects. Every function takes data in and returns data out —
 * no file I/O, no process.exit(), no console output, no chalk formatting.
 *
 * Use this when embedding cs-design in:
 * - Code Studio extensions
 * - MCP servers
 * - CI/CD pipelines
 * - Other tools and libraries
 * - Web applications
 *
 * @example
 * ```ts
 * import {
 *   parseDesignMd,
 *   validate,
 *   lint,
 *   diff,
 *   exportTokens,
 *   getSpec,
 *   listBuiltinSystems,
 * } from "@syncfusion/cs-design/sdk";
 *
 * // Parse a DESIGN.md string
 * const parsed = parseDesignMd(content);
 * if (parsed.ok) {
 *   console.log(parsed.data.yaml.name);
 * }
 *
 * // Validate structure
 * const validation = validate(content);
 *
 * // Deep lint (WCAG, broken refs, etc.)
 * const lintResult = lint(content);
 *
 * // Compare two versions
 * const diffResult = diff(oldContent, newContent);
 *
 * // Export tokens
 * const css = exportTokens(content, "css");
 * const dtcg = exportTokens(content, "dtcg");
 * ```
 *
 * @packageDocumentation
 */

// ── Types ──
export type {
  // Core token types
  DesignYaml,
  DesignColors,
  DesignTypography,
  DesignRounded,
  DesignSpacing,
  DesignComponents,
  TypographyToken,
  ComponentToken,
  ParsedDesignMd,

  // Validation
  Severity,
  ValidationFinding,
  ValidationReport,

  // Lint
  LintFinding,
  LintSummary,
  LintReport,
  DesignSystemInfo,

  // Diff
  TokenDiff,
  DiffResult,

  // Export
  TokenFormat,
  ExportResult,

  // Systems
  DesignSystemMeta,

  // Project
  ProjectJson,
  ScreenEntry,

  // Spec
  LintRuleInfo,
  SpecInfo,

  // Result wrapper
  Result,
} from "./types.js";

// ── Parser ──
export {
  parseDesignMd,
  isValidHexColor,
  extractMarkdownSections,
} from "./parser.js";

// ── Validator ──
export { validate, CANONICAL_SECTIONS } from "./validator.js";

// ── Linter ──
export { lint, lintRaw } from "./linter.js";

// ── Differ ──
export { diff } from "./differ.js";

// ── Exporter ──
export {
  exportTokens,
  generateCss,
  generateTailwind,
  generateJson,
  generateCssTailwind,
  generateDtcg,
} from "./exporter.js";

// ── Spec ──
export { getSpec, getFullSpec, LINT_RULES } from "./spec.js";

// ── Systems ──
export {
  listBuiltinSystems,
  getBuiltinSystemContent,
  getBuiltinSystemMeta,
} from "./systems.js";
