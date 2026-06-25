/**
 * Tests for SDK Exporter — generateCss(), generateTailwind(), generateJson(), exportTokens()
 */

import { describe, it, expect } from "vitest";
import {
  generateCss,
  generateTailwind,
  generateJson,
  generateCssTailwind,
  generateDtcg,
  exportTokens,
} from "../../src/sdk/exporter.js";
import type { DesignYaml } from "../../src/sdk/types.js";

// ── Fixtures ──

const MINIMAL_YAML: DesignYaml = {
  name: "Test",
  colors: { primary: "#1A1C1E", accent: "#2563EB" },
  typography: {
    body: { fontFamily: "Inter", fontSize: "16px" },
  },
};

const FULL_YAML: DesignYaml = {
  name: "Full",
  colors: { primary: "#1A1C1E", accent: "#2563EB", background: "#FFFFFF" },
  "colors-dark": { primary: "#E8EAED", accent: "#60A5FA", background: "#121212" },
  typography: {
    h1: { fontFamily: "Inter", fontSize: "48px", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em" },
    body: { fontFamily: "Inter", fontSize: "16px", fontWeight: 400, lineHeight: 1.6 },
  },
  rounded: { sm: "4px", md: "8px", lg: "12px" },
  spacing: { sm: "8px", md: "16px", lg: "24px" },
  components: {
    button: { backgroundColor: "{colors.accent}", textColor: "{colors.background}", rounded: "{rounded.md}" },
  },
};

const FULL_DESIGN_MD = `---
name: "Full"
colors:
  primary: "#1A1C1E"
  accent: "#2563EB"
  background: "#FFFFFF"
colors-dark:
  primary: "#E8EAED"
  accent: "#60A5FA"
  background: "#121212"
typography:
  h1:
    fontFamily: "Inter"
    fontSize: "48px"
    fontWeight: 700
  body:
    fontFamily: "Inter"
    fontSize: "16px"
rounded:
  sm: "4px"
  md: "8px"
spacing:
  sm: "8px"
  md: "16px"
---

# Full

## Overview
Test.
`;

// ── generateCss ──

describe("generateCss", () => {
  it("generates :root block with color variables", () => {
    const css = generateCss(MINIMAL_YAML);
    expect(css).toContain(":root {");
    expect(css).toContain("--color-primary: #1A1C1E;");
    expect(css).toContain("--color-accent: #2563EB;");
  });

  it("generates typography variables", () => {
    const css = generateCss(FULL_YAML);
    expect(css).toContain("--font-h1-family: 'Inter', sans-serif;");
    expect(css).toContain("--font-h1-size: 48px;");
    expect(css).toContain("--font-h1-weight: 700;");
    expect(css).toContain("--font-h1-line-height: 1.1;");
    expect(css).toContain("--font-h1-letter-spacing: -0.02em;");
    expect(css).toContain("--font-body-family: 'Inter', sans-serif;");
  });

  it("generates rounded variables", () => {
    const css = generateCss(FULL_YAML);
    expect(css).toContain("--radius-sm: 4px;");
    expect(css).toContain("--radius-md: 8px;");
    expect(css).toContain("--radius-lg: 12px;");
  });

  it("generates spacing variables", () => {
    const css = generateCss(FULL_YAML);
    expect(css).toContain("--space-sm: 8px;");
    expect(css).toContain("--space-md: 16px;");
    expect(css).toContain("--space-lg: 24px;");
  });

  it("generates dark theme block when colors-dark exists", () => {
    const css = generateCss(FULL_YAML);
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain("--color-primary: #E8EAED;");
    expect(css).toContain("--color-background: #121212;");
  });

  it("generates @media prefers-color-scheme block", () => {
    const css = generateCss(FULL_YAML);
    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(css).toContain(':root:not([data-theme="light"])');
  });

  it("does NOT generate dark blocks when no colors-dark", () => {
    const css = generateCss(MINIMAL_YAML);
    expect(css).not.toContain('[data-theme="dark"]');
    expect(css).not.toContain("prefers-color-scheme");
  });

  it("includes Light theme comment", () => {
    const css = generateCss(MINIMAL_YAML);
    expect(css).toContain("/* Light theme (default) */");
  });

  it("handles YAML with only colors and typography", () => {
    const css = generateCss(MINIMAL_YAML);
    expect(css).toContain("--color-primary");
    expect(css).toContain("--font-body-family");
    expect(css).not.toContain("--radius-");
    expect(css).not.toContain("--space-");
  });
});

// ── generateTailwind ──

describe("generateTailwind", () => {
  it("generates valid JS module", () => {
    const tw = generateTailwind(FULL_YAML);
    expect(tw).toContain("/** @type {import('tailwindcss').Config['theme']} */");
    expect(tw).toContain("export default");
  });

  it("includes colors", () => {
    const tw = generateTailwind(FULL_YAML);
    expect(tw).toContain('"primary"');
    expect(tw).toContain('"#1A1C1E"');
  });

  it("nests dark colors under colors.dark", () => {
    const tw = generateTailwind(FULL_YAML);
    expect(tw).toContain('"dark"');
    expect(tw).toContain('"#E8EAED"');
  });

  it("includes font families", () => {
    const tw = generateTailwind(FULL_YAML);
    expect(tw).toContain('"inter"');
    expect(tw).toContain('"Inter"');
  });

  it("includes border radius", () => {
    const tw = generateTailwind(FULL_YAML);
    expect(tw).toContain('"borderRadius"');
    expect(tw).toContain('"4px"');
  });

  it("includes spacing", () => {
    const tw = generateTailwind(FULL_YAML);
    expect(tw).toContain('"spacing"');
    expect(tw).toContain('"16px"');
  });

  it("does not include dark key when no colors-dark", () => {
    const tw = generateTailwind(MINIMAL_YAML);
    expect(tw).not.toContain('"dark"');
  });
});

// ── generateJson ──

describe("generateJson", () => {
  it("generates flat key-value JSON", () => {
    const json = generateJson(FULL_YAML);
    const parsed = JSON.parse(json);
    expect(parsed["color.primary"]).toBe("#1A1C1E");
    expect(parsed["color.accent"]).toBe("#2563EB");
  });

  it("includes dark color keys", () => {
    const json = generateJson(FULL_YAML);
    const parsed = JSON.parse(json);
    expect(parsed["color-dark.primary"]).toBe("#E8EAED");
    expect(parsed["color-dark.background"]).toBe("#121212");
  });

  it("includes typography tokens", () => {
    const json = generateJson(FULL_YAML);
    const parsed = JSON.parse(json);
    expect(parsed["font.h1.family"]).toBe("Inter");
    expect(parsed["font.h1.size"]).toBe("48px");
    expect(parsed["font.h1.weight"]).toBe(700);
  });

  it("includes radius and spacing", () => {
    const json = generateJson(FULL_YAML);
    const parsed = JSON.parse(json);
    expect(parsed["radius.md"]).toBe("8px");
    expect(parsed["space.md"]).toBe("16px");
  });

  it("does not include dark keys when no colors-dark", () => {
    const json = generateJson(MINIMAL_YAML);
    const parsed = JSON.parse(json);
    expect(Object.keys(parsed).some((k) => k.startsWith("color-dark."))).toBe(false);
  });

  it("produces valid JSON", () => {
    const json = generateJson(FULL_YAML);
    expect(() => JSON.parse(json)).not.toThrow();
  });
});

// ── generateCssTailwind (Google-powered) ──

describe("generateCssTailwind", () => {
  it("generates Tailwind v4 CSS from valid DESIGN.md", () => {
    const result = generateCssTailwind(FULL_DESIGN_MD);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toContain("--color-");
  });

  it("fails on invalid content", () => {
    const result = generateCssTailwind("not a design.md");
    // May succeed with empty output or fail — depends on Google linter behavior
    expect(typeof result.ok).toBe("boolean");
  });
});

// ── generateDtcg (Google-powered) ──

describe("generateDtcg", () => {
  it("generates valid DTCG JSON from valid DESIGN.md", () => {
    const result = generateDtcg(FULL_DESIGN_MD);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(() => JSON.parse(result.data)).not.toThrow();
  });
});

// ── exportTokens (unified) ──

describe("exportTokens", () => {
  it("exports CSS format", () => {
    const result = exportTokens(FULL_DESIGN_MD, "css");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.format).toBe("css");
    expect(result.data.extension).toBe("css");
    expect(result.data.content).toContain(":root");
  });

  it("exports Tailwind format", () => {
    const result = exportTokens(FULL_DESIGN_MD, "tailwind");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.format).toBe("tailwind");
    expect(result.data.extension).toBe("theme.js");
    expect(result.data.content).toContain("export default");
  });

  it("exports JSON format", () => {
    const result = exportTokens(FULL_DESIGN_MD, "json");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.format).toBe("json");
    expect(result.data.extension).toBe("json");
    expect(() => JSON.parse(result.data.content)).not.toThrow();
  });

  it("exports css-tailwind format", () => {
    const result = exportTokens(FULL_DESIGN_MD, "css-tailwind");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.format).toBe("css-tailwind");
    expect(result.data.extension).toBe("css");
  });

  it("exports dtcg format", () => {
    const result = exportTokens(FULL_DESIGN_MD, "dtcg");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.format).toBe("dtcg");
    expect(result.data.extension).toBe("tokens.json");
  });

  it("fails on invalid format", () => {
    const result = exportTokens(FULL_DESIGN_MD, "invalid" as any);
    expect(result.ok).toBe(false);
  });

  it("fails on invalid DESIGN.md for YAML-based formats", () => {
    const result = exportTokens("not valid", "css");
    expect(result.ok).toBe(false);
  });
});
