/**
 * Preset loader — reads and validates preset JSON files at runtime.
 *
 * Presets live in `extension/data/presets/*.json`. Each file is loaded,
 * validated against the `Preset` interface, and returned as a sorted
 * array. Invalid presets are skipped with a warning.
 */

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import type { Preset, PresetCategory, ShadowLevel, BorderWeight } from "./types.js";

// ── Cache ──

let presetCache: Preset[] | undefined;

// ── Valid values for enum-like fields ──

const VALID_CATEGORIES: PresetCategory[] = ["light", "dark", "vibrant", "editorial", "playful"];
const VALID_SHADOWS: ShadowLevel[] = ["none", "subtle", "medium", "strong"];
const VALID_BORDER_WEIGHTS: BorderWeight[] = ["thin", "medium", "thick"];

// ── Validation ──

interface ValidationResult {
  ok: boolean;
  error?: string;
}

/**
 * Validate a parsed JSON object against the Preset schema.
 * Checks required fields, types, and enum values.
 */
function validatePresetSchema(data: unknown): ValidationResult {
  if (!data || typeof data !== "object") {
    return { ok: false, error: "Preset must be a JSON object" };
  }

  const p = data as Record<string, unknown>;

  // ── Required string fields ──
  const requiredStrings = ["id", "name", "description", "previewFont"];
  for (const field of requiredStrings) {
    if (typeof p[field] !== "string" || (p[field] as string).length === 0) {
      return { ok: false, error: `Missing or empty required field: "${field}"` };
    }
  }

  // ── Category ──
  if (!VALID_CATEGORIES.includes(p.category as PresetCategory)) {
    return { ok: false, error: `Invalid category: "${p.category}". Must be one of: ${VALID_CATEGORIES.join(", ")}` };
  }

  // ── Swatches ──
  if (!Array.isArray(p.swatches) || p.swatches.length < 3) {
    return { ok: false, error: "swatches must be an array with at least 3 colors" };
  }
  for (const sw of p.swatches) {
    if (typeof sw !== "string") {
      return { ok: false, error: "All swatches must be strings (hex colors)" };
    }
  }

  // ── designMd ──
  if (!p.designMd || typeof p.designMd !== "object") {
    return { ok: false, error: "Missing or invalid designMd section" };
  }

  const dm = p.designMd as Record<string, unknown>;

  // designMd.colors
  if (!dm.colors || typeof dm.colors !== "object") {
    return { ok: false, error: "designMd.colors is required and must be an object" };
  }
  const colors = dm.colors as Record<string, unknown>;
  const requiredColors = ["primary", "accent", "background", "surface", "border"];
  for (const c of requiredColors) {
    if (typeof colors[c] !== "string") {
      return { ok: false, error: `designMd.colors.${c} is required and must be a string` };
    }
  }

  // designMd.typography
  if (!dm.typography || typeof dm.typography !== "object") {
    return { ok: false, error: "designMd.typography is required and must be an object" };
  }
  const typo = dm.typography as Record<string, unknown>;
  const typoEntries = Object.entries(typo);
  if (typoEntries.length === 0) {
    return { ok: false, error: "designMd.typography must have at least one entry" };
  }
  for (const [key, val] of typoEntries) {
    if (!val || typeof val !== "object") {
      return { ok: false, error: `designMd.typography.${key} must be an object` };
    }
    const entry = val as Record<string, unknown>;
    if (typeof entry.fontFamily !== "string") {
      return { ok: false, error: `designMd.typography.${key}.fontFamily is required and must be a string` };
    }
    if (typeof entry.fontSize !== "string") {
      return { ok: false, error: `designMd.typography.${key}.fontSize is required and must be a string` };
    }
  }

  // designMd.spacing
  if (!dm.spacing || typeof dm.spacing !== "object") {
    return { ok: false, error: "designMd.spacing is required and must be an object" };
  }

  // designMd.rounded
  if (!dm.rounded || typeof dm.rounded !== "object") {
    return { ok: false, error: "designMd.rounded is required and must be an object" };
  }

  // ── styleTraits ──
  if (!p.styleTraits || typeof p.styleTraits !== "object") {
    return { ok: false, error: "Missing or invalid styleTraits section" };
  }
  const st = p.styleTraits as Record<string, unknown>;

  if (!VALID_SHADOWS.includes(st.shadows as ShadowLevel)) {
    return { ok: false, error: `Invalid styleTraits.shadows: "${st.shadows}". Must be one of: ${VALID_SHADOWS.join(", ")}` };
  }

  if (!VALID_BORDER_WEIGHTS.includes(st.borderWeight as BorderWeight)) {
    return { ok: false, error: `Invalid styleTraits.borderWeight: "${st.borderWeight}". Must be one of: ${VALID_BORDER_WEIGHTS.join(", ")}` };
  }

  if (typeof st.headingWeight !== "number") {
    return { ok: false, error: "styleTraits.headingWeight must be a number" };
  }

  if (typeof st.bodyWeight !== "number") {
    return { ok: false, error: "styleTraits.bodyWeight must be a number" };
  }

  return { ok: true };
}

// ── Loader ──

/**
 * Load all preset JSON files from `extension/data/presets/`.
 *
 * Files are read, parsed, and validated against the Preset schema.
 * Invalid presets are skipped with a console warning. Results are
 * cached for the session — call `clearPresetCache()` to force a reload.
 *
 * @param extensionUri The extension's root URI.
 * @returns Sorted array of validated presets.
 */
export async function loadPresets(extensionUri: vscode.Uri): Promise<Preset[]> {
  if (presetCache) return presetCache;

  const presetsDir = path.join(extensionUri.fsPath, "data", "presets");
  const presets: Preset[] = [];

  if (!fs.existsSync(presetsDir)) {
    console.warn("[cs-design] Presets directory not found:", presetsDir);
    return [];
  }

  const files = fs.readdirSync(presetsDir)
    .filter((f) => f.endsWith(".json"))
    .sort();

  for (const file of files) {
    const filePath = path.join(presetsDir, file);
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      const result = validatePresetSchema(parsed);

      if (result.ok) {
        presets.push(parsed as Preset);
      } else {
        console.warn(`[cs-design] Skipping invalid preset "${file}": ${result.error}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[cs-design] Failed to load preset "${file}": ${msg}`);
    }
  }

  // Sort by category first, then by name
  presets.sort((a, b) => {
    const catOrder: Record<string, number> = { light: 0, dark: 1, vibrant: 2, editorial: 3, playful: 4 };
    const catA = catOrder[a.category] ?? 99;
    const catB = catOrder[b.category] ?? 99;
    if (catA !== catB) return catA - catB;
    return a.name.localeCompare(b.name);
  });

  presetCache = presets;
  return presets;
}

/**
 * Clear the preset cache so the next `loadPresets()` call re-reads files.
 * Useful when a preset file is added/edited during the session.
 */
export function clearPresetCache(): void {
  presetCache = undefined;
}

/**
 * Get a single preset by ID.
 *
 * @param extensionUri The extension's root URI.
 * @param id The preset ID (kebab-case).
 * @returns The preset, or `undefined` if not found.
 */
export async function getPresetById(
  extensionUri: vscode.Uri,
  id: string
): Promise<Preset | undefined> {
  const presets = await loadPresets(extensionUri);
  return presets.find((p) => p.id === id);
}
