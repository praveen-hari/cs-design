# cs-design — Specification

> A CLI tool that provides design system context for AI coding agents.
> The agent designs. The CLI manages the files.

**Version:** 0.1.0
**Status:** Draft
**Date:** 2026-06-24

---

## 1. Overview

`cs-design` is a lightweight CLI that scaffolds and manages design system files for AI-powered UI design workflows. It does NOT generate designs — it provides the structured context (DESIGN.md, tokens, skills) that AI agents read to produce consistent, brand-aligned UI screens.

### What it is

- A file scaffolder and validator for design systems
- A context provider for AI coding agents
- A design system package manager (install, create, list)
- A token exporter (YAML → CSS, Tailwind)

### What it is NOT

- Not an AI model or design generator
- Not a Figma replacement
- Not a build tool or framework
- Not tied to any specific AI agent or editor

### How it works

```
cs-design init "My App"
       │
       ▼
Creates .designs/ folder with:
  - DESIGN.md (brand tokens + prose)
  - project.json (screen registry)
  - SKILL.md (agent instructions)
       │
       ▼
AI agent reads SKILL.md → knows the workflow
AI agent reads DESIGN.md → knows the brand
AI agent generates screens → saves to .designs/screens/
```

---

## 2. Installation

```bash
npm install -g @syncfusion/cs-design
```

After installation, the `cs-design` command is available globally.

---

## 3. Commands

### 3.1 `cs-design init`

Initialize a new design project in the current directory.

```bash
cs-design init <project-name> [--system <system-id>]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `project-name` | Yes | Display name for the project |

**Options:**

| Option | Default | Description |
|--------|---------|-------------|
| `--system` | `modern-minimal` | Design system to use |

**What it creates:**

```
.designs/
├── DESIGN.md              ← Selected design system (Stitch-spec format)
├── project.json           ← Project metadata + screen registry
├── screens/               ← Empty directory for generated screens
└── SKILL.md               ← Agent instructions (auto-installed)
```

**project.json schema:**

```json
{
  "name": "My App",
  "system": "modern-minimal",
  "createdAt": "2026-06-24T10:00:00Z",
  "screens": {}
}
```

**Behavior:**
- Fails if `.designs/` already exists (use `--force` to overwrite)
- Copies the selected design system's DESIGN.md into `.designs/`
- Copies the bundled SKILL.md into `.designs/`
- Creates empty `screens/` directory

**Example:**

```bash
cs-design init "E-commerce App" --system bold-creative
```

---

### 3.2 `cs-design validate`

Validate the current project's DESIGN.md against the specification.

```bash
cs-design validate
```

**Checks performed:**

| Check | Severity | Description |
|-------|----------|-------------|
| YAML front matter exists | Error | Must have `---` delimited YAML block |
| `name` field present | Error | YAML must contain `name` |
| `colors` section present | Error | YAML must contain `colors` map |
| `typography` section present | Error | YAML must contain `typography` map |
| `spacing` section present | Warning | Recommended |
| `rounded` section present | Warning | Recommended |
| `components` section present | Warning | Recommended |
| Color values are valid hex | Error | Must match `#RRGGBB` format |
| Typography has fontFamily | Error | Each entry needs `fontFamily` |
| Typography has fontSize | Error | Each entry needs `fontSize` |
| Markdown has `## Overview` | Warning | Recommended section |
| Markdown has `## Colors` | Warning | Recommended section |
| Markdown has `## Typography` | Warning | Recommended section |
| Markdown has `## Components` | Warning | Recommended section |
| Markdown has `## Do's and Don'ts` | Warning | Recommended section |

**Output:**

```
✅ YAML front matter: valid
✅ name: "Modern Minimal"
✅ colors: 9 tokens defined
✅ typography: 3 levels defined
✅ spacing: 6 levels defined
⚠️  components: not defined (recommended)
✅ Markdown sections: 6/8 present

Result: VALID (1 warning)
```

**Exit codes:**
- `0` — Valid (warnings are OK)
- `1` — Invalid (errors found)

---

### 3.3 `cs-design screens list`

List all screens in the current project.

```bash
cs-design screens list [--json]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |

**Output (default):**

```
Project: E-commerce App (bold-creative)

  home.html          Landing page with hero and features
  login.html         Authentication page with social login
  dashboard.html     Analytics dashboard with stat cards

3 screens
```

**Output (--json):**

```json
{
  "project": "E-commerce App",
  "system": "bold-creative",
  "screens": [
    { "name": "home", "file": "home.html", "description": "Landing page with hero and features" },
    { "name": "login", "file": "login.html", "description": "Authentication page with social login" },
    { "name": "dashboard", "file": "dashboard.html", "description": "Analytics dashboard with stat cards" }
  ]
}
```

**Behavior:**
- Reads `project.json` for screen metadata
- Also scans `screens/` directory for any `.html` files not in `project.json`
- Fails if no `.designs/` directory found

---

### 3.4 `cs-design systems list`

List all available design systems (built-in + installed).

```bash
cs-design systems list
```

**Output:**

```
Built-in:
  modern-minimal     Clean, product-oriented. SaaS tools, dashboards.
  corporate-clean    Professional, trustworthy. Enterprise, B2B.
  bold-creative      Vibrant, expressive. Marketing, portfolios.

Installed:
  (none)
```

---

### 3.5 `cs-design systems install`

Install a design system from a source.

```bash
cs-design systems install <source>
```

**Supported sources:**

| Source | Example |
|--------|---------|
| Registry name | `cs-design systems install stripe` |
| GitHub repo | `cs-design systems install github:user/repo` |
| Local path | `cs-design systems install ./my-system/` |

**Behavior:**
- Downloads/copies the DESIGN.md to `~/.cs-design/systems/<name>/`
- Validates the DESIGN.md before installing
- Fails if the DESIGN.md is invalid

**Install location:**

```
~/.cs-design/
└── systems/
    ├── stripe/
    │   └── DESIGN.md
    └── linear/
        └── DESIGN.md
```

---

### 3.6 `cs-design systems create`

Scaffold a new empty design system.

```bash
cs-design systems create <name>
```

**What it creates:**

```
~/.cs-design/systems/<name>/
└── DESIGN.md              ← Template with empty sections
```

**Template DESIGN.md:**

```yaml
---
version: alpha
name: "<name>"
colors:
  primary: "#000000"
  secondary: "#666666"
  accent: "#0066FF"
  background: "#FFFFFF"
  surface: "#F5F5F5"
  border: "#E0E0E0"
typography:
  h1:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
---

# <name>

## Overview
Describe the visual identity and mood.

## Colors
Describe the color palette and usage rules.

## Typography
Describe the type system and hierarchy.

## Layout
Describe the grid, spacing, and containment.

## Elevation & Depth
Describe shadow and depth strategy.

## Shapes
Describe corner radius and shape language.

## Components
Describe button, card, input, and other component styles.

## Do's and Don'ts
List specific design rules.
```

---

### 3.7 `cs-design export tokens`

Export design tokens from DESIGN.md to other formats.

```bash
cs-design export tokens --format <format>
```

**Formats:**

| Format | Output | Description |
|--------|--------|-------------|
| `css` | `tokens.css` | CSS custom properties (`:root` block) |
| `tailwind` | `tailwind.theme.js` | Tailwind v4 theme config |
| `json` | `tokens.json` | Flat JSON key-value pairs |

**Example — CSS output:**

```bash
cs-design export tokens --format css
```

Reads DESIGN.md YAML front matter and generates:

```css
:root {
  --color-primary: #1A1C1E;
  --color-secondary: #6C7278;
  --color-accent: #B8422E;
  --color-background: #F7F5F2;
  --color-surface: #FFFFFF;
  --color-border: #E0E0E0;

  --font-h1-family: 'Public Sans', sans-serif;
  --font-h1-size: 48px;
  --font-h1-weight: 600;
  --font-h1-line-height: 1.1;
  --font-h1-letter-spacing: -0.02em;

  --font-body-family: 'Public Sans', sans-serif;
  --font-body-size: 16px;
  --font-body-weight: 400;
  --font-body-line-height: 1.6;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
}
```

**Output location:** Writes to `.designs/tokens.<ext>` by default. Use `--out <path>` to override.

---

## 4. DESIGN.md Format

`cs-design` uses the **Stitch DESIGN.md specification** (by Google) as the design system file format.

### Structure

A DESIGN.md file has two layers:

1. **YAML front matter** — machine-readable design tokens
2. **Markdown body** — human-readable design rationale

### YAML Schema

```yaml
---
version: alpha                          # Spec version
name: <string>                          # Required: system name
description: <string>                   # Optional: one-line description

colors:                                 # Required
  <token-name>: <hex-color>             # "#RRGGBB"

typography:                             # Required
  <token-name>:
    fontFamily: <string>                # Required
    fontSize: <dimension>               # Required (e.g., 48px)
    fontWeight: <number>                # Optional (e.g., 600)
    lineHeight: <number|dimension>      # Optional (e.g., 1.2 or 24px)
    letterSpacing: <dimension>          # Optional (e.g., -0.02em)

rounded:                                # Optional
  <scale-level>: <dimension>            # sm: 4px, md: 8px, etc.

spacing:                                # Optional
  <scale-level>: <dimension>            # xs: 4px, sm: 8px, etc.

components:                             # Optional
  <component-name>:
    backgroundColor: <color|ref>        # "{colors.primary}"
    textColor: <color|ref>
    rounded: <dimension|ref>            # "{rounded.md}"
    padding: <dimension>
---
```

### Token Types

| Type | Format | Example |
|------|--------|---------|
| Color | `#` + hex (sRGB) | `"#1A1C1E"` |
| Dimension | number + unit | `48px`, `-0.02em` |
| Token Reference | `{path.to.token}` | `{colors.primary}` |
| Typography | composite object | See schema above |

### Markdown Sections (8 canonical)

| # | Section | Description |
|---|---------|-------------|
| 1 | Overview | Brand personality, mood, visual style |
| 2 | Colors | Palette description and usage rules |
| 3 | Typography | Type system, hierarchy, font pairing |
| 4 | Layout | Grid, spacing, containment |
| 5 | Elevation & Depth | Shadow and depth strategy |
| 6 | Shapes | Corner radius, shape language |
| 7 | Components | Button, card, input styles |
| 8 | Do's and Don'ts | Explicit design rules |

Sections are optional. Unknown sections are preserved (extensible). Duplicate section headings are an error.

---

## 5. SKILL.md — Agent Instructions

The SKILL.md file teaches AI agents how to use the design system and follow the design workflow. It is copied to `.designs/SKILL.md` on `cs-design init`.

### What it contains

1. **How to read DESIGN.md** — parse YAML for tokens, read markdown for rationale
2. **How to generate screens** — self-contained HTML, use token values, save to `.designs/screens/`
3. **How to edit screens** — read current HTML, apply changes, overwrite the file
4. **Quality rules** — responsive, accessible, realistic content, no lorem ipsum
5. **Syncfusion component mapping** — when converting designs to production code

### Agent compatibility

The SKILL.md is plain markdown. Any agent that reads project files can use it:

| Agent | How it reads SKILL.md |
|-------|----------------------|
| Claude Code | Reads `.designs/SKILL.md` as project context |
| Cursor | Can be added to `.cursor/rules/` |
| Codex | Reads project files |
| Code Studio | Reads workspace files |
| Any LLM | Include in system prompt |

---

## 6. File Resolution Order

When looking for design systems:

```
1. .designs/DESIGN.md              ← Project-local (highest priority)
2. ~/.cs-design/systems/<id>/      ← User-installed
3. <cli-install>/systems/<id>/     ← Built-in (fallback)
```

---

## 7. Built-in Design Systems

| ID | Name | Category | Description |
|----|------|----------|-------------|
| `modern-minimal` | Modern Minimal | Starter | Clean, product-oriented. For SaaS, dashboards, utility pages. |
| `corporate-clean` | Corporate Clean | Professional | Trustworthy, structured. For enterprise, B2B platforms. |
| `bold-creative` | Bold Creative | Expressive | Vibrant, high-energy. For marketing, portfolios, creative agencies. |

---

## 8. Project File Structure

After `cs-design init` and agent generates some screens:

```
my-project/
├── .designs/
│   ├── DESIGN.md              ← Design system (YAML tokens + markdown prose)
│   ├── project.json           ← Project metadata + screen list
│   ├── SKILL.md               ← Agent workflow instructions
│   └── screens/
│       ├── home.html          ← Generated by agent
│       ├── login.html         ← Generated by agent
│       └── dashboard.html     ← Generated by agent
└── (existing project files)
```

---

## 9. Global File Structure

```
~/.cs-design/
└── systems/                   ← User-installed design systems
    ├── stripe/
    │   └── DESIGN.md
    └── linear/
        └── DESIGN.md
```

---

## 10. Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Validation error or command failure |
| `2` | Missing required argument |

---

## 11. Environment Variables

| Variable | Description |
|----------|-------------|
| `CS_DESIGN_HOME` | Override global config directory (default: `~/.cs-design/`) |

---

## 12. Future Considerations

These are NOT in scope for v0.1.0 but may be added later:

- **Registry server** — centralized design system marketplace
- **`cs-design extract <url>`** — extract brand from a live website
- **Stitch API integration** — upload DESIGN.md to Google Stitch
- **Code Studio extension** — sidebar UI, preview panels, canvas view
- **Syncfusion theme bridge** — map tokens to Syncfusion theme variables
- **Version history** — track screen changes over time
- **Approval workflow** — draft/review/approved status per screen
