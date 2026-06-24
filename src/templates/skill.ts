/**
 * SKILL.md template — Agent instructions for the design workflow.
 */

export const SKILL_MD_CONTENT = `---
name: cs-design
description: "Design and generate UI screens using the cs-design CLI and DESIGN.md tokens. Use when: creating UI screens, generating HTML pages, designing landing pages, building dashboards, applying design systems, exporting design tokens to CSS or Tailwind, validating design files, switching design systems, or converting designs to Syncfusion components."
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

### Step 3 — Export tokens (optional)

\`\`\`bash
cs-design export tokens --format css        # CSS custom properties → .designs/tokens.css
cs-design export tokens --format tailwind   # Tailwind theme → .designs/tokens.theme.js
cs-design export tokens --format json       # Flat JSON → .designs/tokens.json
cs-design export tokens --format css --out ./src/tokens.css  # Custom path
\`\`\`

### Step 4 — Generate screens

Save self-contained HTML files to \`.designs/screens/\`.

**Requirements:**
- Complete HTML document (\`<!DOCTYPE html>\` through \`</html>\`)
- All CSS inline in a \`<style>\` block (no external stylesheets)
- Google Fonts \`<link>\` tags for fonts from DESIGN.md
- Responsive: mobile-first, works at 375px–1440px
- Semantic HTML: \`<header>\`, \`<main>\`, \`<nav>\`, \`<section>\`, \`<footer>\`
- Exact color hex values, font families, sizes, weights, spacing, and border-radius from DESIGN.md
- Realistic content — **never use Lorem ipsum**
- Kebab-case filenames: \`landing-page.html\`, \`user-dashboard.html\`

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

## Syncfusion Component Mapping

When converting designs to production React code:

| Design Element | Syncfusion Package | Component |
|---------------|-------------------|-----------|
| Data table | \`ej2-react-grids\` | DataGrid |
| Charts | \`ej2-react-charts\` | Chart |
| Date picker | \`ej2-react-calendars\` | DatePicker |
| Dropdown | \`ej2-react-dropdowns\` | DropDownList |
| Dialog/Modal | \`ej2-react-popups\` | Dialog |
| Tabs | \`ej2-react-navigations\` | Tab |
| Sidebar | \`ej2-react-navigations\` | Sidebar |
| Toolbar | \`ej2-react-navigations\` | Toolbar |
| Form inputs | \`ej2-react-inputs\` | TextBox, NumericTextBox |
| Buttons | \`ej2-react-buttons\` | Button |
| File upload | \`ej2-react-inputs\` | Uploader |
| Rich text | \`ej2-react-richtexteditor\` | RichTextEditor |
| Scheduler | \`ej2-react-schedule\` | Schedule |
| TreeView | \`ej2-react-navigations\` | TreeView |
| Kanban | \`ej2-react-kanban\` | Kanban |

Export tokens first (\`cs-design export tokens --format css\`), then map CSS custom properties to Syncfusion theme variables.
`;
