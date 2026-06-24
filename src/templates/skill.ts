/**
 * SKILL.md template — Agent instructions for the design workflow.
 */

export const SKILL_MD_CONTENT = `# Design System Agent Skill

> This file teaches AI agents how to use the \`cs-design\` CLI and the design system to produce consistent, brand-aligned UI screens.
> Read this file first when working on UI screens in this project.

---

## Prerequisites

This project was initialized with the \`cs-design\` CLI. The CLI manages design system files, validates tokens, and exports them to CSS/Tailwind/JSON. You should use it throughout the workflow.

\`\`\`bash
# Verify the CLI is available
cs-design --version
\`\`\`

---

## 1. Understand the Design System

### Read DESIGN.md

The \`.designs/DESIGN.md\` file has two layers:

1. **YAML front matter** (between \`---\` markers) — machine-readable design tokens
2. **Markdown body** — human-readable design rationale and rules

\`\`\`yaml
---
colors:
  primary: "#1A1C1E"
  accent: "#2563EB"
typography:
  h1:
    fontFamily: "Inter"
    fontSize: "48px"
    fontWeight: 700
---
\`\`\`

Use these exact values in generated HTML/CSS. **Do not invent colors or fonts.**

### Read the rationale

The markdown sections describe **why** and **how** to use the tokens:
- **Overview** — brand personality and mood
- **Colors** — which color to use where
- **Typography** — hierarchy and pairing rules
- **Layout** — grid, spacing, containment
- **Components** — button, card, input styles
- **Do's and Don'ts** — explicit rules to follow

### Validate the design system

Before generating any screens, confirm the design system is valid:

\`\`\`bash
cs-design validate
\`\`\`

This checks YAML structure, color hex values, typography fields, and recommended markdown sections. Fix any errors before proceeding.

---

## 2. Export Tokens

Export design tokens to the format your screens or production code needs:

\`\`\`bash
# CSS custom properties (recommended for HTML screens)
cs-design export tokens --format css

# Tailwind v4 theme config
cs-design export tokens --format tailwind

# Flat JSON key-value pairs
cs-design export tokens --format json

# Custom output path
cs-design export tokens --format css --out ./src/tokens.css
\`\`\`

The exported \`.designs/tokens.css\` can be linked directly in generated HTML screens for token consistency, or you can inline the values.

---

## 3. Generate Screens

### File format

Generate **self-contained HTML files** saved to \`.designs/screens/\`.

Each screen must:
- Be a complete HTML document (\`<!DOCTYPE html>\` through \`</html>\`)
- Include all CSS inline in a \`<style>\` block (no external stylesheets)
- Include Google Fonts \`<link>\` tags for any fonts referenced in DESIGN.md
- Be responsive (mobile-first, works at 375px–1440px)
- Use semantic HTML (\`<header>\`, \`<main>\`, \`<nav>\`, \`<section>\`, \`<footer>\`)

### Token usage

- Use exact color hex values from DESIGN.md YAML (or reference the exported CSS variables)
- Use exact font families, sizes, and weights
- Use exact spacing and border-radius values
- Reference the component styles for buttons, cards, inputs

### Content rules

- Use **realistic content** — real product names, real copy, real data
- **Never use "Lorem ipsum"** or placeholder text
- Use realistic names, emails, dates, and numbers
- Images: use placeholder services like \`https://placehold.co/\` with appropriate dimensions

### File naming

- Use kebab-case: \`landing-page.html\`, \`user-dashboard.html\`
- Be descriptive: \`pricing-comparison.html\` not \`page3.html\`

---

## 4. Track Screens

After generating screens, use the CLI to see what exists:

\`\`\`bash
# Human-readable list
cs-design screens list

# Machine-readable JSON
cs-design screens list --json
\`\`\`

This scans \`.designs/screens/\` for HTML files and cross-references with \`project.json\`.

---

## 5. Edit Screens

1. Read the current HTML file from \`.designs/screens/<name>.html\`
2. Apply the requested changes
3. Overwrite the file with the updated content
4. Ensure all design tokens are still correctly applied
5. Run \`cs-design validate\` to confirm the design system is still intact

---

## 6. Switch or Explore Design Systems

\`\`\`bash
# See all available design systems
cs-design systems list

# Re-initialize with a different system (overwrites .designs/)
cs-design init "My App" --system bold-creative --force

# Install a system from GitHub
cs-design systems install github:user/design-system-repo

# Install from a local directory
cs-design systems install ./path/to/system/

# Create a brand-new empty system
cs-design systems create "My Brand"
\`\`\`

---

## 7. Quality Checklist

Before finalizing any screen, verify:

- [ ] \`cs-design validate\` passes with no errors
- [ ] All colors match DESIGN.md tokens exactly
- [ ] All fonts match DESIGN.md typography tokens
- [ ] Spacing follows the defined scale
- [ ] Border radii match the rounded tokens
- [ ] Responsive: works at 375px, 768px, and 1440px
- [ ] Accessible: proper heading hierarchy, alt text, sufficient contrast
- [ ] Semantic HTML: correct use of landmarks and elements
- [ ] No Lorem ipsum or placeholder text
- [ ] Interactive states: hover, focus, active, disabled
- [ ] Self-contained: no external CSS or JS dependencies (except Google Fonts)

---

## 8. Syncfusion Component Mapping

When converting designs to production code with Syncfusion components:

| Design Element | Syncfusion Component |
|---------------|---------------------|
| Data table | \`@syncfusion/ej2-react-grids\` — DataGrid |
| Charts | \`@syncfusion/ej2-react-charts\` — Chart |
| Date picker | \`@syncfusion/ej2-react-calendars\` — DatePicker |
| Dropdown | \`@syncfusion/ej2-react-dropdowns\` — DropDownList |
| Dialog/Modal | \`@syncfusion/ej2-react-popups\` — Dialog |
| Tabs | \`@syncfusion/ej2-react-navigations\` — Tab |
| Sidebar | \`@syncfusion/ej2-react-navigations\` — Sidebar |
| Toolbar | \`@syncfusion/ej2-react-navigations\` — Toolbar |
| Form inputs | \`@syncfusion/ej2-react-inputs\` — TextBox, NumericTextBox |
| Buttons | \`@syncfusion/ej2-react-buttons\` — Button |
| File upload | \`@syncfusion/ej2-react-inputs\` — Uploader |
| Rich text | \`@syncfusion/ej2-react-richtexteditor\` — RichTextEditor |
| Scheduler | \`@syncfusion/ej2-react-schedule\` — Schedule |
| TreeView | \`@syncfusion/ej2-react-navigations\` — TreeView |
| Kanban | \`@syncfusion/ej2-react-kanban\` — Kanban |

Export tokens first (\`cs-design export tokens --format css\`), then map CSS custom properties to Syncfusion theme variables when building production components.

---

## Quick Reference

\`\`\`bash
cs-design validate                          # Check DESIGN.md is valid
cs-design export tokens --format css        # Export CSS custom properties
cs-design export tokens --format tailwind   # Export Tailwind theme
cs-design export tokens --format json       # Export flat JSON tokens
cs-design screens list                      # List all screens
cs-design screens list --json               # List screens as JSON
cs-design systems list                      # Show available design systems
cs-design systems install <source>          # Install a design system
cs-design systems create <name>             # Create a new empty system
\`\`\`
`;
