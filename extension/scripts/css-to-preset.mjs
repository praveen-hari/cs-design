#!/usr/bin/env node
/**
 * css-to-preset.mjs — Convert a shadcn/Tailwind CSS theme to a cs-design preset JSON.
 *
 * Usage:
 *   node css-to-preset.mjs <input.css> [output.json] [--name "My Theme"] [--id my-theme]
 *
 * Parses :root and .dark CSS variable blocks, converts oklch/hsl/rgb colors
 * to hex, maps shadcn token names to our preset format, and writes a valid
 * preset JSON file.
 *
 * Token mapping (shadcn → preset):
 *   --foreground        → primary
 *   --muted-foreground  → secondary
 *   --primary           → accent
 *   --background        → background
 *   --card              → surface
 *   --border            → border
 *   --destructive       → error
 *   --warning (if present) → warning
 *   --success (if present) → success
 *
 * Dark mode (.dark block) → colors-dark
 */

import fs from "fs";
import path from "path";

// ── CLI args ──

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(`Usage: node css-to-preset.mjs <input.css> [output.json] [--name "My Theme"] [--id my-theme] [--font "Inter"]

Options:
  --name   Preset display name (default: derived from filename)
  --id     Preset ID, kebab-case (default: derived from name)
  --font   Font family name (default: Inter)
           Supported: Inter, Roboto, Open Sans, Geist, Poppins, Montserrat,
           Outfit, Plus Jakarta Sans, DM Sans, IBM Plex Sans, Nunito, Lato,
           Noto Sans, Nunito Sans, Figtree, Raleway, Public Sans,
           Delius Swash Caps, Barlow, Hind, Instrument Sans, Manrope,
           Oxanium, Gabriela, Source Code Pro`);
  process.exit(1);
}

let inputPath = null;
let outputPath = null;
let presetName = null;
let presetId = null;
let fontName = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--name") { presetName = args[++i]; continue; }
  if (args[i] === "--id") { presetId = args[++i]; continue; }
  if (args[i] === "--font") { fontName = args[++i]; continue; }
  if (!inputPath) { inputPath = args[i]; continue; }
  if (!outputPath) { outputPath = args[i]; continue; }
}

if (!inputPath) {
  console.error("Error: No input CSS file specified.");
  process.exit(1);
}

if (!outputPath) {
  const parsed = path.parse(inputPath);
  outputPath = path.join(parsed.dir, `${parsed.name}.preset.json`);
}

if (!presetName) {
  presetName = path.parse(inputPath).name
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

if (!presetId) {
  presetId = presetName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Color conversion ──

/**
 * Convert oklch(L C H) to hex.
 * oklch → oklab → linear sRGB → sRGB → hex
 */
function oklchToHex(l, c, h) {
  // oklch → oklab
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // oklab → linear sRGB
  // Using the OKLab → linear sRGB matrix from the W3C spec
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const l_c = l_ ** 3;
  const m_c = m_ ** 3;
  const s_c = s_ ** 3;

  let r = 4.0767416621 * l_c - 3.3077115913 * m_c + 0.2309699292 * s_c;
  let g = -1.2684380046 * l_c + 2.6097574011 * m_c - 0.3413193965 * s_c;
  let bl = -0.0041960863 * l_c - 0.7034186147 * m_c + 1.7076147010 * s_c;

  // linear sRGB → sRGB (gamma correction)
  r = r <= 0.0031308 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055;
  g = g <= 0.0031308 ? 12.92 * g : 1.055 * Math.pow(g, 1 / 2.4) - 0.055;
  bl = bl <= 0.0031308 ? 12.92 * bl : 1.055 * Math.pow(bl, 1 / 2.4) - 0.055;

  // Clamp and convert to 0-255
  r = Math.round(Math.max(0, Math.min(1, r)) * 255);
  g = Math.round(Math.max(0, Math.min(1, g)) * 255);
  bl = Math.round(Math.max(0, Math.min(1, bl)) * 255);

  return rgbToHex(r, g, bl);
}

/**
 * Convert HSL to hex.
 */
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r, g, b;
  if (h < 60) { [r, g, b] = [c, x, 0]; }
  else if (h < 120) { [r, g, b] = [x, c, 0]; }
  else if (h < 180) { [r, g, b] = [0, c, x]; }
  else if (h < 240) { [r, g, b] = [0, x, c]; }
  else if (h < 300) { [r, g, b] = [x, 0, c]; }
  else { [r, g, b] = [c, 0, x]; }
  return rgbToHex(
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  );
}

/**
 * Convert RGB to hex string.
 */
function rgbToHex(r, g, b) {
  const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Parse any CSS color value to hex.
 * Supports: oklch(), hsl(), rgb(), rgba(), #hex (3/4/6/8 digit), named colors.
 * @param value        The CSS color string
 * @param blendTarget  Hex color to blend alpha colors with (default: #FFFFFF)
 */
function colorToHex(value, blendTarget = "#FFFFFF") {
  const v = value.trim().toLowerCase();

  // oklch(L C H) or oklch(L C H / A)
  const oklchMatch = v.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*[\d.]+)?\s*\)/);
  if (oklchMatch) {
    return oklchToHex(parseFloat(oklchMatch[1]), parseFloat(oklchMatch[2]), parseFloat(oklchMatch[3]));
  }

  // oklch(L C) — no hue (grayscale)
  const oklchGrayMatch = v.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s*(?:\/\s*[\d.]+)?\s*\)/);
  if (oklchGrayMatch) {
    return oklchToHex(parseFloat(oklchGrayMatch[1]), parseFloat(oklchGrayMatch[2]), 0);
  }

  // oklch(L) — lightness only
  const oklchLMatch = v.match(/oklch\(\s*([\d.]+)\s*(?:\/\s*[\d.]+)?\s*\)/);
  if (oklchLMatch) {
    return oklchToHex(parseFloat(oklchLMatch[1]), 0, 0);
  }

  // hsl(H S% L%) or hsl(H, S%, L%)
  const hslMatch = v.match(/hsl\(\s*([\d.]+)\s*,?\s*([\d.]+)%\s*,?\s*([\d.]+)%\s*\)/);
  if (hslMatch) {
    return hslToHex(parseFloat(hslMatch[1]), parseFloat(hslMatch[2]), parseFloat(hslMatch[3]));
  }

  // rgb(R, G, B) or rgb(R G B)
  const rgbMatch = v.match(/rgb\(\s*(\d+)\s*,?\s*(\d+)\s*,?\s*(\d+)\s*\)/);
  if (rgbMatch) {
    return rgbToHex(parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3]));
  }

  // rgba(R, G, B, A) — ignore alpha, use RGB
  const rgbaMatch = v.match(/rgba?\(\s*(\d+)\s*,?\s*(\d+)\s*,?\s*(\d+)\s*,?\s*[\d.]*\s*\)/);
  if (rgbaMatch) {
    return rgbToHex(parseInt(rgbaMatch[1]), parseInt(rgbaMatch[2]), parseInt(rgbaMatch[3]));
  }

  // oklch with percentage: oklch(100% 0 0)
  const oklchPctMatch = v.match(/oklch\(\s*(\d+)%\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*[\d.]+)?\s*\)/);
  if (oklchPctMatch) {
    return oklchToHex(parseFloat(oklchPctMatch[1]) / 100, parseFloat(oklchPctMatch[2]), parseFloat(oklchPctMatch[3]));
  }

  // oklch(100% 0 0) — percentage lightness, no chroma
  const oklchPctGrayMatch = v.match(/oklch\(\s*(\d+)%\s+([\d.]+)\s*(?:\/\s*[\d.]+)?\s*\)/);
  if (oklchPctGrayMatch) {
    return oklchToHex(parseFloat(oklchPctGrayMatch[1]) / 100, parseFloat(oklchPctGrayMatch[2]), 0);
  }

  // oklch(100%) — percentage lightness only
  const oklchPctLMatch = v.match(/oklch\(\s*(\d+)%\s*(?:\/\s*[\d.]+)?\s*\)/);
  if (oklchPctLMatch) {
    return oklchToHex(parseFloat(oklchPctLMatch[1]) / 100, 0, 0);
  }

  // #hex (6-digit)
  if (/^#[0-9a-f]{6}$/.test(v)) return v.toUpperCase();

  // #hex (8-digit with alpha: #RRGGBBAA) — blend with target background
  const hex8Match = v.match(/^#([0-9a-f]{6})([0-9a-f]{2})$/);
  if (hex8Match) {
    const baseHex = `#${hex8Match[1]}`.toUpperCase();
    const alpha = parseInt(hex8Match[2], 16) / 255;
    return blendWithColor(baseHex, alpha, blendTarget);
  }

  // #hex (4-digit with alpha: #RGBA)
  const hex4Match = v.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])$/);
  if (hex4Match) {
    const baseHex = `#${hex4Match[1]}${hex4Match[1]}${hex4Match[2]}${hex4Match[2]}${hex4Match[3]}${hex4Match[3]}`.toUpperCase();
    const alpha = parseInt(`${hex4Match[4]}${hex4Match[4]}`, 16) / 255;
    return blendWithColor(baseHex, alpha, blendTarget);
  }

  // #hex (3-digit)
  if (/^#[0-9a-f]{3}$/.test(v)) {
    return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`.toUpperCase();
  }

  // oklch with alpha percentage on border/input: oklch(1 0 0 / 10%)
  // Already handled by the oklch regex above (the / A part is optional)

  // If it's a color with alpha like "oklch(1 0 0 / 10%)", we need to handle it
  // by blending with white (for light mode) or black (for dark mode)
  const oklchAlphaMatch = v.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\/\s*([\d.]+)%?\s*\)/);
  if (oklchAlphaMatch) {
    const [, l, c, h, aStr] = oklchAlphaMatch;
    const alpha = aStr.includes("%") ? parseFloat(aStr) / 100 : parseFloat(aStr);
    const baseHex = oklchToHex(parseFloat(l), parseFloat(c), parseFloat(h));
    return blendWithColor(baseHex, alpha, blendTarget);
  }

  console.warn(`  ⚠️  Could not parse color: "${value}" — using #888888 as fallback`);
  return "#888888";
}

/**
 * Blend a hex color with a target color at the given alpha.
 * Used for colors like oklch(1 0 0 / 10%) or #ffffff1a which are semi-transparent.
 * @param hex    The base hex color (e.g. "#FFFFFF")
 * @param alpha  Alpha value 0–1
 * @param blendTarget  The background color to blend with (default: white "#FFFFFF")
 */
function blendWithColor(hex, alpha, blendTarget = "#FFFFFF") {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const tr = parseInt(blendTarget.slice(1, 3), 16);
  const tg = parseInt(blendTarget.slice(3, 5), 16);
  const tb = parseInt(blendTarget.slice(5, 7), 16);
  const blendedR = Math.round(r * alpha + tr * (1 - alpha));
  const blendedG = Math.round(g * alpha + tg * (1 - alpha));
  const blendedB = Math.round(b * alpha + tb * (1 - alpha));
  return rgbToHex(blendedR, blendedG, blendedB);
}

// Backward-compatible alias
function blendWithWhite(hex, alpha) {
  return blendWithColor(hex, alpha, "#FFFFFF");
}

// ── CSS parsing ──

/**
 * Extract CSS variable blocks from a CSS file.
 * Returns { root: {...}, dark: {...} }.
 */
function parseCssBlocks(css) {
  const blocks = { root: {}, dark: {} };

  // Match :root { ... } blocks
  const rootRegex = /:root\s*\{([^}]*)\}/g;
  let match;
  while ((match = rootRegex.exec(css)) !== null) {
    const vars = parseVars(match[1]);
    Object.assign(blocks.root, vars);
  }

  // Match .dark { ... } blocks
  const darkRegex = /\.dark\s*\{([^}]*)\}/g;
  while ((match = darkRegex.exec(css)) !== null) {
    const vars = parseVars(match[1]);
    Object.assign(blocks.dark, vars);
  }

  return blocks;
}

/**
 * Parse CSS custom properties from a block body.
 */
function parseVars(body) {
  const vars = {};
  const lines = body.split(";").map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const match = line.match(/^--([\w-]+)\s*:\s*(.+)$/);
    if (match) {
      vars[`--${match[1]}`] = match[2].trim();
    }
  }
  return vars;
}

// ── Token mapping ──

/**
 * Map shadcn CSS variables to our preset token names.
 * @param vars   Parsed CSS variables (--name → value)
 * @param isDark If true, alpha colors are blended with the dark background
 *               instead of white.
 */
function mapTokens(vars, isDark = false) {
  // Determine the blend target: for dark mode, blend with the dark background
  let blendTarget = "#FFFFFF";
  if (isDark) {
    const darkBg = vars["--background"];
    if (darkBg) {
      // Parse the dark background to get a solid hex for blending
      blendTarget = colorToHex(darkBg, "#0A0A0A");
    } else {
      blendTarget = "#0A0A0A";
    }
  }

  const get = (key) => vars[key] ? colorToHex(vars[key], blendTarget) : null;

  const tokens = {
    primary: get("--foreground") || "#1A1A1A",
    secondary: get("--muted-foreground") || "#6B7280",
    accent: get("--primary") || "#2563EB",
    background: get("--background") || "#FFFFFF",
    surface: get("--card") || get("--background") || "#F8FAFC",
    border: get("--border") || "#E2E8F0",
    error: get("--destructive") || "#DC2626",
    warning: get("--warning") || "#EAB308",
    success: get("--success") || "#16A34A",
  };

  // Add extra tokens if present
  if (vars["--info"]) tokens.info = colorToHex(vars["--info"], blendTarget);
  if (vars["--ring"]) tokens.focusBorder = colorToHex(vars["--ring"], blendTarget);

  return tokens;
}

/**
 * Determine shadow level from CSS shadow variables.
 */
function detectShadowLevel(vars) {
  const shadowMd = vars["--shadow-md"] || vars["--shadow"] || "";
  if (!shadowMd || shadowMd === "none") return "none";

  // Check for opacity values to determine strength
  if (shadowMd.includes("/ 0.25") || shadowMd.includes("0.25")) return "strong";
  if (shadowMd.includes("/ 0.15") || shadowMd.includes("0.15")) return "medium";
  if (shadowMd.includes("/ 0.10") || shadowMd.includes("0.10")) return "subtle";
  if (shadowMd.includes("/ 0.05") || shadowMd.includes("0.05")) return "subtle";

  return "subtle";
}

/**
 * Detect border weight from CSS (default to thin).
 */
function detectBorderWeight(vars) {
  // shadcn doesn't explicitly define border weight in variables,
  // so we default to thin (1px)
  return "thin";
}

/**
 * Detect radius from --radius variable.
 */
function detectRadius(vars) {
  const radius = vars["--radius"];
  if (!radius) {
    return { sm: "4px", md: "6px", lg: "8px", xl: "12px", full: "9999px" };
  }

  // Parse the base radius value (e.g., "0.625rem", "0.5rem", "10px")
  const pxMatch = radius.match(/([\d.]+)px/);
  const remMatch = radius.match(/([\d.]+)rem/);

  let basePx;
  if (pxMatch) basePx = parseFloat(pxMatch[1]);
  else if (remMatch) basePx = parseFloat(remMatch[1]) * 16; // assume 16px base
  else basePx = 6; // default

  return {
    sm: `${Math.round(basePx * 0.6)}px`,
    md: `${Math.round(basePx * 0.8)}px`,
    lg: `${Math.round(basePx)}px`,
    xl: `${Math.round(basePx * 1.4)}px`,
    full: "9999px",
  };
}

// ── Main ──

function main() {
  console.log(`📖 Reading CSS: ${inputPath}`);
  const css = fs.readFileSync(inputPath, "utf-8");

  console.log("🔍 Parsing CSS variable blocks...");
  const blocks = parseCssBlocks(css);

  const rootVarCount = Object.keys(blocks.root).length;
  const darkVarCount = Object.keys(blocks.dark).length;
  console.log(`   Found ${rootVarCount} :root variables, ${darkVarCount} .dark variables`);

  if (rootVarCount === 0) {
    console.error("❌ No :root CSS variables found in the input file.");
    process.exit(1);
  }

  console.log("🎨 Converting colors to hex...");
  const lightColors = mapTokens(blocks.root, false);
  const darkColors = blocks.dark && Object.keys(blocks.dark).length > 0
    ? mapTokens(blocks.dark, true)
    : undefined;

  console.log("📐 Detecting radius, shadows, and border weight...");
  const radius = detectRadius(blocks.root);
  const shadows = detectShadowLevel(blocks.root);
  const borderWeight = detectBorderWeight(blocks.root);

  // ── Resolve font ──
  // Priority: --font flag > CSS --font-sans (if it's a real font, not a var()) > Inter default
  const SUPPORTED_FONTS = {
    "Inter": "'Inter', system-ui, sans-serif",
    "Roboto": "'Roboto', system-ui, sans-serif",
    "Open Sans": "'Open Sans', system-ui, sans-serif",
    "Geist": "'Geist', system-ui, sans-serif",
    "Poppins": "'Poppins', system-ui, sans-serif",
    "Montserrat": "'Montserrat', system-ui, sans-serif",
    "Outfit": "'Outfit', system-ui, sans-serif",
    "Plus Jakarta Sans": "'Plus Jakarta Sans', system-ui, sans-serif",
    "DM Sans": "'DM Sans', system-ui, sans-serif",
    "IBM Plex Sans": "'IBM Plex Sans', system-ui, sans-serif",
    "Nunito": "'Nunito', system-ui, sans-serif",
    "Lato": "'Lato', system-ui, sans-serif",
    "Noto Sans": "'Noto Sans', system-ui, sans-serif",
    "Nunito Sans": "'Nunito Sans', system-ui, sans-serif",
    "Figtree": "'Figtree', system-ui, sans-serif",
    "Raleway": "'Raleway', system-ui, sans-serif",
    "Public Sans": "'Public Sans', system-ui, sans-serif",
    "Delius Swash Caps": "'Delius Swash Caps', cursive",
    "Barlow": "'Barlow', system-ui, sans-serif",
    "Hind": "'Hind', system-ui, sans-serif",
    "Instrument Sans": "'Instrument Sans', system-ui, sans-serif",
    "Manrope": "'Manrope', system-ui, sans-serif",
    "Oxanium": "'Oxanium', system-ui, sans-serif",
    "Gabriela": "'Gabriela', serif",
    "Source Code Pro": "'Source Code Pro', 'JetBrains Mono', monospace",
  };

  let fontDisplayName = "Inter";
  let fontFamily = SUPPORTED_FONTS["Inter"];

  if (fontName) {
    // User specified a font via --font flag
    if (SUPPORTED_FONTS[fontName]) {
      fontDisplayName = fontName;
      fontFamily = SUPPORTED_FONTS[fontName];
    } else {
      console.warn(`  ⚠️  Unsupported font "${fontName}". Use one of: ${Object.keys(SUPPORTED_FONTS).join(", ")}`);
      console.warn(`     Falling back to Inter.`);
    }
  } else {
    // Try to auto-detect font from CSS.
    // Strategy:
    //   1. Detect --font-heading, --font-body, --font-mono separately
    //   2. Each may be var(--font-xxx) — extract "xxx", convert to Title Case
    //   3. Match against supported fonts catalog
    //   4. Use heading font for h1–h3, body font for body/small/caption, mono for code

    /**
     * Detect a font from a CSS variable, skipping circular refs.
     * Uses the LAST match (the @layer base :root block has the real values).
     */
    function detectFontFromVar(varName) {
      const regex = new RegExp(`${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*var\\(--font-([\\w-]+)\\)`, "g");
      let lastMatch = null;
      let m;
      while ((m = regex.exec(css)) !== null) {
        const detected = m[1];
        // Skip circular refs like --font-heading: var(--font-sans)
        if (["sans", "heading", "body", "mono"].includes(detected)) continue;
        lastMatch = detected;
      }
      if (!lastMatch) return null;
      return lastMatch.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }

    const detectedHeadingFont = detectFontFromVar("--font-heading");
    const detectedBodyFont = detectFontFromVar("--font-body");
    const detectedMonoFont = detectFontFromVar("--font-mono");
    const detectedSansFont = detectFontFromVar("--font-sans");

    // Pick the primary display font (for previewFont and fontDisplayName)
    const detectedPrimary = detectedHeadingFont ?? detectedBodyFont ?? detectedSansFont;

    if (detectedPrimary) {
      // Match against supported fonts
      for (const [name, stack] of Object.entries(SUPPORTED_FONTS)) {
        if (name.toLowerCase() === detectedPrimary.toLowerCase()) {
          fontDisplayName = name;
          fontFamily = stack;
          break;
        }
      }
      // If not in catalog, use generic fallback
      if (fontDisplayName === "Inter") {
        fontDisplayName = detectedPrimary;
        fontFamily = `'${detectedPrimary}', system-ui, sans-serif`;
      }
      console.log(`   🔍 Auto-detected heading font: ${detectedHeadingFont ?? "(none)"}`);
      console.log(`   🔍 Auto-detected body font: ${detectedBodyFont ?? "(none)"}`);
      console.log(`   🔍 Auto-detected mono font: ${detectedMonoFont ?? "(none)"}`);
    }

    // Also try direct font-family declarations (non-var values)
    if (fontDisplayName === "Inter") {
      const directMatch = css.match(/--font-sans:\s*([^;]+);/);
      if (directMatch) {
        const rawFont = directMatch[1].trim();
        if (!rawFont.includes("var(")) {
          for (const [name, stack] of Object.entries(SUPPORTED_FONTS)) {
            if (rawFont.includes(name)) {
              fontDisplayName = name;
              fontFamily = stack;
              console.log(`   🔍 Auto-detected font from CSS: ${name}`);
              break;
            }
          }
        }
      }
    }

    if (fontDisplayName === "Inter" && !fontName) {
      console.log(`   No font specified or detected — using Inter (default). Override with --font "FontName"`);
    }
  }

  // ── Resolve heading / body / mono font stacks ──

  function resolveFontStack(name) {
    if (!name) return null;
    for (const [n, stack] of Object.entries(SUPPORTED_FONTS)) {
      if (n.toLowerCase() === name.toLowerCase()) return stack;
    }
    return `'${name}', system-ui, sans-serif`;
  }

  // Detect fonts from CSS variables — use the LAST match (the @layer base :root
  // block has the real values; the @theme inline block has circular references)
  function detectLastFontVar(varName) {
    const regex = new RegExp(`${varName}\\s*:\\s*var\\(--font-([\\w-]+)\\)`, "g");
    let lastMatch = null;
    let m;
    while ((m = regex.exec(css)) !== null) {
      // Skip circular refs like --font-heading: var(--font-sans) or --font-sans: var(--font-heading)
      const detected = m[1];
      if (detected === "sans" || detected === "heading" || detected === "body" || detected === "mono") continue;
      lastMatch = detected;
    }
    if (!lastMatch) return null;
    return lastMatch.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }

  const headingFontName = detectLastFontVar("--font-heading");
  const bodyFontName = detectLastFontVar("--font-body");
  const monoFontName = detectLastFontVar("--font-mono");

  const headingFontStack = resolveFontStack(headingFontName) ?? fontFamily;
  const bodyFontStack = resolveFontStack(bodyFontName) ?? fontFamily;
  const monoFontStack = resolveFontStack(monoFontName) ?? "'JetBrains Mono', monospace";

  // Build swatches (5 colors for the preset card)
  const swatches = [
    lightColors.primary,
    lightColors.accent,
    lightColors.background,
    lightColors.surface,
    lightColors.border,
  ];

  // Determine category
  const isDarkTheme = lightColors.background === "#000000" ||
    parseInt(lightColors.background.slice(1, 3), 16) < 30;
  const category = isDarkTheme ? "dark" : "light";

  // Build the preset

  // ── Extract typography from CSS element rules (h1–h6, body) if present ──
  function extractTypoRule(selector) {
    // Match rules like: h1 { font-size: 2.5rem; line-height: 1.15; ... }
    const regex = new RegExp(`${selector}\\s*\\{([^}]*)\\}`, "g");
    let match;
    const props = {};
    while ((match = regex.exec(css)) !== null) {
      const body = match[1];
      const sizeMatch = body.match(/font-size:\s*([\d.]+)(rem|px|em)/);
      const lhMatch = body.match(/line-height:\s*([\d.]+)/);
      const lsMatch = body.match(/letter-spacing:\s*([\d.]+)(em|px)/);
      const fwMatch = body.match(/font-weight:\s*(\d+)/);
      if (sizeMatch) {
        const val = parseFloat(sizeMatch[1]);
        const unit = sizeMatch[2];
        props.fontSize = unit === "rem" ? `${Math.round(val * 16)}px` : `${val}${unit}`;
      }
      if (lhMatch) props.lineHeight = parseFloat(lhMatch[1]);
      if (lsMatch) props.letterSpacing = `${lsMatch[1]}${lsMatch[2]}`;
      if (fwMatch) props.fontWeight = parseInt(fwMatch[1]);
    }
    return Object.keys(props).length > 0 ? props : null;
  }

  const h1Props = extractTypoRule("h1");
  const h2Props = extractTypoRule("h2");
  const h3Props = extractTypoRule("h3");
  const bodyProps = extractTypoRule("body");

  const defaultHeadingWeight = h1Props?.fontWeight ?? 700;
  const defaultBodyWeight = bodyProps?.fontWeight ?? 400;

  const typography = {
    h1: { fontFamily: headingFontStack, fontSize: h1Props?.fontSize ?? "36px", fontWeight: h1Props?.fontWeight ?? defaultHeadingWeight, lineHeight: h1Props?.lineHeight ?? 1.2, ...(h1Props?.letterSpacing ? { letterSpacing: h1Props.letterSpacing } : { letterSpacing: "-0.02em" }) },
    h2: { fontFamily: headingFontStack, fontSize: h2Props?.fontSize ?? "28px", fontWeight: h2Props?.fontWeight ?? (defaultHeadingWeight > 400 ? defaultHeadingWeight : 600), lineHeight: h2Props?.lineHeight ?? 1.3, ...(h2Props?.letterSpacing ? { letterSpacing: h2Props.letterSpacing } : { letterSpacing: "-0.01em" }) },
    h3: { fontFamily: headingFontStack, fontSize: h3Props?.fontSize ?? "22px", fontWeight: h3Props?.fontWeight ?? (defaultHeadingWeight > 400 ? defaultHeadingWeight : 600), lineHeight: h3Props?.lineHeight ?? 1.4 },
    body: { fontFamily: bodyFontStack, fontSize: bodyProps?.fontSize ?? "16px", fontWeight: defaultBodyWeight, lineHeight: bodyProps?.lineHeight ?? 1.5 },
    small: { fontFamily: bodyFontStack, fontSize: "14px", fontWeight: defaultBodyWeight, lineHeight: 1.4 },
    caption: { fontFamily: bodyFontStack, fontSize: "12px", fontWeight: defaultBodyWeight, lineHeight: 1.4 },
    code: { fontFamily: monoFontStack, fontSize: "14px", fontWeight: 400, lineHeight: 1.5 },
  };

  const preset = {
    id: presetId,
    name: presetName,
    description: `Converted from ${path.basename(inputPath)}`,
    category,
    swatches,
    designMd: {
      name: presetName,
      description: `Design system converted from ${path.basename(inputPath)}`,
      colors: lightColors,
      ...(darkColors ? { "colors-dark": darkColors } : {}),
      typography,
      spacing: { xs: "8px", sm: "12px", md: "16px", lg: "24px", xl: "32px" },
      rounded: radius,
    },
    styleTraits: {
      shadows,
      borderWeight,
      headingWeight: defaultHeadingWeight,
      bodyWeight: defaultBodyWeight,
    },
    previewFont: fontDisplayName,
  };

  console.log("✅ Preset generated:");
  console.log(`   ID: ${preset.id}`);
  console.log(`   Name: ${preset.name}`);
  console.log(`   Category: ${preset.category}`);
  console.log(`   Font: ${fontDisplayName}`);
  console.log(`   Colors: ${Object.keys(preset.designMd.colors).length} tokens`);
  console.log(`   Dark mode: ${darkColors ? "Yes" : "No"}`);
  console.log(`   Shadows: ${shadows}`);
  console.log(`   Border: ${borderWeight}`);
  console.log(`   Radius: ${radius.md}`);

  fs.writeFileSync(outputPath, JSON.stringify(preset, null, 2) + "\n", "utf-8");
  console.log(`\n💾 Written to: ${outputPath}`);
  console.log(`\nTo use: copy this file to extension/data/presets/${preset.id}.json`);
}

main();
