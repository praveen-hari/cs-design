---
name: design-system
description: "Create or edit a DESIGN.md design system file. Use when: user provides a screenshot, mockup, image, CSS file, HTML file, website URL, brand description, or color palette. Also use when user asks to create, extract, edit, update, or modify a design system, change colors, change fonts, adjust spacing, add tokens, remove tokens, or tweak any design system value. Handles brand extraction, color analysis, typography detection, design token generation, and WCAG contrast validation."
argument-hint: "Source or change, e.g. 'from this screenshot', 'change accent to blue', 'add dark mode', 'extract from this CSS'"
---

# design-system — Create or Edit Design System

Create a new DESIGN.md from any source, or edit an existing one. Handles both full creation and targeted edits (change a color, add a token, update typography, etc.).

## When to Use

**Creating a new design system:**
- User provides a screenshot, mockup, or design image
- User provides a CSS or HTML file to extract tokens from
- User provides a website URL to analyze
- User asks to create a design system from a text description ("modern SaaS", "like Stripe")
- User asks to extract or generate a design system

**Editing an existing design system:**
- User asks to change a color, typography, spacing, or component tokens
- User asks to add or remove tokens
- User asks to fix lint warnings or errors
- User asks to update the prose/rationale sections

**Determine which flow to use:**
- If `.designs/DESIGN.md` exists and user wants changes → **Edit flow**
- If `.designs/DESIGN.md` doesn't exist or user wants a fresh start → **Create flow**

## Prerequisites

### 1. Check CLI is installed

```bash
cs-design --version
```

If the command is not found, install it:

```bash
npm install -g @syncfusion/cs-design
```

### 2. Ensure `.designs/` folder exists

```bash
ls .designs/
```

If it does not exist, scaffold it first — then overwrite `DESIGN.md` with the generated content:

```bash
cs-design init "My Project"
```

## Output Location

Save the generated file to `.designs/DESIGN.md` (project-local).

## Procedure

### Step 0 — Get the specification

Before creating a DESIGN.md, get the full format specification:

```bash
# Full specification as markdown (human-readable)
cs-design spec

# Full specification as JSON (includes spec text, format rules, and lint rules)
cs-design spec --format json

# Just the lint rules
cs-design spec --rules-only
```

The specification defines the exact YAML schema, token types, section order, and validation rules. **Always follow it.**

### Step 1 — Analyze the source

**From an image/screenshot:**
- Identify the dominant color palette (primary, secondary, accent, background, surface, border)
- Identify typography (font families, sizes, weights from headings and body text)
- Identify spacing patterns (padding, margins, gaps)
- Identify border radius patterns (sharp, moderate, rounded, pill)
- Identify the overall mood (minimal, bold, corporate, playful, etc.)

**From CSS:**
- Extract CSS custom properties (`--color-*`, `--font-*`, `--space-*`, `--radius-*`)
- Extract color values from properties (`color`, `background-color`, `border-color`)
- Extract font declarations and spacing/border-radius values

**From HTML:**
- Parse `<style>` blocks and inline styles
- Extract the same tokens as CSS above
- Analyze the structure for component patterns

**From a URL:**
- Fetch the page and analyze the rendered styles
- Extract color, typography, and spacing tokens

**From a text description:**
- Interpret the mood and style direction
- Choose appropriate colors, typography, and spacing
- Reference well-known design systems when mentioned (e.g. "like Linear" → clean, minimal, dark-friendly)

### Step 2 — Build the token set

**Colors (required, minimum 6):**
- `primary` — main text and UI anchor color
- `secondary` — supporting text and labels
- `accent` — interactive elements, CTAs, links
- `background` — page background
- `surface` — cards, panels, elevated containers
- `border` — dividers, input borders
- `success`, `warning`, `error` — feedback colors (recommended)

All colors must be `#RRGGBB` hex format.

**Typography (required, minimum 2):**
Each entry needs at minimum `fontFamily` and `fontSize`:
- `h1` — primary heading (36–56px)
- `h2` — secondary heading (28–40px)
- `h3` — tertiary heading (20–28px)
- `body` — body text (15–18px)
- `small` — secondary text (13–15px)
- `caption` — metadata, labels (11–13px)

Optional per entry: `fontWeight`, `lineHeight`, `letterSpacing`.

**Spacing (recommended):**
- `xs`: 4px, `sm`: 8px, `md`: 16px, `lg`: 24px, `xl`: 32px, `2xl`: 48px

**Rounded (recommended):**
- `sm`: 2–6px, `md`: 6–12px, `lg`: 12–20px, `full`: 9999px

**Components (recommended):**
- `button`: backgroundColor, textColor, rounded, padding
- `card`: backgroundColor, textColor, rounded, padding
- `input`: backgroundColor, textColor, rounded, padding

### Step 3 — Write the DESIGN.md

The file has two parts:

**Part 1 — YAML front matter:**

```yaml
---
version: alpha
name: "System Name"
description: "One-line description"

colors:
  primary: "#1A1C1E"
  secondary: "#6C7278"
  accent: "#2563EB"
  background: "#FFFFFF"
  surface: "#F8FAFC"
  border: "#E2E8F0"
  success: "#16A34A"
  warning: "#EAB308"
  error: "#DC2626"

typography:
  h1:
    fontFamily: "Inter"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  h2:
    fontFamily: "Inter"
    fontSize: "36px"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5

rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  full: "9999px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"

components:
  button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
---
```

**Part 2 — Markdown body** with these 8 canonical sections:

```markdown
# System Name

## Overview
Brand personality, mood, visual style, best-for use cases.

## Colors
Palette description and usage rules for each color token.

## Typography
Type system, hierarchy, font pairing rationale.

## Layout
Grid system, spacing scale, containment rules, page margins.

## Elevation & Depth
Shadow strategy and depth levels.

## Shapes
Corner radius philosophy and shape language.

## Components
Button, card, input, table, and navigation component styles.

## Do's and Don'ts
Explicit design rules — what to do and what to avoid.
```

### Step 4 — Save, validate, and lint

```bash
# Full validation (structural + deep lint)
cs-design validate

# Deep lint only — more detailed findings
cs-design lint
cs-design lint --json    # Machine-readable output
```

Fix any errors reported — warnings are acceptable but should be reviewed.

---

## Edit Flow — Modifying an Existing DESIGN.md

### Edit Step 1 — Read the current DESIGN.md

Always read the existing `.designs/DESIGN.md` first. Understand the current token values and overall design intent.

### Edit Step 2 — Back up before editing

```bash
cp .designs/DESIGN.md .designs/DESIGN-backup.md
```

### Edit Step 3 — Make targeted changes

**Only modify what the user asked for. Preserve everything else.**

| User request | What to change | What to preserve |
|-------------|----------------|------------------|
| "Change accent to blue" | `colors.accent` value | All other colors, typography, spacing, components, prose |
| "Switch to Poppins font" | `fontFamily` in all typography entries | Font sizes, weights, line heights |
| "Make buttons more rounded" | `components.button.rounded` | All other component tokens |
| "Add a warning color" | Add `colors.warning` entry | All existing tokens |
| "Make headings larger" | `fontSize` in h1, h2, h3 | Font families, weights, body text |
| "Update the overview section" | `## Overview` markdown content | YAML front matter, other sections |

**Rules for editing:**
- Keep the `---` YAML delimiters intact
- Keep the `version` and `name` fields
- When changing a color, update the `## Colors` prose section to match
- When changing typography, update the `## Typography` prose section to match
- When adding component tokens, use `{token.references}` where possible
- Maintain canonical section order

### Edit Step 4 — Compare, validate, and confirm

```bash
cs-design diff .designs/DESIGN-backup.md .designs/DESIGN.md
cs-design validate
cs-design lint
```
