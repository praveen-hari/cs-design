/**
 * create-design-system SKILL.md — Teaches agents how to create a valid
 * DESIGN.md from any source: image, CSS, HTML, URL, text description, or brand brief.
 */

export const CREATE_DESIGN_SKILL_MD_CONTENT = `---
name: create-design-system
description: "Create or edit a DESIGN.md design system file. Use when: user provides a screenshot, mockup, image, CSS file, HTML file, website URL, brand description, color palette, or asks to create, extract, edit, update, or modify a design system. Also use when user asks to change colors, fonts, spacing, add tokens, remove tokens, or tweak the design system. Handles brand extraction, color analysis, typography detection, design token generation, and WCAG contrast validation."
argument-hint: "Describe the change, e.g. 'from this screenshot', 'change accent to blue', 'add a dark mode palette'"
---

# Create or Edit Design System

Create a new DESIGN.md from any source, or edit an existing one. Handles both full creation and targeted edits (change a color, add a token, update typography, etc.).

## When to Use

**Creating a new design system:**
- User provides a screenshot, mockup, or design image
- User provides a CSS or HTML file to extract tokens from
- User provides a website URL to analyze
- User asks to create a design system from a text description ("modern SaaS", "like Stripe")
- User asks to extract or generate a design system

**Editing an existing design system:**
- User asks to change a color ("make the accent blue", "darken the background")
- User asks to change typography ("switch to Poppins", "make headings larger")
- User asks to add tokens ("add a warning color", "add an xl spacing")
- User asks to remove tokens ("remove the caption typography")
- User asks to update components ("make buttons more rounded")
- User asks to update the prose/rationale sections
- User asks to fix lint warnings or errors

**Determine which flow to use:**
- If \`.designs/DESIGN.md\` exists and user wants changes → **Edit flow** (below)
- If \`.designs/DESIGN.md\` doesn't exist or user wants a fresh start → **Create flow** (below)

## Output Location

Save the generated file to \`.designs/DESIGN.md\` (project-local).

If \`.designs/\` doesn't exist yet, run \`cs-design init "Project Name"\` first, then overwrite the DESIGN.md.

## Procedure

### Step 0 — Get the specification

Before creating a DESIGN.md, get the full format specification:

\`\`\`bash
# Full specification as markdown (human-readable)
cs-design spec

# Full specification as JSON (machine-readable — includes spec text, format rules, and lint rules)
cs-design spec --format json

# Just the lint rules
cs-design spec --rules-only
\`\`\`

The specification defines the exact YAML schema, token types, section order, and validation rules. **Always follow it.**

### Step 1 — Analyze the source

**From an image/screenshot:**
- Identify the dominant color palette (primary, secondary, accent, background, surface, border)
- Identify typography (font families, sizes, weights from headings and body text)
- Identify spacing patterns (padding, margins, gaps)
- Identify border radius patterns (sharp, moderate, rounded, pill)
- Identify component styles (buttons, cards, inputs)
- Identify the overall mood (minimal, bold, corporate, playful, etc.)

**From CSS:**
- Extract CSS custom properties (\`--color-*\`, \`--font-*\`, \`--space-*\`, \`--radius-*\`)
- Extract color values from properties (\`color\`, \`background-color\`, \`border-color\`)
- Extract font declarations (\`font-family\`, \`font-size\`, \`font-weight\`, \`line-height\`)
- Extract spacing values (\`padding\`, \`margin\`, \`gap\`)
- Extract border-radius values

**From HTML:**
- Parse \`<style>\` blocks and inline styles
- Extract the same tokens as CSS above
- Analyze the structure for component patterns

**From a URL:**
- Fetch the page and analyze the rendered styles
- Use the browser to inspect computed styles if available
- Extract the same tokens as HTML above

**From a text description:**
- Interpret the mood and style direction
- Choose appropriate colors, typography, and spacing
- Reference well-known design systems for inspiration when mentioned (e.g. "like Linear" → clean, minimal, dark-friendly)

### Step 2 — Build the token set

Assemble these required tokens:

**Colors (required, minimum 6):**
- \`primary\` — main text and UI anchor color
- \`secondary\` — supporting text and labels
- \`accent\` — interactive elements, CTAs, links
- \`background\` — page background
- \`surface\` — cards, panels, elevated containers
- \`border\` — dividers, input borders
- \`success\` — positive feedback (recommended)
- \`warning\` — caution feedback (recommended)
- \`error\` — error feedback (recommended)

All colors must be \`#RRGGBB\` hex format.

**Typography (required, minimum 2):**
Each entry needs at minimum \`fontFamily\` and \`fontSize\`:
- \`h1\` — primary heading (36–56px)
- \`h2\` — secondary heading (28–40px)
- \`h3\` — tertiary heading (20–28px)
- \`body\` — body text (15–18px)
- \`small\` — secondary text (13–15px)
- \`caption\` — metadata, labels (11–13px)

Optional per entry: \`fontWeight\`, \`lineHeight\`, \`letterSpacing\`.

**Spacing (recommended):**
- \`xs\`: 4px, \`sm\`: 8px, \`md\`: 16px, \`lg\`: 24px, \`xl\`: 32px, \`2xl\`: 48px

**Rounded (recommended):**
- \`sm\`: 2–6px, \`md\`: 6–12px, \`lg\`: 12–20px, \`full\`: 9999px

**Components (recommended):**
- \`button\`: backgroundColor, textColor, rounded, padding
- \`card\`: backgroundColor, textColor, rounded, padding
- \`input\`: backgroundColor, textColor, rounded, padding

### Step 3 — Write the DESIGN.md

The file has two parts:

**Part 1 — YAML front matter** (between \`---\` markers):

\`\`\`yaml
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
\`\`\`

**Part 2 — Markdown body** with these 8 canonical sections:

\`\`\`markdown
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
\`\`\`

### Step 4 — Save, validate, and lint

1. Write the file to \`.designs/DESIGN.md\`
2. Run \`cs-design validate\` to confirm structural validity + deep lint
3. Run \`cs-design lint\` for detailed findings (WCAG contrast, broken refs, orphaned tokens)
4. Fix any errors reported — warnings are acceptable but should be reviewed
5. Confirm the result with the user

\`\`\`bash
# Full validation (structural + deep lint)
cs-design validate

# Deep lint only — more detailed findings
cs-design lint
cs-design lint --json    # Machine-readable output
\`\`\`

---

## Edit Flow — Modifying an Existing DESIGN.md

When the user wants to **change** the existing design system (not create from scratch):

### Edit Step 1 — Read the current DESIGN.md

Always read the existing \`.designs/DESIGN.md\` first. Understand:
- Current token values (colors, typography, spacing, rounded, components)
- Current markdown rationale sections
- The overall design intent

### Edit Step 2 — Back up before editing

\`\`\`bash
cp .designs/DESIGN.md .designs/DESIGN-backup.md
\`\`\`

### Edit Step 3 — Make targeted changes

**Only modify what the user asked for.** Preserve everything else.

| User request | What to change | What to preserve |
|-------------|----------------|------------------|
| "Change accent to blue" | \`colors.accent\` value | All other colors, typography, spacing, components, prose |
| "Switch to Poppins font" | \`fontFamily\` in all typography entries | Font sizes, weights, line heights, colors, spacing |
| "Make buttons more rounded" | \`components.button.rounded\` | All other component tokens |
| "Add a warning color" | Add \`colors.warning\` entry | All existing tokens |
| "Make headings larger" | \`fontSize\` in h1, h2, h3 | Font families, weights, body text |
| "Update the overview section" | \`## Overview\` markdown content | YAML front matter, other sections |

**Rules for editing:**
- Keep the \`---\` YAML delimiters intact
- Keep the \`version\` and \`name\` fields
- When changing a color, update the \`## Colors\` prose section to match
- When changing typography, update the \`## Typography\` prose section to match
- When adding component tokens, use \`{token.references}\` where possible (e.g., \`"{colors.accent}"\`)
- Maintain canonical section order

### Edit Step 4 — Validate and diff

\`\`\`bash
# Validate the edited file
cs-design validate

# Deep lint
cs-design lint

# Compare before/after to verify only intended changes were made
cs-design diff .designs/DESIGN-backup.md .designs/DESIGN.md
\`\`\`

The diff shows exactly which tokens were added, removed, or modified. Verify:
- ✅ Only the requested tokens changed
- ✅ No unintended regressions (new errors or warnings)
- ✅ No tokens were accidentally removed

### Edit Step 5 — Apply changes

\`\`\`bash
# Re-export tokens.css — all screens update automatically
cs-design apply
\`\`\`

Clean up the backup if everything looks good:

\`\`\`bash
rm .designs/DESIGN-backup.md
\`\`\`

## Quality Rules

- All color values must be valid \`#RRGGBB\` hex
- Every typography entry must have \`fontFamily\` and \`fontSize\`
- No duplicate \`##\` section headings
- The markdown body should have substantive content in each section, not just placeholders
- Choose fonts available on Google Fonts for web compatibility
- Ensure sufficient contrast between text colors and backgrounds (WCAG AA minimum — 4.5:1 ratio)
- The design system should feel cohesive — colors, typography, and spacing should work together
- Component token references (\`{colors.primary}\`) must resolve to defined tokens
- Sections should appear in canonical order: Overview → Colors → Typography → Layout → Elevation & Depth → Shapes → Components → Do's and Don'ts

## Common Font Pairings

| Style | Heading Font | Body Font |
|-------|-------------|-----------|
| Modern minimal | Inter | Inter |
| Corporate | Source Sans Pro | Source Sans Pro |
| Bold creative | Sora | DM Sans |
| Editorial | Playfair Display | Source Serif Pro |
| Technical | JetBrains Mono | Inter |
| Friendly | Nunito | Open Sans |
| Elegant | Cormorant Garamond | Lato |
| Startup | Space Grotesk | IBM Plex Sans |
`;
