/**
 * Design system registry — built-in systems and resolution logic.
 */

import fs from "fs-extra";
import path from "node:path";
import type { DesignSystemMeta } from "../types.js";
import { getGlobalSystemsDir, DESIGN_MD } from "../constants.js";
import { MODERN_MINIMAL_DESIGN_MD } from "./modern-minimal.js";
import { CORPORATE_CLEAN_DESIGN_MD } from "./corporate-clean.js";
import { BOLD_CREATIVE_DESIGN_MD } from "./bold-creative.js";

// ── Built-in registry ──

export interface BuiltinSystem {
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
 * Get all built-in design system metadata.
 */
export function getBuiltinSystems(): DesignSystemMeta[] {
  return BUILTIN_SYSTEMS.map((s) => s.meta);
}

/**
 * Get a built-in system by ID.
 */
export function getBuiltinSystem(id: string): BuiltinSystem | undefined {
  return BUILTIN_SYSTEMS.find((s) => s.meta.id === id);
}

/**
 * List all user-installed design systems from the global directory.
 */
export async function getInstalledSystems(): Promise<DesignSystemMeta[]> {
  const systemsDir = getGlobalSystemsDir();
  if (!(await fs.pathExists(systemsDir))) return [];

  const entries = await fs.readdir(systemsDir, { withFileTypes: true });
  const systems: DesignSystemMeta[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const designPath = path.join(systemsDir, entry.name, DESIGN_MD);
    if (await fs.pathExists(designPath)) {
      systems.push({
        id: entry.name,
        name: entry.name,
        category: "Installed",
        description: "User-installed design system",
        builtin: false,
      });
    }
  }

  return systems;
}

/**
 * Resolve a design system by ID.
 * Resolution order: built-in → user-installed.
 * Returns the DESIGN.md content string or null.
 */
export async function resolveSystem(id: string): Promise<string | null> {
  // 1. Check built-in
  const builtin = getBuiltinSystem(id);
  if (builtin) return builtin.content;

  // 2. Check user-installed
  const installedPath = path.join(getGlobalSystemsDir(), id, DESIGN_MD);
  if (await fs.pathExists(installedPath)) {
    return fs.readFile(installedPath, "utf-8");
  }

  return null;
}

/**
 * Get all available systems (built-in + installed).
 */
export async function getAllSystems(): Promise<DesignSystemMeta[]> {
  const builtin = getBuiltinSystems();
  const installed = await getInstalledSystems();
  return [...builtin, ...installed];
}
