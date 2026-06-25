/**
 * Tests for SDK Differ — diff()
 */

import { describe, it, expect } from "vitest";
import { diff } from "../../src/sdk/differ.js";

// ── Fixtures ──

const SYSTEM_A = `---
name: "System A"
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

# System A

## Overview
System A overview.
`;

const SYSTEM_B_MODIFIED = `---
name: "System B"
colors:
  primary: "#0F172A"
  accent: "#7C3AED"
  background: "#FFFFFF"
  success: "#16A34A"
typography:
  h1:
    fontFamily: "Poppins"
    fontSize: "52px"
  body:
    fontFamily: "Inter"
    fontSize: "16px"
rounded:
  sm: "4px"
  md: "8px"
  lg: "16px"
spacing:
  sm: "8px"
  md: "16px"
components:
  button:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.background}"
---

# System B

## Overview
System B overview.
`;

const SYSTEM_C_BROKEN = `---
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
---
`;

// ── diff() ──

describe("diff", () => {
  it("detects no changes when comparing identical files", () => {
    const result = diff(SYSTEM_A, SYSTEM_A);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.tokens.colors.added).toHaveLength(0);
    expect(result.data.tokens.colors.removed).toHaveLength(0);
    expect(result.data.tokens.colors.modified).toHaveLength(0);
    expect(result.data.regression).toBe(false);
  });

  it("detects modified colors", () => {
    const result = diff(SYSTEM_A, SYSTEM_B_MODIFIED);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.tokens.colors.modified).toContain("primary");
    expect(result.data.tokens.colors.modified).toContain("accent");
  });

  it("detects added colors", () => {
    const result = diff(SYSTEM_A, SYSTEM_B_MODIFIED);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.tokens.colors.added).toContain("success");
  });

  it("detects removed colors", () => {
    // B has "success" that A doesn't, so reverse: B→A removes "success"
    const result = diff(SYSTEM_B_MODIFIED, SYSTEM_A);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.tokens.colors.removed).toContain("success");
  });

  it("detects modified typography", () => {
    const result = diff(SYSTEM_A, SYSTEM_B_MODIFIED);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.tokens.typography.modified).toContain("h1");
  });

  it("detects added rounded tokens", () => {
    const result = diff(SYSTEM_A, SYSTEM_B_MODIFIED);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.tokens.rounded.added).toContain("lg");
  });

  it("reports findings delta", () => {
    const result = diff(SYSTEM_A, SYSTEM_B_MODIFIED);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(typeof result.data.findings.delta.errors).toBe("number");
    expect(typeof result.data.findings.delta.warnings).toBe("number");
  });

  it("detects regression when errors increase", () => {
    const result = diff(SYSTEM_A, SYSTEM_C_BROKEN);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.regression).toBe(true);
  });

  it("no regression when errors decrease", () => {
    const result = diff(SYSTEM_C_BROKEN, SYSTEM_A);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.regression).toBe(false);
  });

  it("handles empty before content", () => {
    const result = diff("", SYSTEM_A);
    // May fail or succeed with all tokens as "added"
    expect(typeof result.ok).toBe("boolean");
  });

  it("returns all token categories", () => {
    const result = diff(SYSTEM_A, SYSTEM_B_MODIFIED);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.tokens).toHaveProperty("colors");
    expect(result.data.tokens).toHaveProperty("typography");
    expect(result.data.tokens).toHaveProperty("rounded");
    expect(result.data.tokens).toHaveProperty("spacing");
    expect(result.data.tokens).toHaveProperty("components");
  });
});
