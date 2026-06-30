---
name: design-screens
description: "Generate and manage UI screens using DESIGN.md tokens and cs-design tools. Use when: creating UI screens, generating HTML pages, designing landing pages, building dashboards, applying design system changes to screens, updating screens after design changes, re-applying tokens, exporting design tokens to CSS or Tailwind, validating design files, linting for WCAG contrast issues, comparing design versions, or switching design systems."
argument-hint: "Describe the screen or UI task, e.g. 'create a pricing page', 'export tokens as CSS', or 'lint the design'"
---

# design-screens — AI Screen Generation Workflow

Generate consistent, brand-aligned UI screens using the cs-design tools and the project's design system.

## When to Use

- User asks to create, design, or generate a UI screen or HTML page
- User asks to apply or switch a design system
- User asks to export design tokens (CSS, Tailwind, JSON, DTCG)
- User asks to validate or lint a DESIGN.md file
- User asks to compare two design system versions
- User asks to list or manage screens

> For converting designs to production framework code (React, Angular, etc.), use the **syncfusion-components** skill instead.

## Prerequisites

Check if `.designs/DESIGN.md` exists. If not, use the `#cs-design-init` tool to create the project:

**Tool:** `cs-design_init` — Creates `.designs/` with DESIGN.md, project.json, tokens.css.

Available built-in systems: `modern-minimal` (default), `corporate-clean`, `bold-creative`.

## Project Layout

```
project-root/
└── .designs/
    ├── DESIGN.md              ← Design system tokens + rationale
    ├── project.json           ← Project metadata + screen registry
    ├── tokens.css             ← Exported CSS custom properties
    └── screens/               ← Generated HTML screens
```

## Available Tools

| Tool | Purpose |
|------|---------|
| `cs-design_init` | Initialize a new design project with a built-in system |
| `cs-design_validate` | Structural validation — reports errors and warnings |
| `cs-design_lint` | Deep lint (WCAG contrast, broken refs, orphaned tokens) |
| `cs-design_exportTokens` | Export tokens: `css`, `tailwind`, `json`, `css-tailwind`, `dtcg` |
| `cs-design_listSystems` | List available built-in design systems |
| `cs-design_getSpec` | Get the DESIGN.md format specification |

## Procedure

### Step 1 — Read the design system

Read the `.designs/DESIGN.md` file. It has two layers:

1. **YAML front matter** (between `---` markers) — machine-readable design tokens (colors, typography, spacing, border-radius, components)
2. **Markdown body** — human-readable rationale: Overview, Colors, Typography, Layout, Components, Do's and Don'ts

Use the exact token values from YAML. **Never invent colors or fonts.**

### Step 2 — Validate and lint

Run both structural validation and deep lint:

1. **Tool:** `cs-design_validate` — Structural validation, reports errors and warnings.
2. **Tool:** `cs-design_lint` — Deep lint (WCAG contrast, broken refs, orphaned tokens).

The deep linter checks:
- **broken-ref** — Token references like `{colors.primary}` that don't resolve
- **contrast-ratio** — WCAG AA contrast failures (4.5:1 minimum)
- **orphaned-tokens** — Color tokens never referenced by any component
- **missing-primary** — No primary color defined
- **section-order** — Sections out of canonical order
- **unknown-key** — Likely YAML key typos (e.g. `colours:` → `colors:`)

Fix any errors before generating screens.

### Step 3 — Detect the target platform

Before generating anything, determine what the user needs:

**Check the project for framework indicators:**
- `package.json` with `react` → React
- `package.json` with `@angular/core` → Angular
- `package.json` with `vue` → Vue
- `.csproj` with Blazor SDK → Blazor
- `.csproj` with MAUI/WPF/WinUI/WinForms → .NET desktop
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

**Tool:** `cs-design_exportTokens` with format `css`.

### A2 — Generate HTML screens

Save HTML files to `.designs/screens/`.

**Requirements:**
- Complete HTML document (`<!DOCTYPE html>` through `</html>`)
- **Link to shared `tokens.css`** — do NOT inline a `:root` block or hardcode token values
- Component styles in a `<style>` block using CSS variables
- Google Fonts `<link>` tags for fonts from DESIGN.md
- Responsive: mobile-first, works at 375px–1440px
- Semantic HTML: `<header>`, `<main>`, `<nav>`, `<section>`, `<footer>`
- Realistic content — **never use Lorem ipsum**
- Kebab-case filenames: `landing-page.html`, `user-dashboard.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Page Title</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

  <!-- Link to shared tokens — single source of truth -->
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
```

### A3 — Apply design changes

When DESIGN.md is updated, re-export tokens and all screens update automatically:

**Tool:** `cs-design_exportTokens` with format `css` — re-exports tokens.css and all screens update automatically.

### A6 — Preview in the Integrated Browser

Once a screen is generated, open it directly in the **Code Studio integrated browser** so the user can review the design without leaving the editor.

Resolve the absolute `file://` path for the screen and open it:

```
file:///absolute/path/to/.designs/screens/<screen-name>.html
```

**When to trigger this step:**
- After generating a new HTML screen (run automatically — don't wait to be asked)
- After `cs-design_exportTokens` re-exports tokens and screens change
- After the user asks to "preview", "open", "show me", or "view" any screen

**Multiple screens:** If multiple screens were generated or updated in one task, open them sequentially — one tab per screen — so the user can review each.

**Checklist before opening:**
- Confirm the file exists at `.designs/screens/<name>.html`
- Confirm `tokens.css` is exported and present at `.designs/tokens.css`
- Confirm `cs-design_validate` passes (no blocking errors)

> The integrated browser renders live HTML+CSS. The user can inspect, scroll, and interact with the page directly inside Code Studio.

---

## Path B — Production Code (framework components)

Use this when the user wants to **build the actual application** with Syncfusion components. Skip HTML screens entirely — generate framework code directly from DESIGN.md tokens.

### B1 — Use Syncfusion component skills

The Syncfusion component skills (syncfusion-react-grid, syncfusion-react-charts, etc.) provide API knowledge for generating production code. Refer to the **syncfusion-components** skill for the full component catalog.

### B2 — Export tokens for the framework

**Tool:** `cs-design_exportTokens` — Supports formats: `css`, `tailwind`, `json`, `css-tailwind`, `dtcg`.

### B3 — Generate production components

Read the installed Syncfusion component skills at `~/.agents/skills/syncfusion-<fw>-*` and generate production code directly.

| Framework | Token mapping |
|-----------|--------------|
| React | Import `tokens.css`, use CSS variables in JSX/CSS modules |
| Angular | Import `tokens.css` in `styles.css`, use variables in component SCSS |
| Blazor | Import `tokens.css` in `wwwroot/css`, use variables in component CSS |
| Vue | Import `tokens.css` in `main.ts`, use variables in `<style scoped>` |

### B4 — Apply design changes to production code

**Tool:** `cs-design_exportTokens` with format `css` — re-exports tokens.css. Since production components also reference CSS variables, they update automatically.

### B5 — Preview HTML prototypes in the Integrated Browser (optional)

If HTML mockups exist alongside production code (e.g. for reference during development), open them in the Code Studio integrated browser using the `file://` URI:

```
file:///absolute/path/to/.designs/screens/<screen-name>.html
```

> Use this to let the user compare the HTML prototype side-by-side with the production implementation.

---

## Switching Design Systems

**Tool:** `cs-design_listSystems` — Lists available built-in systems.
**Tool:** `cs-design_init` with system parameter — Initialize with a specific system.

## Dark Mode Support

If the DESIGN.md has a `colors-dark` section, the design system supports dark mode.

The `cs-design_exportTokens` tool with format `css` generates three CSS blocks:
1. `:root { ... }` — light theme (default)
2. `[data-theme="dark"] { ... }` — dark theme via attribute
3. `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ... } }` — auto dark via OS preference

```html
<button onclick="document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'">
  Toggle Dark Mode
</button>
```

## Quality Checklist

- [ ] `cs-design_lint` tool reports no errors (warnings are acceptable)
- [ ] All styling uses CSS variables from tokens.css — no hardcoded token values
- [ ] Colors, fonts, spacing, and radii match DESIGN.md tokens
- [ ] Responsive at 375px, 768px, and 1440px
- [ ] Accessible: heading hierarchy, alt text, sufficient contrast (WCAG AA)
- [ ] No Lorem ipsum or placeholder text
- [ ] Interactive states: hover, focus, active, disabled
- [ ] If `colors-dark` exists, screens work in both light and dark modes
- [ ] Cross-page consistency: header, nav, footer identical across all screens
- [ ] **Screen opened in the integrated browser** for user review (Path A — always do this)

## Cross-Page Consistency Rules

| Element | Rule |
|---------|------|
| **Header / Nav** | Copy exact HTML from most recent existing screen — never regenerate |
| **Footer** | Same — copy verbatim from an existing screen |
| **tokens.css link** | Every screen must use `<link rel="stylesheet" href="../tokens.css" />` |
| **Color values** | Always use CSS variables (`var(--color-primary)`). Never hardcode hex values |
| **Spacing scale** | Use spacing variables (`var(--space-sm)`, `var(--space-md)`, etc.) |
| **Border radius** | Use radius variables (`var(--radius-md)`) |

### Consistency Procedure (Multi-Screen Projects)

1. **Read the most recent screen** in `.designs/screens/` to extract the `<head>`, `<header>`, `<footer>`, and shared styles
2. **Copy those shared elements verbatim** into the new screen
3. **Only write new markup** for the `<main>` content area
4. **Update navigation** — add the new page to the nav in ALL existing screens
5. **Verify internal links** — all `href` attributes must point to real screen files

## Design Mappings

### UI Element Refinement

| User says | Generate as |
|-----------|-------------|
| "menu at the top" | Sticky navigation bar with logo, menu items, and mobile hamburger |
| "big photo" | Full-width hero section with overlay text |
| "list of things" | Responsive card grid with hover states |
| "button" | Primary CTA button with hover/focus/active transitions |
| "form" | Form with labelled inputs, validation states, and submit button |
| "sidebar" | Collapsible side navigation with icon-label pairings |
| "popup" | Modal dialog with backdrop overlay |
| "pricing" | Pricing comparison cards with highlighted recommended tier |
| "stats" | Metric cards with icon, number, label, and trend indicator |
| "FAQ" | Accordion with expand/collapse and smooth animation |

### Atmosphere & Vibe Translation

| User says | Translate to |
|-----------|-------------|
| "Modern" | Clean lines, generous whitespace, high-contrast typography |
| "Professional" | Sophisticated palette, subtle shadows, structured grid |
| "Fun / Playful" | Vibrant accent colors, rounded corners, bold typography |
| "Luxury" | Spacious layout, fine hairline borders, serif headers |
| "Minimal" | Maximum whitespace, limited color palette, thin borders |
| "Corporate" | Structured grid, blue/grey palette, data-dense layouts |
