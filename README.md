# cs-design

> A CLI tool that provides design system context for AI coding agents.

**The agent designs. The CLI manages the files.**

## What it does

`cs-design` scaffolds and manages design system files for AI-powered UI design workflows. It provides the structured context (DESIGN.md, tokens, agent skills) that AI agents read to produce consistent, brand-aligned UI screens — then convert them to production code with Syncfusion components.

```
cs-design init "My App"
       │
       ▼
Creates:
  .designs/                          ← Design system + screens
    ├── DESIGN.md                    ← Brand tokens + prose
    ├── project.json                 ← Screen registry
    └── screens/                     ← Generated HTML screens
  .codestudio/skills/                ← Agent Skills (open standard)
    ├── cs-design/SKILL.md           ← Design workflow
    ├── syncfusion-components/SKILL.md ← Component skill router
    └── create-design-system/SKILL.md  ← Design system creator
       │
       ▼
AI agent reads skills → knows the workflow
AI agent reads DESIGN.md → knows the brand
AI agent generates screens → saves to .designs/screens/
AI agent runs cs-design skills add react → gets Syncfusion API knowledge
AI agent converts screens → production React/Angular/Blazor code
```

## Install

```bash
npm install -g @syncfusion/cs-design
```

## Quick Start

```bash
# Initialize a project with the default design system
cs-design init "My App"

# Or pick a specific system
cs-design init "My App" --system bold-creative

# Validate your DESIGN.md
cs-design validate

# Export tokens to CSS
cs-design export tokens --format css

# List screens
cs-design screens list

# Apply design changes to all screens
cs-design apply

# Install Syncfusion component skills for AI agents
cs-design skills add react
```

## Commands

### Project

| Command | Description |
|---------|-------------|
| `cs-design init <name> [--system <id>] [--force]` | Initialize a new design project |
| `cs-design validate` | Validate DESIGN.md against the spec |
| `cs-design apply` | Re-export tokens and update all screens after DESIGN.md changes |

### Screens

| Command | Description |
|---------|-------------|
| `cs-design screens list [--json]` | List all screens in the project |

### Design Systems

| Command | Description |
|---------|-------------|
| `cs-design systems list` | List available design systems (built-in + installed) |
| `cs-design systems install <source>` | Install from GitHub or local path |
| `cs-design systems create <name>` | Create a new empty design system |

### Token Export

| Command | Description |
|---------|-------------|
| `cs-design export tokens --format css` | Export CSS custom properties |
| `cs-design export tokens --format tailwind` | Export Tailwind v4 theme config |
| `cs-design export tokens --format json` | Export flat JSON key-value pairs |
| `cs-design export tokens --format css --out <path>` | Export to custom path |

### Syncfusion Component Skills

| Command | Description |
|---------|-------------|
| `cs-design skills add <framework>` | Install all Syncfusion component skills (non-interactive) |
| `cs-design skills add <framework> --only grid,charts` | Install specific components only |
| `cs-design skills list [--json]` | List installed Syncfusion skills |
| `cs-design skills remove <framework>` | Remove skills for a framework |

**Supported frameworks:** `react`, `angular`, `blazor`, `javascript`, `vue`, `maui`, `wpf`, `winui`, `winforms`

## Built-in Design Systems

| ID | Name | Best for |
|----|------|----------|
| `modern-minimal` | Modern Minimal | SaaS, dashboards, utility pages |
| `corporate-clean` | Corporate Clean | Enterprise, B2B platforms |
| `bold-creative` | Bold Creative | Marketing, portfolios, creative agencies |

## Agent Skills (Open Standard)

`cs-design init` places three [Agent Skills](https://code.visualstudio.com/docs/agent-customization/agent-skills) into your project. These are portable — they work with any skills-compatible AI agent (Code Studio, VS Code Copilot, Claude, Cursor, etc.).

| Skill | Purpose |
|-------|---------|
| `cs-design` | Design workflow — read tokens, generate screens with CSS variables, validate, apply changes |
| `create-design-system` | Create DESIGN.md from any source — images, CSS, HTML, URLs, text descriptions |
| `syncfusion-components` | Install and use Syncfusion component skills for production code generation |

### How the skills work

1. **Agent reads `cs-design` skill** → knows how to generate HTML screens using design tokens
2. **Agent reads `create-design-system` skill** → can create a DESIGN.md from a screenshot, CSS file, or text description
3. **Agent reads `syncfusion-components` skill** → runs `cs-design skills add react` to install component skills, then generates production Syncfusion code

### CSS Variables & Apply

Screens use CSS custom properties (`var(--color-accent)`) instead of hardcoded hex values. When you change the design system:

```bash
# Edit DESIGN.md (change accent color, fonts, etc.)
# Then apply to all screens:
cs-design apply
```

All screens update automatically because they reference CSS variables, not hardcoded values.

## DESIGN.md Format

Uses the **Stitch DESIGN.md specification** — YAML front matter for machine-readable tokens, markdown body for human-readable rationale.

```yaml
---
version: alpha
name: "My System"
colors:
  primary: "#1A1C1E"
  accent: "#2563EB"
  background: "#FFFFFF"
typography:
  h1:
    fontFamily: "Inter"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: 1.1
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
---

# My System

## Overview
Brand personality, mood, visual style...

## Colors
Palette description and usage rules...

## Typography
Type system and hierarchy...
```

## Project Structure

```
my-project/
├── .codestudio/skills/
│   ├── cs-design/SKILL.md              ← Design workflow skill
│   ├── syncfusion-components/SKILL.md  ← Component skill router
│   └── create-design-system/SKILL.md   ← Design system creator
├── .designs/
│   ├── DESIGN.md                       ← Design system (tokens + prose)
│   ├── project.json                    ← Project metadata
│   ├── tokens.css                      ← Exported CSS custom properties
│   └── screens/
│       ├── landing-page.html           ← Generated by agent
│       ├── dashboard.html              ← Generated by agent
│       └── settings.html               ← Generated by agent
└── (your existing project files)
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CS_DESIGN_HOME` | Override global config directory (default: `~/.cs-design/`) |

## License

MIT
