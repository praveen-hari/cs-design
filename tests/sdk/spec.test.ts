/**
 * Tests for SDK Spec — getSpec(), getFullSpec(), LINT_RULES
 */

import { describe, it, expect } from "vitest";
import { getSpec, getFullSpec, LINT_RULES } from "../../src/sdk/spec.js";

describe("getSpec", () => {
  it("returns spec info with format details", () => {
    const spec = getSpec();
    expect(spec.format).toBeDefined();
    expect(spec.format.layers).toHaveLength(2);
    expect(spec.format.tokenSchema).toContain("colors");
    expect(spec.format.tokenSchema).toContain("typography");
    expect(spec.format.tokenSchema).toContain("components");
  });

  it("returns canonical section order", () => {
    const spec = getSpec();
    expect(spec.format.sectionOrder).toContain("Overview");
    expect(spec.format.sectionOrder).toContain("Colors");
    expect(spec.format.sectionOrder).toContain("Typography");
    expect(spec.format.sectionOrder).toContain("Do's and Don'ts");
    expect(spec.format.sectionOrder).toHaveLength(8);
  });

  it("returns token types", () => {
    const spec = getSpec();
    expect(spec.format.tokenTypes).toHaveProperty("Color");
    expect(spec.format.tokenTypes).toHaveProperty("Dimension");
    expect(spec.format.tokenTypes).toHaveProperty("Token Reference");
    expect(spec.format.tokenTypes).toHaveProperty("Typography");
  });

  it("returns spec URL", () => {
    const spec = getSpec();
    expect(spec.specUrl).toContain("github.com");
    expect(spec.specUrl).toContain("design.md");
  });

  it("returns lint rules", () => {
    const spec = getSpec();
    expect(spec.rules.length).toBeGreaterThanOrEqual(9);
    for (const rule of spec.rules) {
      expect(rule.name).toBeTruthy();
      expect(rule.severity).toBeTruthy();
      expect(rule.description).toBeTruthy();
    }
  });

  it("includes full spec text", () => {
    const spec = getSpec();
    expect(spec.fullSpec).toBeDefined();
    expect(spec.fullSpec.length).toBeGreaterThan(100);
    expect(spec.fullSpec).toContain("DESIGN.md");
  });
});

describe("getFullSpec", () => {
  it("returns the full specification text", () => {
    const spec = getFullSpec();
    expect(spec.length).toBeGreaterThan(500);
    expect(spec).toContain("DESIGN.md");
    expect(spec).toContain("YAML");
    expect(spec).toContain("colors");
    expect(spec).toContain("typography");
  });
});

describe("LINT_RULES", () => {
  it("has at least 9 rules", () => {
    expect(LINT_RULES.length).toBeGreaterThanOrEqual(9);
  });

  it("includes known rules", () => {
    const names = LINT_RULES.map((r) => r.name);
    expect(names).toContain("broken-ref");
    expect(names).toContain("contrast-ratio");
    expect(names).toContain("orphaned-tokens");
    expect(names).toContain("missing-primary");
    expect(names).toContain("section-order");
    expect(names).toContain("unknown-key");
  });

  it("each rule has name, severity, and description", () => {
    for (const rule of LINT_RULES) {
      expect(typeof rule.name).toBe("string");
      expect(["error", "warning", "info"]).toContain(rule.severity);
      expect(typeof rule.description).toBe("string");
      expect(rule.description.length).toBeGreaterThan(10);
    }
  });
});
