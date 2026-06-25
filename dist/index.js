// src/sdk/parser.ts
import yaml from "js-yaml";
function parseDesignMd(content) {
  const fmRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = content.match(fmRegex);
  if (!match) {
    return {
      ok: false,
      error: "No valid YAML front matter found. Expected --- delimited block at the top of the file."
    };
  }
  const rawYaml = match[1];
  const markdown = match[2];
  try {
    const parsed = yaml.load(rawYaml);
    if (!parsed || typeof parsed !== "object") {
      return { ok: false, error: "YAML front matter parsed to a non-object value." };
    }
    return { ok: true, data: { yaml: parsed, markdown, rawYaml } };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `YAML parse error: ${message}` };
  }
}
function isValidHexColor(value) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}
function extractMarkdownSections(markdown) {
  const headingRegex = /^## (.+)$/gm;
  const sections = [];
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    sections.push(match[1].trim());
  }
  return sections;
}

// src/sdk/validator.ts
var CANONICAL_SECTIONS = [
  "Overview",
  "Colors",
  "Typography",
  "Layout",
  "Elevation & Depth",
  "Shapes",
  "Components",
  "Do's and Don'ts"
];
function finding(check, severity, passed, message) {
  return { check, severity, passed, message };
}
function validateYaml(yamlData) {
  const results = [];
  const hasName = typeof yamlData.name === "string" && yamlData.name.length > 0;
  results.push(
    finding(
      "name field",
      "error",
      hasName,
      hasName ? `name: "${yamlData.name}"` : "name field is missing or empty"
    )
  );
  const hasColors = yamlData.colors && typeof yamlData.colors === "object" && Object.keys(yamlData.colors).length > 0;
  results.push(
    finding(
      "colors section",
      "error",
      !!hasColors,
      hasColors ? `colors: ${Object.keys(yamlData.colors).length} tokens defined` : "colors section is missing or empty"
    )
  );
  if (hasColors) {
    for (const [key, value] of Object.entries(yamlData.colors)) {
      if (typeof value === "string" && !isValidHexColor(value)) {
        results.push(
          finding(
            `color "${key}"`,
            "error",
            false,
            `Invalid hex color: "${value}" (expected #RRGGBB)`
          )
        );
      }
    }
  }
  const hasTypography = yamlData.typography && typeof yamlData.typography === "object" && Object.keys(yamlData.typography).length > 0;
  results.push(
    finding(
      "typography section",
      "error",
      !!hasTypography,
      hasTypography ? `typography: ${Object.keys(yamlData.typography).length} levels defined` : "typography section is missing or empty"
    )
  );
  if (hasTypography) {
    for (const [key, entry] of Object.entries(yamlData.typography)) {
      if (!entry.fontFamily) {
        results.push(
          finding(
            `typography "${key}" fontFamily`,
            "error",
            false,
            `typography.${key} is missing fontFamily`
          )
        );
      }
      if (!entry.fontSize) {
        results.push(
          finding(
            `typography "${key}" fontSize`,
            "error",
            false,
            `typography.${key} is missing fontSize`
          )
        );
      }
    }
  }
  const spacingKeys = yamlData.spacing ? Object.keys(yamlData.spacing) : [];
  results.push(
    finding(
      "spacing section",
      "warning",
      spacingKeys.length > 0,
      spacingKeys.length > 0 ? `spacing: ${spacingKeys.length} levels defined` : "spacing section not defined (recommended)"
    )
  );
  const roundedKeys = yamlData.rounded ? Object.keys(yamlData.rounded) : [];
  results.push(
    finding(
      "rounded section",
      "warning",
      roundedKeys.length > 0,
      roundedKeys.length > 0 ? `rounded: ${roundedKeys.length} levels defined` : "rounded section not defined (recommended)"
    )
  );
  const componentKeys = yamlData.components ? Object.keys(yamlData.components) : [];
  results.push(
    finding(
      "components section",
      "warning",
      componentKeys.length > 0,
      componentKeys.length > 0 ? `components: ${componentKeys.length} defined` : "components section not defined (recommended)"
    )
  );
  const darkColors = yamlData["colors-dark"];
  if (darkColors && typeof darkColors === "object") {
    const darkKeys = Object.keys(darkColors);
    results.push(
      finding(
        "colors-dark section",
        "info",
        true,
        `colors-dark: ${darkKeys.length} dark mode overrides defined`
      )
    );
    for (const [key, value] of Object.entries(darkColors)) {
      if (typeof value === "string" && !isValidHexColor(value)) {
        results.push(
          finding(
            `colors-dark "${key}"`,
            "error",
            false,
            `Invalid hex color in colors-dark: "${value}" (expected #RRGGBB)`
          )
        );
      }
    }
    if (hasColors) {
      const lightKeys = new Set(Object.keys(yamlData.colors));
      for (const key of darkKeys) {
        if (!lightKeys.has(key)) {
          results.push(
            finding(
              `colors-dark "${key}" orphan`,
              "warning",
              false,
              `colors-dark.${key} has no matching colors.${key} in light theme`
            )
          );
        }
      }
      const darkKeySet = new Set(darkKeys);
      const missingDark = [...lightKeys].filter((k) => !darkKeySet.has(k));
      if (missingDark.length > 0) {
        results.push(
          finding(
            "colors-dark completeness",
            "warning",
            false,
            `Light tokens missing dark overrides: ${missingDark.join(", ")}`
          )
        );
      }
    }
  }
  return results;
}
function validateMarkdown(markdown) {
  const results = [];
  const sections = extractMarkdownSections(markdown);
  const seen = /* @__PURE__ */ new Set();
  for (const section of sections) {
    if (seen.has(section)) {
      results.push(
        finding(
          `duplicate section "${section}"`,
          "error",
          false,
          `Duplicate section heading: "## ${section}"`
        )
      );
    }
    seen.add(section);
  }
  const presentCount = CANONICAL_SECTIONS.filter((s) => sections.includes(s)).length;
  for (const section of CANONICAL_SECTIONS) {
    results.push(
      finding(
        `section "${section}"`,
        "warning",
        sections.includes(section),
        sections.includes(section) ? `"## ${section}" present` : `"## ${section}" not found (recommended)`
      )
    );
  }
  results.push(
    finding(
      "markdown sections",
      "warning",
      presentCount >= 4,
      `Markdown sections: ${presentCount}/${CANONICAL_SECTIONS.length} present`
    )
  );
  return results;
}
function validate(content) {
  const parsed = parseDesignMd(content);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const findings = [];
  findings.push(finding("YAML front matter", "error", true, "valid"));
  findings.push(...validateYaml(parsed.data.yaml));
  findings.push(...validateMarkdown(parsed.data.markdown));
  const errorCount = findings.filter((f) => !f.passed && f.severity === "error").length;
  const warningCount = findings.filter((f) => !f.passed && f.severity === "warning").length;
  return {
    ok: true,
    data: {
      findings,
      valid: errorCount === 0,
      errorCount,
      warningCount
    }
  };
}

// src/sdk/linter.ts
import { lint as googleLint } from "@google/design.md/linter";
function lint(content) {
  try {
    const report = googleLint(content);
    const findings = report.findings.map((f) => ({
      severity: f.severity,
      message: f.message,
      path: f.path
    }));
    const summary = {
      errors: report.summary.errors,
      warnings: report.summary.warnings,
      infos: report.summary.infos
    };
    const ds = report.designSystem;
    const designSystem = {
      name: ds.name ?? "",
      colors: ds.colors.size,
      typography: ds.typography.size,
      rounded: ds.rounded.size,
      spacing: ds.spacing.size,
      components: ds.components.size,
      sections: report.sections
    };
    return {
      ok: true,
      data: { findings, summary, designSystem, sections: report.sections }
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Lint failed: ${message}` };
  }
}
function lintRaw(content) {
  try {
    return { ok: true, data: googleLint(content) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Lint failed: ${message}` };
  }
}

// src/sdk/differ.ts
import { lint as googleLint2 } from "@google/design.md/linter";
function diffMaps(before, after) {
  const added = [];
  const removed = [];
  const modified = [];
  for (const key of after.keys()) {
    if (!before.has(key)) {
      added.push(key);
    } else {
      const bVal = JSON.stringify(before.get(key));
      const aVal = JSON.stringify(after.get(key));
      if (bVal !== aVal) {
        modified.push(key);
      }
    }
  }
  for (const key of before.keys()) {
    if (!after.has(key)) {
      removed.push(key);
    }
  }
  return { added, removed, modified };
}
function serializeComponents(components) {
  const result = /* @__PURE__ */ new Map();
  for (const [name, comp] of components) {
    result.set(name, Object.fromEntries(comp.properties));
  }
  return result;
}
function diff(beforeContent, afterContent) {
  try {
    const beforeReport = googleLint2(beforeContent);
    const afterReport = googleLint2(afterContent);
    const result = {
      tokens: {
        colors: diffMaps(beforeReport.designSystem.colors, afterReport.designSystem.colors),
        typography: diffMaps(beforeReport.designSystem.typography, afterReport.designSystem.typography),
        rounded: diffMaps(beforeReport.designSystem.rounded, afterReport.designSystem.rounded),
        spacing: diffMaps(beforeReport.designSystem.spacing, afterReport.designSystem.spacing),
        components: diffMaps(
          serializeComponents(beforeReport.designSystem.components),
          serializeComponents(afterReport.designSystem.components)
        )
      },
      findings: {
        before: beforeReport.summary,
        after: afterReport.summary,
        delta: {
          errors: afterReport.summary.errors - beforeReport.summary.errors,
          warnings: afterReport.summary.warnings - beforeReport.summary.warnings
        }
      },
      regression: afterReport.summary.errors > beforeReport.summary.errors || afterReport.summary.warnings > beforeReport.summary.warnings
    };
    return { ok: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Diff failed: ${message}` };
  }
}

// src/sdk/exporter.ts
import {
  lint as googleLint3,
  TailwindV4EmitterHandler,
  serializeTailwindV4,
  DtcgEmitterHandler
} from "@google/design.md/linter";
function generateCss(yaml3) {
  const lines = ["/* Light theme (default) */", ":root {"];
  if (yaml3.colors) {
    lines.push("  /* Colors */");
    for (const [key, value] of Object.entries(yaml3.colors)) {
      lines.push(`  --color-${key}: ${value};`);
    }
    lines.push("");
  }
  if (yaml3.typography) {
    lines.push("  /* Typography */");
    for (const [key, token] of Object.entries(yaml3.typography)) {
      lines.push(`  --font-${key}-family: '${token.fontFamily}', sans-serif;`);
      lines.push(`  --font-${key}-size: ${token.fontSize};`);
      if (token.fontWeight !== void 0) {
        lines.push(`  --font-${key}-weight: ${token.fontWeight};`);
      }
      if (token.lineHeight !== void 0) {
        lines.push(`  --font-${key}-line-height: ${token.lineHeight};`);
      }
      if (token.letterSpacing) {
        lines.push(`  --font-${key}-letter-spacing: ${token.letterSpacing};`);
      }
    }
    lines.push("");
  }
  if (yaml3.rounded) {
    lines.push("  /* Border Radius */");
    for (const [key, value] of Object.entries(yaml3.rounded)) {
      lines.push(`  --radius-${key}: ${value};`);
    }
    lines.push("");
  }
  if (yaml3.spacing) {
    lines.push("  /* Spacing */");
    for (const [key, value] of Object.entries(yaml3.spacing)) {
      lines.push(`  --space-${key}: ${value};`);
    }
    lines.push("");
  }
  lines.push("}");
  const darkColors = yaml3["colors-dark"];
  if (darkColors && Object.keys(darkColors).length > 0) {
    lines.push("");
    lines.push('/* Dark theme \u2014 activated via data-theme="dark" attribute */');
    lines.push('[data-theme="dark"] {');
    for (const [key, value] of Object.entries(darkColors)) {
      lines.push(`  --color-${key}: ${value};`);
    }
    lines.push("}");
    lines.push("");
    lines.push("/* Dark theme \u2014 auto-activated via OS preference */");
    lines.push("@media (prefers-color-scheme: dark) {");
    lines.push('  :root:not([data-theme="light"]) {');
    for (const [key, value] of Object.entries(darkColors)) {
      lines.push(`    --color-${key}: ${value};`);
    }
    lines.push("  }");
    lines.push("}");
  }
  return lines.join("\n") + "\n";
}
function generateTailwind(yaml3) {
  const theme = {};
  if (yaml3.colors) {
    const colors = { ...yaml3.colors };
    const darkColors = yaml3["colors-dark"];
    if (darkColors) {
      colors.dark = { ...darkColors };
    }
    theme.colors = colors;
  }
  if (yaml3.typography) {
    const fontFamily = {};
    const fontSize = {};
    const seenFamilies = /* @__PURE__ */ new Set();
    for (const [key, token] of Object.entries(yaml3.typography)) {
      if (!seenFamilies.has(token.fontFamily)) {
        const familyKey = token.fontFamily.toLowerCase().replace(/\s+/g, "-");
        fontFamily[familyKey] = [token.fontFamily, "sans-serif"];
        seenFamilies.add(token.fontFamily);
      }
      const meta = {};
      if (token.lineHeight !== void 0) meta.lineHeight = String(token.lineHeight);
      if (token.letterSpacing) meta.letterSpacing = token.letterSpacing;
      if (token.fontWeight !== void 0) meta.fontWeight = String(token.fontWeight);
      fontSize[key] = [token.fontSize, meta];
    }
    theme.fontFamily = fontFamily;
    theme.fontSize = fontSize;
  }
  if (yaml3.rounded) {
    theme.borderRadius = { ...yaml3.rounded };
  }
  if (yaml3.spacing) {
    theme.spacing = { ...yaml3.spacing };
  }
  return `/** @type {import('tailwindcss').Config['theme']} */
export default ${JSON.stringify(theme, null, 2)};
`;
}
function generateJson(yaml3) {
  const tokens = {};
  if (yaml3.colors) {
    for (const [key, value] of Object.entries(yaml3.colors)) {
      tokens[`color.${key}`] = value;
    }
  }
  const darkColors = yaml3["colors-dark"];
  if (darkColors) {
    for (const [key, value] of Object.entries(darkColors)) {
      tokens[`color-dark.${key}`] = value;
    }
  }
  if (yaml3.typography) {
    for (const [key, token] of Object.entries(yaml3.typography)) {
      tokens[`font.${key}.family`] = token.fontFamily;
      tokens[`font.${key}.size`] = token.fontSize;
      if (token.fontWeight !== void 0) tokens[`font.${key}.weight`] = token.fontWeight;
      if (token.lineHeight !== void 0) tokens[`font.${key}.lineHeight`] = token.lineHeight;
      if (token.letterSpacing) tokens[`font.${key}.letterSpacing`] = token.letterSpacing;
    }
  }
  if (yaml3.rounded) {
    for (const [key, value] of Object.entries(yaml3.rounded)) {
      tokens[`radius.${key}`] = value;
    }
  }
  if (yaml3.spacing) {
    for (const [key, value] of Object.entries(yaml3.spacing)) {
      tokens[`space.${key}`] = value;
    }
  }
  return JSON.stringify(tokens, null, 2) + "\n";
}
function generateCssTailwind(content) {
  try {
    const report = googleLint3(content);
    const handler = new TailwindV4EmitterHandler();
    const result = handler.execute(report.designSystem);
    if (!result.success) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true, data: serializeTailwindV4(result.data.theme) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
function generateDtcg(content) {
  try {
    const report = googleLint3(content);
    const handler = new DtcgEmitterHandler();
    const result = handler.execute(report.designSystem);
    if (!result.success) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true, data: JSON.stringify(result.data, null, 2) + "\n" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
var FORMAT_EXTENSIONS = {
  css: "css",
  tailwind: "theme.js",
  json: "json",
  "css-tailwind": "css",
  dtcg: "tokens.json"
};
function exportTokens(content, format) {
  const extension = FORMAT_EXTENSIONS[format];
  if (!extension) {
    return {
      ok: false,
      error: `Unknown format "${format}". Supported: ${Object.keys(FORMAT_EXTENSIONS).join(", ")}`
    };
  }
  if (format === "css-tailwind") {
    const result = generateCssTailwind(content);
    if (!result.ok) return result;
    return { ok: true, data: { content: result.data, format, extension } };
  }
  if (format === "dtcg") {
    const result = generateDtcg(content);
    if (!result.ok) return result;
    return { ok: true, data: { content: result.data, format, extension } };
  }
  const parsed = parseDesignMd(content);
  if (!parsed.ok) return parsed;
  const generators = {
    css: generateCss,
    tailwind: generateTailwind,
    json: generateJson
  };
  const generator = generators[format];
  if (!generator) {
    return { ok: false, error: `No generator for format "${format}"` };
  }
  try {
    const output = generator(parsed.data.yaml);
    return { ok: true, data: { content: output, format, extension } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// src/sdk/spec.ts
var FULL_SPEC = `# DESIGN.md Format Specification

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
- \`fontFamily\` (string) \u2014 required
- \`fontSize\` (Dimension) \u2014 required
- \`fontWeight\` (number) \u2014 e.g., 400, 700
- \`lineHeight\` (Dimension | number) \u2014 unitless number is a multiplier of fontSize (recommended)
- \`letterSpacing\` (Dimension)
- \`fontFeature\` (string) \u2014 configures font-feature-settings
- \`fontVariation\` (string) \u2014 configures font-variation-settings

**Dimension**: A string with a unit suffix. Valid units: px, em, rem.

**Token Reference**: Wrapped in curly braces, contains an object path to another value in the YAML tree. Example: \`{colors.primary}\`, \`{rounded.md}\`. Within the \`components\` section, references to composite values (e.g., \`{typography.label-md}\`) are permitted.

## Sections

Every DESIGN.md follows the same structure. Sections can be omitted if not relevant, but those present must appear in this order. All sections use \`##\` headings.

### Section Order

1. **Overview** (also: "Brand & Style") \u2014 Brand personality, target audience, emotional response the UI should evoke
2. **Colors** \u2014 Color palettes and usage rules. At least \`primary\` must be defined
3. **Typography** \u2014 Typography levels (typically 9\u201315). Common categories: headline, display, body, label, caption
4. **Layout** (also: "Layout & Spacing") \u2014 Grid system, spacing strategy, containment rules
5. **Elevation & Depth** (also: "Elevation") \u2014 Shadow strategy or flat design alternatives
6. **Shapes** \u2014 Corner radius philosophy and shape language
7. **Components** \u2014 Component atom styles: buttons, chips, lists, tooltips, checkboxes, radio buttons, input fields
8. **Do's and Don'ts** \u2014 Practical guidelines and common pitfalls

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
var LINT_RULES = [
  {
    name: "broken-ref",
    severity: "error",
    description: "Token references ({colors.primary}) that don't resolve to any defined token"
  },
  {
    name: "missing-primary",
    severity: "warning",
    description: "Colors are defined but no primary color exists \u2014 agents will auto-generate one"
  },
  {
    name: "contrast-ratio",
    severity: "warning",
    description: "Component backgroundColor/textColor pairs below WCAG AA minimum (4.5:1)"
  },
  {
    name: "orphaned-tokens",
    severity: "warning",
    description: "Color tokens defined but never referenced by any component"
  },
  {
    name: "token-summary",
    severity: "info",
    description: "Summary of how many tokens are defined in each section"
  },
  {
    name: "missing-sections",
    severity: "info",
    description: "Optional sections (spacing, rounded) absent when other tokens exist"
  },
  {
    name: "missing-typography",
    severity: "warning",
    description: "Colors are defined but no typography tokens exist \u2014 agents will use default fonts"
  },
  {
    name: "section-order",
    severity: "warning",
    description: "Sections appear out of the canonical order defined by the spec"
  },
  {
    name: "unknown-key",
    severity: "warning",
    description: "A top-level YAML key looks like a typo of a known schema key (e.g. colours: \u2192 colors:)"
  }
];
function getSpec() {
  return {
    format: {
      layers: [
        "YAML front matter \u2014 Machine-readable design tokens (delimited by --- fences)",
        "Markdown body \u2014 Human-readable design rationale (organized into ## sections)"
      ],
      tokenSchema: [
        "version",
        "name",
        "description",
        "colors",
        "typography",
        "rounded",
        "spacing",
        "components"
      ],
      sectionOrder: [
        "Overview",
        "Colors",
        "Typography",
        "Layout",
        "Elevation & Depth",
        "Shapes",
        "Components",
        "Do's and Don'ts"
      ],
      tokenTypes: {
        Color: "Any CSS color (hex, rgb(), oklch(), named, etc.)",
        Dimension: "number + unit (px, em, rem)",
        "Token Reference": "{path.to.token}",
        Typography: "object with fontFamily, fontSize, fontWeight, lineHeight, letterSpacing"
      }
    },
    specUrl: "https://github.com/google-labs-code/design.md/blob/main/docs/spec.md",
    rules: LINT_RULES,
    fullSpec: FULL_SPEC
  };
}
function getFullSpec() {
  return FULL_SPEC;
}

// src/systems/modern-minimal.ts
var MODERN_MINIMAL_DESIGN_MD = `---
version: alpha
name: "Modern Minimal"
description: "Clean, product-oriented design system for SaaS tools, dashboards, and utility pages."

colors:
  primary: "#1A1C1E"
  secondary: "#6C7278"
  accent: "#2563EB"
  background: "#FFFFFF"
  surface: "#F8FAFC"
  border: "#E2E8F0"
  success: "#16A34A"
  warning: "#EAB308"
  error: "#DC2626"

colors-dark:
  primary: "#E8EAED"
  secondary: "#9AA0A6"
  accent: "#60A5FA"
  background: "#121212"
  surface: "#1E1E1E"
  border: "#333333"
  success: "#4ADE80"
  warning: "#FACC15"
  error: "#F87171"

typography:
  h1:
    fontFamily: "Inter"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  h2:
    fontFamily: "Inter"
    fontSize: "36px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  h3:
    fontFamily: "Inter"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.3
  h4:
    fontFamily: "Inter"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Inter"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4

rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"

components:
  button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
---

# Modern Minimal

## Overview

Modern Minimal is a clean, product-oriented design system built for SaaS tools, dashboards, and utility pages. It emphasizes clarity, whitespace, and functional hierarchy. The visual language is restrained \u2014 every element earns its place.

**Mood:** Professional, focused, trustworthy, modern.
**Best for:** SaaS products, admin dashboards, developer tools, analytics platforms.

## Colors

The palette is intentionally narrow. A near-black primary anchors all text and key UI elements. The accent blue is used sparingly \u2014 only for interactive elements and primary actions.

- **Primary (#1A1C1E):** Headlines, body text, primary buttons.
- **Secondary (#6C7278):** Supporting text, labels, metadata.
- **Accent (#2563EB):** Links, primary CTAs, active states, focus rings.
- **Background (#FFFFFF):** Page background.
- **Surface (#F8FAFC):** Cards, panels, elevated containers.
- **Border (#E2E8F0):** Dividers, input borders, table lines.
- **Success/Warning/Error:** Semantic feedback only \u2014 never decorative.

## Typography

Inter is the sole typeface. The type scale uses a modular ratio with tight letter-spacing on headings for a modern feel. Body text is set at 16px with generous line-height for readability.

- Headlines: Bold weight, tight tracking, clear hierarchy from H1 (48px) down to H4 (20px).
- Body: Regular weight, 1.6 line-height for comfortable reading.
- Small/Caption: Used for metadata, timestamps, and secondary information.

## Layout

Use an 8px grid. All spacing values are multiples of 4px. Content areas max out at 1200px with generous side padding (24\u201348px). Cards and sections use consistent internal padding (24px).

- **Page margins:** 24px (mobile), 48px (desktop).
- **Section gaps:** 48px between major sections, 24px between related groups.
- **Card padding:** 24px uniform.

## Elevation & Depth

Minimal shadow usage. Depth is communicated through background color shifts (white \u2192 surface gray) rather than heavy shadows.

- **Level 0:** No shadow (flat on background).
- **Level 1:** \`0 1px 3px rgba(0,0,0,0.08)\` \u2014 cards, dropdowns.
- **Level 2:** \`0 4px 12px rgba(0,0,0,0.10)\` \u2014 modals, popovers.

## Shapes

Rounded corners are moderate. Buttons and inputs use 8px radius. Cards use 12px. Avatars and badges use full rounding.

## Components

### Buttons
- **Primary:** Solid background (#1A1C1E), white text, 8px radius, 12px 24px padding.
- **Secondary:** Outlined with border, transparent background.
- **Ghost:** No border, no background, text-only with hover state.
- **Disabled:** 50% opacity, no pointer events.

### Cards
- White background, 12px radius, subtle border or Level 1 shadow.
- Consistent 24px internal padding.

### Inputs
- White background, 1px border (#E2E8F0), 8px radius.
- Focus state: 2px accent ring.
- Error state: red border + error message below.

### Tables
- Clean horizontal lines only. No zebra striping.
- Header row: medium weight, secondary color.

## Do's and Don'ts

**Do:**
- Use whitespace generously \u2014 let content breathe.
- Maintain consistent spacing using the 8px grid.
- Use the accent color only for interactive elements.
- Keep text hierarchy clear: one H1 per page, logical heading order.

**Don't:**
- Don't use more than 2 font weights on a single screen.
- Don't add decorative gradients or patterns.
- Don't use colored backgrounds for content sections.
- Don't center-align body text.
- Don't use shadows heavier than Level 2.
`;

// src/systems/corporate-clean.ts
var CORPORATE_CLEAN_DESIGN_MD = `---
version: alpha
name: "Corporate Clean"
description: "Professional, trustworthy design system for enterprise and B2B platforms."

colors:
  primary: "#0F172A"
  secondary: "#475569"
  accent: "#0369A1"
  background: "#FFFFFF"
  surface: "#F1F5F9"
  border: "#CBD5E1"
  success: "#15803D"
  warning: "#CA8A04"
  error: "#B91C1C"

colors-dark:
  primary: "#F1F5F9"
  secondary: "#94A3B8"
  accent: "#38BDF8"
  background: "#0F172A"
  surface: "#1E293B"
  border: "#334155"
  success: "#4ADE80"
  warning: "#FDE047"
  error: "#FCA5A5"

typography:
  h1:
    fontFamily: "Source Sans Pro"
    fontSize: "42px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  h2:
    fontFamily: "Source Sans Pro"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.25
  h3:
    fontFamily: "Source Sans Pro"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.3
  h4:
    fontFamily: "Source Sans Pro"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Source Sans Pro"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Source Sans Pro"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Source Sans Pro"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4

rounded:
  sm: "2px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"

components:
  button:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
---

# Corporate Clean

## Overview

Corporate Clean is a professional, trustworthy design system built for enterprise software, B2B platforms, and internal tools. It prioritizes readability, information density, and a sense of reliability. The visual language is structured and predictable.

**Mood:** Authoritative, reliable, structured, professional.
**Best for:** Enterprise dashboards, B2B SaaS, internal tools, financial platforms.

## Colors

The palette is conservative and high-contrast. A deep navy primary conveys authority. The accent blue is institutional \u2014 trustworthy without being playful.

- **Primary (#0F172A):** Headlines, navigation, key UI anchors.
- **Secondary (#475569):** Body text, descriptions, secondary labels.
- **Accent (#0369A1):** Primary actions, links, active navigation.
- **Background (#FFFFFF):** Page background.
- **Surface (#F1F5F9):** Sidebar backgrounds, table headers, section fills.
- **Border (#CBD5E1):** Dividers, input borders, card outlines.
- **Semantic colors:** Success (green), Warning (amber), Error (red) \u2014 used strictly for status indicators.

## Typography

Source Sans Pro provides excellent readability at all sizes. The type scale is tighter than consumer products \u2014 optimized for information-dense interfaces.

- Headlines: Bold weight, moderate tracking. H1 at 42px for page titles.
- Body: Regular weight at 16px. Comfortable for long-form reading.
- Small/Caption: Used for table data, timestamps, and metadata.

## Layout

Use a 4px base grid with 8px increments for spacing. Content areas are wider (up to 1400px) to accommodate data-heavy layouts. Sidebars are 240\u2013280px.

- **Page margins:** 24px (mobile), 32px (desktop).
- **Section gaps:** 32px between major sections.
- **Card padding:** 24px uniform.
- **Table cell padding:** 12px 16px.

## Elevation & Depth

Shadows are subtle and functional. Depth is primarily communicated through borders and background color changes.

- **Level 0:** No shadow, 1px border for definition.
- **Level 1:** \`0 1px 2px rgba(0,0,0,0.06)\` \u2014 cards, dropdowns.
- **Level 2:** \`0 4px 8px rgba(0,0,0,0.08)\` \u2014 modals, dialogs.

## Shapes

Corner radii are conservative. Buttons and inputs use 6px. Cards use 8px. Avoid fully rounded elements except for avatars and status badges.

## Components

### Buttons
- **Primary:** Solid accent blue (#0369A1), white text, 6px radius.
- **Secondary:** White background, 1px border, accent text.
- **Danger:** Red background for destructive actions.
- **Disabled:** Reduced opacity, cursor not-allowed.

### Cards
- White background, 1px border (#CBD5E1), 8px radius.
- Optional header with surface background.

### Inputs
- White background, 1px border, 6px radius.
- Focus: 2px accent ring.
- Labels above inputs, not floating.

### Tables
- Bordered header row with surface background.
- Alternating row colors optional for dense data.
- Sortable columns indicated with chevron icons.

### Navigation
- Vertical sidebar with icon + label items.
- Active state: accent background tint + bold text.
- Collapsible to icon-only mode.

## Do's and Don'ts

**Do:**
- Use consistent alignment \u2014 left-align text and data.
- Provide clear visual hierarchy with heading levels.
- Use borders to separate sections in dense layouts.
- Include breadcrumbs for deep navigation.

**Don't:**
- Don't use playful illustrations or decorative elements.
- Don't use more than 3 levels of nesting in navigation.
- Don't use rounded-full on buttons or cards.
- Don't use light font weights for body text.
- Don't hide critical actions behind hover states.
`;

// src/systems/bold-creative.ts
var BOLD_CREATIVE_DESIGN_MD = `---
version: alpha
name: "Bold Creative"
description: "Vibrant, expressive design system for marketing sites, portfolios, and creative agencies."

colors:
  primary: "#1E0A3C"
  secondary: "#6F7287"
  accent: "#F05537"
  background: "#FFFDF9"
  surface: "#FFF5EE"
  border: "#E8DDD3"
  success: "#22C55E"
  warning: "#F59E0B"
  error: "#EF4444"

colors-dark:
  primary: "#F5F0FF"
  secondary: "#A8A3B3"
  accent: "#FF7A5C"
  background: "#1A0E2E"
  surface: "#2D1B4E"
  border: "#3D2B5A"
  success: "#4ADE80"
  warning: "#FBBF24"
  error: "#FB7185"

typography:
  h1:
    fontFamily: "Sora"
    fontSize: "56px"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  h2:
    fontFamily: "Sora"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  h3:
    fontFamily: "Sora"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.25
  h4:
    fontFamily: "Sora"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "DM Sans"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.7
  small:
    fontFamily: "DM Sans"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "DM Sans"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4

rounded:
  sm: "6px"
  md: "12px"
  lg: "20px"
  xl: "28px"
  full: "9999px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"

components:
  button:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: "14px 32px"
  card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "32px"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
---

# Bold Creative

## Overview

Bold Creative is a vibrant, expressive design system built for marketing sites, portfolios, and creative agencies. It uses warm tones, generous spacing, and confident typography to create memorable experiences. Every screen should feel intentional and alive.

**Mood:** Energetic, confident, warm, memorable.
**Best for:** Marketing sites, portfolios, creative agencies, event pages, product launches.

## Colors

The palette is warm and high-contrast. A deep purple primary grounds the design while the coral accent (#F05537) creates energy and draws attention to key actions.

- **Primary (#1E0A3C):** Headlines, hero text, navigation.
- **Secondary (#6F7287):** Body text, descriptions, metadata.
- **Accent (#F05537):** CTAs, highlights, hover states, decorative elements.
- **Background (#FFFDF9):** Warm off-white page background.
- **Surface (#FFF5EE):** Feature sections, testimonial cards, highlighted areas.
- **Border (#E8DDD3):** Subtle warm dividers.

## Typography

Sora for headlines \u2014 geometric, modern, and bold. DM Sans for body \u2014 clean and highly readable. The contrast between the two creates visual interest.

- Headlines: Extra-bold weight, very tight tracking (-0.03em on H1). Large sizes create impact.
- Body: Regular weight at 17px with generous 1.7 line-height for a relaxed reading experience.
- The font pairing creates a clear distinction between display and reading text.

## Layout

Use generous spacing. Sections breathe with 64px+ gaps. Content areas max at 1100px for focused reading. Hero sections can be full-width.

- **Page margins:** 24px (mobile), 64px (desktop).
- **Section gaps:** 64px between major sections, 40px between related groups.
- **Card padding:** 32px uniform.
- **Hero sections:** Full viewport height or near it.

## Elevation & Depth

Use a mix of subtle shadows and background color shifts. Accent-colored shadows add personality.

- **Level 0:** No shadow.
- **Level 1:** \`0 2px 8px rgba(30,10,60,0.06)\` \u2014 cards.
- **Level 2:** \`0 8px 24px rgba(30,10,60,0.10)\` \u2014 modals, featured cards.
- **Accent glow:** \`0 4px 16px rgba(240,85,55,0.20)\` \u2014 hover on accent buttons.

## Shapes

Generous corner radii. Buttons use full rounding (pill shape). Cards use 20px. Inputs use 12px. The rounded shapes reinforce the friendly, approachable mood.

## Components

### Buttons
- **Primary:** Coral accent (#F05537), white text, pill shape (full rounding), 14px 32px padding.
- **Secondary:** Outlined with accent border, transparent background.
- **Ghost:** Text-only with underline on hover.
- **Hover:** Slight scale-up (1.02) + accent glow shadow.

### Cards
- Warm off-white background, 20px radius, generous 32px padding.
- Feature cards may use surface background (#FFF5EE).
- Hover: subtle lift with increased shadow.

### Inputs
- White background, warm border, 12px radius.
- Focus: 2px accent ring with glow.
- Placeholder text in secondary color.

### Hero Sections
- Full-width, generous vertical padding (120px+).
- Large H1 with tight tracking.
- Single clear CTA button.
- Optional decorative shapes or gradients.

## Do's and Don'ts

**Do:**
- Use bold, confident headlines \u2014 don't be shy with size.
- Let sections breathe with generous spacing.
- Use the accent color to create clear focal points.
- Add subtle hover animations (scale, shadow) for interactivity.
- Use real photography or bold illustrations.

**Don't:**
- Don't use more than 2 accent colors.
- Don't crowd content \u2014 whitespace is a feature.
- Don't use thin font weights for headlines.
- Don't use sharp corners (less than 6px radius).
- Don't use generic stock photography.
- Don't center-align paragraphs longer than 3 lines.
`;

// src/sdk/systems.ts
var BUILTIN_SYSTEMS = [
  {
    meta: {
      id: "modern-minimal",
      name: "Modern Minimal",
      category: "Starter",
      description: "Clean, product-oriented. SaaS tools, dashboards.",
      builtin: true
    },
    content: MODERN_MINIMAL_DESIGN_MD
  },
  {
    meta: {
      id: "corporate-clean",
      name: "Corporate Clean",
      category: "Professional",
      description: "Professional, trustworthy. Enterprise, B2B.",
      builtin: true
    },
    content: CORPORATE_CLEAN_DESIGN_MD
  },
  {
    meta: {
      id: "bold-creative",
      name: "Bold Creative",
      category: "Expressive",
      description: "Vibrant, expressive. Marketing, portfolios.",
      builtin: true
    },
    content: BOLD_CREATIVE_DESIGN_MD
  }
];
function listBuiltinSystems() {
  return BUILTIN_SYSTEMS.map((s) => s.meta);
}
function getBuiltinSystemContent(id) {
  const system = BUILTIN_SYSTEMS.find((s) => s.meta.id === id);
  return system?.content ?? null;
}
function getBuiltinSystemMeta(id) {
  const system = BUILTIN_SYSTEMS.find((s) => s.meta.id === id);
  return system?.meta ?? null;
}

// src/constants.ts
import path from "path";
import os from "os";
var DESIGNS_DIR = ".designs";
var DESIGN_MD = "DESIGN.md";
var PROJECT_JSON = "project.json";
var SKILL_MD = "SKILL.md";
var SKILL_FOLDER_NAME = "cs-design";
var SKILLS_DIR = ".codestudio/skills";
var SCREENS_DIR = "screens";
var DEFAULT_SYSTEM = "modern-minimal";
var GLOBAL_DIR_NAME = ".cs-design";
var ENV_HOME = "CS_DESIGN_HOME";
function getGlobalDir() {
  return process.env[ENV_HOME] || path.join(os.homedir(), GLOBAL_DIR_NAME);
}
function getGlobalSystemsDir() {
  return path.join(getGlobalDir(), "systems");
}
function getDesignsDir(basePath = process.cwd()) {
  return path.join(basePath, DESIGNS_DIR);
}
function getSkillDir(basePath = process.cwd()) {
  return path.join(basePath, SKILLS_DIR, SKILL_FOLDER_NAME);
}

// src/utils.ts
import fs from "fs-extra";
import path2 from "path";
import yaml2 from "js-yaml";
import chalk from "chalk";
function parseDesignMd2(content) {
  const fmRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = content.match(fmRegex);
  if (!match) return null;
  const rawYaml = match[1];
  const markdown = match[2];
  try {
    const parsed = yaml2.load(rawYaml);
    if (!parsed || typeof parsed !== "object") return null;
    return { yaml: parsed, markdown, rawYaml };
  } catch {
    return null;
  }
}
async function readDesignMd(filePath) {
  if (!await fs.pathExists(filePath)) return null;
  const content = await fs.readFile(filePath, "utf-8");
  return parseDesignMd2(content);
}
async function requireProject(basePath = process.cwd()) {
  const designsDir = getDesignsDir(basePath);
  if (!await fs.pathExists(designsDir)) {
    throw new Error(
      `No ${DESIGNS_DIR}/ directory found. Run ${chalk.cyan("cs-design init")} first.`
    );
  }
  return designsDir;
}
async function readProjectJson(designsDir) {
  const projectPath = path2.join(designsDir, PROJECT_JSON);
  if (!await fs.pathExists(projectPath)) return null;
  return fs.readJson(projectPath);
}
async function readProjectDesignMd(designsDir) {
  const designPath = path2.join(designsDir, DESIGN_MD);
  return readDesignMd(designPath);
}

// src/systems/index.ts
import fs2 from "fs-extra";
import path3 from "path";
var BUILTIN_SYSTEMS2 = [
  {
    meta: {
      id: "modern-minimal",
      name: "Modern Minimal",
      category: "Starter",
      description: "Clean, product-oriented. SaaS tools, dashboards.",
      builtin: true
    },
    content: MODERN_MINIMAL_DESIGN_MD
  },
  {
    meta: {
      id: "corporate-clean",
      name: "Corporate Clean",
      category: "Professional",
      description: "Professional, trustworthy. Enterprise, B2B.",
      builtin: true
    },
    content: CORPORATE_CLEAN_DESIGN_MD
  },
  {
    meta: {
      id: "bold-creative",
      name: "Bold Creative",
      category: "Expressive",
      description: "Vibrant, expressive. Marketing, portfolios.",
      builtin: true
    },
    content: BOLD_CREATIVE_DESIGN_MD
  }
];
function getBuiltinSystems() {
  return BUILTIN_SYSTEMS2.map((s) => s.meta);
}
function getBuiltinSystem(id) {
  return BUILTIN_SYSTEMS2.find((s) => s.meta.id === id);
}
async function getInstalledSystems() {
  const systemsDir = getGlobalSystemsDir();
  if (!await fs2.pathExists(systemsDir)) return [];
  const entries = await fs2.readdir(systemsDir, { withFileTypes: true });
  const systems = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const designPath = path3.join(systemsDir, entry.name, DESIGN_MD);
    if (await fs2.pathExists(designPath)) {
      systems.push({
        id: entry.name,
        name: entry.name,
        category: "Installed",
        description: "User-installed design system",
        builtin: false
      });
    }
  }
  return systems;
}
async function resolveSystem(id) {
  const builtin = getBuiltinSystem(id);
  if (builtin) return builtin.content;
  const installedPath = path3.join(getGlobalSystemsDir(), id, DESIGN_MD);
  if (await fs2.pathExists(installedPath)) {
    return fs2.readFile(installedPath, "utf-8");
  }
  return null;
}
async function getAllSystems() {
  const builtin = getBuiltinSystems();
  const installed = await getInstalledSystems();
  return [...builtin, ...installed];
}
export {
  CANONICAL_SECTIONS,
  DEFAULT_SYSTEM,
  DESIGNS_DIR,
  DESIGN_MD,
  LINT_RULES,
  PROJECT_JSON,
  SCREENS_DIR,
  SKILLS_DIR,
  SKILL_FOLDER_NAME,
  SKILL_MD,
  diff,
  exportTokens,
  extractMarkdownSections,
  generateCss,
  generateCssTailwind,
  generateDtcg,
  generateJson,
  generateTailwind,
  getAllSystems,
  getBuiltinSystem,
  getBuiltinSystemContent,
  getBuiltinSystemMeta,
  getBuiltinSystems,
  getDesignsDir,
  getFullSpec,
  getGlobalDir,
  getGlobalSystemsDir,
  getInstalledSystems,
  getSkillDir,
  getSpec,
  isValidHexColor,
  lint,
  lintRaw,
  listBuiltinSystems,
  parseDesignMd,
  readDesignMd,
  readProjectDesignMd,
  readProjectJson,
  requireProject,
  resolveSystem,
  validate
};
//# sourceMappingURL=index.js.map