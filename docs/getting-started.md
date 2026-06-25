# Getting Started with cs-design

A step-by-step guide to using `cs-design` — from installation to building production applications with Syncfusion components.

---

## Table of Contents

1. [Installation](#1-installation)
2. [Create a Design Project](#2-create-a-design-project)
3. [Understand the DESIGN.md Format](#3-understand-the-designmd-format)
4. [Validate and Lint Your Design System](#4-validate-and-lint-your-design-system)
5. [Create a Design System from Scratch](#5-create-a-design-system-from-scratch)
6. [Import a Design from External Sources](#6-import-a-design-from-external-sources)
7. [Export Design Tokens](#7-export-design-tokens)
8. [Generate HTML Screen Previews](#8-generate-html-screen-previews)
9. [Dark Mode Support](#9-dark-mode-support)
10. [Build Production Apps with Syncfusion Components](#10-build-production-apps-with-syncfusion-components)
11. [Compare and Iterate on Designs](#11-compare-and-iterate-on-designs)
12. [Manage Design Systems](#12-manage-design-systems)
13. [Using the SDK Programmatically](#13-using-the-sdk-programmatically)

---

## 1. Installation

### Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later
- An AI-powered code editor (Code Studio, VS Code with Copilot, Cursor, etc.)

### Install the CLI

**From npm (when published):**

```bash
npm install -g @syncfusion/cs-design
```

**From a shared tarball:**

```bash
npm install -g ./syncfusion-cs-design-0.1.0.tgz
```

### Verify installation

```bash
cs-design --version
# 0.1.0
```

---

## 2. Create a Design Project

### Initialize with a built-in design system

```bash
mkdir my-app && cd my-app
cs-design init "My App"
```

This creates:

```
my-app/
├── .codestudio/skills/
│   ├── cs-design/SKILL.md              ← Design workflow instructions for AI agents
│   ├── create-design-system/SKILL.md   ← How to create/edit DESIGN.md
│   └── syncfusion-components/SKILL.md  ← Syncfusion component catalog
├── .designs/
│   ├── DESIGN.md                       ← Your design system (tokens + rationale)
│   ├── project.json                    ← Project metadata
│   └── screens/                        ← Generated HTML screens go here
```

### Choose a specific design system

```bash
cs-design init "My App" --system bold-creative
```

**Built-in systems:**

| ID | Name | Best for |
|----|------|----------|
| `modern-minimal` | Modern Minimal | SaaS, dashboards, utility pages |
| `corporate-clean` | Corporate Clean | Enterprise, B2B platforms |
| `bold-creative` | Bold Creative | Marketing, portfolios, creative agencies |

### Re-initialize (overwrite existing)

```bash
cs-design init "My App" --system corporate-clean --force
```

---

## 3. Understand the DESIGN.md Format

The `DESIGN.md` file is the heart of your design system. It follows the [Stitch DESIGN.md specification](https://github.com/google-labs-code/design.md) with two layers:

### Layer 1: YAML Front Matter (machine-readable tokens)

```yaml
---
version: alpha
name: "My App"
description: "Clean SaaS design system"

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

colors-dark:
  primary: "#E8EAED"
  secondary: "#9AA0A6"
  accent: "#60A5FA"
  background: "#121212"
  surface: "#1E1E1E"
  border: "#333333"
  success: "#4ADE80"
  warning: "#FACC15"
  error: "#F87171"

typography:
  h1:
    fontFamily: "Inter"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6

rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"

spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"

components:
  button:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
---
```

### Layer 2: Markdown Body (human-readable rationale)

```markdown
# My App

## Overview
Clean, product-oriented design for a SaaS dashboard...

## Colors
The palette is rooted in high-contrast neutrals...

## Typography
Inter is used throughout for clarity and readability...

## Layout
8px grid system with 16px base spacing...

## Elevation & Depth
Subtle shadows for cards and modals...

## Shapes
Moderate rounding (8px default) for a friendly feel...

## Components
Buttons use the accent color with medium rounding...

## Do's and Don'ts
- DO use accent color only for primary CTAs
- DON'T use more than 2 font weights per screen
```

### View the full specification

```bash
cs-design spec                  # Human-readable
cs-design spec --rules          # Include lint rules
cs-design spec --format json    # Machine-readable (for agents)
```

---

## 4. Validate and Lint Your Design System

### Quick validation (structural + deep lint)

```bash
cs-design validate
```

This runs two passes:
1. **Structural** — checks YAML structure, required fields, hex color format
2. **Deep lint** — WCAG contrast, broken token references, orphaned tokens

### Deep lint only

```bash
cs-design lint                    # Pretty output
cs-design lint --json             # Machine-readable (for CI/CD)
cs-design lint path/to/DESIGN.md  # Lint a specific file
```

**What the linter checks:**

| Rule | Severity | What it catches |
|------|----------|-----------------|
| `broken-ref` | error | `{colors.primary}` references that don't resolve |
| `contrast-ratio` | warning | Text/background pairs below WCAG AA (4.5:1) |
| `orphaned-tokens` | warning | Colors defined but never used in components |
| `missing-primary` | warning | No `primary` color defined |
| `section-order` | warning | Markdown sections out of canonical order |
| `unknown-key` | warning | YAML typos like `colours:` instead of `colors:` |

---

## 5. Create a Design System from Scratch

### Using the AI agent

Open your AI agent (Code Studio, Copilot, etc.) and ask:

> "Create a design system for a modern fintech dashboard — dark-friendly, professional, with blue accents"

The agent reads the `create-design-system` skill and:
1. Runs `cs-design spec --format json` to get the specification
2. Generates a complete DESIGN.md with tokens + rationale
3. Saves it to `.designs/DESIGN.md`
4. Runs `cs-design validate` and `cs-design lint` to verify

### Using the CLI scaffold

```bash
cs-design systems create "Fintech Pro"
```

This creates an empty design system template that you can customize.

### Editing an existing design system

Ask the agent:

> "Change the accent color to #7C3AED and switch the font to Poppins"

The agent will:
1. Read the existing `.designs/DESIGN.md`
2. Back up to `.designs/DESIGN-backup.md`
3. Make only the requested changes
4. Run `cs-design diff .designs/DESIGN-backup.md .designs/DESIGN.md` to verify
5. Run `cs-design apply` to update tokens.css

---

## 6. Import a Design from External Sources

### From a screenshot or mockup

Ask the agent:

> "Create a design system from this screenshot"

(Attach the image) — The agent analyzes colors, typography, spacing, and generates a DESIGN.md.

### From a CSS file

> "Extract a design system from this CSS file"

The agent parses CSS custom properties, color values, font declarations, and spacing.

### From a website URL

> "Create a design system inspired by linear.app"

The agent analyzes the site's visual style and generates matching tokens.

### From a text description

> "Create a design system: minimal, dark mode, monospace fonts, green accents, for a developer tool"

### From another DESIGN.md (GitHub)

```bash
# Install a design system from a GitHub repo
cs-design systems install github:user/their-design-system

# Use it in your project
cs-design init "My App" --system their-design-system --force
```

### From a local file

```bash
# Install from a local directory
cs-design systems install ./path/to/design-system/

# Or directly copy a DESIGN.md
cp /path/to/other/DESIGN.md .designs/DESIGN.md
cs-design validate
```

---

## 7. Export Design Tokens

Export your design tokens to any format your project needs:

```bash
# CSS custom properties (most common)
cs-design export tokens --format css
# → .designs/tokens.css

# Tailwind v3 theme config
cs-design export tokens --format tailwind
# → .designs/tokens.theme.js

# Tailwind v4 CSS @theme block
cs-design export tokens --format css-tailwind
# → .designs/tokens.css

# Flat JSON key-value pairs
cs-design export tokens --format json
# → .designs/tokens.json

# W3C Design Tokens (DTCG) standard
cs-design export tokens --format dtcg
# → .designs/tokens.tokens.json

# Export to a custom path
cs-design export tokens --format css --out ./src/styles/tokens.css
```

### What the CSS export looks like

```css
/* Light theme (default) */
:root {
  --color-primary: #1A1C1E;
  --color-accent: #2563EB;
  --color-background: #FFFFFF;
  --font-h1-family: 'Inter', sans-serif;
  --font-h1-size: 48px;
  --radius-md: 8px;
  --space-md: 16px;
}

/* Dark theme — via data-theme="dark" attribute */
[data-theme="dark"] {
  --color-primary: #E8EAED;
  --color-accent: #60A5FA;
  --color-background: #121212;
}

/* Dark theme — auto via OS preference */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-primary: #E8EAED;
    --color-accent: #60A5FA;
    --color-background: #121212;
  }
}
```

---

## 8. Generate HTML Screen Previews

### Ask the AI agent

> "Design a pricing page for my SaaS app"

The agent reads your DESIGN.md tokens and generates an HTML file at `.designs/screens/pricing-page.html`.

### Key rules for generated screens

- Links to `../tokens.css` (shared token file)
- Uses CSS variables (`var(--color-accent)`) — never hardcoded values
- Responsive (375px–1440px)
- Semantic HTML
- Realistic content (no Lorem ipsum)

### Apply design changes

When you edit DESIGN.md, update all screens at once:

```bash
cs-design apply
```

This re-exports `tokens.css`. All screens update automatically because they use CSS variables.

### List screens

```bash
cs-design screens list
cs-design screens list --json
```

---

## 9. Dark Mode Support

If your DESIGN.md has a `colors-dark` section, dark mode works automatically.

### In HTML screens

Add a toggle button:

```html
<button onclick="document.documentElement.dataset.theme =
  document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'">
  Toggle Dark Mode
</button>
```

No extra CSS needed — the same `var(--color-background)` automatically switches values.

### Three activation methods

1. **Manual toggle** — Set `data-theme="dark"` on `<html>`
2. **OS preference** — Automatically follows `prefers-color-scheme: dark`
3. **Force light** — Set `data-theme="light"` to override OS dark mode

---

## 10. Build Production Apps with Syncfusion Components

This is the full workflow: design system → Syncfusion production code.

### Step 1: Install Syncfusion component skills

```bash
# Install all component skills for your framework
cs-design skills add react

# Or install only what you need
cs-design skills add react --only grid,charts,inputs,buttons

# Check installed skills
cs-design skills list
```

**Supported frameworks:**

| Framework | Command |
|-----------|---------|
| React | `cs-design skills add react` |
| Angular | `cs-design skills add angular` |
| Vue | `cs-design skills add vue` |
| Blazor | `cs-design skills add blazor` |
| JavaScript | `cs-design skills add javascript` |
| .NET MAUI | `cs-design skills add maui` |
| WPF | `cs-design skills add wpf` |
| WinUI | `cs-design skills add winui` |
| WinForms | `cs-design skills add winforms` |

### Step 2: Export tokens for your framework

```bash
# For React/Angular/Vue (CSS-based)
cs-design export tokens --format css --out ./src/styles/tokens.css

# For Tailwind projects
cs-design export tokens --format tailwind --out ./tailwind.theme.js

# For Tailwind v4
cs-design export tokens --format css-tailwind --out ./src/theme.css
```

### Step 3: Ask the AI agent to build

> "Build a dashboard page with a data grid, charts, and a sidebar using Syncfusion components. Use the design tokens from DESIGN.md."

The agent will:
1. Read your DESIGN.md for brand tokens
2. Read the installed Syncfusion component skills for API knowledge
3. Generate production React/Angular/Vue code with:
   - Correct Syncfusion imports and setup
   - CSS variables from your design system
   - Proper component configuration

### Step 4: Convert HTML previews to production code

If you already have HTML screen previews:

> "Convert the dashboard screen at .designs/screens/dashboard.html to React with Syncfusion components"

### Step 5: Apply design changes

```bash
# Edit DESIGN.md (change colors, fonts, etc.)
# Then re-export tokens:
cs-design apply
```

Production components using CSS variables update automatically.

### Example: React Dashboard

```bash
# 1. Initialize design project
cs-design init "Analytics Dashboard" --system modern-minimal

# 2. Install React + Syncfusion skills
cs-design skills add react --only grid,charts,sidebar,buttons

# 3. Export tokens
cs-design export tokens --format css --out ./src/tokens.css

# 4. Ask the agent to build
# "Build an analytics dashboard with a sidebar, data grid, and line chart"

# 5. Iterate on the design
# Edit .designs/DESIGN.md → change accent color
cs-design apply
# All components update automatically
```

---

## 11. Compare and Iterate on Designs

### Compare two versions

```bash
# Before editing, save a backup
cp .designs/DESIGN.md .designs/DESIGN-backup.md

# Edit the design system...

# Compare changes
cs-design diff .designs/DESIGN-backup.md .designs/DESIGN.md
```

Output shows:
- **Added** tokens (new colors, typography, etc.)
- **Removed** tokens
- **Modified** tokens (changed values)
- **Regression detection** (new lint errors or warnings)

### JSON output for CI/CD

```bash
cs-design diff old.md new.md --json
```

### Switch between design systems

```bash
# See available systems
cs-design systems list

# Switch to a different system
cs-design init "My App" --system bold-creative --force

# Apply the new tokens
cs-design apply
```

---

## 12. Manage Design Systems

### List available systems

```bash
cs-design systems list
```

Shows built-in systems + any you've installed.

### Install from GitHub

```bash
cs-design systems install github:username/repo-name
```

The repo must contain a valid `DESIGN.md` at the root.

### Install from a local path

```bash
cs-design systems install ./path/to/design-system/
```

### Create a new empty system

```bash
cs-design systems create "My Brand"
```

Creates a template in `~/.cs-design/systems/my-brand/DESIGN.md` that you can customize.

### Use an installed system

```bash
cs-design init "My App" --system my-brand
```

---

## 13. Using the SDK Programmatically

The SDK provides pure functions for embedding in extensions, MCP servers, or CI/CD pipelines.

### Install

```bash
npm install @syncfusion/cs-design
```

### Import

```ts
// Pure SDK (no file I/O, no side effects)
import { parseDesignMd, validate, lint, diff, exportTokens } from "@syncfusion/cs-design/sdk";

// Full library (SDK + file-system utilities)
import { parseDesignMd, validate, lint, readDesignMd } from "@syncfusion/cs-design";
```

### Quick example

```ts
import { parseDesignMd, validate, lint, exportTokens } from "@syncfusion/cs-design/sdk";
import fs from "fs";

const content = fs.readFileSync(".designs/DESIGN.md", "utf-8");

// Parse
const parsed = parseDesignMd(content);
if (parsed.ok) {
  console.log(parsed.data.yaml.name);    // "Modern Minimal"
  console.log(parsed.data.yaml.colors);  // { primary: "#1A1C1E", ... }
}

// Validate
const validation = validate(content);
if (validation.ok) {
  console.log(validation.data.valid);       // true
  console.log(validation.data.errorCount);  // 0
}

// Lint
const lintResult = lint(content);
if (lintResult.ok) {
  for (const f of lintResult.data.findings) {
    console.log(`[${f.severity}] ${f.message}`);
  }
}

// Export CSS
const css = exportTokens(content, "css");
if (css.ok) {
  fs.writeFileSync("tokens.css", css.data.content);
}
```

All functions return `Result<T>` — they never throw:

```ts
type Result<T> = { ok: true; data: T } | { ok: false; error: string };
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Initialize project | `cs-design init "My App"` |
| Validate | `cs-design validate` |
| Deep lint | `cs-design lint` |
| Export CSS tokens | `cs-design export tokens --format css` |
| Apply changes | `cs-design apply` |
| Compare versions | `cs-design diff old.md new.md` |
| View spec | `cs-design spec` |
| List screens | `cs-design screens list` |
| List systems | `cs-design systems list` |
| Install system | `cs-design systems install github:user/repo` |
| Add Syncfusion skills | `cs-design skills add react` |
| List skills | `cs-design skills list` |
| Remove skills | `cs-design skills remove react` |

---

## Workflow Summary

```
┌─────────────────────────────────────────────────────────────┐
│  1. SETUP                                                    │
│     cs-design init "My App" --system modern-minimal          │
│                                                              │
│  2. DESIGN                                                   │
│     Edit .designs/DESIGN.md (or ask AI to create/edit)       │
│     cs-design validate && cs-design lint                     │
│                                                              │
│  3. EXPORT                                                   │
│     cs-design export tokens --format css                     │
│     cs-design apply                                          │
│                                                              │
│  4. PREVIEW                                                  │
│     Ask AI: "Design a pricing page"                          │
│     → .designs/screens/pricing-page.html                     │
│                                                              │
│  5. BUILD                                                    │
│     cs-design skills add react                               │
│     Ask AI: "Convert to React with Syncfusion components"    │
│     → Production React code with design tokens               │
│                                                              │
│  6. ITERATE                                                  │
│     Edit DESIGN.md → cs-design apply → everything updates    │
│     cs-design diff old.md new.md → verify changes            │
└─────────────────────────────────────────────────────────────┘
```
