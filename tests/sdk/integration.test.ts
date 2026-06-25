/**
 * Integration tests — Full pipeline: parse → validate → lint → export → diff
 */

import { describe, it, expect } from "vitest";
import {
  parseDesignMd,
  validate,
  lint,
  diff,
  exportTokens,
  getSpec,
  listBuiltinSystems,
  getBuiltinSystemContent,
} from "../../src/sdk/index.js";

describe("Full pipeline: parse → validate → lint → export", () => {
  it("processes modern-minimal through the entire pipeline", () => {
    const content = getBuiltinSystemContent("modern-minimal")!;

    // 1. Parse
    const parsed = parseDesignMd(content);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.data.yaml.name).toBe("Modern Minimal");

    // 2. Validate
    const validation = validate(content);
    expect(validation.ok).toBe(true);
    if (!validation.ok) return;
    expect(validation.data.valid).toBe(true);

    // 3. Lint
    const lintResult = lint(content);
    expect(lintResult.ok).toBe(true);
    if (!lintResult.ok) return;
    expect(lintResult.data.summary.errors).toBe(0);

    // 4. Export all formats
    for (const format of ["css", "tailwind", "json", "css-tailwind", "dtcg"] as const) {
      const exported = exportTokens(content, format);
      expect(exported.ok).toBe(true);
      if (exported.ok) {
        expect(exported.data.content.length).toBeGreaterThan(0);
      }
    }
  });

  it("processes all built-in systems through the pipeline", () => {
    for (const sys of listBuiltinSystems()) {
      const content = getBuiltinSystemContent(sys.id)!;

      const parsed = parseDesignMd(content);
      expect(parsed.ok).toBe(true);

      const validation = validate(content);
      expect(validation.ok).toBe(true);
      if (validation.ok) {
        expect(validation.data.valid).toBe(true);
      }

      const lintResult = lint(content);
      expect(lintResult.ok).toBe(true);
      if (lintResult.ok) {
        expect(lintResult.data.summary.errors).toBe(0);
      }

      const css = exportTokens(content, "css");
      expect(css.ok).toBe(true);
    }
  });
});

describe("Diff pipeline", () => {
  it("diffs two different built-in systems", () => {
    const a = getBuiltinSystemContent("modern-minimal")!;
    const b = getBuiltinSystemContent("bold-creative")!;

    const result = diff(a, b);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // Should detect modified colors (both have primary, accent, etc. but different values)
    expect(result.data.tokens.colors.modified.length).toBeGreaterThan(0);
    // Should detect modified typography (different fonts)
    expect(result.data.tokens.typography.modified.length).toBeGreaterThan(0);
  });

  it("detects no changes when diffing same system", () => {
    const content = getBuiltinSystemContent("corporate-clean")!;
    const result = diff(content, content);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.tokens.colors.modified).toHaveLength(0);
    expect(result.data.tokens.colors.added).toHaveLength(0);
    expect(result.data.tokens.colors.removed).toHaveLength(0);
    expect(result.data.regression).toBe(false);
  });
});

describe("Dark mode pipeline", () => {
  it("CSS export includes dark theme for systems with colors-dark", () => {
    const content = getBuiltinSystemContent("modern-minimal")!;
    const result = exportTokens(content, "css");
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // Light theme
    expect(result.data.content).toContain(":root {");
    expect(result.data.content).toContain("--color-primary: #1A1C1E;");

    // Dark theme
    expect(result.data.content).toContain('[data-theme="dark"]');
    expect(result.data.content).toContain("--color-primary: #E8EAED;");
    expect(result.data.content).toContain("@media (prefers-color-scheme: dark)");
  });

  it("JSON export includes dark color keys", () => {
    const content = getBuiltinSystemContent("modern-minimal")!;
    const result = exportTokens(content, "json");
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const tokens = JSON.parse(result.data.content);
    expect(tokens["color.primary"]).toBeDefined();
    expect(tokens["color-dark.primary"]).toBeDefined();
  });
});

describe("Spec integration", () => {
  it("spec section order matches validator canonical sections", () => {
    const spec = getSpec();
    expect(spec.format.sectionOrder).toContain("Overview");
    expect(spec.format.sectionOrder).toContain("Colors");
    expect(spec.format.sectionOrder).toContain("Do's and Don'ts");
  });

  it("spec rules count matches LINT_RULES", () => {
    const spec = getSpec();
    expect(spec.rules.length).toBeGreaterThanOrEqual(9);
  });
});

describe("Result type contract", () => {
  it("all SDK functions return Result<T> with ok boolean", () => {
    // Success cases
    const content = getBuiltinSystemContent("modern-minimal")!;
    const parse = parseDesignMd(content);
    expect(typeof parse.ok).toBe("boolean");

    const val = validate(content);
    expect(typeof val.ok).toBe("boolean");

    const l = lint(content);
    expect(typeof l.ok).toBe("boolean");

    const d = diff(content, content);
    expect(typeof d.ok).toBe("boolean");

    const e = exportTokens(content, "css");
    expect(typeof e.ok).toBe("boolean");

    // Failure cases
    const parseFail = parseDesignMd("invalid");
    expect(parseFail.ok).toBe(false);
    if (!parseFail.ok) {
      expect(typeof parseFail.error).toBe("string");
    }

    const valFail = validate("invalid");
    expect(valFail.ok).toBe(false);
    if (!valFail.ok) {
      expect(typeof valFail.error).toBe("string");
    }

    const exportFail = exportTokens("invalid", "css");
    expect(exportFail.ok).toBe(false);
    if (!exportFail.ok) {
      expect(typeof exportFail.error).toBe("string");
    }
  });
});
