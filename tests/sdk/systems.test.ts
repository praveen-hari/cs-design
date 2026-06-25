/**
 * Tests for SDK Systems — listBuiltinSystems(), getBuiltinSystemContent(), getBuiltinSystemMeta()
 */

import { describe, it, expect } from "vitest";
import {
  listBuiltinSystems,
  getBuiltinSystemContent,
  getBuiltinSystemMeta,
} from "../../src/sdk/systems.js";
import { parseDesignMd } from "../../src/sdk/parser.js";
import { validate } from "../../src/sdk/validator.js";

describe("listBuiltinSystems", () => {
  it("returns 3 built-in systems", () => {
    const systems = listBuiltinSystems();
    expect(systems).toHaveLength(3);
  });

  it("includes modern-minimal", () => {
    const systems = listBuiltinSystems();
    expect(systems.some((s) => s.id === "modern-minimal")).toBe(true);
  });

  it("includes corporate-clean", () => {
    const systems = listBuiltinSystems();
    expect(systems.some((s) => s.id === "corporate-clean")).toBe(true);
  });

  it("includes bold-creative", () => {
    const systems = listBuiltinSystems();
    expect(systems.some((s) => s.id === "bold-creative")).toBe(true);
  });

  it("each system has required metadata", () => {
    for (const sys of listBuiltinSystems()) {
      expect(sys.id).toBeTruthy();
      expect(sys.name).toBeTruthy();
      expect(sys.category).toBeTruthy();
      expect(sys.description).toBeTruthy();
      expect(sys.builtin).toBe(true);
    }
  });
});

describe("getBuiltinSystemContent", () => {
  it("returns content for modern-minimal", () => {
    const content = getBuiltinSystemContent("modern-minimal");
    expect(content).not.toBeNull();
    expect(content).toContain("Modern Minimal");
  });

  it("returns content for corporate-clean", () => {
    const content = getBuiltinSystemContent("corporate-clean");
    expect(content).not.toBeNull();
    expect(content).toContain("Corporate Clean");
  });

  it("returns content for bold-creative", () => {
    const content = getBuiltinSystemContent("bold-creative");
    expect(content).not.toBeNull();
    expect(content).toContain("Bold Creative");
  });

  it("returns null for unknown system", () => {
    expect(getBuiltinSystemContent("nonexistent")).toBeNull();
    expect(getBuiltinSystemContent("")).toBeNull();
  });

  it("all built-in systems are parseable", () => {
    for (const sys of listBuiltinSystems()) {
      const content = getBuiltinSystemContent(sys.id);
      expect(content).not.toBeNull();
      const parsed = parseDesignMd(content!);
      expect(parsed.ok).toBe(true);
      if (parsed.ok) {
        expect(parsed.data.yaml.name).toBe(sys.name);
      }
    }
  });

  it("all built-in systems pass validation", () => {
    for (const sys of listBuiltinSystems()) {
      const content = getBuiltinSystemContent(sys.id);
      const result = validate(content!);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.valid).toBe(true);
      }
    }
  });

  it("all built-in systems have colors-dark", () => {
    for (const sys of listBuiltinSystems()) {
      const content = getBuiltinSystemContent(sys.id);
      const parsed = parseDesignMd(content!);
      expect(parsed.ok).toBe(true);
      if (parsed.ok) {
        expect(parsed.data.yaml["colors-dark"]).toBeDefined();
        expect(Object.keys(parsed.data.yaml["colors-dark"]!).length).toBeGreaterThan(0);
      }
    }
  });

  it("all built-in systems have components", () => {
    for (const sys of listBuiltinSystems()) {
      const content = getBuiltinSystemContent(sys.id);
      const parsed = parseDesignMd(content!);
      expect(parsed.ok).toBe(true);
      if (parsed.ok) {
        expect(parsed.data.yaml.components).toBeDefined();
      }
    }
  });
});

describe("getBuiltinSystemMeta", () => {
  it("returns metadata for known system", () => {
    const meta = getBuiltinSystemMeta("modern-minimal");
    expect(meta).not.toBeNull();
    expect(meta?.name).toBe("Modern Minimal");
    expect(meta?.builtin).toBe(true);
  });

  it("returns null for unknown system", () => {
    expect(getBuiltinSystemMeta("nonexistent")).toBeNull();
  });
});
