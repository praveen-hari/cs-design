/**
 * Tests for SDK Parser — parseDesignMd(), isValidHexColor(), extractMarkdownSections()
 */

import { describe, it, expect } from "vitest";
import { parseDesignMd, isValidHexColor, extractMarkdownSections } from "../../src/sdk/parser.js";

// ── Test fixtures ──

const VALID_DESIGN_MD = `---
name: "Test System"
colors:
  primary: "#1A1C1E"
  accent: "#2563EB"
typography:
  h1:
    fontFamily: "Inter"
    fontSize: "48px"
  body:
    fontFamily: "Inter"
    fontSize: "16px"
---

# Test System

## Overview
A test design system.

## Colors
Primary and accent colors.
`;

const MINIMAL_DESIGN_MD = `---
name: "Minimal"
colors:
  primary: "#000000"
typography:
  body:
    fontFamily: "Arial"
    fontSize: "16px"
---
`;

const FULL_DESIGN_MD = `---
version: alpha
name: "Full System"
description: "A complete design system"
colors:
  primary: "#1A1C1E"
  secondary: "#6C7278"
  accent: "#2563EB"
  background: "#FFFFFF"
  surface: "#F8FAFC"
  border: "#E2E8F0"
colors-dark:
  primary: "#E8EAED"
  secondary: "#9AA0A6"
  accent: "#60A5FA"
  background: "#121212"
  surface: "#1E1E1E"
  border: "#333333"
typography:
  h1:
    fontFamily: "Inter"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
---

# Full System

## Overview
Complete design system for testing.

## Colors
Full color palette.

## Typography
Type hierarchy.
`;

// ── parseDesignMd ──

describe("parseDesignMd", () => {
  it("parses valid DESIGN.md with YAML and markdown", () => {
    const result = parseDesignMd(VALID_DESIGN_MD);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.yaml.name).toBe("Test System");
    expect(result.data.yaml.colors.primary).toBe("#1A1C1E");
    expect(result.data.yaml.colors.accent).toBe("#2563EB");
    expect(result.data.yaml.typography.h1.fontFamily).toBe("Inter");
    expect(result.data.yaml.typography.h1.fontSize).toBe("48px");
    expect(result.data.markdown).toContain("## Overview");
    expect(result.data.markdown).toContain("## Colors");
    expect(result.data.rawYaml).toContain("name:");
  });

  it("parses minimal DESIGN.md", () => {
    const result = parseDesignMd(MINIMAL_DESIGN_MD);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.yaml.name).toBe("Minimal");
    expect(result.data.yaml.colors.primary).toBe("#000000");
    expect(result.data.markdown).toBe("");
  });

  it("parses full DESIGN.md with all sections", () => {
    const result = parseDesignMd(FULL_DESIGN_MD);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.yaml.version).toBe("alpha");
    expect(result.data.yaml.description).toBe("A complete design system");
    expect(result.data.yaml.rounded?.sm).toBe("4px");
    expect(result.data.yaml.spacing?.md).toBe("16px");
    expect(result.data.yaml.components?.button.backgroundColor).toBe("{colors.accent}");
  });

  it("parses colors-dark section", () => {
    const result = parseDesignMd(FULL_DESIGN_MD);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const dark = result.data.yaml["colors-dark"];
    expect(dark).toBeDefined();
    expect(dark?.primary).toBe("#E8EAED");
    expect(dark?.background).toBe("#121212");
  });

  it("fails on empty string", () => {
    const result = parseDesignMd("");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("No valid YAML front matter");
  });

  it("fails on content without front matter", () => {
    const result = parseDesignMd("# Just a heading\n\nSome text.");
    expect(result.ok).toBe(false);
  });

  it("fails on malformed YAML", () => {
    const result = parseDesignMd("---\n: invalid: yaml: [broken\n---\n");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("YAML parse error");
  });

  it("fails on YAML that parses to a scalar", () => {
    const result = parseDesignMd("---\njust a string\n---\n");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("non-object");
  });

  it("handles Windows line endings (CRLF)", () => {
    const content = "---\r\nname: \"CRLF Test\"\r\ncolors:\r\n  primary: \"#000000\"\r\ntypography:\r\n  body:\r\n    fontFamily: \"Arial\"\r\n    fontSize: \"16px\"\r\n---\r\n\r\n## Overview\r\n";
    const result = parseDesignMd(content);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.yaml.name).toBe("CRLF Test");
  });

  it("handles missing closing --- delimiter", () => {
    const result = parseDesignMd("---\nname: test\ncolors:\n  primary: '#000'\n");
    expect(result.ok).toBe(false);
  });
});

// ── isValidHexColor ──

describe("isValidHexColor", () => {
  it("accepts valid 6-digit hex colors", () => {
    expect(isValidHexColor("#000000")).toBe(true);
    expect(isValidHexColor("#FFFFFF")).toBe(true);
    expect(isValidHexColor("#1A1C1E")).toBe(true);
    expect(isValidHexColor("#2563EB")).toBe(true);
    expect(isValidHexColor("#abcdef")).toBe(true);
    expect(isValidHexColor("#ABCDEF")).toBe(true);
  });

  it("rejects 3-digit hex colors", () => {
    expect(isValidHexColor("#000")).toBe(false);
    expect(isValidHexColor("#FFF")).toBe(false);
  });

  it("rejects 8-digit hex colors (with alpha)", () => {
    expect(isValidHexColor("#000000FF")).toBe(false);
  });

  it("rejects colors without hash", () => {
    expect(isValidHexColor("000000")).toBe(false);
    expect(isValidHexColor("FFFFFF")).toBe(false);
  });

  it("rejects invalid hex characters", () => {
    expect(isValidHexColor("#GGGGGG")).toBe(false);
    expect(isValidHexColor("#ZZZZZZ")).toBe(false);
  });

  it("rejects named colors", () => {
    expect(isValidHexColor("red")).toBe(false);
    expect(isValidHexColor("blue")).toBe(false);
  });

  it("rejects rgb() format", () => {
    expect(isValidHexColor("rgb(0,0,0)")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidHexColor("")).toBe(false);
  });
});

// ── extractMarkdownSections ──

describe("extractMarkdownSections", () => {
  it("extracts H2 headings", () => {
    const md = "## Overview\nText\n## Colors\nMore text\n## Typography\n";
    expect(extractMarkdownSections(md)).toEqual(["Overview", "Colors", "Typography"]);
  });

  it("returns empty array for no headings", () => {
    expect(extractMarkdownSections("Just some text.")).toEqual([]);
  });

  it("ignores H1 and H3 headings", () => {
    const md = "# Title\n## Section\n### Subsection\n";
    expect(extractMarkdownSections(md)).toEqual(["Section"]);
  });

  it("trims whitespace from headings", () => {
    const md = "##   Spaced Heading   \n";
    expect(extractMarkdownSections(md)).toEqual(["Spaced Heading"]);
  });

  it("handles empty markdown", () => {
    expect(extractMarkdownSections("")).toEqual([]);
  });

  it("extracts all 8 canonical sections", () => {
    const md = `## Overview\n## Colors\n## Typography\n## Layout\n## Elevation & Depth\n## Shapes\n## Components\n## Do's and Don'ts\n`;
    const sections = extractMarkdownSections(md);
    expect(sections).toHaveLength(8);
    expect(sections).toContain("Do's and Don'ts");
  });
});
