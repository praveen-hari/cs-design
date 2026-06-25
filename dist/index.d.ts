import { LintReport as LintReport$1 } from '@google/design.md/linter';

/**
 * SDK type definitions — shared between SDK and CLI layers.
 *
 * All types here are pure data structures with no dependencies on
 * Node.js APIs, chalk, or any CLI-specific code.
 */
interface DesignColors {
    [tokenName: string]: string;
}
interface TypographyToken {
    fontFamily: string;
    fontSize: string;
    fontWeight?: number;
    lineHeight?: number | string;
    letterSpacing?: string;
}
interface DesignTypography {
    [tokenName: string]: TypographyToken;
}
interface DesignRounded {
    [scaleLevel: string]: string;
}
interface DesignSpacing {
    [scaleLevel: string]: string;
}
interface ComponentToken {
    backgroundColor?: string;
    textColor?: string;
    rounded?: string;
    padding?: string;
    [key: string]: string | undefined;
}
interface DesignComponents {
    [componentName: string]: ComponentToken;
}
interface DesignYaml {
    version?: string;
    name: string;
    description?: string;
    colors: DesignColors;
    /** Dark mode color overrides. Same token names as `colors`, different values. */
    "colors-dark"?: DesignColors;
    typography: DesignTypography;
    rounded?: DesignRounded;
    spacing?: DesignSpacing;
    components?: DesignComponents;
}
interface ParsedDesignMd {
    yaml: DesignYaml;
    markdown: string;
    rawYaml: string;
}
type Severity = "error" | "warning" | "info";
interface ValidationFinding {
    check: string;
    severity: Severity;
    passed: boolean;
    message: string;
}
interface ValidationReport {
    findings: ValidationFinding[];
    valid: boolean;
    errorCount: number;
    warningCount: number;
}
interface LintFinding {
    severity: Severity;
    message: string;
    path?: string;
}
interface LintSummary {
    errors: number;
    warnings: number;
    infos: number;
}
interface DesignSystemInfo {
    name: string;
    colors: number;
    typography: number;
    rounded: number;
    spacing: number;
    components: number;
    sections: string[];
}
interface LintReport {
    findings: LintFinding[];
    summary: LintSummary;
    designSystem: DesignSystemInfo;
    sections: string[];
}
interface TokenDiff {
    added: string[];
    removed: string[];
    modified: string[];
}
interface DiffResult {
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
        delta: {
            errors: number;
            warnings: number;
        };
    };
    regression: boolean;
}
type TokenFormat = "css" | "tailwind" | "json" | "css-tailwind" | "dtcg";
interface ExportResult {
    content: string;
    format: TokenFormat;
    /** Suggested file extension (e.g. "css", "theme.js", "tokens.json") */
    extension: string;
}
interface DesignSystemMeta {
    id: string;
    name: string;
    category: string;
    description: string;
    builtin: boolean;
}
interface ScreenEntry {
    name: string;
    file: string;
    description: string;
}
interface ProjectJson {
    name: string;
    system: string;
    createdAt: string;
    screens: Record<string, ScreenEntry>;
}
interface LintRuleInfo {
    name: string;
    severity: string;
    description: string;
}
interface SpecInfo {
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
/**
 * A Result type for SDK operations that can fail.
 * SDK functions never throw — they return Result<T>.
 */
type Result<T> = {
    ok: true;
    data: T;
} | {
    ok: false;
    error: string;
};

/**
 * SDK Parser — Pure DESIGN.md parsing with no I/O.
 *
 * All functions take string input and return typed results.
 * No file system access, no process.exit, no console output.
 */

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
declare function parseDesignMd(content: string): Result<ParsedDesignMd>;
/**
 * Check if a string is a valid hex color (#RRGGBB).
 */
declare function isValidHexColor(value: string): boolean;
/**
 * Extract all H2 section headings from markdown content.
 *
 * @example
 * ```ts
 * extractMarkdownSections("## Overview\n...\n## Colors\n...");
 * // → ["Overview", "Colors"]
 * ```
 */
declare function extractMarkdownSections(markdown: string): string[];

/**
 * SDK Validator — Pure structural validation of DESIGN.md content.
 *
 * Validates YAML structure, color formats, typography entries,
 * and markdown section presence. No I/O, no side effects.
 */

/** Canonical markdown sections in DESIGN.md (spec order). */
declare const CANONICAL_SECTIONS: string[];
/**
 * Validate a DESIGN.md string for structural correctness.
 *
 * This performs cs-design's own structural checks (YAML structure,
 * color formats, typography entries, markdown sections). For deep
 * spec-level linting (WCAG contrast, broken refs, etc.), use `lint()`.
 *
 * @param content - Raw DESIGN.md file content
 * @returns Result containing the validation report
 *
 * @example
 * ```ts
 * import { validate } from "@syncfusion/cs-design/sdk";
 *
 * const result = validate(designMdContent);
 * if (result.ok) {
 *   console.log(result.data.valid);        // true
 *   console.log(result.data.errorCount);   // 0
 *   console.log(result.data.findings);     // ValidationFinding[]
 * }
 * ```
 */
declare function validate(content: string): Result<ValidationReport>;

/**
 * SDK Linter — Deep lint DESIGN.md using @google/design.md.
 *
 * Wraps Google's spec-compliant linter into a pure function that
 * takes a string and returns a typed result. No I/O, no side effects.
 */

/**
 * Deep lint a DESIGN.md string using the @google/design.md linter.
 *
 * Runs 9+ lint rules including:
 * - broken-ref: Unresolved {token.references}
 * - contrast-ratio: WCAG AA contrast failures
 * - orphaned-tokens: Unused color tokens
 * - missing-primary: No primary color defined
 * - section-order: Sections out of canonical order
 * - unknown-key: Likely YAML key typos
 * - And more...
 *
 * @param content - Raw DESIGN.md file content
 * @returns Result containing the lint report
 *
 * @example
 * ```ts
 * import { lint } from "@syncfusion/cs-design/sdk";
 *
 * const result = lint(designMdContent);
 * if (result.ok) {
 *   console.log(result.data.summary);          // { errors: 0, warnings: 2, infos: 1 }
 *   console.log(result.data.findings);          // LintFinding[]
 *   console.log(result.data.designSystem.name); // "Modern Minimal"
 * }
 * ```
 */
declare function lint(content: string): Result<LintReport>;
/**
 * Access the raw Google LintReport for advanced usage.
 *
 * Unlike `lint()`, this returns the full Google report object including
 * the resolved DesignSystemState with Maps, Tailwind config, etc.
 *
 * @param content - Raw DESIGN.md file content
 * @returns Result containing the raw Google LintReport
 */
declare function lintRaw(content: string): Result<LintReport$1>;

/**
 * SDK Differ — Compare two DESIGN.md files for token-level changes.
 *
 * Pure function: takes two strings, returns a typed diff result.
 * No I/O, no side effects.
 */

/**
 * Compare two DESIGN.md strings and detect token-level changes.
 *
 * Parses both files using the Google linter, then compares the resolved
 * design system models to find added, removed, and modified tokens.
 * Also detects regressions (new errors or warnings in the "after" file).
 *
 * @param beforeContent - Raw content of the "before" DESIGN.md
 * @param afterContent  - Raw content of the "after" DESIGN.md
 * @returns Result containing the diff report
 *
 * @example
 * ```ts
 * import { diff } from "@syncfusion/cs-design/sdk";
 *
 * const result = diff(oldDesignMd, newDesignMd);
 * if (result.ok) {
 *   console.log(result.data.tokens.colors.modified); // ["primary", "accent"]
 *   console.log(result.data.regression);              // false
 * }
 * ```
 */
declare function diff(beforeContent: string, afterContent: string): Result<DiffResult>;

/**
 * SDK Exporter — Export design tokens to various formats.
 *
 * All functions take parsed YAML or raw content and return strings.
 * No file I/O, no side effects.
 */

/**
 * Generate CSS custom properties (:root block) from design tokens.
 * If `colors-dark` is defined, also generates a `[data-theme="dark"]` block
 * and a `@media (prefers-color-scheme: dark)` block.
 */
declare function generateCss(yaml: DesignYaml): string;
/**
 * Generate a Tailwind v3 theme.extend config object from design tokens.
 */
declare function generateTailwind(yaml: DesignYaml): string;
/**
 * Generate flat JSON key-value pairs from design tokens.
 */
declare function generateJson(yaml: DesignYaml): string;
/**
 * Generate Tailwind v4 CSS @theme block from raw DESIGN.md content.
 */
declare function generateCssTailwind(content: string): Result<string>;
/**
 * Generate W3C Design Tokens (DTCG) JSON from raw DESIGN.md content.
 */
declare function generateDtcg(content: string): Result<string>;
/**
 * Export design tokens from a DESIGN.md string to any supported format.
 *
 * This is the main entry point for token export. It handles all formats
 * uniformly — both YAML-based (css, tailwind, json) and Google-powered
 * (css-tailwind, dtcg).
 *
 * @param content - Raw DESIGN.md file content
 * @param format  - Target format
 * @returns Result containing the exported content and metadata
 *
 * @example
 * ```ts
 * import { exportTokens } from "@syncfusion/cs-design/sdk";
 *
 * const result = exportTokens(designMdContent, "css");
 * if (result.ok) {
 *   console.log(result.data.content);    // ":root { --color-primary: #1A1C1E; ... }"
 *   console.log(result.data.extension);  // "css"
 * }
 *
 * // Tailwind v4 CSS
 * const tw4 = exportTokens(designMdContent, "css-tailwind");
 *
 * // W3C DTCG
 * const dtcg = exportTokens(designMdContent, "dtcg");
 * ```
 */
declare function exportTokens(content: string, format: TokenFormat): Result<ExportResult>;

/**
 * SDK Spec — DESIGN.md format specification data.
 *
 * Bundles the full DESIGN.md specification (from Google's design.md project)
 * so agents can access it programmatically without network requests.
 *
 * Pure data, no I/O. Useful for injecting spec context into agent prompts.
 */

/**
 * Known lint rules from @google/design.md linter.
 */
declare const LINT_RULES: LintRuleInfo[];
/**
 * Get the full DESIGN.md format specification as structured data.
 *
 * @example
 * ```ts
 * import { getSpec } from "@syncfusion/cs-design/sdk";
 *
 * const spec = getSpec();
 * console.log(spec.format.sectionOrder);  // ["Overview", "Colors", ...]
 * console.log(spec.rules);                // LintRuleInfo[]
 *
 * // Inject into an agent prompt:
 * const prompt = `Follow this spec: ${JSON.stringify(spec.format)}`;
 * ```
 */
/**
 * Get the full DESIGN.md format specification as structured data.
 *
 * Includes the complete specification text that agents can use to
 * create or edit DESIGN.md files correctly.
 *
 * @example
 * ```ts
 * import { getSpec } from "@syncfusion/cs-design/sdk";
 *
 * const spec = getSpec();
 * console.log(spec.fullSpec);              // Full specification markdown
 * console.log(spec.format.sectionOrder);   // ["Overview", "Colors", ...]
 * console.log(spec.rules);                 // LintRuleInfo[]
 *
 * // Inject into an agent prompt:
 * const prompt = `Follow this specification:\n${spec.fullSpec}`;
 * ```
 */
declare function getSpec(): SpecInfo;
/**
 * Get just the full specification text as a markdown string.
 *
 * This is the complete DESIGN.md format specification that agents need
 * to create or edit DESIGN.md files. Lighter than getSpec() when you
 * only need the spec text.
 *
 * @example
 * ```ts
 * import { getFullSpec } from "@syncfusion/cs-design/sdk";
 *
 * const specText = getFullSpec();
 * // Pass to an agent as context
 * ```
 */
declare function getFullSpec(): string;

/**
 * SDK Systems — Built-in design system content access.
 *
 * Provides access to built-in design system templates as strings.
 * No file I/O for built-in systems (they're bundled).
 */

/**
 * List all built-in design system metadata.
 *
 * @example
 * ```ts
 * import { listBuiltinSystems } from "@syncfusion/cs-design/sdk";
 *
 * const systems = listBuiltinSystems();
 * // [{ id: "modern-minimal", name: "Modern Minimal", ... }, ...]
 * ```
 */
declare function listBuiltinSystems(): DesignSystemMeta[];
/**
 * Get the DESIGN.md content for a built-in design system.
 *
 * @param id - System ID (e.g. "modern-minimal", "corporate-clean", "bold-creative")
 * @returns The DESIGN.md content string, or null if not found
 *
 * @example
 * ```ts
 * import { getBuiltinSystemContent } from "@syncfusion/cs-design/sdk";
 *
 * const content = getBuiltinSystemContent("modern-minimal");
 * if (content) {
 *   // Use it directly or write to disk
 *   console.log(content); // "---\nversion: alpha\nname: Modern Minimal\n..."
 * }
 * ```
 */
declare function getBuiltinSystemContent(id: string): string | null;
/**
 * Get metadata for a specific built-in design system.
 */
declare function getBuiltinSystemMeta(id: string): DesignSystemMeta | null;

/**
 * Shared constants for cs-design CLI.
 */
/** Name of the project-local designs directory */
declare const DESIGNS_DIR = ".designs";
/** Name of the design system file */
declare const DESIGN_MD = "DESIGN.md";
/** Name of the project metadata file */
declare const PROJECT_JSON = "project.json";
/** Name of the agent skill file */
declare const SKILL_MD = "SKILL.md";
/** Skill folder name (must match `name` field in SKILL.md frontmatter) */
declare const SKILL_FOLDER_NAME = "cs-design";
/** Standard skill discovery directory */
declare const SKILLS_DIR = ".codestudio/skills";
/** Name of the screens subdirectory */
declare const SCREENS_DIR = "screens";
/** Default design system ID */
declare const DEFAULT_SYSTEM = "modern-minimal";
/** Resolve the global config directory */
declare function getGlobalDir(): string;
/** Resolve the global systems directory */
declare function getGlobalSystemsDir(): string;
/** Resolve the project designs directory from a base path */
declare function getDesignsDir(basePath?: string): string;
/** Resolve the skill directory from a base path */
declare function getSkillDir(basePath?: string): string;

/**
 * Shared utility functions for cs-design CLI.
 */

/**
 * Read and parse a DESIGN.md file from disk.
 */
declare function readDesignMd(filePath: string): Promise<{
    yaml: DesignYaml;
    markdown: string;
    rawYaml: string;
} | null>;
/**
 * Ensure we're inside a cs-design project (has .designs/ directory).
 * Returns the resolved .designs/ path or throws.
 */
declare function requireProject(basePath?: string): Promise<string>;
/**
 * Read the project.json from the .designs/ directory.
 */
declare function readProjectJson(designsDir: string): Promise<Record<string, unknown> | null>;
/**
 * Read the DESIGN.md from the project's .designs/ directory.
 */
declare function readProjectDesignMd(designsDir: string): Promise<{
    yaml: DesignYaml;
    markdown: string;
    rawYaml: string;
} | null>;

/**
 * Design system registry — built-in systems and resolution logic.
 */

interface BuiltinSystem {
    meta: DesignSystemMeta;
    content: string;
}
/**
 * Get all built-in design system metadata.
 */
declare function getBuiltinSystems(): DesignSystemMeta[];
/**
 * Get a built-in system by ID.
 */
declare function getBuiltinSystem(id: string): BuiltinSystem | undefined;
/**
 * List all user-installed design systems from the global directory.
 */
declare function getInstalledSystems(): Promise<DesignSystemMeta[]>;
/**
 * Resolve a design system by ID.
 * Resolution order: built-in → user-installed.
 * Returns the DESIGN.md content string or null.
 */
declare function resolveSystem(id: string): Promise<string | null>;
/**
 * Get all available systems (built-in + installed).
 */
declare function getAllSystems(): Promise<DesignSystemMeta[]>;

export { CANONICAL_SECTIONS, type ComponentToken, DEFAULT_SYSTEM, DESIGNS_DIR, DESIGN_MD, type DesignColors, type DesignComponents, type DesignRounded, type DesignSpacing, type DesignSystemInfo, type DesignSystemMeta, type DesignTypography, type DesignYaml, type DiffResult, type ExportResult, LINT_RULES, type LintFinding, type LintReport, type LintRuleInfo, type LintSummary, PROJECT_JSON, type ParsedDesignMd, type ProjectJson, type Result, SCREENS_DIR, SKILLS_DIR, SKILL_FOLDER_NAME, SKILL_MD, type ScreenEntry, type Severity, type SpecInfo, type TokenDiff, type TokenFormat, type TypographyToken, type ValidationFinding, type ValidationReport, diff, exportTokens, extractMarkdownSections, generateCss, generateCssTailwind, generateDtcg, generateJson, generateTailwind, getAllSystems, getBuiltinSystem, getBuiltinSystemContent, getBuiltinSystemMeta, getBuiltinSystems, getDesignsDir, getFullSpec, getGlobalDir, getGlobalSystemsDir, getInstalledSystems, getSkillDir, getSpec, isValidHexColor, lint, lintRaw, listBuiltinSystems, parseDesignMd, readDesignMd, readProjectDesignMd, readProjectJson, requireProject, resolveSystem, validate };
