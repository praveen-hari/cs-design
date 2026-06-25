/**
 * SDK Spec — DESIGN.md format specification data.
 *
 * Pure data, no I/O. Useful for injecting spec context into agent prompts.
 */

import type { SpecInfo, LintRuleInfo } from "./types.js";

/**
 * Known lint rules from @google/design.md linter.
 */
export const LINT_RULES: LintRuleInfo[] = [
  {
    name: "broken-ref",
    severity: "error",
    description: "Token references ({colors.primary}) that don't resolve to any defined token",
  },
  {
    name: "missing-primary",
    severity: "warning",
    description: "Colors are defined but no primary color exists — agents will auto-generate one",
  },
  {
    name: "contrast-ratio",
    severity: "warning",
    description: "Component backgroundColor/textColor pairs below WCAG AA minimum (4.5:1)",
  },
  {
    name: "orphaned-tokens",
    severity: "warning",
    description: "Color tokens defined but never referenced by any component",
  },
  {
    name: "token-summary",
    severity: "info",
    description: "Summary of how many tokens are defined in each section",
  },
  {
    name: "missing-sections",
    severity: "info",
    description: "Optional sections (spacing, rounded) absent when other tokens exist",
  },
  {
    name: "missing-typography",
    severity: "warning",
    description: "Colors are defined but no typography tokens exist — agents will use default fonts",
  },
  {
    name: "section-order",
    severity: "warning",
    description: "Sections appear out of the canonical order defined by the spec",
  },
  {
    name: "unknown-key",
    severity: "warning",
    description: "A top-level YAML key looks like a typo of a known schema key (e.g. colours: → colors:)",
  },
];

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
export function getSpec(): SpecInfo {
  return {
    format: {
      layers: [
        "YAML front matter — Machine-readable design tokens (delimited by --- fences)",
        "Markdown body — Human-readable design rationale (organized into ## sections)",
      ],
      tokenSchema: [
        "version",
        "name",
        "description",
        "colors",
        "typography",
        "rounded",
        "spacing",
        "components",
      ],
      sectionOrder: [
        "Overview",
        "Colors",
        "Typography",
        "Layout",
        "Elevation & Depth",
        "Shapes",
        "Components",
        "Do's and Don'ts",
      ],
      tokenTypes: {
        Color: "Any CSS color (hex, rgb(), oklch(), named, etc.)",
        Dimension: "number + unit (px, em, rem)",
        "Token Reference": "{path.to.token}",
        Typography: "object with fontFamily, fontSize, fontWeight, lineHeight, letterSpacing",
      },
    },
    specUrl: "https://github.com/google-labs-code/design.md/blob/main/docs/spec.md",
    rules: LINT_RULES,
  };
}
