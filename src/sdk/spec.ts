/**
 * SDK Spec — DESIGN.md format specification data.
 *
 * Bundles the full DESIGN.md specification (from Google's design.md project)
 * so agents can access it programmatically without network requests.
 *
 * Pure data, no I/O. Useful for injecting spec context into agent prompts.
 */

import type { SpecInfo, LintRuleInfo } from "./types.js";

// ── Full specification text ──
// Source: https://github.com/google-labs-code/design.md/blob/main/docs/spec.md
// Last synced: 2026-06-25 (spec version: alpha)

const FULL_SPEC = `# DESIGN.md Format Specification

DESIGN.md is a self-contained, plain-text representation of a design system. It defines the visual identity of a brand and product, ensuring that stylistic choices can be followed across design sessions and between different AI agents and tools. As a human-readable, open-format document, it serves as a living source of truth that both humans and AI can understand and refine.

A DESIGN.md file contains two parts: An optional YAML frontmatter, and a markdown body. The YAML front matter contains machine-readable design tokens. The markdown body sections provide human-readable design rationale and guidance. Prose may use descriptive color names (e.g., "Midnight Forest Green") that correspond to systematic token names (e.g., \`primary\`). The tokens are the normative values; the prose provides context for how to apply them.

## Design Tokens

DESIGN.md may embed design tokens in a structured format. The system is inspired by the Design Token JSON spec (https://www.designtokens.org/). Specifically, it adopts the concept of typed token groups (colors, typography, spacing) and the \`{path.to.token}\` reference syntax for cross-referencing values.

These tokens are easily converted from or to \`tokens.json\`, Figma variables, and Tailwind theme configs.

Design tokens are embedded as YAML front matter at the beginning of the file. The front matter block must begin with a line containing exactly \`---\` and end with a line containing exactly \`---\`.

### Schema

\`\`\`yaml
version: <string>          # optional, current version: "alpha"
name: <string>
description: <string>      # optional
colors:
  <token-name>: <Color>
typography:
  <token-name>: <Typography>
rounded:
  <scale-level>: <Dimension>
spacing:
  <scale-level>: <Dimension | number>
components:
  <component-name>:
    <token-name>: <string | token reference>
\`\`\`

The \`<scale-level>\` placeholder represents a named level in a sizing or spacing scale. Common level names include \`xs\`, \`sm\`, \`md\`, \`lg\`, \`xl\`, and \`full\`. Any descriptive string key is valid.

### Token Types

**Color**: Any valid CSS color string. Supported formats:
- Hex: \`#RGB\`, \`#RGBA\`, \`#RRGGBB\`, \`#RRGGBBAA\`
- Named colors: \`red\`, \`cornflowerblue\`, \`transparent\`
- Functional: \`rgb()\`, \`rgba()\`, \`hsl()\`, \`hsla()\`, \`hwb()\`
- Wide-gamut: \`oklch()\`, \`oklab()\`, \`lch()\`, \`lab()\`
- Mixing: \`color-mix(in srgb, ...)\`

Hex notation (\`#RRGGBB\`) is the recommended default.

**Typography**: An object with these properties:
- \`fontFamily\` (string) — required
- \`fontSize\` (Dimension) — required
- \`fontWeight\` (number) — e.g., 400, 700
- \`lineHeight\` (Dimension | number) — unitless number is a multiplier of fontSize (recommended)
- \`letterSpacing\` (Dimension)
- \`fontFeature\` (string) — configures font-feature-settings
- \`fontVariation\` (string) — configures font-variation-settings

**Dimension**: A string with a unit suffix. Valid units: px, em, rem.

**Token Reference**: Wrapped in curly braces, contains an object path to another value in the YAML tree. Example: \`{colors.primary}\`, \`{rounded.md}\`. Within the \`components\` section, references to composite values (e.g., \`{typography.label-md}\`) are permitted.

## Sections

Every DESIGN.md follows the same structure. Sections can be omitted if not relevant, but those present must appear in this order. All sections use \`##\` headings.

### Section Order

1. **Overview** (also: "Brand & Style") — Brand personality, target audience, emotional response the UI should evoke
2. **Colors** — Color palettes and usage rules. At least \`primary\` must be defined
3. **Typography** — Typography levels (typically 9–15). Common categories: headline, display, body, label, caption
4. **Layout** (also: "Layout & Spacing") — Grid system, spacing strategy, containment rules
5. **Elevation & Depth** (also: "Elevation") — Shadow strategy or flat design alternatives
6. **Shapes** — Corner radius philosophy and shape language
7. **Components** — Component atom styles: buttons, chips, lists, tooltips, checkboxes, radio buttons, input fields
8. **Do's and Don'ts** — Practical guidelines and common pitfalls

### Section Details

**Colors section tokens**: \`map<string, Color>\` mapping token name to color value.
\`\`\`yaml
colors:
  primary: "#1A1C1E"
  secondary: "#6C7278"
  tertiary: "#B8422E"
  neutral: "#F7F5F2"
\`\`\`

**Typography section tokens**: \`map<string, Typography>\` mapping token name to typography object.
\`\`\`yaml
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
\`\`\`

**Spacing section tokens**: \`map<string, Dimension | number>\` mapping scale identifier to dimension or unitless number.
\`\`\`yaml
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
\`\`\`

**Rounded section tokens**: \`map<string, Dimension>\` for corner radii.
\`\`\`yaml
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
\`\`\`

**Components section tokens**: \`map<string, map<string, string>>\` mapping component name to sub-tokens. Values may be literals or token references.

Valid component properties: \`backgroundColor\`, \`textColor\`, \`typography\`, \`rounded\`, \`padding\`, \`size\`, \`height\`, \`width\`.

Variants (hover, active, pressed) are separate entries with related key names.
\`\`\`yaml
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.secondary}"
\`\`\`

## Recommended Token Names (Non-Normative)

**Colors:** primary, secondary, tertiary, neutral, surface, on-surface, error
**Typography:** headline-display, headline-lg, headline-md, body-lg, body-md, body-sm, label-lg, label-md, label-sm
**Rounded:** none, sm, md, lg, xl, full

## Consumer Behavior for Unknown Content

| Scenario | Behavior |
|----------|----------|
| Unknown section heading | Preserve; do not error |
| Unknown color token name | Accept if value is valid |
| Unknown typography token name | Accept as valid typography |
| Unknown spacing value | Accept; store as string if not a valid dimension |
| Unknown component property | Accept with warning |
| Duplicate section heading | Error; reject the file |
`;

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
    fullSpec: FULL_SPEC,
  };
}

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
export function getFullSpec(): string {
  return FULL_SPEC;
}
