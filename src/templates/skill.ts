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

### Step 3 — Detect the target platform

Before generating anything, determine what the user needs:

**Check the project for framework indicators:**
- \`package.json\` with \`react\` → React
- \`package.json\` with \`@angular/core\` → Angular
- \`package.json\` with \`vue\` → Vue
- \`.csproj\` with Blazor SDK → Blazor
- \`.csproj\` with MAUI/WPF/WinUI/WinForms → .NET desktop
- No framework detected → ask the user

**If the user explicitly says** "design a page", "show me a mockup", "create a preview" → they want a **design preview** (HTML).

**If the user says** "build this", "create the component", "implement this page" → they want **production code** in their framework.

**Choose the right path:**

| User intent | Target | Path |
|-------------|--------|------|
| Design exploration / preview | HTML screens | → **Path A** (below) |
| Production code (framework detected) | React / Angular / Blazor / Vue / etc. | → **Path B** (below) |
| Production code (no framework) | Ask the user | → Ask, then Path B |

---

## Path A — Design Previews (HTML screens)

Use this when the user wants to **explore and iterate on designs** before committing to a framework. HTML screens are quick to generate, easy to preview in a browser, and framework-agnostic.

### A1 — Export tokens

\`\`\`bash
cs-design export tokens --format css
\`\`\`

### A2 — Generate HTML screens

Save HTML files to \`.designs/screens/\`.

**Requirements:**
- Complete HTML document (\`<!DOCTYPE html>\` through \`</html>\`)
- **Link to shared \`tokens.css\`** — do NOT inline a \`:root\` block or hardcode token values
- Component styles in a \`<style>\` block using CSS variables
- Google Fonts \`<link>\` tags for fonts from DESIGN.md
- Responsive: mobile-first, works at 375px–1440px
- Semantic HTML: \`<header>\`, \`<main>\`, \`<nav>\`, \`<section>\`, \`<footer>\`
- Realistic content — **never use Lorem ipsum**
- Kebab-case filenames: \`landing-page.html\`, \`user-dashboard.html\`

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
    /* Only component styles here — use CSS variables, never hardcoded values */
    body { background: var(--color-background); color: var(--color-primary); font-family: var(--font-body-family); }
    h1   { font-family: var(--font-h1-family); font-size: var(--font-h1-size); font-weight: var(--font-h1-weight); }
    .btn { background: var(--color-accent); color: #fff; border-radius: var(--radius-md); padding: var(--space-sm) var(--space-lg); }
  </style>
</head>
<body>
  ...
</body>
</html>
\`\`\`

### A3 — Apply design changes

When DESIGN.md is updated, re-export tokens and all screens update automatically:

\`\`\`bash
cs-design apply
\`\`\`

### A4 — Track and manage screens

\`\`\`bash
cs-design screens list            # Human-readable
cs-design screens list --json     # Machine-readable
\`\`\`

---

## Path B — Production Code (framework components)

Use this when the user wants to **build the actual application** with Syncfusion components. Skip HTML screens entirely — generate framework code directly from DESIGN.md tokens.

### B1 — Install Syncfusion component skills

\`\`\`bash
cs-design skills add react          # or angular, blazor, vue, javascript
\`\`\`

This installs Syncfusion component skills with verified API knowledge. Install only the components you need:

\`\`\`bash
cs-design skills add react --only grid,scheduler,charts,inputs,buttons
\`\`\`

### B2 — Export tokens for the framework

\`\`\`bash
cs-design export tokens --format css          # For CSS-based frameworks (React, Angular, Vue)
cs-design export tokens --format tailwind     # For Tailwind projects
cs-design export tokens --format json         # For programmatic token access
\`\`\`

### B3 — Generate production components

Read the installed Syncfusion component skills (they are now at \`~/.agents/skills/syncfusion-<fw>-*\`) and generate production code directly.

**Map DESIGN.md tokens to the framework's styling approach:**

| Framework | Token mapping |
|-----------|--------------|
| React | Import \`tokens.css\`, use CSS variables in JSX/CSS modules |
| Angular | Import \`tokens.css\` in \`styles.css\`, use variables in component SCSS |
| Blazor | Import \`tokens.css\` in \`wwwroot/css\`, use variables in component CSS |
| Vue | Import \`tokens.css\` in \`main.ts\`, use variables in \`<style scoped>\` |

**Use the \`/syncfusion-components\` skill** for the full component catalog and install commands.

### B4 — Apply design changes to production code

\`\`\`bash
cs-design apply
\`\`\`

Re-exports \`tokens.css\`. Since production components also reference CSS variables, they update automatically.

---

## Switching Design Systems

\`\`\`bash
cs-design systems list                                    # See available systems
cs-design init "My App" --system bold-creative --force    # Switch system
cs-design systems install github:user/repo                # Install from GitHub
cs-design systems install ./path/to/system/               # Install from local path
cs-design systems create "My Brand"                       # Create empty system
\`\`\`

## Quality Checklist

Before finalizing any output (HTML screens or production components):

- [ ] \`cs-design validate\` passes with no errors
- [ ] All styling uses CSS variables from tokens.css — no hardcoded token values
- [ ] Colors, fonts, spacing, and radii match DESIGN.md tokens
- [ ] Responsive at 375px, 768px, and 1440px
- [ ] Accessible: heading hierarchy, alt text, sufficient contrast
- [ ] No Lorem ipsum or placeholder text
- [ ] Interactive states: hover, focus, active, disabled
`;
