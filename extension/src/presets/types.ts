/**
 * Preset type definitions.
 *
 * A preset is a complete design system bundle — colors, typography,
 * spacing, radius, shadows, and border weight — that can be applied
 * in a single click. Presets are stored as JSON files (data, not code)
 * in `extension/data/presets/` and loaded at runtime by `loader.ts`.
 *
 * The `designMd` field uses the same structure as the DESIGN.md YAML
 * frontmatter (the `DesignYaml` type from the SDK), so a preset can be
 * validated with the existing `validate()` function and written directly
 * to a DESIGN.md file.
 */

// ── Style traits (not in the DESIGN.md spec, but control the preview) ──

export type ShadowLevel = "none" | "subtle" | "medium" | "strong";
export type BorderWeight = "thin" | "medium" | "thick";
export type PresetCategory = "light" | "dark" | "vibrant" | "editorial" | "playful";

export interface PresetStyleTraits {
  /** Box-shadow strength for cards / popovers. */
  shadows: ShadowLevel;
  /** Border thickness for cards / inputs / buttons. */
  borderWeight: BorderWeight;
  /** Font weight for headings (h1–h3). */
  headingWeight: number;
  /** Font weight for body text. */
  bodyWeight: number;
}

// ── Color tokens ──

export interface PresetColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  [key: string]: string; // allow extra color tokens
}

export interface PresetColorsDark {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  border: string;
  [key: string]: string;
}

// ── Typography tokens ──

export interface PresetTypographyEntry {
  fontFamily: string;
  fontSize: string;
  fontWeight?: number;
  lineHeight?: number | string;
  letterSpacing?: string;
}

export type PresetTypography = Record<string, PresetTypographyEntry>;

// ── Scale tokens ──

export type PresetScale = Record<string, string>;

// ── Design.md portion (mirrors DesignYaml from the SDK) ──

export interface PresetDesignMd {
  name: string;
  description?: string;
  colors: PresetColors;
  "colors-dark"?: PresetColorsDark;
  typography: PresetTypography;
  spacing: PresetScale;
  rounded: PresetScale;
}

// ── Complete preset ──

export interface Preset {
  /** Unique identifier (kebab-case). Used in project.json `system` field. */
  id: string;

  /** Display name shown in the generator UI. */
  name: string;

  /** Short description (1 line, shown under name in the preset card). */
  description: string;

  /** Category for grouping / filtering in the UI. */
  category: PresetCategory;

  /**
   * Preview swatches for the preset card.
   * Typically 5 colors: [primary, accent, background, surface, border].
   */
  swatches: string[];

  /** Full design tokens — same structure as DESIGN.md YAML frontmatter. */
  designMd: PresetDesignMd;

  /** Extra visual traits not covered by the DESIGN.md spec. */
  styleTraits: PresetStyleTraits;

  /** Google Fonts family name for the generator's live preview. */
  previewFont: string;
}
