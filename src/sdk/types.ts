/**
 * SDK type definitions — shared between SDK and CLI layers.
 *
 * All types here are pure data structures with no dependencies on
 * Node.js APIs, chalk, or any CLI-specific code.
 */

// ── DESIGN.md Token Types ──

export interface DesignColors {
  [tokenName: string]: string;
}

export interface TypographyToken {
  fontFamily: string;
  fontSize: string;
  fontWeight?: number;
  lineHeight?: number | string;
  letterSpacing?: string;
}

export interface DesignTypography {
  [tokenName: string]: TypographyToken;
}

export interface DesignRounded {
  [scaleLevel: string]: string;
}

export interface DesignSpacing {
  [scaleLevel: string]: string;
}

export interface ComponentToken {
  backgroundColor?: string;
  textColor?: string;
  rounded?: string;
  padding?: string;
  [key: string]: string | undefined;
}

export interface DesignComponents {
  [componentName: string]: ComponentToken;
}

export interface DesignYaml {
  version?: string;
  name: string;
  description?: string;
  colors: DesignColors;
  typography: DesignTypography;
  rounded?: DesignRounded;
  spacing?: DesignSpacing;
  components?: DesignComponents;
}

// ── Parsed DESIGN.md ──

export interface ParsedDesignMd {
  yaml: DesignYaml;
  markdown: string;
  rawYaml: string;
}

// ── Validation ──

export type Severity = "error" | "warning" | "info";

export interface ValidationFinding {
  check: string;
  severity: Severity;
  passed: boolean;
  message: string;
}

export interface ValidationReport {
  findings: ValidationFinding[];
  valid: boolean;
  errorCount: number;
  warningCount: number;
}

// ── Lint (Google-powered) ──

export interface LintFinding {
  severity: Severity;
  message: string;
  path?: string;
}

export interface LintSummary {
  errors: number;
  warnings: number;
  infos: number;
}

export interface DesignSystemInfo {
  name: string;
  colors: number;
  typography: number;
  rounded: number;
  spacing: number;
  components: number;
  sections: string[];
}

export interface LintReport {
  findings: LintFinding[];
  summary: LintSummary;
  designSystem: DesignSystemInfo;
  sections: string[];
}

// ── Diff ──

export interface TokenDiff {
  added: string[];
  removed: string[];
  modified: string[];
}

export interface DiffResult {
  tokens: {
    colors: TokenDiff;
    typography: TokenDiff;
    rounded: TokenDiff;
    spacing: TokenDiff;
    components: TokenDiff;
  };
  findings: {
    before: LintSummary;
    after: LintSummary;
    delta: { errors: number; warnings: number };
  };
  regression: boolean;
}

// ── Token Export ──

export type TokenFormat = "css" | "tailwind" | "json" | "css-tailwind" | "dtcg";

export interface ExportResult {
  content: string;
  format: TokenFormat;
  /** Suggested file extension (e.g. "css", "theme.js", "tokens.json") */
  extension: string;
}

// ── Design System Registry ──

export interface DesignSystemMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  builtin: boolean;
}

// ── Project ──

export interface ScreenEntry {
  name: string;
  file: string;
  description: string;
}

export interface ProjectJson {
  name: string;
  system: string;
  createdAt: string;
  screens: Record<string, ScreenEntry>;
}

// ── Spec ──

export interface LintRuleInfo {
  name: string;
  severity: string;
  description: string;
}

export interface SpecInfo {
  format: {
    layers: string[];
    tokenSchema: string[];
    sectionOrder: string[];
    tokenTypes: Record<string, string>;
  };
  specUrl: string;
  rules: LintRuleInfo[];
  /** The full DESIGN.md format specification as markdown text. */
  fullSpec: string;
}

// ── SDK Result wrapper ──

/**
 * A Result type for SDK operations that can fail.
 * SDK functions never throw — they return Result<T>.
 */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
