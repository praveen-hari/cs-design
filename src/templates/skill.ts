/**
 * SKILL.md template — Agent instructions for the design workflow.
 */

export const SKILL_MD_CONTENT = `---
name: cs-design
description: "Design and generate UI screens using the cs-design CLI and DESIGN.md tokens. Use when: creating UI screens, generating HTML pages, designing landing pages, building dashboards, applying design system changes to screens, updating screens after design changes, re-applying tokens, exporting design tokens to CSS or Tailwind, validating design files, switching design systems, or converting designs to Syncfusion components."
argument-hint: "Describe the screen or UI task, e.g. 'create a pricing page' or 'export tokens as CSS'"
---

# cs-design — AI Design Workflow

Generate consistent, brand-aligned UI screens using the \`cs-design\` CLI and the project's design system.

## When to Use

- User asks to create, design, or generate a UI screen or HTML page
- User asks to apply or switch a design system
- User asks to export design tokens (CSS, Tailwind, JSON)
- User asks to validate a DESIGN.md file
- User asks to list or manage screens
- User asks to convert designs to Syncfusion production components

## Prerequisites

This project uses the \`cs-design\` CLI. Verify it is available:

\`\`\`bash
cs-design --version
\`\`\`

## Project Layout

\`\`\`
project-root/
├── .codestudio/skills/cs-design/
│   └── SKILL.md               ← This file (Agent Skills spec)
└── .designs/
    ├── DESIGN.md              ← Design system tokens + rationale
    ├── project.json           ← Project metadata + screen registry
    └── screens/               ← Generated HTML screens
\`\`\`

## Procedure

### Step 1 — Read the design system

Read the [DESIGN.md](../../../.designs/DESIGN.md) file. It has two layers:

1. **YAML front matter** (between \`---\` markers) — machine-readable design tokens (colors, typography, spacing, border-radius, components)
2. **Markdown body** — human-readable rationale: Overview, Colors, Typography, Layout, Components, Do's and Don'ts

Use the exact token values from YAML. **Never invent colors or fonts.**

### Step 2 — Validate

\`\`\`bash
cs-design validate
\`\`\`

Fix any errors before generating screens.

### Step 3 — Export tokens

Export tokens to CSS custom properties. **This is required before generating screens.**

\`\`\`bash
cs-design export tokens --format css        # CSS custom properties → .designs/tokens.css
cs-design export tokens --format tailwind   # Tailwind theme → .designs/tokens.theme.js
cs-design export tokens --format json       # Flat JSON → .designs/tokens.json
cs-design export tokens --format css --out ./src/tokens.css  # Custom path
\`\`\`

### Step 4 — Generate screens

Save HTML files to \`.designs/screens/\`.

**Requirements:**
- Complete HTML document (\`<!DOCTYPE html>\` through \`</html>\`)
- **Link to shared \`tokens.css\`** — do NOT inline a \`:root\` block
- Component styles in a \`<style>\` block using CSS variables
- Google Fonts \`<link>\` tags for fonts from DESIGN.md
- Responsive: mobile-first, works at 375px–1440px
- Semantic HTML: \`<header>\`, \`<main>\`, \`<nav>\`, \`<section>\`, \`<footer>\`
- Realistic content — **never use Lorem ipsum**
- Kebab-case filenames: \`landing-page.html\`, \`user-dashboard.html\`

**IMPORTANT — Link tokens.css, do NOT inline token values:**

Every screen must link to the shared \`tokens.css\` file and use CSS variables for all design token values. This ensures a single source of truth — when the design system changes, \`cs-design apply\` re-exports \`tokens.css\` and every screen updates automatically.

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Page Title</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

  <!-- ✅ Link to shared tokens — single source of truth -->
  <link rel="stylesheet" href="../tokens.css" />

  <style>
    /* ✅ CORRECT — only component styles here, using CSS variables */
    body { background: var(--color-background); color: var(--color-primary); font-family: var(--font-body-family); }
    h1   { font-family: var(--font-h1-family); font-size: var(--font-h1-size); font-weight: var(--font-h1-weight); }
    .btn { background: var(--color-accent); color: #fff; border-radius: var(--radius-md); padding: var(--space-sm) var(--space-lg); }
    .card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-lg); }
  </style>
</head>
<body>
  ...
</body>
</html>
\`\`\`

**Do NOT do this:**

\`\`\`html
<!-- ❌ WRONG — inlining :root block duplicates tokens in every screen -->
<style>
  :root {
    --color-primary: #1A1C1E;
    --color-accent: #2563EB;
  }
</style>

<!-- ❌ WRONG — hardcoded values break when design system changes -->
<style>
  .btn { background: #2563EB; border-radius: 8px; }
</style>
\`\`\`

### Step 4b — Apply design system changes

When the design system (DESIGN.md) is updated:

\`\`\`bash
cs-design apply
\`\`\`

This re-exports \`tokens.css\` from the updated DESIGN.md. Because all screens link to \`tokens.css\` via \`<link rel="stylesheet" href="../tokens.css" />\`, they pick up the new values automatically — no HTML patching needed.

### Step 5 — Track screens

\`\`\`bash
cs-design screens list            # Human-readable
cs-design screens list --json     # Machine-readable
\`\`\`

### Step 6 — Edit screens

1. Read the current file from \`.designs/screens/<name>.html\`
2. Apply changes while preserving all design tokens
3. Overwrite the file
4. Run \`cs-design validate\` to confirm integrity

### Step 7 — Switch design systems (if needed)

\`\`\`bash
cs-design systems list                                    # See available systems
cs-design init "My App" --system bold-creative --force    # Switch system
cs-design systems install github:user/repo                # Install from GitHub
cs-design systems install ./path/to/system/               # Install from local path
cs-design systems create "My Brand"                       # Create empty system
\`\`\`

## Quality Checklist

Before finalizing any screen:

- [ ] \`cs-design validate\` passes with no errors
- [ ] Colors, fonts, spacing, and radii match DESIGN.md tokens exactly
- [ ] Responsive at 375px, 768px, and 1440px
- [ ] Accessible: heading hierarchy, alt text, sufficient contrast
- [ ] Semantic HTML with correct landmarks
- [ ] No Lorem ipsum or placeholder text
- [ ] Interactive states: hover, focus, active, disabled
- [ ] Self-contained: no external CSS/JS (except Google Fonts)

## Converting to Production Code

To convert HTML screens to production framework code with Syncfusion components, use the \`/syncfusion-components\` skill. It handles framework detection, component skill installation, and API-correct code generation.
`;
