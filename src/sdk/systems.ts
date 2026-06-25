/**
 * SDK Systems — Built-in design system content access.
 *
 * Provides access to built-in design system templates as strings.
 * No file I/O for built-in systems (they're bundled).
 */

import type { DesignSystemMeta } from "./types.js";
import { MODERN_MINIMAL_DESIGN_MD } from "../systems/modern-minimal.js";
import { CORPORATE_CLEAN_DESIGN_MD } from "../systems/corporate-clean.js";
import { BOLD_CREATIVE_DESIGN_MD } from "../systems/bold-creative.js";

interface BuiltinSystem {
  meta: DesignSystemMeta;
  content: string;
}

const BUILTIN_SYSTEMS: BuiltinSystem[] = [
  {
    meta: {
      id: "modern-minimal",
      name: "Modern Minimal",
      category: "Starter",
      description: "Clean, product-oriented. SaaS tools, dashboards.",
      builtin: true,
    },
    content: MODERN_MINIMAL_DESIGN_MD,
  },
  {
    meta: {
      id: "corporate-clean",
      name: "Corporate Clean",
      category: "Professional",
      description: "Professional, trustworthy. Enterprise, B2B.",
      builtin: true,
    },
    content: CORPORATE_CLEAN_DESIGN_MD,
  },
  {
    meta: {
      id: "bold-creative",
      name: "Bold Creative",
      category: "Expressive",
      description: "Vibrant, expressive. Marketing, portfolios.",
      builtin: true,
    },
    content: BOLD_CREATIVE_DESIGN_MD,
  },
];

/**
 * List all built-in design system metadata.
 *
 * @example
 * ```ts
 * import { listBuiltinSystems } from "@syncfusion/cs-design/sdk";
 *
 * const systems = listBuiltinSystems();
 * // [{ id: "modern-minimal", name: "Modern Minimal", ... }, ...]
 * ```
 */
export function listBuiltinSystems(): DesignSystemMeta[] {
  return BUILTIN_SYSTEMS.map((s) => s.meta);
}

/**
 * Get the DESIGN.md content for a built-in design system.
 *
 * @param id - System ID (e.g. "modern-minimal", "corporate-clean", "bold-creative")
 * @returns The DESIGN.md content string, or null if not found
 *
 * @example
 * ```ts
 * import { getBuiltinSystemContent } from "@syncfusion/cs-design/sdk";
 *
 * const content = getBuiltinSystemContent("modern-minimal");
 * if (content) {
 *   // Use it directly or write to disk
 *   console.log(content); // "---\nversion: alpha\nname: Modern Minimal\n..."
 * }
 * ```
 */
export function getBuiltinSystemContent(id: string): string | null {
  const system = BUILTIN_SYSTEMS.find((s) => s.meta.id === id);
  return system?.content ?? null;
}

/**
 * Get metadata for a specific built-in design system.
 */
export function getBuiltinSystemMeta(id: string): DesignSystemMeta | null {
  const system = BUILTIN_SYSTEMS.find((s) => s.meta.id === id);
  return system?.meta ?? null;
}
