/**
 * Tests for SDK Linter — lint(), lintRaw()
 */

import { describe, it, expect } from "vitest";
import { lint, lintRaw } from "../../src/sdk/linter.js";

// ── Fixtures ──

const VALID_DESIGN_MD = `---
name: "Test"
colors:
  primary: "#1A1C1E"
  accent: "#2563EB"
  background: "#FFFFFF"
typography:
  h1:
    fontFamily: "Inter"
    fontSize: "48px"
  body:
    fontFamily: "Inter"
    fontSize: "16px"
rounded:
  sm: "4px"
  md: "8px"
spacing:
  sm: "8px"
  md: "16px"
components:
  button:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.background}"
---

# Test

## Overview
A test system.

## Colors
Primary and accent.

## Typography
Inter for everything.

## Layout
8px grid.

## Elevation & Depth
Flat design.

## Shapes
Moderate rounding.

## Components
Button styles.

## Do's and Don'ts
Keep it simple.
`;

const BROKEN_REFS_MD = `---
name: "Broken"
colors:
  primary: "#000000"
typography:
  body:
    fontFamily: "Arial"
    fontSize: "16px"
components:
  button:
    backgroundColor: "{colors.nonexistent}"
    textColor: "{colors.also-missing}"
---
`;

const NO_PRIMARY_MD = `---
name: "No Primary"
colors:
  accent: "#2563EB"
  background: "#FFFFFF"
typography:
  body:
    fontFamily: "Arial"
    fontSize: "16px"
---
`;

// ── lint() ──

describe("lint", () => {
  it("returns ok for valid DESIGN.md", () => {
    const result = lint(VALID_DESIGN_MD);
    expect(result.ok).toBe(true);
  });

  it("returns design system info", () => {
    const result = lint(VALID_DESIGN_MD);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.designSystem.name).toBe("Test");
    expect(result.data.designSystem.colors).toBeGreaterThan(0);
    expect(result.data.designSystem.typography).toBeGreaterThan(0);
  });

  it("returns summary counts", () => {
    const result = lint(VALID_DESIGN_MD);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(typeof result.data.summary.errors).toBe("number");
    expect(typeof result.data.summary.warnings).toBe("number");
    expect(typeof result.data.summary.infos).toBe("number");
  });

  it("returns sections list", () => {
    const result = lint(VALID_DESIGN_MD);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.sections).toContain("Overview");
    expect(result.data.sections).toContain("Colors");
  });

  it("detects broken token references", () => {
    const result = lint(BROKEN_REFS_MD);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.summary.errors).toBeGreaterThan(0);
    expect(result.data.findings.some((f) => f.severity === "error")).toBe(true);
  });

  it("warns on missing primary color", () => {
    const result = lint(NO_PRIMARY_MD);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.findings.some((f) =>
      f.severity === "warning" && f.message.toLowerCase().includes("primary"),
    )).toBe(true);
  });

  it("returns findings with severity and message", () => {
    const result = lint(VALID_DESIGN_MD);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    for (const f of result.data.findings) {
      expect(["error", "warning", "info"]).toContain(f.severity);
      expect(typeof f.message).toBe("string");
      expect(f.message.length).toBeGreaterThan(0);
    }
  });

  it("handles empty content gracefully", () => {
    const result = lint("");
    // Should not crash — may return ok with warnings or error
    expect(typeof result.ok).toBe("boolean");
  });

  it("handles content without YAML", () => {
    const result = lint("# Just a heading\n\nSome text.");
    expect(typeof result.ok).toBe("boolean");
  });
});

// ── lintRaw() ──

describe("lintRaw", () => {
  it("returns the raw Google LintReport", () => {
    const result = lintRaw(VALID_DESIGN_MD);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.designSystem).toBeDefined();
    expect(result.data.findings).toBeDefined();
    expect(result.data.summary).toBeDefined();
    // Google report has Maps, not plain objects
    expect(result.data.designSystem.colors instanceof Map).toBe(true);
  });

  it("returns design system with Maps", () => {
    const result = lintRaw(VALID_DESIGN_MD);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.designSystem.colors.size).toBeGreaterThan(0);
    expect(result.data.designSystem.typography.size).toBeGreaterThan(0);
  });
});
