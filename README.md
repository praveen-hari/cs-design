# cs-design

> A CLI tool that provides design system context for AI coding agents.

**The agent designs. The CLI manages the files.**

## What it does

`cs-design` scaffolds and manages design system files for AI-powered UI design workflows. It provides the structured context (DESIGN.md, tokens, skills) that AI agents read to produce consistent, brand-aligned UI screens.

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

# List screens
cs-design screens list

# Export tokens to CSS
cs-design export tokens --format css
```

## Commands

| Command | Description |
|---------|-------------|
| `cs-design init <name>` | Initialize a new design project |
| `cs-design validate` | Validate DESIGN.md against the spec |
| `cs-design screens list` | List all screens in the project |
| `cs-design systems list` | List available design systems |
| `cs-design systems install <source>` | Install a design system |
| `cs-design systems create <name>` | Create a new empty design system |
| `cs-design export tokens --format <fmt>` | Export tokens (css, tailwind, json) |

## Built-in Design Systems

| ID | Name | Best for |
|----|------|----------|
| `modern-minimal` | Modern Minimal | SaaS, dashboards, utility pages |
| `corporate-clean` | Corporate Clean | Enterprise, B2B platforms |
| `bold-creative` | Bold Creative | Marketing, portfolios, creative agencies |

## DESIGN.md Format

Uses the **Stitch DESIGN.md specification** — YAML front matter for machine-readable tokens, markdown body for human-readable rationale.

```yaml
---
version: alpha
name: "My System"
colors:
  primary: "#1A1C1E"
  accent: "#2563EB"
typography:
  h1:
    fontFamily: "Inter"
    fontSize: "48px"
    fontWeight: 700
---

# My System

## Overview
...
```

## License

MIT
