/**
 * Core type definitions for cs-design CLI.
 */

// ── DESIGN.md YAML front matter types ──

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

// ── Project types ──

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

// ── Validation types ──

export type ValidationSeverity = "error" | "warning";

export interface ValidationResult {
  check: string;
  severity: ValidationSeverity;
  passed: boolean;
  message: string;
}

export interface ValidationReport {
  results: ValidationResult[];
  valid: boolean;
  errorCount: number;
  warningCount: number;
}

// ── Design system registry types ──

export interface DesignSystemMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  builtin: boolean;
}

// ── Token export types ──

export type TokenFormat = "css" | "tailwind" | "json";
