/**
 * SDK Validator — Pure structural validation of DESIGN.md content.
 *
 * Validates YAML structure, color formats, typography entries,
 * and markdown section presence. No I/O, no side effects.
 */

import type {
  DesignYaml,
  ValidationFinding,
  ValidationReport,
  Result,
} from "./types.js";
import { parseDesignMd, isValidHexColor, extractMarkdownSections } from "./parser.js";

/** Canonical markdown sections in DESIGN.md (spec order). */
export const CANONICAL_SECTIONS = [
  "Overview",
  "Colors",
  "Typography",
  "Layout",
  "Elevation & Depth",
  "Shapes",
  "Components",
  "Do's and Don'ts",
];

function finding(
  check: string,
  severity: "error" | "warning",
  passed: boolean,
  message: string,
): ValidationFinding {
  return { check, severity, passed, message };
}

/**
 * Validate the YAML front matter of a parsed DESIGN.md.
 */
function validateYaml(yamlData: DesignYaml): ValidationFinding[] {
  const results: ValidationFinding[] = [];

  // name field
  const hasName = typeof yamlData.name === "string" && yamlData.name.length > 0;
  results.push(
    finding("name field", "error", hasName,
      hasName ? `name: "${yamlData.name}"` : "name field is missing or empty"),
  );

  // colors section
  const hasColors = yamlData.colors && typeof yamlData.colors === "object"
    && Object.keys(yamlData.colors).length > 0;
  results.push(
    finding("colors section", "error", !!hasColors,
      hasColors
        ? `colors: ${Object.keys(yamlData.colors).length} tokens defined`
        : "colors section is missing or empty"),
  );

  // Validate individual color values
  if (hasColors) {
    for (const [key, value] of Object.entries(yamlData.colors)) {
      if (typeof value === "string" && !isValidHexColor(value)) {
        results.push(
          finding(`color "${key}"`, "error", false,
            `Invalid hex color: "${value}" (expected #RRGGBB)`),
        );
      }
    }
  }

  // typography section
  const hasTypography = yamlData.typography && typeof yamlData.typography === "object"
    && Object.keys(yamlData.typography).length > 0;
  results.push(
    finding("typography section", "error", !!hasTypography,
      hasTypography
        ? `typography: ${Object.keys(yamlData.typography).length} levels defined`
        : "typography section is missing or empty"),
  );

  // Validate typography entries
  if (hasTypography) {
    for (const [key, entry] of Object.entries(yamlData.typography)) {
      if (!entry.fontFamily) {
        results.push(
          finding(`typography "${key}" fontFamily`, "error", false,
            `typography.${key} is missing fontFamily`),
        );
      }
      if (!entry.fontSize) {
        results.push(
          finding(`typography "${key}" fontSize`, "error", false,
            `typography.${key} is missing fontSize`),
        );
      }
    }
  }

  // spacing section (recommended)
  const spacingKeys = yamlData.spacing ? Object.keys(yamlData.spacing) : [];
  results.push(
    finding("spacing section", "warning", spacingKeys.length > 0,
      spacingKeys.length > 0
        ? `spacing: ${spacingKeys.length} levels defined`
        : "spacing section not defined (recommended)"),
  );

  // rounded section (recommended)
  const roundedKeys = yamlData.rounded ? Object.keys(yamlData.rounded) : [];
  results.push(
    finding("rounded section", "warning", roundedKeys.length > 0,
      roundedKeys.length > 0
        ? `rounded: ${roundedKeys.length} levels defined`
        : "rounded section not defined (recommended)"),
  );

  // components section (recommended)
  const componentKeys = yamlData.components ? Object.keys(yamlData.components) : [];
  results.push(
    finding("components section", "warning", componentKeys.length > 0,
      componentKeys.length > 0
        ? `components: ${componentKeys.length} defined`
        : "components section not defined (recommended)"),
  );

  return results;
}

/**
 * Validate the markdown body of a DESIGN.md.
 */
function validateMarkdown(markdown: string): ValidationFinding[] {
  const results: ValidationFinding[] = [];
  const sections = extractMarkdownSections(markdown);

  // Check for duplicate sections
  const seen = new Set<string>();
  for (const section of sections) {
    if (seen.has(section)) {
      results.push(
        finding(`duplicate section "${section}"`, "error", false,
          `Duplicate section heading: "## ${section}"`),
      );
    }
    seen.add(section);
  }

  // Check canonical sections
  const presentCount = CANONICAL_SECTIONS.filter((s) => sections.includes(s)).length;
  for (const section of CANONICAL_SECTIONS) {
    results.push(
      finding(`section "${section}"`, "warning", sections.includes(section),
        sections.includes(section)
          ? `"## ${section}" present`
          : `"## ${section}" not found (recommended)`),
    );
  }

  results.push(
    finding("markdown sections", "warning", presentCount >= 4,
      `Markdown sections: ${presentCount}/${CANONICAL_SECTIONS.length} present`),
  );

  return results;
}

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
export function validate(content: string): Result<ValidationReport> {
  const parsed = parseDesignMd(content);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const findings: ValidationFinding[] = [];

  // YAML front matter exists
  findings.push(finding("YAML front matter", "error", true, "valid"));

  // Validate YAML content
  findings.push(...validateYaml(parsed.data.yaml));

  // Validate markdown content
  findings.push(...validateMarkdown(parsed.data.markdown));

  const errorCount = findings.filter((f) => !f.passed && f.severity === "error").length;
  const warningCount = findings.filter((f) => !f.passed && f.severity === "warning").length;

  return {
    ok: true,
    data: {
      findings,
      valid: errorCount === 0,
      errorCount,
      warningCount,
    },
  };
}
