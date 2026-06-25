/**
 * Tests for SDK Validator — validate()
 */

import { describe, it, expect } from "vitest";
import { validate } from "../../src/sdk/validator.js";

// ── Helpers ──

function makeDesignMd(yaml: string, markdown = ""): string {
  return `---\n${yaml}\n---\n${markdown}`;
}

const VALID_YAML = `name: "Test"
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
spacing:
  sm: "8px"
  md: "16px"
rounded:
  sm: "4px"
  md: "8px"
components:
  button:
    backgroundColor: "{colors.accent}"`;

const ALL_SECTIONS = `
## Overview
Test overview.

## Colors
Color palette.

## Typography
Type system.

## Layout
Grid system.

## Elevation & Depth
Shadow strategy.

## Shapes
Corner radius.

## Components
Button styles.

## Do's and Don'ts
Design rules.
`;

// ── Valid cases ──

describe("validate — valid inputs", () => {
  it("validates a complete DESIGN.md", () => {
    const result = validate(makeDesignMd(VALID_YAML, ALL_SECTIONS));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.valid).toBe(true);
    expect(result.data.errorCount).toBe(0);
  });

  it("returns findings even when valid", () => {
    const result = validate(makeDesignMd(VALID_YAML, ALL_SECTIONS));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.findings.length).toBeGreaterThan(0);
    expect(result.data.findings.some((f) => f.passed)).toBe(true);
  });

  it("reports correct token counts", () => {
    const result = validate(makeDesignMd(VALID_YAML, ALL_SECTIONS));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const colorsFinding = result.data.findings.find((f) => f.check === "colors section");
    expect(colorsFinding?.message).toContain("2 tokens");
    const typoFinding = result.data.findings.find((f) => f.check === "typography section");
    expect(typoFinding?.message).toContain("2 levels");
  });
});

// ── Missing required fields ──

describe("validate — missing required fields", () => {
  it("fails on missing name", () => {
    const yaml = `colors:\n  primary: "#000000"\ntypography:\n  body:\n    fontFamily: "Arial"\n    fontSize: "16px"`;
    const result = validate(makeDesignMd(yaml));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.valid).toBe(false);
    expect(result.data.findings.some((f) => f.check === "name field" && !f.passed)).toBe(true);
  });

  it("fails on empty name", () => {
    const yaml = `name: ""\ncolors:\n  primary: "#000000"\ntypography:\n  body:\n    fontFamily: "Arial"\n    fontSize: "16px"`;
    const result = validate(makeDesignMd(yaml));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.valid).toBe(false);
  });

  it("fails on missing colors", () => {
    const yaml = `name: "Test"\ntypography:\n  body:\n    fontFamily: "Arial"\n    fontSize: "16px"`;
    const result = validate(makeDesignMd(yaml));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.valid).toBe(false);
    expect(result.data.findings.some((f) => f.check === "colors section" && !f.passed)).toBe(true);
  });

  it("fails on empty colors object", () => {
    const yaml = `name: "Test"\ncolors: {}\ntypography:\n  body:\n    fontFamily: "Arial"\n    fontSize: "16px"`;
    const result = validate(makeDesignMd(yaml));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.valid).toBe(false);
  });

  it("fails on missing typography", () => {
    const yaml = `name: "Test"\ncolors:\n  primary: "#000000"`;
    const result = validate(makeDesignMd(yaml));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.valid).toBe(false);
    expect(result.data.findings.some((f) => f.check === "typography section" && !f.passed)).toBe(true);
  });
});

// ── Invalid color values ──

describe("validate — invalid colors", () => {
  it("fails on invalid hex color", () => {
    const yaml = `name: "Test"\ncolors:\n  primary: "not-a-color"\ntypography:\n  body:\n    fontFamily: "Arial"\n    fontSize: "16px"`;
    const result = validate(makeDesignMd(yaml));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.valid).toBe(false);
    expect(result.data.findings.some((f) => f.check.includes("primary") && f.message.includes("Invalid hex"))).toBe(true);
  });

  it("fails on 3-digit hex color", () => {
    const yaml = `name: "Test"\ncolors:\n  primary: "#FFF"\ntypography:\n  body:\n    fontFamily: "Arial"\n    fontSize: "16px"`;
    const result = validate(makeDesignMd(yaml));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.valid).toBe(false);
  });

  it("reports multiple invalid colors", () => {
    const yaml = `name: "Test"\ncolors:\n  primary: "red"\n  accent: "blue"\ntypography:\n  body:\n    fontFamily: "Arial"\n    fontSize: "16px"`;
    const result = validate(makeDesignMd(yaml));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const colorErrors = result.data.findings.filter((f) => f.message.includes("Invalid hex"));
    expect(colorErrors.length).toBe(2);
  });
});

// ── Invalid typography ──

describe("validate — invalid typography", () => {
  it("fails on missing fontFamily", () => {
    const yaml = `name: "Test"\ncolors:\n  primary: "#000000"\ntypography:\n  body:\n    fontSize: "16px"`;
    const result = validate(makeDesignMd(yaml));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.valid).toBe(false);
    expect(result.data.findings.some((f) => f.message.includes("missing fontFamily"))).toBe(true);
  });

  it("fails on missing fontSize", () => {
    const yaml = `name: "Test"\ncolors:\n  primary: "#000000"\ntypography:\n  body:\n    fontFamily: "Arial"`;
    const result = validate(makeDesignMd(yaml));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.valid).toBe(false);
    expect(result.data.findings.some((f) => f.message.includes("missing fontSize"))).toBe(true);
  });
});

// ── Warnings for optional sections ──

describe("validate — optional section warnings", () => {
  it("warns on missing spacing", () => {
    const yaml = `name: "Test"\ncolors:\n  primary: "#000000"\ntypography:\n  body:\n    fontFamily: "Arial"\n    fontSize: "16px"`;
    const result = validate(makeDesignMd(yaml));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.valid).toBe(true); // warnings don't make it invalid
    expect(result.data.findings.some((f) => f.check === "spacing section" && !f.passed)).toBe(true);
  });

  it("warns on missing rounded", () => {
    const yaml = `name: "Test"\ncolors:\n  primary: "#000000"\ntypography:\n  body:\n    fontFamily: "Arial"\n    fontSize: "16px"`;
    const result = validate(makeDesignMd(yaml));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.findings.some((f) => f.check === "rounded section" && !f.passed)).toBe(true);
  });

  it("warns on missing components", () => {
    const yaml = `name: "Test"\ncolors:\n  primary: "#000000"\ntypography:\n  body:\n    fontFamily: "Arial"\n    fontSize: "16px"`;
    const result = validate(makeDesignMd(yaml));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.findings.some((f) => f.check === "components section" && !f.passed)).toBe(true);
  });
});

// ── Markdown section validation ──

describe("validate — markdown sections", () => {
  it("warns on missing canonical sections", () => {
    const yaml = `name: "Test"\ncolors:\n  primary: "#000000"\ntypography:\n  body:\n    fontFamily: "Arial"\n    fontSize: "16px"`;
    const result = validate(makeDesignMd(yaml, "## Overview\nSome text."));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.findings.some((f) => f.check === 'section "Colors"' && !f.passed)).toBe(true);
  });

  it("detects duplicate sections", () => {
    const yaml = `name: "Test"\ncolors:\n  primary: "#000000"\ntypography:\n  body:\n    fontFamily: "Arial"\n    fontSize: "16px"`;
    const md = "## Overview\nFirst.\n## Overview\nDuplicate.";
    const result = validate(makeDesignMd(yaml, md));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.valid).toBe(false);
    expect(result.data.findings.some((f) => f.message.includes("Duplicate section"))).toBe(true);
  });
});

// ── Dark mode validation ──

describe("validate — colors-dark", () => {
  it("validates valid dark colors", () => {
    const yaml = `name: "Test"\ncolors:\n  primary: "#000000"\n  accent: "#0066FF"\ncolors-dark:\n  primary: "#FFFFFF"\n  accent: "#4D94FF"\ntypography:\n  body:\n    fontFamily: "Arial"\n    fontSize: "16px"`;
    const result = validate(makeDesignMd(yaml));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.findings.some((f) => f.check === "colors-dark section" && f.passed)).toBe(true);
  });

  it("fails on invalid dark hex color", () => {
    const yaml = `name: "Test"\ncolors:\n  primary: "#000000"\ncolors-dark:\n  primary: "not-hex"\ntypography:\n  body:\n    fontFamily: "Arial"\n    fontSize: "16px"`;
    const result = validate(makeDesignMd(yaml));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.valid).toBe(false);
    expect(result.data.findings.some((f) => f.message.includes("Invalid hex color in colors-dark"))).toBe(true);
  });

  it("warns on orphan dark token (no matching light token)", () => {
    const yaml = `name: "Test"\ncolors:\n  primary: "#000000"\ncolors-dark:\n  primary: "#FFFFFF"\n  nonexistent: "#333333"\ntypography:\n  body:\n    fontFamily: "Arial"\n    fontSize: "16px"`;
    const result = validate(makeDesignMd(yaml));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.findings.some((f) => f.message.includes("nonexistent") && f.message.includes("no matching"))).toBe(true);
  });

  it("warns on light tokens missing dark overrides", () => {
    const yaml = `name: "Test"\ncolors:\n  primary: "#000000"\n  accent: "#0066FF"\ncolors-dark:\n  primary: "#FFFFFF"\ntypography:\n  body:\n    fontFamily: "Arial"\n    fontSize: "16px"`;
    const result = validate(makeDesignMd(yaml));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.findings.some((f) => f.check === "colors-dark completeness" && f.message.includes("accent"))).toBe(true);
  });
});

// ── Error handling ──

describe("validate — error handling", () => {
  it("returns error for invalid YAML", () => {
    const result = validate("---\n: broken yaml [\n---\n");
    expect(result.ok).toBe(false);
  });

  it("returns error for no front matter", () => {
    const result = validate("Just text, no YAML.");
    expect(result.ok).toBe(false);
  });

  it("returns error for empty string", () => {
    const result = validate("");
    expect(result.ok).toBe(false);
  });
});
