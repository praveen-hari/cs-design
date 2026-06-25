#!/usr/bin/env node

// src/cli.ts
import { Command } from "commander";

// src/commands/init.ts
import fs3 from "fs-extra";
import path4 from "path";
import chalk2 from "chalk";
import ora from "ora";

// src/constants.ts
import path from "path";
import os from "os";
var DESIGNS_DIR = ".designs";
var DESIGN_MD = "DESIGN.md";
var PROJECT_JSON = "project.json";
var SKILL_MD = "SKILL.md";
var SKILL_FOLDER_NAME = "cs-design";
var SYNCFUSION_SKILL_FOLDER_NAME = "syncfusion-components";
var CREATE_DESIGN_SKILL_FOLDER_NAME = "create-design-system";
var SKILLS_DIR = ".codestudio/skills";
var SCREENS_DIR = "screens";
var DEFAULT_SYSTEM = "modern-minimal";
var GLOBAL_DIR_NAME = ".cs-design";
var ENV_HOME = "CS_DESIGN_HOME";
function getGlobalDir() {
  return process.env[ENV_HOME] || path.join(os.homedir(), GLOBAL_DIR_NAME);
}
function getGlobalSystemsDir() {
  return path.join(getGlobalDir(), "systems");
}
function getDesignsDir(basePath = process.cwd()) {
  return path.join(basePath, DESIGNS_DIR);
}
function getSkillDir(basePath = process.cwd()) {
  return path.join(basePath, SKILLS_DIR, SKILL_FOLDER_NAME);
}
function getSyncfusionSkillDir(basePath = process.cwd()) {
  return path.join(basePath, SKILLS_DIR, SYNCFUSION_SKILL_FOLDER_NAME);
}
function getCreateDesignSkillDir(basePath = process.cwd()) {
  return path.join(basePath, SKILLS_DIR, CREATE_DESIGN_SKILL_FOLDER_NAME);
}

// src/systems/index.ts
import fs from "fs-extra";
import path2 from "path";

// src/systems/modern-minimal.ts
var MODERN_MINIMAL_DESIGN_MD = `---
version: alpha
name: "Modern Minimal"
description: "Clean, product-oriented design system for SaaS tools, dashboards, and utility pages."

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
  h2:
    fontFamily: "Inter"
    fontSize: "36px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  h3:
    fontFamily: "Inter"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.3
  h4:
    fontFamily: "Inter"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.4
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
  caption:
    fontFamily: "Inter"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4

rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
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

# Modern Minimal

## Overview

Modern Minimal is a clean, product-oriented design system built for SaaS tools, dashboards, and utility pages. It emphasizes clarity, whitespace, and functional hierarchy. The visual language is restrained \u2014 every element earns its place.

**Mood:** Professional, focused, trustworthy, modern.
**Best for:** SaaS products, admin dashboards, developer tools, analytics platforms.

## Colors

The palette is intentionally narrow. A near-black primary anchors all text and key UI elements. The accent blue is used sparingly \u2014 only for interactive elements and primary actions.

- **Primary (#1A1C1E):** Headlines, body text, primary buttons.
- **Secondary (#6C7278):** Supporting text, labels, metadata.
- **Accent (#2563EB):** Links, primary CTAs, active states, focus rings.
- **Background (#FFFFFF):** Page background.
- **Surface (#F8FAFC):** Cards, panels, elevated containers.
- **Border (#E2E8F0):** Dividers, input borders, table lines.
- **Success/Warning/Error:** Semantic feedback only \u2014 never decorative.

## Typography

Inter is the sole typeface. The type scale uses a modular ratio with tight letter-spacing on headings for a modern feel. Body text is set at 16px with generous line-height for readability.

- Headlines: Bold weight, tight tracking, clear hierarchy from H1 (48px) down to H4 (20px).
- Body: Regular weight, 1.6 line-height for comfortable reading.
- Small/Caption: Used for metadata, timestamps, and secondary information.

## Layout

Use an 8px grid. All spacing values are multiples of 4px. Content areas max out at 1200px with generous side padding (24\u201348px). Cards and sections use consistent internal padding (24px).

- **Page margins:** 24px (mobile), 48px (desktop).
- **Section gaps:** 48px between major sections, 24px between related groups.
- **Card padding:** 24px uniform.

## Elevation & Depth

Minimal shadow usage. Depth is communicated through background color shifts (white \u2192 surface gray) rather than heavy shadows.

- **Level 0:** No shadow (flat on background).
- **Level 1:** \`0 1px 3px rgba(0,0,0,0.08)\` \u2014 cards, dropdowns.
- **Level 2:** \`0 4px 12px rgba(0,0,0,0.10)\` \u2014 modals, popovers.

## Shapes

Rounded corners are moderate. Buttons and inputs use 8px radius. Cards use 12px. Avatars and badges use full rounding.

## Components

### Buttons
- **Primary:** Solid background (#1A1C1E), white text, 8px radius, 12px 24px padding.
- **Secondary:** Outlined with border, transparent background.
- **Ghost:** No border, no background, text-only with hover state.
- **Disabled:** 50% opacity, no pointer events.

### Cards
- White background, 12px radius, subtle border or Level 1 shadow.
- Consistent 24px internal padding.

### Inputs
- White background, 1px border (#E2E8F0), 8px radius.
- Focus state: 2px accent ring.
- Error state: red border + error message below.

### Tables
- Clean horizontal lines only. No zebra striping.
- Header row: medium weight, secondary color.

## Do's and Don'ts

**Do:**
- Use whitespace generously \u2014 let content breathe.
- Maintain consistent spacing using the 8px grid.
- Use the accent color only for interactive elements.
- Keep text hierarchy clear: one H1 per page, logical heading order.

**Don't:**
- Don't use more than 2 font weights on a single screen.
- Don't add decorative gradients or patterns.
- Don't use colored backgrounds for content sections.
- Don't center-align body text.
- Don't use shadows heavier than Level 2.
`;

// src/systems/corporate-clean.ts
var CORPORATE_CLEAN_DESIGN_MD = `---
version: alpha
name: "Corporate Clean"
description: "Professional, trustworthy design system for enterprise and B2B platforms."

colors:
  primary: "#0F172A"
  secondary: "#475569"
  accent: "#0369A1"
  background: "#FFFFFF"
  surface: "#F1F5F9"
  border: "#CBD5E1"
  success: "#15803D"
  warning: "#CA8A04"
  error: "#B91C1C"

colors-dark:
  primary: "#F1F5F9"
  secondary: "#94A3B8"
  accent: "#38BDF8"
  background: "#0F172A"
  surface: "#1E293B"
  border: "#334155"
  success: "#4ADE80"
  warning: "#FDE047"
  error: "#FCA5A5"

typography:
  h1:
    fontFamily: "Source Sans Pro"
    fontSize: "42px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  h2:
    fontFamily: "Source Sans Pro"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.25
  h3:
    fontFamily: "Source Sans Pro"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.3
  h4:
    fontFamily: "Source Sans Pro"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Source Sans Pro"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Source Sans Pro"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Source Sans Pro"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4

rounded:
  sm: "2px"
  md: "6px"
  lg: "8px"
  xl: "12px"
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
    backgroundColor: "{colors.accent}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
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

# Corporate Clean

## Overview

Corporate Clean is a professional, trustworthy design system built for enterprise software, B2B platforms, and internal tools. It prioritizes readability, information density, and a sense of reliability. The visual language is structured and predictable.

**Mood:** Authoritative, reliable, structured, professional.
**Best for:** Enterprise dashboards, B2B SaaS, internal tools, financial platforms.

## Colors

The palette is conservative and high-contrast. A deep navy primary conveys authority. The accent blue is institutional \u2014 trustworthy without being playful.

- **Primary (#0F172A):** Headlines, navigation, key UI anchors.
- **Secondary (#475569):** Body text, descriptions, secondary labels.
- **Accent (#0369A1):** Primary actions, links, active navigation.
- **Background (#FFFFFF):** Page background.
- **Surface (#F1F5F9):** Sidebar backgrounds, table headers, section fills.
- **Border (#CBD5E1):** Dividers, input borders, card outlines.
- **Semantic colors:** Success (green), Warning (amber), Error (red) \u2014 used strictly for status indicators.

## Typography

Source Sans Pro provides excellent readability at all sizes. The type scale is tighter than consumer products \u2014 optimized for information-dense interfaces.

- Headlines: Bold weight, moderate tracking. H1 at 42px for page titles.
- Body: Regular weight at 16px. Comfortable for long-form reading.
- Small/Caption: Used for table data, timestamps, and metadata.

## Layout

Use a 4px base grid with 8px increments for spacing. Content areas are wider (up to 1400px) to accommodate data-heavy layouts. Sidebars are 240\u2013280px.

- **Page margins:** 24px (mobile), 32px (desktop).
- **Section gaps:** 32px between major sections.
- **Card padding:** 24px uniform.
- **Table cell padding:** 12px 16px.

## Elevation & Depth

Shadows are subtle and functional. Depth is primarily communicated through borders and background color changes.

- **Level 0:** No shadow, 1px border for definition.
- **Level 1:** \`0 1px 2px rgba(0,0,0,0.06)\` \u2014 cards, dropdowns.
- **Level 2:** \`0 4px 8px rgba(0,0,0,0.08)\` \u2014 modals, dialogs.

## Shapes

Corner radii are conservative. Buttons and inputs use 6px. Cards use 8px. Avoid fully rounded elements except for avatars and status badges.

## Components

### Buttons
- **Primary:** Solid accent blue (#0369A1), white text, 6px radius.
- **Secondary:** White background, 1px border, accent text.
- **Danger:** Red background for destructive actions.
- **Disabled:** Reduced opacity, cursor not-allowed.

### Cards
- White background, 1px border (#CBD5E1), 8px radius.
- Optional header with surface background.

### Inputs
- White background, 1px border, 6px radius.
- Focus: 2px accent ring.
- Labels above inputs, not floating.

### Tables
- Bordered header row with surface background.
- Alternating row colors optional for dense data.
- Sortable columns indicated with chevron icons.

### Navigation
- Vertical sidebar with icon + label items.
- Active state: accent background tint + bold text.
- Collapsible to icon-only mode.

## Do's and Don'ts

**Do:**
- Use consistent alignment \u2014 left-align text and data.
- Provide clear visual hierarchy with heading levels.
- Use borders to separate sections in dense layouts.
- Include breadcrumbs for deep navigation.

**Don't:**
- Don't use playful illustrations or decorative elements.
- Don't use more than 3 levels of nesting in navigation.
- Don't use rounded-full on buttons or cards.
- Don't use light font weights for body text.
- Don't hide critical actions behind hover states.
`;

// src/systems/bold-creative.ts
var BOLD_CREATIVE_DESIGN_MD = `---
version: alpha
name: "Bold Creative"
description: "Vibrant, expressive design system for marketing sites, portfolios, and creative agencies."

colors:
  primary: "#1E0A3C"
  secondary: "#6F7287"
  accent: "#F05537"
  background: "#FFFDF9"
  surface: "#FFF5EE"
  border: "#E8DDD3"
  success: "#22C55E"
  warning: "#F59E0B"
  error: "#EF4444"

colors-dark:
  primary: "#F5F0FF"
  secondary: "#A8A3B3"
  accent: "#FF7A5C"
  background: "#1A0E2E"
  surface: "#2D1B4E"
  border: "#3D2B5A"
  success: "#4ADE80"
  warning: "#FBBF24"
  error: "#FB7185"

typography:
  h1:
    fontFamily: "Sora"
    fontSize: "56px"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  h2:
    fontFamily: "Sora"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  h3:
    fontFamily: "Sora"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.25
  h4:
    fontFamily: "Sora"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "DM Sans"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.7
  small:
    fontFamily: "DM Sans"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "DM Sans"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4

rounded:
  sm: "6px"
  md: "12px"
  lg: "20px"
  xl: "28px"
  full: "9999px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"

components:
  button:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: "14px 32px"
  card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "32px"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
---

# Bold Creative

## Overview

Bold Creative is a vibrant, expressive design system built for marketing sites, portfolios, and creative agencies. It uses warm tones, generous spacing, and confident typography to create memorable experiences. Every screen should feel intentional and alive.

**Mood:** Energetic, confident, warm, memorable.
**Best for:** Marketing sites, portfolios, creative agencies, event pages, product launches.

## Colors

The palette is warm and high-contrast. A deep purple primary grounds the design while the coral accent (#F05537) creates energy and draws attention to key actions.

- **Primary (#1E0A3C):** Headlines, hero text, navigation.
- **Secondary (#6F7287):** Body text, descriptions, metadata.
- **Accent (#F05537):** CTAs, highlights, hover states, decorative elements.
- **Background (#FFFDF9):** Warm off-white page background.
- **Surface (#FFF5EE):** Feature sections, testimonial cards, highlighted areas.
- **Border (#E8DDD3):** Subtle warm dividers.

## Typography

Sora for headlines \u2014 geometric, modern, and bold. DM Sans for body \u2014 clean and highly readable. The contrast between the two creates visual interest.

- Headlines: Extra-bold weight, very tight tracking (-0.03em on H1). Large sizes create impact.
- Body: Regular weight at 17px with generous 1.7 line-height for a relaxed reading experience.
- The font pairing creates a clear distinction between display and reading text.

## Layout

Use generous spacing. Sections breathe with 64px+ gaps. Content areas max at 1100px for focused reading. Hero sections can be full-width.

- **Page margins:** 24px (mobile), 64px (desktop).
- **Section gaps:** 64px between major sections, 40px between related groups.
- **Card padding:** 32px uniform.
- **Hero sections:** Full viewport height or near it.

## Elevation & Depth

Use a mix of subtle shadows and background color shifts. Accent-colored shadows add personality.

- **Level 0:** No shadow.
- **Level 1:** \`0 2px 8px rgba(30,10,60,0.06)\` \u2014 cards.
- **Level 2:** \`0 8px 24px rgba(30,10,60,0.10)\` \u2014 modals, featured cards.
- **Accent glow:** \`0 4px 16px rgba(240,85,55,0.20)\` \u2014 hover on accent buttons.

## Shapes

Generous corner radii. Buttons use full rounding (pill shape). Cards use 20px. Inputs use 12px. The rounded shapes reinforce the friendly, approachable mood.

## Components

### Buttons
- **Primary:** Coral accent (#F05537), white text, pill shape (full rounding), 14px 32px padding.
- **Secondary:** Outlined with accent border, transparent background.
- **Ghost:** Text-only with underline on hover.
- **Hover:** Slight scale-up (1.02) + accent glow shadow.

### Cards
- Warm off-white background, 20px radius, generous 32px padding.
- Feature cards may use surface background (#FFF5EE).
- Hover: subtle lift with increased shadow.

### Inputs
- White background, warm border, 12px radius.
- Focus: 2px accent ring with glow.
- Placeholder text in secondary color.

### Hero Sections
- Full-width, generous vertical padding (120px+).
- Large H1 with tight tracking.
- Single clear CTA button.
- Optional decorative shapes or gradients.

## Do's and Don'ts

**Do:**
- Use bold, confident headlines \u2014 don't be shy with size.
- Let sections breathe with generous spacing.
- Use the accent color to create clear focal points.
- Add subtle hover animations (scale, shadow) for interactivity.
- Use real photography or bold illustrations.

**Don't:**
- Don't use more than 2 accent colors.
- Don't crowd content \u2014 whitespace is a feature.
- Don't use thin font weights for headlines.
- Don't use sharp corners (less than 6px radius).
- Don't use generic stock photography.
- Don't center-align paragraphs longer than 3 lines.
`;

// src/systems/index.ts
var BUILTIN_SYSTEMS = [
  {
    meta: {
      id: "modern-minimal",
      name: "Modern Minimal",
      category: "Starter",
      description: "Clean, product-oriented. SaaS tools, dashboards.",
      builtin: true
    },
    content: MODERN_MINIMAL_DESIGN_MD
  },
  {
    meta: {
      id: "corporate-clean",
      name: "Corporate Clean",
      category: "Professional",
      description: "Professional, trustworthy. Enterprise, B2B.",
      builtin: true
    },
    content: CORPORATE_CLEAN_DESIGN_MD
  },
  {
    meta: {
      id: "bold-creative",
      name: "Bold Creative",
      category: "Expressive",
      description: "Vibrant, expressive. Marketing, portfolios.",
      builtin: true
    },
    content: BOLD_CREATIVE_DESIGN_MD
  }
];
function getBuiltinSystems() {
  return BUILTIN_SYSTEMS.map((s) => s.meta);
}
function getBuiltinSystem(id) {
  return BUILTIN_SYSTEMS.find((s) => s.meta.id === id);
}
async function getInstalledSystems() {
  const systemsDir = getGlobalSystemsDir();
  if (!await fs.pathExists(systemsDir)) return [];
  const entries = await fs.readdir(systemsDir, { withFileTypes: true });
  const systems2 = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const designPath = path2.join(systemsDir, entry.name, DESIGN_MD);
    if (await fs.pathExists(designPath)) {
      systems2.push({
        id: entry.name,
        name: entry.name,
        category: "Installed",
        description: "User-installed design system",
        builtin: false
      });
    }
  }
  return systems2;
}
async function resolveSystem(id) {
  const builtin = getBuiltinSystem(id);
  if (builtin) return builtin.content;
  const installedPath = path2.join(getGlobalSystemsDir(), id, DESIGN_MD);
  if (await fs.pathExists(installedPath)) {
    return fs.readFile(installedPath, "utf-8");
  }
  return null;
}

// src/templates/skill.ts
var SKILL_MD_CONTENT = `---
name: cs-design
description: "Design and generate UI screens using the cs-design CLI and DESIGN.md tokens. Use when: creating UI screens, generating HTML pages, designing landing pages, building dashboards, applying design system changes to screens, updating screens after design changes, re-applying tokens, exporting design tokens to CSS or Tailwind, validating design files, linting for WCAG contrast issues, comparing design versions, switching design systems, or converting designs to Syncfusion components."
argument-hint: "Describe the screen or UI task, e.g. 'create a pricing page' or 'export tokens as CSS'"
---

# cs-design \u2014 AI Design Workflow

Generate consistent, brand-aligned UI screens using the \`cs-design\` CLI and the project's design system.

## When to Use

- User asks to create, design, or generate a UI screen or HTML page
- User asks to apply or switch a design system
- User asks to export design tokens (CSS, Tailwind, JSON, DTCG)
- User asks to validate or lint a DESIGN.md file
- User asks to compare two design system versions
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
\u251C\u2500\u2500 .codestudio/skills/cs-design/
\u2502   \u2514\u2500\u2500 SKILL.md               \u2190 This file (Agent Skills spec)
\u2514\u2500\u2500 .designs/
    \u251C\u2500\u2500 DESIGN.md              \u2190 Design system tokens + rationale
    \u251C\u2500\u2500 project.json           \u2190 Project metadata + screen registry
    \u251C\u2500\u2500 tokens.css             \u2190 Exported CSS custom properties
    \u2514\u2500\u2500 screens/               \u2190 Generated HTML screens
\`\`\`

## CLI Reference

| Command | Purpose |
|---------|---------|
| \`cs-design init <name> [--system <id>]\` | Initialize a new design project |
| \`cs-design validate\` | Structural validation + deep lint |
| \`cs-design lint [file] [--json]\` | Deep lint (WCAG contrast, broken refs, orphaned tokens, section order) |
| \`cs-design diff <before> <after> [--json]\` | Compare two DESIGN.md files for token-level regressions |
| \`cs-design spec [--rules] [--format json]\` | Output the DESIGN.md format specification |
| \`cs-design apply\` | Re-export tokens.css \u2014 all screens update automatically |
| \`cs-design export tokens --format <fmt>\` | Export tokens: \`css\`, \`tailwind\`, \`json\`, \`css-tailwind\`, \`dtcg\` |
| \`cs-design screens list [--json]\` | List all screens in the project |
| \`cs-design systems list\` | List available design systems |
| \`cs-design systems install <source>\` | Install from GitHub or local path |
| \`cs-design systems create <name>\` | Scaffold a new empty design system |
| \`cs-design skills add <framework>\` | Install Syncfusion component skills |
| \`cs-design skills list [--json]\` | List installed Syncfusion skills |
| \`cs-design skills remove <framework>\` | Remove skills for a framework |

## Procedure

### Step 1 \u2014 Read the design system

Read the [DESIGN.md](../../../.designs/DESIGN.md) file. It has two layers:

1. **YAML front matter** (between \`---\` markers) \u2014 machine-readable design tokens (colors, typography, spacing, border-radius, components)
2. **Markdown body** \u2014 human-readable rationale: Overview, Colors, Typography, Layout, Components, Do's and Don'ts

Use the exact token values from YAML. **Never invent colors or fonts.**

### Step 2 \u2014 Validate and lint

Run both structural validation and deep lint:

\`\`\`bash
# Full validation (structural + deep lint in one command)
cs-design validate

# Or deep lint only (WCAG contrast, broken refs, orphaned tokens, etc.)
cs-design lint
cs-design lint --json    # Machine-readable output for programmatic use
\`\`\`

The deep linter checks:
- **broken-ref** \u2014 Token references like \`{colors.primary}\` that don't resolve
- **contrast-ratio** \u2014 WCAG AA contrast failures (4.5:1 minimum)
- **orphaned-tokens** \u2014 Color tokens never referenced by any component
- **missing-primary** \u2014 No primary color defined
- **section-order** \u2014 Sections out of canonical order
- **unknown-key** \u2014 Likely YAML key typos (e.g. \`colours:\` \u2192 \`colors:\`)

Fix any errors before generating screens.

### Step 3 \u2014 Detect the target platform

Before generating anything, determine what the user needs:

**Check the project for framework indicators:**
- \`package.json\` with \`react\` \u2192 React
- \`package.json\` with \`@angular/core\` \u2192 Angular
- \`package.json\` with \`vue\` \u2192 Vue
- \`.csproj\` with Blazor SDK \u2192 Blazor
- \`.csproj\` with MAUI/WPF/WinUI/WinForms \u2192 .NET desktop
- No framework detected \u2192 ask the user

**If the user explicitly says** "design a page", "show me a mockup", "create a preview" \u2192 they want a **design preview** (HTML).

**If the user says** "build this", "create the component", "implement this page" \u2192 they want **production code** in their framework.

**Choose the right path:**

| User intent | Target | Path |
|-------------|--------|------|
| Design exploration / preview | HTML screens | \u2192 **Path A** (below) |
| Production code (framework detected) | React / Angular / Blazor / Vue / etc. | \u2192 **Path B** (below) |
| Production code (no framework) | Ask the user | \u2192 Ask, then Path B |

---

## Path A \u2014 Design Previews (HTML screens)

Use this when the user wants to **explore and iterate on designs** before committing to a framework. HTML screens are quick to generate, easy to preview in a browser, and framework-agnostic.

### A1 \u2014 Export tokens

\`\`\`bash
cs-design export tokens --format css
\`\`\`

### A2 \u2014 Generate HTML screens

Save HTML files to \`.designs/screens/\`.

**Requirements:**
- Complete HTML document (\`<!DOCTYPE html>\` through \`</html>\`)
- **Link to shared \`tokens.css\`** \u2014 do NOT inline a \`:root\` block or hardcode token values
- Component styles in a \`<style>\` block using CSS variables
- Google Fonts \`<link>\` tags for fonts from DESIGN.md
- Responsive: mobile-first, works at 375px\u20131440px
- Semantic HTML: \`<header>\`, \`<main>\`, \`<nav>\`, \`<section>\`, \`<footer>\`
- Realistic content \u2014 **never use Lorem ipsum**
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

  <!-- \u2705 Link to shared tokens \u2014 single source of truth -->
  <link rel="stylesheet" href="../tokens.css" />

  <style>
    /* Only component styles here \u2014 use CSS variables, never hardcoded values */
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

### A3 \u2014 Apply design changes

When DESIGN.md is updated, re-export tokens and all screens update automatically:

\`\`\`bash
cs-design apply
\`\`\`

### A4 \u2014 Compare design versions

When iterating on the design system, compare before and after:

\`\`\`bash
# Save a copy before editing
cp .designs/DESIGN.md .designs/DESIGN-backup.md

# After editing, check for regressions
cs-design diff .designs/DESIGN-backup.md .designs/DESIGN.md

# JSON output for programmatic use
cs-design diff .designs/DESIGN-backup.md .designs/DESIGN.md --json
\`\`\`

### A5 \u2014 Track and manage screens

\`\`\`bash
cs-design screens list            # Human-readable
cs-design screens list --json     # Machine-readable
\`\`\`

---

## Path B \u2014 Production Code (framework components)

Use this when the user wants to **build the actual application** with Syncfusion components. Skip HTML screens entirely \u2014 generate framework code directly from DESIGN.md tokens.

### B1 \u2014 Install Syncfusion component skills

\`\`\`bash
cs-design skills add react          # or angular, blazor, vue, javascript
\`\`\`

This installs Syncfusion component skills with verified API knowledge. Install only the components you need:

\`\`\`bash
cs-design skills add react --only grid,scheduler,charts,inputs,buttons
\`\`\`

### B2 \u2014 Export tokens for the framework

\`\`\`bash
cs-design export tokens --format css            # CSS custom properties (React, Angular, Vue)
cs-design export tokens --format tailwind       # Tailwind v3 theme.extend config
cs-design export tokens --format css-tailwind   # Tailwind v4 CSS @theme block
cs-design export tokens --format json           # Flat JSON key-value pairs
cs-design export tokens --format dtcg           # W3C Design Tokens (DTCG) format
\`\`\`

### B3 \u2014 Generate production components

Read the installed Syncfusion component skills (they are now at \`~/.agents/skills/syncfusion-<fw>-*\`) and generate production code directly.

**Map DESIGN.md tokens to the framework's styling approach:**

| Framework | Token mapping |
|-----------|--------------|
| React | Import \`tokens.css\`, use CSS variables in JSX/CSS modules |
| Angular | Import \`tokens.css\` in \`styles.css\`, use variables in component SCSS |
| Blazor | Import \`tokens.css\` in \`wwwroot/css\`, use variables in component CSS |
| Vue | Import \`tokens.css\` in \`main.ts\`, use variables in \`<style scoped>\` |

**Use the \`/syncfusion-components\` skill** for the full component catalog and install commands.

### B4 \u2014 Apply design changes to production code

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

## Dark Mode Support

If the DESIGN.md has a \`colors-dark\` section, the design system supports dark mode.

**How it works:**
- \`cs-design export tokens --format css\` generates three CSS blocks:
  1. \`:root { ... }\` \u2014 light theme (default)
  2. \`[data-theme="dark"] { ... }\` \u2014 dark theme via attribute
  3. \`@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ... } }\` \u2014 auto dark via OS preference

**In HTML screens**, add a theme toggle:

\`\`\`html
<button onclick="document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'">
  Toggle Dark Mode
</button>
\`\`\`

**No extra CSS needed** \u2014 the same \`var(--color-background)\`, \`var(--color-primary)\` variables automatically switch values.

**In production code**, use the same \`data-theme\` attribute approach or the framework's theme system.

## Quality Checklist

Before finalizing any output (HTML screens or production components):

- [ ] \`cs-design validate\` passes with no errors
- [ ] \`cs-design lint\` reports no errors (warnings are acceptable)
- [ ] All styling uses CSS variables from tokens.css \u2014 no hardcoded token values
- [ ] Colors, fonts, spacing, and radii match DESIGN.md tokens
- [ ] Responsive at 375px, 768px, and 1440px
- [ ] Accessible: heading hierarchy, alt text, sufficient contrast (WCAG AA)
- [ ] No Lorem ipsum or placeholder text
- [ ] Interactive states: hover, focus, active, disabled
- [ ] If \`colors-dark\` exists, screens work in both light and dark modes
`;

// src/templates/syncfusion-skill.ts
var SYNCFUSION_SKILL_MD_CONTENT = `---
name: syncfusion-components
description: "Install and use Syncfusion UI component skills for production code generation. Use when: converting HTML designs to React, Angular, Blazor, Vue, or JavaScript production code with Syncfusion components, adding data grids, charts, schedulers, forms, editors, navigation, kanban boards, or any Syncfusion UI component to a project."
argument-hint: "Framework and components, e.g. 'react grid and charts' or 'angular scheduler'"
---

# Syncfusion Component Skills

Install Syncfusion component skills on demand so AI agents can generate accurate, API-correct production code. Each component skill contains verified setup, imports, configuration, and usage patterns maintained by Syncfusion.

## When to Use

- Converting HTML screen designs (.designs/screens/) to production framework code
- Adding Syncfusion UI components (grid, chart, scheduler, etc.) to a project
- Need accurate Syncfusion API usage, imports, and configuration

## Procedure

### Step 1 \u2014 Detect the framework

Check the project for framework indicators:
- \`package.json\` with \`react\`, \`@angular/core\`, \`vue\` \u2192 web framework
- \`.csproj\` with \`Microsoft.NET.Sdk.BlazorWebAssembly\` \u2192 blazor
- \`.csproj\` with \`Microsoft.Maui\` \u2192 maui
- \`.csproj\` with WPF/WinUI/WinForms references \u2192 desktop framework

### Step 2 \u2014 Install component skills

Run \`cs-design skills add <framework>\` to install all Syncfusion component skills for that framework. This is **non-interactive** and safe for agents to run.

\`\`\`bash
# Install all skills for a framework
cs-design skills add react
cs-design skills add angular
cs-design skills add blazor
cs-design skills add vue
cs-design skills add javascript
cs-design skills add maui
cs-design skills add wpf
cs-design skills add winui
cs-design skills add winforms

# Install only specific components
cs-design skills add react --only grid,scheduler,charts

# List installed skills
cs-design skills list
cs-design skills list --json    # Machine-readable

# Remove skills for a framework
cs-design skills remove react
\`\`\`

### Step 2b \u2014 Export tokens for the framework

\`\`\`bash
cs-design export tokens --format css            # CSS custom properties (React, Angular, Vue)
cs-design export tokens --format tailwind       # Tailwind v3 theme.extend config
cs-design export tokens --format css-tailwind   # Tailwind v4 CSS @theme block
cs-design export tokens --format json           # Flat JSON key-value pairs
cs-design export tokens --format dtcg           # W3C Design Tokens (DTCG) format
\`\`\`

### Step 3 \u2014 Read the installed component skills

After installation, component skills are available at \`~/.agents/skills/\`. Each skill has:
- \`SKILL.md\` \u2014 Setup, imports, configuration, key APIs
- \`references/\` \u2014 Detailed feature docs (loaded on demand)

Read only the skills you need for the current screen.

### Step 4 \u2014 Generate production code

Use the design tokens from [DESIGN.md](../../../.designs/DESIGN.md) for styling, and the component skill instructions for Syncfusion API usage.

## Component Catalog

### Data & Lists

| UI Pattern | React Skill | Angular Skill |
|------------|-------------|---------------|
| Data table / grid | syncfusion-react-grid | syncfusion-angular-grid |
| Tree grid | syncfusion-react-treegrid | syncfusion-angular-treegrid |
| Pivot table | syncfusion-react-pivot-table | syncfusion-angular-pivot-table |
| ListView | syncfusion-react-listview | syncfusion-angular-listview |
| Kanban board | syncfusion-react-kanban | syncfusion-angular-kanban |

### Charts & Visualization

| UI Pattern | React Skill | Angular Skill |
|------------|-------------|---------------|
| Bar/line/area chart | syncfusion-react-charts | syncfusion-angular-charts |
| Pie/donut chart | syncfusion-react-accumulation-chart | syncfusion-angular-accumulation-chart |
| 3D chart | syncfusion-react-3d-chart | syncfusion-angular-3d-chart |
| Heatmap | syncfusion-react-heatmap | syncfusion-angular-heatmap |
| Sparkline | syncfusion-react-sparkline | syncfusion-angular-sparkline |
| Maps | syncfusion-react-maps | syncfusion-angular-maps |
| Bullet chart | syncfusion-react-bullet-chart | syncfusion-angular-bullet-chart |
| Gauges | syncfusion-react-circular-gauge | syncfusion-angular-circular-gauge |

### Scheduling & Calendar

| UI Pattern | React Skill | Angular Skill |
|------------|-------------|---------------|
| Scheduler / calendar | syncfusion-react-scheduler | syncfusion-angular-scheduler |
| Gantt chart | syncfusion-react-gantt-chart | syncfusion-angular-gantt-chart |

### Forms & Inputs

| UI Pattern | React Skill | Angular Skill |
|------------|-------------|---------------|
| Text / number inputs | syncfusion-react-inputs | syncfusion-angular-inputs |
| Buttons / toggles | syncfusion-react-buttons | syncfusion-angular-buttons |
| Dropdowns / select | syncfusion-react-dropdowns | syncfusion-angular-dropdowns |
| Date/time pickers | syncfusion-react-calendars | syncfusion-angular-calendars |
| File upload | syncfusion-react-inputs | syncfusion-angular-inputs |
| Query builder | syncfusion-react-query-builder | syncfusion-angular-query-builder |

### Navigation

| UI Pattern | React Skill | Angular Skill |
|------------|-------------|---------------|
| Sidebar | syncfusion-react-sidebar | syncfusion-angular-sidebar |
| Tabs | syncfusion-react-tabs | syncfusion-angular-tabs |
| Toolbar | syncfusion-react-toolbar | syncfusion-angular-toolbar |
| Menu | syncfusion-react-menu | syncfusion-angular-menu |
| Breadcrumb | syncfusion-react-breadcrumb | syncfusion-angular-breadcrumb |
| TreeView | syncfusion-react-treeview | syncfusion-angular-treeview |
| Accordion | syncfusion-react-accordion | syncfusion-angular-accordion |
| Stepper | syncfusion-react-stepper | syncfusion-angular-stepper |

### Layout

| UI Pattern | React Skill | Angular Skill |
|------------|-------------|---------------|
| Dashboard layout | syncfusion-react-dashboard-layout | syncfusion-angular-dashboard-layout |
| Splitter | syncfusion-react-splitter | syncfusion-angular-splitter |
| Cards | syncfusion-react-cards | syncfusion-angular-cards |

### Editors

| UI Pattern | React Skill | Angular Skill |
|------------|-------------|---------------|
| Rich text editor | syncfusion-react-rich-text-editor | syncfusion-angular-rich-text-editor |
| Image editor | syncfusion-react-image-editor | syncfusion-angular-image-editor |
| Diagram | syncfusion-react-diagram | syncfusion-angular-diagram |

### Notifications & Feedback

| UI Pattern | React Skill | Angular Skill |
|------------|-------------|---------------|
| Dialog / modal | syncfusion-react-popups | syncfusion-angular-popups |
| Toast / alerts | syncfusion-react-notifications | syncfusion-angular-notifications |
| Progress bar | syncfusion-react-progress-bar | syncfusion-angular-progress-bar |

### AI Components

| UI Pattern | React Skill | Angular Skill |
|------------|-------------|---------------|
| AI AssistView | syncfusion-react-ai-assistview | syncfusion-angular-ai-assistview |
| Chat UI | syncfusion-react-chat-ui | syncfusion-angular-chat-ui |

### Always Install (Base Skills)

These should always be installed alongside component skills:

| Skill | Purpose |
|-------|---------|
| \`syncfusion-<fw>-common\` | Shared setup, data manager, service patterns |
| \`syncfusion-<fw>-themes\` | Theme CSS, styling, design token mapping |
| \`syncfusion-<fw>-license\` | License key registration |

## Skill Naming Convention

All Syncfusion skills follow the pattern: \`syncfusion-<framework>-<component>\`

Replace \`<framework>\` with: \`react\`, \`angular\`, \`blazor\`, \`vue\`, \`javascript\`, \`maui\`, \`wpf\`, \`winui\`, \`winforms\`
`;

// src/templates/create-design-skill.ts
var CREATE_DESIGN_SKILL_MD_CONTENT = `---
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
- If \`.designs/DESIGN.md\` exists and user wants changes \u2192 **Edit flow** (below)
- If \`.designs/DESIGN.md\` doesn't exist or user wants a fresh start \u2192 **Create flow** (below)

## Output Location

Save the generated file to \`.designs/DESIGN.md\` (project-local).

If \`.designs/\` doesn't exist yet, run \`cs-design init "Project Name"\` first, then overwrite the DESIGN.md.

## Procedure

### Step 0 \u2014 Get the specification

Before creating a DESIGN.md, get the full format specification:

\`\`\`bash
# Full specification as markdown (human-readable)
cs-design spec

# Full specification as JSON (machine-readable \u2014 includes spec text, format rules, and lint rules)
cs-design spec --format json

# Just the lint rules
cs-design spec --rules-only
\`\`\`

The specification defines the exact YAML schema, token types, section order, and validation rules. **Always follow it.**

### Step 1 \u2014 Analyze the source

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
- Reference well-known design systems for inspiration when mentioned (e.g. "like Linear" \u2192 clean, minimal, dark-friendly)

### Step 2 \u2014 Build the token set

Assemble these required tokens:

**Colors (required, minimum 6):**
- \`primary\` \u2014 main text and UI anchor color
- \`secondary\` \u2014 supporting text and labels
- \`accent\` \u2014 interactive elements, CTAs, links
- \`background\` \u2014 page background
- \`surface\` \u2014 cards, panels, elevated containers
- \`border\` \u2014 dividers, input borders
- \`success\` \u2014 positive feedback (recommended)
- \`warning\` \u2014 caution feedback (recommended)
- \`error\` \u2014 error feedback (recommended)

All colors must be \`#RRGGBB\` hex format.

**Typography (required, minimum 2):**
Each entry needs at minimum \`fontFamily\` and \`fontSize\`:
- \`h1\` \u2014 primary heading (36\u201356px)
- \`h2\` \u2014 secondary heading (28\u201340px)
- \`h3\` \u2014 tertiary heading (20\u201328px)
- \`body\` \u2014 body text (15\u201318px)
- \`small\` \u2014 secondary text (13\u201315px)
- \`caption\` \u2014 metadata, labels (11\u201313px)

Optional per entry: \`fontWeight\`, \`lineHeight\`, \`letterSpacing\`.

**Spacing (recommended):**
- \`xs\`: 4px, \`sm\`: 8px, \`md\`: 16px, \`lg\`: 24px, \`xl\`: 32px, \`2xl\`: 48px

**Rounded (recommended):**
- \`sm\`: 2\u20136px, \`md\`: 6\u201312px, \`lg\`: 12\u201320px, \`full\`: 9999px

**Components (recommended):**
- \`button\`: backgroundColor, textColor, rounded, padding
- \`card\`: backgroundColor, textColor, rounded, padding
- \`input\`: backgroundColor, textColor, rounded, padding

### Step 3 \u2014 Write the DESIGN.md

The file has two parts:

**Part 1 \u2014 YAML front matter** (between \`---\` markers):

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

**Part 2 \u2014 Markdown body** with these 8 canonical sections:

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
Explicit design rules \u2014 what to do and what to avoid.
\`\`\`

### Step 4 \u2014 Save, validate, and lint

1. Write the file to \`.designs/DESIGN.md\`
2. Run \`cs-design validate\` to confirm structural validity + deep lint
3. Run \`cs-design lint\` for detailed findings (WCAG contrast, broken refs, orphaned tokens)
4. Fix any errors reported \u2014 warnings are acceptable but should be reviewed
5. Confirm the result with the user

\`\`\`bash
# Full validation (structural + deep lint)
cs-design validate

# Deep lint only \u2014 more detailed findings
cs-design lint
cs-design lint --json    # Machine-readable output
\`\`\`

---

## Edit Flow \u2014 Modifying an Existing DESIGN.md

When the user wants to **change** the existing design system (not create from scratch):

### Edit Step 1 \u2014 Read the current DESIGN.md

Always read the existing \`.designs/DESIGN.md\` first. Understand:
- Current token values (colors, typography, spacing, rounded, components)
- Current markdown rationale sections
- The overall design intent

### Edit Step 2 \u2014 Back up before editing

\`\`\`bash
cp .designs/DESIGN.md .designs/DESIGN-backup.md
\`\`\`

### Edit Step 3 \u2014 Make targeted changes

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

### Edit Step 4 \u2014 Validate and diff

\`\`\`bash
# Validate the edited file
cs-design validate

# Deep lint
cs-design lint

# Compare before/after to verify only intended changes were made
cs-design diff .designs/DESIGN-backup.md .designs/DESIGN.md
\`\`\`

The diff shows exactly which tokens were added, removed, or modified. Verify:
- \u2705 Only the requested tokens changed
- \u2705 No unintended regressions (new errors or warnings)
- \u2705 No tokens were accidentally removed

### Edit Step 5 \u2014 Apply changes

\`\`\`bash
# Re-export tokens.css \u2014 all screens update automatically
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
- Ensure sufficient contrast between text colors and backgrounds (WCAG AA minimum \u2014 4.5:1 ratio)
- The design system should feel cohesive \u2014 colors, typography, and spacing should work together
- Component token references (\`{colors.primary}\`) must resolve to defined tokens
- Sections should appear in canonical order: Overview \u2192 Colors \u2192 Typography \u2192 Layout \u2192 Elevation & Depth \u2192 Shapes \u2192 Components \u2192 Do's and Don'ts

## Dark Mode (colors-dark)

If the design system should support dark mode, add a \`colors-dark\` section in the YAML front matter. It uses the **same token names** as \`colors\` but with dark-appropriate values:

\`\`\`yaml
colors:
  primary: "#1A1C1E"
  background: "#FFFFFF"
  surface: "#F8FAFC"
  accent: "#2563EB"

colors-dark:
  primary: "#E8EAED"
  background: "#121212"
  surface: "#1E1E1E"
  accent: "#60A5FA"
\`\`\`

**Rules for dark mode colors:**
- Every token in \`colors-dark\` should have a matching token in \`colors\`
- Ideally, provide dark overrides for ALL light tokens (the validator warns about missing ones)
- Dark backgrounds should be dark (\`#121212\`\u2013\`#1E1E1E\`), not pure black (\`#000000\`)
- Dark text colors should be light but not pure white \u2014 use \`#E8EAED\` or similar
- Accent colors in dark mode should be lighter/more saturated versions of the light accent
- Ensure WCAG AA contrast (4.5:1) for dark mode text on dark backgrounds

The exported \`tokens.css\` will automatically include:
- \`:root { ... }\` \u2014 light theme
- \`[data-theme="dark"] { ... }\` \u2014 dark theme via attribute
- \`@media (prefers-color-scheme: dark) { ... }\` \u2014 auto dark via OS preference

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

// src/utils.ts
import fs2 from "fs-extra";
import path3 from "path";
import yaml from "js-yaml";
import chalk from "chalk";
function parseDesignMd(content) {
  const fmRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = content.match(fmRegex);
  if (!match) return null;
  const rawYaml = match[1];
  const markdown = match[2];
  try {
    const parsed = yaml.load(rawYaml);
    if (!parsed || typeof parsed !== "object") return null;
    return { yaml: parsed, markdown, rawYaml };
  } catch {
    return null;
  }
}
async function requireProject(basePath = process.cwd()) {
  const designsDir = getDesignsDir(basePath);
  if (!await fs2.pathExists(designsDir)) {
    throw new Error(
      `No ${DESIGNS_DIR}/ directory found. Run ${chalk.cyan("cs-design init")} first.`
    );
  }
  return designsDir;
}
function logSuccess(message) {
  console.log(chalk.green("\u2705") + " " + message);
}
function logWarning(message) {
  console.log(chalk.yellow("\u26A0\uFE0F ") + " " + message);
}
function logError(message) {
  console.error(chalk.red("\u2716") + " " + message);
}
function logInfo(message) {
  console.log(chalk.blue("\u2139") + " " + message);
}

// src/commands/init.ts
async function initCommand(projectName, options) {
  const designsDir = getDesignsDir();
  const systemId = options.system || DEFAULT_SYSTEM;
  if (await fs3.pathExists(designsDir) && !options.force) {
    logError(
      `${DESIGNS_DIR}/ already exists. Use ${chalk2.cyan("--force")} to overwrite.`
    );
    process.exit(1);
  }
  const spinner = ora("Initializing design project...").start();
  try {
    const systemContent = await resolveSystem(systemId);
    if (!systemContent) {
      spinner.fail(`Design system "${systemId}" not found.`);
      console.log();
      console.log("Available systems:");
      console.log(`  ${chalk2.cyan("modern-minimal")}     Clean, product-oriented`);
      console.log(`  ${chalk2.cyan("corporate-clean")}    Professional, trustworthy`);
      console.log(`  ${chalk2.cyan("bold-creative")}      Vibrant, expressive`);
      console.log();
      console.log(
        `Run ${chalk2.cyan("cs-design systems list")} to see all available systems.`
      );
      process.exit(1);
    }
    spinner.text = "Creating directory structure...";
    await fs3.ensureDir(designsDir);
    await fs3.ensureDir(path4.join(designsDir, SCREENS_DIR));
    spinner.text = "Writing DESIGN.md...";
    await fs3.writeFile(path4.join(designsDir, DESIGN_MD), systemContent, "utf-8");
    spinner.text = "Writing project.json...";
    const projectJson = {
      name: projectName,
      system: systemId,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      screens: {}
    };
    await fs3.writeJson(path4.join(designsDir, PROJECT_JSON), projectJson, {
      spaces: 2
    });
    spinner.text = "Writing skills...";
    const skillDir = getSkillDir();
    await fs3.ensureDir(skillDir);
    await fs3.writeFile(
      path4.join(skillDir, SKILL_MD),
      SKILL_MD_CONTENT,
      "utf-8"
    );
    const sfSkillDir = getSyncfusionSkillDir();
    await fs3.ensureDir(sfSkillDir);
    await fs3.writeFile(
      path4.join(sfSkillDir, SKILL_MD),
      SYNCFUSION_SKILL_MD_CONTENT,
      "utf-8"
    );
    const createDesignSkillDir = getCreateDesignSkillDir();
    await fs3.ensureDir(createDesignSkillDir);
    await fs3.writeFile(
      path4.join(createDesignSkillDir, SKILL_MD),
      CREATE_DESIGN_SKILL_MD_CONTENT,
      "utf-8"
    );
    spinner.succeed("Design project initialized!");
    console.log();
    console.log(`  ${chalk2.bold("Project:")}  ${projectName}`);
    console.log(`  ${chalk2.bold("System:")}   ${systemId}`);
    console.log(`  ${chalk2.bold("Location:")} ${chalk2.dim(designsDir)}`);
    console.log();
    console.log("  Created:");
    logSuccess(`${DESIGNS_DIR}/${DESIGN_MD}`);
    logSuccess(`${DESIGNS_DIR}/${PROJECT_JSON}`);
    logSuccess(`${SKILLS_DIR}/${SKILL_FOLDER_NAME}/${SKILL_MD}`);
    logSuccess(`${SKILLS_DIR}/${SYNCFUSION_SKILL_FOLDER_NAME}/${SKILL_MD}`);
    logSuccess(`${SKILLS_DIR}/${CREATE_DESIGN_SKILL_FOLDER_NAME}/${SKILL_MD}`);
    logSuccess(`${DESIGNS_DIR}/${SCREENS_DIR}/`);
    console.log();
    console.log(
      `  ${chalk2.dim("Your AI agent can now read SKILL.md and DESIGN.md to generate screens.")}`
    );
  } catch (error) {
    spinner.fail("Failed to initialize project.");
    const message = error instanceof Error ? error.message : String(error);
    logError(message);
    process.exit(1);
  }
}

// src/commands/validate.ts
import fs4 from "fs-extra";
import path5 from "path";
import chalk3 from "chalk";

// src/sdk/parser.ts
import yaml2 from "js-yaml";
function parseDesignMd2(content) {
  const fmRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = content.match(fmRegex);
  if (!match) {
    return {
      ok: false,
      error: "No valid YAML front matter found. Expected --- delimited block at the top of the file."
    };
  }
  const rawYaml = match[1];
  const markdown = match[2];
  try {
    const parsed = yaml2.load(rawYaml);
    if (!parsed || typeof parsed !== "object") {
      return { ok: false, error: "YAML front matter parsed to a non-object value." };
    }
    return { ok: true, data: { yaml: parsed, markdown, rawYaml } };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `YAML parse error: ${message}` };
  }
}
function isValidHexColor(value) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}
function extractMarkdownSections(markdown) {
  const headingRegex = /^## (.+)$/gm;
  const sections = [];
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    sections.push(match[1].trim());
  }
  return sections;
}

// src/sdk/validator.ts
var CANONICAL_SECTIONS = [
  "Overview",
  "Colors",
  "Typography",
  "Layout",
  "Elevation & Depth",
  "Shapes",
  "Components",
  "Do's and Don'ts"
];
function finding(check, severity, passed, message) {
  return { check, severity, passed, message };
}
function validateYaml(yamlData) {
  const results = [];
  const hasName = typeof yamlData.name === "string" && yamlData.name.length > 0;
  results.push(
    finding(
      "name field",
      "error",
      hasName,
      hasName ? `name: "${yamlData.name}"` : "name field is missing or empty"
    )
  );
  const hasColors = yamlData.colors && typeof yamlData.colors === "object" && Object.keys(yamlData.colors).length > 0;
  results.push(
    finding(
      "colors section",
      "error",
      !!hasColors,
      hasColors ? `colors: ${Object.keys(yamlData.colors).length} tokens defined` : "colors section is missing or empty"
    )
  );
  if (hasColors) {
    for (const [key, value] of Object.entries(yamlData.colors)) {
      if (typeof value === "string" && !isValidHexColor(value)) {
        results.push(
          finding(
            `color "${key}"`,
            "error",
            false,
            `Invalid hex color: "${value}" (expected #RRGGBB)`
          )
        );
      }
    }
  }
  const hasTypography = yamlData.typography && typeof yamlData.typography === "object" && Object.keys(yamlData.typography).length > 0;
  results.push(
    finding(
      "typography section",
      "error",
      !!hasTypography,
      hasTypography ? `typography: ${Object.keys(yamlData.typography).length} levels defined` : "typography section is missing or empty"
    )
  );
  if (hasTypography) {
    for (const [key, entry] of Object.entries(yamlData.typography)) {
      if (!entry.fontFamily) {
        results.push(
          finding(
            `typography "${key}" fontFamily`,
            "error",
            false,
            `typography.${key} is missing fontFamily`
          )
        );
      }
      if (!entry.fontSize) {
        results.push(
          finding(
            `typography "${key}" fontSize`,
            "error",
            false,
            `typography.${key} is missing fontSize`
          )
        );
      }
    }
  }
  const spacingKeys = yamlData.spacing ? Object.keys(yamlData.spacing) : [];
  results.push(
    finding(
      "spacing section",
      "warning",
      spacingKeys.length > 0,
      spacingKeys.length > 0 ? `spacing: ${spacingKeys.length} levels defined` : "spacing section not defined (recommended)"
    )
  );
  const roundedKeys = yamlData.rounded ? Object.keys(yamlData.rounded) : [];
  results.push(
    finding(
      "rounded section",
      "warning",
      roundedKeys.length > 0,
      roundedKeys.length > 0 ? `rounded: ${roundedKeys.length} levels defined` : "rounded section not defined (recommended)"
    )
  );
  const componentKeys = yamlData.components ? Object.keys(yamlData.components) : [];
  results.push(
    finding(
      "components section",
      "warning",
      componentKeys.length > 0,
      componentKeys.length > 0 ? `components: ${componentKeys.length} defined` : "components section not defined (recommended)"
    )
  );
  const darkColors = yamlData["colors-dark"];
  if (darkColors && typeof darkColors === "object") {
    const darkKeys = Object.keys(darkColors);
    results.push(
      finding(
        "colors-dark section",
        "info",
        true,
        `colors-dark: ${darkKeys.length} dark mode overrides defined`
      )
    );
    for (const [key, value] of Object.entries(darkColors)) {
      if (typeof value === "string" && !isValidHexColor(value)) {
        results.push(
          finding(
            `colors-dark "${key}"`,
            "error",
            false,
            `Invalid hex color in colors-dark: "${value}" (expected #RRGGBB)`
          )
        );
      }
    }
    if (hasColors) {
      const lightKeys = new Set(Object.keys(yamlData.colors));
      for (const key of darkKeys) {
        if (!lightKeys.has(key)) {
          results.push(
            finding(
              `colors-dark "${key}" orphan`,
              "warning",
              false,
              `colors-dark.${key} has no matching colors.${key} in light theme`
            )
          );
        }
      }
      const darkKeySet = new Set(darkKeys);
      const missingDark = [...lightKeys].filter((k) => !darkKeySet.has(k));
      if (missingDark.length > 0) {
        results.push(
          finding(
            "colors-dark completeness",
            "warning",
            false,
            `Light tokens missing dark overrides: ${missingDark.join(", ")}`
          )
        );
      }
    }
  }
  return results;
}
function validateMarkdown(markdown) {
  const results = [];
  const sections = extractMarkdownSections(markdown);
  const seen = /* @__PURE__ */ new Set();
  for (const section of sections) {
    if (seen.has(section)) {
      results.push(
        finding(
          `duplicate section "${section}"`,
          "error",
          false,
          `Duplicate section heading: "## ${section}"`
        )
      );
    }
    seen.add(section);
  }
  const presentCount = CANONICAL_SECTIONS.filter((s) => sections.includes(s)).length;
  for (const section of CANONICAL_SECTIONS) {
    results.push(
      finding(
        `section "${section}"`,
        "warning",
        sections.includes(section),
        sections.includes(section) ? `"## ${section}" present` : `"## ${section}" not found (recommended)`
      )
    );
  }
  results.push(
    finding(
      "markdown sections",
      "warning",
      presentCount >= 4,
      `Markdown sections: ${presentCount}/${CANONICAL_SECTIONS.length} present`
    )
  );
  return results;
}
function validate(content) {
  const parsed = parseDesignMd2(content);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  const findings = [];
  findings.push(finding("YAML front matter", "error", true, "valid"));
  findings.push(...validateYaml(parsed.data.yaml));
  findings.push(...validateMarkdown(parsed.data.markdown));
  const errorCount = findings.filter((f) => !f.passed && f.severity === "error").length;
  const warningCount = findings.filter((f) => !f.passed && f.severity === "warning").length;
  return {
    ok: true,
    data: {
      findings,
      valid: errorCount === 0,
      errorCount,
      warningCount
    }
  };
}

// src/sdk/linter.ts
import { lint as googleLint } from "@google/design.md/linter";
function lint(content) {
  try {
    const report = googleLint(content);
    const findings = report.findings.map((f) => ({
      severity: f.severity,
      message: f.message,
      path: f.path
    }));
    const summary = {
      errors: report.summary.errors,
      warnings: report.summary.warnings,
      infos: report.summary.infos
    };
    const ds = report.designSystem;
    const designSystem = {
      name: ds.name ?? "",
      colors: ds.colors.size,
      typography: ds.typography.size,
      rounded: ds.rounded.size,
      spacing: ds.spacing.size,
      components: ds.components.size,
      sections: report.sections
    };
    return {
      ok: true,
      data: { findings, summary, designSystem, sections: report.sections }
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Lint failed: ${message}` };
  }
}

// src/commands/validate.ts
async function validateCommand() {
  const designsDir = await requireProject();
  const designPath = path5.join(designsDir, DESIGN_MD);
  const content = await fs4.readFile(designPath, "utf-8");
  const structResult = validate(content);
  if (!structResult.ok) {
    logError(structResult.error);
    process.exit(1);
  }
  const report = structResult.data;
  console.log();
  for (const f of report.findings) {
    if (f.passed) {
      logSuccess(`${f.check}: ${f.message}`);
    } else if (f.severity === "error") {
      logError(`${f.check}: ${f.message}`);
    } else {
      logWarning(`${f.check}: ${f.message}`);
    }
  }
  console.log();
  if (report.valid) {
    const suffix = report.warningCount > 0 ? ` (${report.warningCount} warning${report.warningCount > 1 ? "s" : ""})` : "";
    console.log(chalk3.green.bold(`Structural: VALID${suffix}`));
  } else {
    console.log(chalk3.red.bold(
      `Structural: INVALID (${report.errorCount} error${report.errorCount > 1 ? "s" : ""}, ${report.warningCount} warning${report.warningCount > 1 ? "s" : ""})`
    ));
  }
  console.log();
  console.log(chalk3.bold("\u2500\u2500 Deep Lint (powered by @google/design.md) \u2500\u2500"));
  console.log();
  const lintResult = lint(content);
  if (!lintResult.ok) {
    logWarning(`Deep lint skipped: ${lintResult.error}`);
    console.log();
    console.log(report.valid ? chalk3.green.bold("Result: VALID (structural only)") : chalk3.red.bold(`Result: INVALID (${report.errorCount} error${report.errorCount > 1 ? "s" : ""}, ${report.warningCount} warning${report.warningCount > 1 ? "s" : ""})`));
    process.exit(report.valid ? 0 : 1);
  }
  const lintData = lintResult.data;
  let deepErrors = 0;
  let deepWarnings = 0;
  if (lintData.findings.length === 0) {
    logSuccess("No additional issues found by deep linter.");
  } else {
    for (const finding2 of lintData.findings) {
      const pathStr = finding2.path ? chalk3.dim(` (${finding2.path})`) : "";
      if (finding2.severity === "error") {
        deepErrors++;
        logError(`${finding2.message}${pathStr}`);
      } else if (finding2.severity === "warning") {
        deepWarnings++;
        logWarning(`${finding2.message}${pathStr}`);
      } else {
        logInfo(`${finding2.message}${pathStr}`);
      }
    }
  }
  console.log();
  const totalErrors = report.errorCount + deepErrors;
  const totalWarnings = report.warningCount + deepWarnings;
  const isValid = totalErrors === 0;
  if (isValid) {
    const suffix = totalWarnings > 0 ? ` (${totalWarnings} warning${totalWarnings > 1 ? "s" : ""})` : "";
    console.log(chalk3.green.bold(`Result: VALID${suffix}`));
  } else {
    console.log(chalk3.red.bold(
      `Result: INVALID (${totalErrors} error${totalErrors > 1 ? "s" : ""}, ${totalWarnings} warning${totalWarnings > 1 ? "s" : ""})`
    ));
  }
  process.exit(isValid ? 0 : 1);
}

// src/commands/lint.ts
import fs5 from "fs-extra";
import path6 from "path";
import chalk4 from "chalk";
function severityIcon(severity) {
  switch (severity) {
    case "error":
      return chalk4.red("\u2716");
    case "warning":
      return chalk4.yellow("\u26A0");
    case "info":
      return chalk4.blue("\u2139");
    default:
      return chalk4.dim("\xB7");
  }
}
function severityColor(severity) {
  switch (severity) {
    case "error":
      return chalk4.red;
    case "warning":
      return chalk4.yellow;
    case "info":
      return chalk4.blue;
    default:
      return chalk4.dim;
  }
}
async function lintCommand(options) {
  let filePath;
  if (options.file) {
    filePath = path6.resolve(options.file);
  } else {
    const designsDir = await requireProject();
    filePath = path6.join(designsDir, DESIGN_MD);
  }
  if (!await fs5.pathExists(filePath)) {
    logError(`File not found: ${filePath}`);
    process.exit(1);
  }
  const content = await fs5.readFile(filePath, "utf-8");
  const result = lint(content);
  if (!result.ok) {
    logError(result.error);
    process.exit(1);
  }
  const report = result.data;
  if (options.json) {
    console.log(JSON.stringify({
      findings: report.findings,
      summary: report.summary,
      sections: report.sections
    }, null, 2));
    process.exit(report.summary.errors > 0 ? 1 : 0);
  }
  console.log();
  console.log(chalk4.bold(`Linting: ${chalk4.cyan(path6.relative(process.cwd(), filePath))}`));
  console.log();
  if (report.findings.length === 0) {
    logSuccess("No issues found \u2014 DESIGN.md is clean!");
  } else {
    const errors = report.findings.filter((f) => f.severity === "error");
    const warnings = report.findings.filter((f) => f.severity === "warning");
    const infos = report.findings.filter((f) => f.severity === "info");
    for (const finding2 of report.findings) {
      const icon = severityIcon(finding2.severity);
      const color = severityColor(finding2.severity);
      const pathStr = finding2.path ? chalk4.dim(` (${finding2.path})`) : "";
      console.log(`  ${icon} ${color(finding2.message)}${pathStr}`);
    }
    console.log();
    const parts = [];
    if (errors.length > 0) parts.push(chalk4.red(`${errors.length} error${errors.length > 1 ? "s" : ""}`));
    if (warnings.length > 0) parts.push(chalk4.yellow(`${warnings.length} warning${warnings.length > 1 ? "s" : ""}`));
    if (infos.length > 0) parts.push(chalk4.blue(`${infos.length} info`));
    console.log(`  ${parts.join(", ")}`);
  }
  const ds = report.designSystem;
  console.log();
  console.log(chalk4.bold("Design System:"));
  if (ds.name) console.log(`  Name: ${chalk4.cyan(ds.name)}`);
  console.log(`  Colors: ${ds.colors} tokens`);
  console.log(`  Typography: ${ds.typography} tokens`);
  console.log(`  Rounded: ${ds.rounded} tokens`);
  console.log(`  Spacing: ${ds.spacing} tokens`);
  console.log(`  Components: ${ds.components} defined`);
  console.log(`  Sections: ${report.sections.length} (${report.sections.join(", ") || "none"})`);
  console.log();
  process.exit(report.summary.errors > 0 ? 1 : 0);
}

// src/commands/diff.ts
import fs6 from "fs-extra";
import path7 from "path";
import chalk5 from "chalk";

// src/sdk/differ.ts
import { lint as googleLint2 } from "@google/design.md/linter";
function diffMaps(before, after) {
  const added = [];
  const removed = [];
  const modified = [];
  for (const key of after.keys()) {
    if (!before.has(key)) {
      added.push(key);
    } else {
      const bVal = JSON.stringify(before.get(key));
      const aVal = JSON.stringify(after.get(key));
      if (bVal !== aVal) {
        modified.push(key);
      }
    }
  }
  for (const key of before.keys()) {
    if (!after.has(key)) {
      removed.push(key);
    }
  }
  return { added, removed, modified };
}
function serializeComponents(components) {
  const result = /* @__PURE__ */ new Map();
  for (const [name, comp] of components) {
    result.set(name, Object.fromEntries(comp.properties));
  }
  return result;
}
function diff(beforeContent, afterContent) {
  try {
    const beforeReport = googleLint2(beforeContent);
    const afterReport = googleLint2(afterContent);
    const result = {
      tokens: {
        colors: diffMaps(beforeReport.designSystem.colors, afterReport.designSystem.colors),
        typography: diffMaps(beforeReport.designSystem.typography, afterReport.designSystem.typography),
        rounded: diffMaps(beforeReport.designSystem.rounded, afterReport.designSystem.rounded),
        spacing: diffMaps(beforeReport.designSystem.spacing, afterReport.designSystem.spacing),
        components: diffMaps(
          serializeComponents(beforeReport.designSystem.components),
          serializeComponents(afterReport.designSystem.components)
        )
      },
      findings: {
        before: beforeReport.summary,
        after: afterReport.summary,
        delta: {
          errors: afterReport.summary.errors - beforeReport.summary.errors,
          warnings: afterReport.summary.warnings - beforeReport.summary.warnings
        }
      },
      regression: afterReport.summary.errors > beforeReport.summary.errors || afterReport.summary.warnings > beforeReport.summary.warnings
    };
    return { ok: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Diff failed: ${message}` };
  }
}

// src/commands/diff.ts
function hasChanges(d) {
  return d.added.length > 0 || d.removed.length > 0 || d.modified.length > 0;
}
function printTokenDiff(label, d) {
  if (!hasChanges(d)) return;
  console.log(`  ${chalk5.bold(label)}:`);
  for (const key of d.added) console.log(`    ${chalk5.green("+ " + key)}`);
  for (const key of d.removed) console.log(`    ${chalk5.red("- " + key)}`);
  for (const key of d.modified) console.log(`    ${chalk5.yellow("~ " + key)}`);
}
async function diffCommand(beforePath, afterPath, options) {
  const resolvedBefore = path7.resolve(beforePath);
  const resolvedAfter = path7.resolve(afterPath);
  if (!await fs6.pathExists(resolvedBefore)) {
    logError(`File not found: ${resolvedBefore}`);
    process.exit(1);
  }
  if (!await fs6.pathExists(resolvedAfter)) {
    logError(`File not found: ${resolvedAfter}`);
    process.exit(1);
  }
  const beforeContent = await fs6.readFile(resolvedBefore, "utf-8");
  const afterContent = await fs6.readFile(resolvedAfter, "utf-8");
  const result = diff(beforeContent, afterContent);
  if (!result.ok) {
    logError(result.error);
    process.exit(1);
  }
  const data = result.data;
  if (options.json) {
    console.log(JSON.stringify(data, null, 2));
    process.exit(data.regression ? 1 : 0);
  }
  console.log();
  console.log(
    chalk5.bold("Comparing: ") + chalk5.cyan(path7.relative(process.cwd(), resolvedBefore)) + chalk5.dim(" \u2192 ") + chalk5.cyan(path7.relative(process.cwd(), resolvedAfter))
  );
  console.log();
  const sections = ["colors", "typography", "rounded", "spacing", "components"];
  let anyChanges = false;
  for (const section of sections) {
    const d = data.tokens[section];
    if (hasChanges(d)) {
      anyChanges = true;
      printTokenDiff(section.charAt(0).toUpperCase() + section.slice(1), d);
    }
  }
  if (!anyChanges) {
    console.log(chalk5.green("  No token changes detected."));
  }
  console.log();
  console.log(chalk5.bold("Findings:"));
  const de = data.findings.delta.errors;
  const dw = data.findings.delta.warnings;
  const errStr = de === 0 ? chalk5.dim("errors: 0") : de > 0 ? chalk5.red(`errors: +${de}`) : chalk5.green(`errors: ${de}`);
  const warnStr = dw === 0 ? chalk5.dim("warnings: 0") : dw > 0 ? chalk5.red(`warnings: +${dw}`) : chalk5.green(`warnings: ${dw}`);
  console.log(`  ${errStr}, ${warnStr}`);
  console.log();
  if (data.regression) {
    console.log(chalk5.red.bold("\u26A0 REGRESSION DETECTED \u2014 new errors or warnings introduced."));
  } else {
    console.log(chalk5.green.bold("\u2705 No regressions."));
  }
  console.log();
  process.exit(data.regression ? 1 : 0);
}

// src/commands/spec.ts
import chalk6 from "chalk";

// src/sdk/spec.ts
var FULL_SPEC = `# DESIGN.md Format Specification

DESIGN.md is a self-contained, plain-text representation of a design system. It defines the visual identity of a brand and product, ensuring that stylistic choices can be followed across design sessions and between different AI agents and tools. As a human-readable, open-format document, it serves as a living source of truth that both humans and AI can understand and refine.

A DESIGN.md file contains two parts: An optional YAML frontmatter, and a markdown body. The YAML front matter contains machine-readable design tokens. The markdown body sections provide human-readable design rationale and guidance. Prose may use descriptive color names (e.g., "Midnight Forest Green") that correspond to systematic token names (e.g., \`primary\`). The tokens are the normative values; the prose provides context for how to apply them.

## Design Tokens

DESIGN.md may embed design tokens in a structured format. The system is inspired by the Design Token JSON spec (https://www.designtokens.org/). Specifically, it adopts the concept of typed token groups (colors, typography, spacing) and the \`{path.to.token}\` reference syntax for cross-referencing values.

These tokens are easily converted from or to \`tokens.json\`, Figma variables, and Tailwind theme configs.

Design tokens are embedded as YAML front matter at the beginning of the file. The front matter block must begin with a line containing exactly \`---\` and end with a line containing exactly \`---\`.

### Schema

\`\`\`yaml
version: <string>          # optional, current version: "alpha"
name: <string>
description: <string>      # optional
colors:
  <token-name>: <Color>
typography:
  <token-name>: <Typography>
rounded:
  <scale-level>: <Dimension>
spacing:
  <scale-level>: <Dimension | number>
components:
  <component-name>:
    <token-name>: <string | token reference>
\`\`\`

The \`<scale-level>\` placeholder represents a named level in a sizing or spacing scale. Common level names include \`xs\`, \`sm\`, \`md\`, \`lg\`, \`xl\`, and \`full\`. Any descriptive string key is valid.

### Token Types

**Color**: Any valid CSS color string. Supported formats:
- Hex: \`#RGB\`, \`#RGBA\`, \`#RRGGBB\`, \`#RRGGBBAA\`
- Named colors: \`red\`, \`cornflowerblue\`, \`transparent\`
- Functional: \`rgb()\`, \`rgba()\`, \`hsl()\`, \`hsla()\`, \`hwb()\`
- Wide-gamut: \`oklch()\`, \`oklab()\`, \`lch()\`, \`lab()\`
- Mixing: \`color-mix(in srgb, ...)\`

Hex notation (\`#RRGGBB\`) is the recommended default.

**Typography**: An object with these properties:
- \`fontFamily\` (string) \u2014 required
- \`fontSize\` (Dimension) \u2014 required
- \`fontWeight\` (number) \u2014 e.g., 400, 700
- \`lineHeight\` (Dimension | number) \u2014 unitless number is a multiplier of fontSize (recommended)
- \`letterSpacing\` (Dimension)
- \`fontFeature\` (string) \u2014 configures font-feature-settings
- \`fontVariation\` (string) \u2014 configures font-variation-settings

**Dimension**: A string with a unit suffix. Valid units: px, em, rem.

**Token Reference**: Wrapped in curly braces, contains an object path to another value in the YAML tree. Example: \`{colors.primary}\`, \`{rounded.md}\`. Within the \`components\` section, references to composite values (e.g., \`{typography.label-md}\`) are permitted.

## Sections

Every DESIGN.md follows the same structure. Sections can be omitted if not relevant, but those present must appear in this order. All sections use \`##\` headings.

### Section Order

1. **Overview** (also: "Brand & Style") \u2014 Brand personality, target audience, emotional response the UI should evoke
2. **Colors** \u2014 Color palettes and usage rules. At least \`primary\` must be defined
3. **Typography** \u2014 Typography levels (typically 9\u201315). Common categories: headline, display, body, label, caption
4. **Layout** (also: "Layout & Spacing") \u2014 Grid system, spacing strategy, containment rules
5. **Elevation & Depth** (also: "Elevation") \u2014 Shadow strategy or flat design alternatives
6. **Shapes** \u2014 Corner radius philosophy and shape language
7. **Components** \u2014 Component atom styles: buttons, chips, lists, tooltips, checkboxes, radio buttons, input fields
8. **Do's and Don'ts** \u2014 Practical guidelines and common pitfalls

### Section Details

**Colors section tokens**: \`map<string, Color>\` mapping token name to color value.
\`\`\`yaml
colors:
  primary: "#1A1C1E"
  secondary: "#6C7278"
  tertiary: "#B8422E"
  neutral: "#F7F5F2"
\`\`\`

**Typography section tokens**: \`map<string, Typography>\` mapping token name to typography object.
\`\`\`yaml
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
\`\`\`

**Spacing section tokens**: \`map<string, Dimension | number>\` mapping scale identifier to dimension or unitless number.
\`\`\`yaml
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
\`\`\`

**Rounded section tokens**: \`map<string, Dimension>\` for corner radii.
\`\`\`yaml
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
\`\`\`

**Components section tokens**: \`map<string, map<string, string>>\` mapping component name to sub-tokens. Values may be literals or token references.

Valid component properties: \`backgroundColor\`, \`textColor\`, \`typography\`, \`rounded\`, \`padding\`, \`size\`, \`height\`, \`width\`.

Variants (hover, active, pressed) are separate entries with related key names.
\`\`\`yaml
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.secondary}"
\`\`\`

## Recommended Token Names (Non-Normative)

**Colors:** primary, secondary, tertiary, neutral, surface, on-surface, error
**Typography:** headline-display, headline-lg, headline-md, body-lg, body-md, body-sm, label-lg, label-md, label-sm
**Rounded:** none, sm, md, lg, xl, full

## Consumer Behavior for Unknown Content

| Scenario | Behavior |
|----------|----------|
| Unknown section heading | Preserve; do not error |
| Unknown color token name | Accept if value is valid |
| Unknown typography token name | Accept as valid typography |
| Unknown spacing value | Accept; store as string if not a valid dimension |
| Unknown component property | Accept with warning |
| Duplicate section heading | Error; reject the file |
`;
var LINT_RULES = [
  {
    name: "broken-ref",
    severity: "error",
    description: "Token references ({colors.primary}) that don't resolve to any defined token"
  },
  {
    name: "missing-primary",
    severity: "warning",
    description: "Colors are defined but no primary color exists \u2014 agents will auto-generate one"
  },
  {
    name: "contrast-ratio",
    severity: "warning",
    description: "Component backgroundColor/textColor pairs below WCAG AA minimum (4.5:1)"
  },
  {
    name: "orphaned-tokens",
    severity: "warning",
    description: "Color tokens defined but never referenced by any component"
  },
  {
    name: "token-summary",
    severity: "info",
    description: "Summary of how many tokens are defined in each section"
  },
  {
    name: "missing-sections",
    severity: "info",
    description: "Optional sections (spacing, rounded) absent when other tokens exist"
  },
  {
    name: "missing-typography",
    severity: "warning",
    description: "Colors are defined but no typography tokens exist \u2014 agents will use default fonts"
  },
  {
    name: "section-order",
    severity: "warning",
    description: "Sections appear out of the canonical order defined by the spec"
  },
  {
    name: "unknown-key",
    severity: "warning",
    description: "A top-level YAML key looks like a typo of a known schema key (e.g. colours: \u2192 colors:)"
  }
];
function getSpec() {
  return {
    format: {
      layers: [
        "YAML front matter \u2014 Machine-readable design tokens (delimited by --- fences)",
        "Markdown body \u2014 Human-readable design rationale (organized into ## sections)"
      ],
      tokenSchema: [
        "version",
        "name",
        "description",
        "colors",
        "typography",
        "rounded",
        "spacing",
        "components"
      ],
      sectionOrder: [
        "Overview",
        "Colors",
        "Typography",
        "Layout",
        "Elevation & Depth",
        "Shapes",
        "Components",
        "Do's and Don'ts"
      ],
      tokenTypes: {
        Color: "Any CSS color (hex, rgb(), oklch(), named, etc.)",
        Dimension: "number + unit (px, em, rem)",
        "Token Reference": "{path.to.token}",
        Typography: "object with fontFamily, fontSize, fontWeight, lineHeight, letterSpacing"
      }
    },
    specUrl: "https://github.com/google-labs-code/design.md/blob/main/docs/spec.md",
    rules: LINT_RULES,
    fullSpec: FULL_SPEC
  };
}

// src/commands/spec.ts
async function specCommand(options) {
  const spec = getSpec();
  if (options.format === "json") {
    const output = {};
    if (options.rulesOnly) {
      output.rules = spec.rules;
    } else {
      output.spec = spec.fullSpec;
      output.format = spec.format;
      output.specUrl = spec.specUrl;
      if (options.rules) output.rules = spec.rules;
    }
    console.log(JSON.stringify(output, null, 2));
    return;
  }
  if (options.rulesOnly) {
    printRulesTable(spec.rules);
    return;
  }
  console.log(spec.fullSpec);
  if (options.rules) printRulesTable(spec.rules);
}
function printRulesTable(rules) {
  console.log(chalk6.bold("Active Linting Rules:"));
  console.log();
  const nameWidth = Math.max(...rules.map((r) => r.name.length), 4) + 2;
  const sevWidth = 10;
  console.log(`  ${chalk6.bold("Rule".padEnd(nameWidth))} ${chalk6.bold("Severity".padEnd(sevWidth))} ${chalk6.bold("Description")}`);
  console.log(`  ${"\u2500".repeat(nameWidth)} ${"\u2500".repeat(sevWidth)} ${"\u2500".repeat(40)}`);
  for (const rule of rules) {
    const sevColor = rule.severity === "error" ? chalk6.red : rule.severity === "warning" ? chalk6.yellow : chalk6.blue;
    console.log(`  ${chalk6.cyan(rule.name.padEnd(nameWidth))} ${sevColor(rule.severity.padEnd(sevWidth))} ${rule.description}`);
  }
  console.log();
}

// src/commands/screens.ts
import fs7 from "fs-extra";
import path8 from "path";
import chalk7 from "chalk";
async function screensListCommand(options) {
  const designsDir = await requireProject();
  const projectPath = path8.join(designsDir, PROJECT_JSON);
  if (!await fs7.pathExists(projectPath)) {
    console.error(
      chalk7.red(`No ${PROJECT_JSON} found in .designs/ directory.`)
    );
    process.exit(1);
  }
  const project = await fs7.readJson(projectPath);
  const screensDir = path8.join(designsDir, SCREENS_DIR);
  const registeredScreens = /* @__PURE__ */ new Map();
  if (project.screens) {
    for (const [key, entry] of Object.entries(project.screens)) {
      registeredScreens.set(entry.file || `${key}.html`, entry);
    }
  }
  const allScreens = [];
  if (await fs7.pathExists(screensDir)) {
    const files = await fs7.readdir(screensDir);
    const htmlFiles = files.filter((f) => f.endsWith(".html")).sort();
    for (const file of htmlFiles) {
      if (registeredScreens.has(file)) {
        allScreens.push(registeredScreens.get(file));
      } else {
        const name = path8.basename(file, ".html");
        allScreens.push({
          name,
          file,
          description: "(unregistered \u2014 not in project.json)"
        });
      }
    }
  }
  for (const [file, entry] of registeredScreens) {
    if (!allScreens.some((s) => s.file === file)) {
      allScreens.push(entry);
    }
  }
  if (options.json) {
    const output = {
      project: project.name,
      system: project.system,
      screens: allScreens.map((s) => ({
        name: s.name,
        file: s.file,
        description: s.description
      }))
    };
    console.log(JSON.stringify(output, null, 2));
    return;
  }
  console.log();
  console.log(
    `${chalk7.bold("Project:")} ${project.name} ${chalk7.dim(`(${project.system})`)}`
  );
  console.log();
  if (allScreens.length === 0) {
    console.log(chalk7.dim("  No screens yet."));
    console.log();
    console.log(
      `  ${chalk7.dim("Ask your AI agent to generate screens using the design system.")}`
    );
  } else {
    for (const screen of allScreens) {
      const fileName = chalk7.cyan(screen.file.padEnd(22));
      console.log(`  ${fileName} ${screen.description}`);
    }
    console.log();
    console.log(
      `${allScreens.length} screen${allScreens.length !== 1 ? "s" : ""}`
    );
  }
  console.log();
}

// src/commands/systems.ts
import fs8 from "fs-extra";
import path9 from "path";
import chalk8 from "chalk";
import ora2 from "ora";

// src/templates/design-system.ts
function generateEmptyDesignMd(name) {
  return `---
version: alpha
name: "${name}"
description: ""

colors:
  primary: "#000000"
  secondary: "#666666"
  accent: "#0066FF"
  background: "#FFFFFF"
  surface: "#F5F5F5"
  border: "#E0E0E0"

colors-dark:
  primary: "#FFFFFF"
  secondary: "#999999"
  accent: "#4D94FF"
  background: "#121212"
  surface: "#1E1E1E"
  border: "#333333"

typography:
  h1:
    fontFamily: "Inter"
    fontSize: "48px"
    fontWeight: 600
    lineHeight: 1.2
  h2:
    fontFamily: "Inter"
    fontSize: "36px"
    fontWeight: 600
    lineHeight: 1.25
  h3:
    fontFamily: "Inter"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
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
---

# ${name}

## Overview

Describe the visual identity and mood of this design system.

## Colors

Describe the color palette and usage rules.

## Typography

Describe the type system and hierarchy.

## Layout

Describe the grid, spacing, and containment rules.

## Elevation & Depth

Describe shadow and depth strategy.

## Shapes

Describe corner radius and shape language.

## Components

Describe button, card, input, and other component styles.

## Do's and Don'ts

List specific design rules and constraints.
`;
}

// src/commands/systems.ts
async function systemsListCommand() {
  const builtins = getBuiltinSystems();
  const installed = await getInstalledSystems();
  console.log();
  console.log(chalk8.bold("Built-in:"));
  for (const sys of builtins) {
    const id = chalk8.cyan(sys.id.padEnd(22));
    console.log(`  ${id} ${sys.description}`);
  }
  console.log();
  console.log(chalk8.bold("Installed:"));
  if (installed.length === 0) {
    console.log(chalk8.dim("  (none)"));
  } else {
    for (const sys of installed) {
      const id = chalk8.cyan(sys.id.padEnd(22));
      console.log(`  ${id} ${sys.description}`);
    }
  }
  console.log();
}
async function systemsInstallCommand(source) {
  const spinner = ora2(`Installing design system from "${source}"...`).start();
  try {
    let content;
    let systemId;
    if (source.startsWith("github:")) {
      const repoPath = source.replace("github:", "");
      const rawUrl = `https://raw.githubusercontent.com/${repoPath}/main/DESIGN.md`;
      spinner.text = `Fetching from GitHub: ${repoPath}...`;
      const response = await fetch(rawUrl);
      if (!response.ok) {
        const masterUrl = `https://raw.githubusercontent.com/${repoPath}/master/DESIGN.md`;
        const masterResponse = await fetch(masterUrl);
        if (!masterResponse.ok) {
          throw new Error(
            `Could not fetch DESIGN.md from ${repoPath} (tried main and master branches)`
          );
        }
        content = await masterResponse.text();
      } else {
        content = await response.text();
      }
      systemId = repoPath.split("/").pop() || repoPath.replace("/", "-");
    } else if (source.startsWith("./") || source.startsWith("/") || source.startsWith("../")) {
      const localPath = path9.resolve(source);
      const designPath = (await fs8.stat(localPath)).isDirectory() ? path9.join(localPath, DESIGN_MD) : localPath;
      if (!await fs8.pathExists(designPath)) {
        throw new Error(`No DESIGN.md found at ${designPath}`);
      }
      content = await fs8.readFile(designPath, "utf-8");
      systemId = path9.basename(path9.dirname(designPath));
      if (systemId === "." || systemId === "..") {
        systemId = path9.basename(designPath, ".md").toLowerCase();
      }
    } else {
      throw new Error(
        `Registry install is not yet supported. Use a local path or GitHub source:
  cs-design systems install ./my-system/
  cs-design systems install github:user/repo`
      );
    }
    spinner.text = "Validating DESIGN.md...";
    const parsed = parseDesignMd(content);
    if (!parsed) {
      throw new Error(
        "Invalid DESIGN.md \u2014 could not parse YAML front matter."
      );
    }
    if (!parsed.yaml.name) {
      throw new Error('Invalid DESIGN.md \u2014 missing "name" field in YAML.');
    }
    if (!parsed.yaml.colors) {
      throw new Error('Invalid DESIGN.md \u2014 missing "colors" section in YAML.');
    }
    if (!parsed.yaml.typography) {
      throw new Error(
        'Invalid DESIGN.md \u2014 missing "typography" section in YAML.'
      );
    }
    const finalId = systemId.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    spinner.text = `Installing as "${finalId}"...`;
    const installDir = path9.join(getGlobalSystemsDir(), finalId);
    await fs8.ensureDir(installDir);
    await fs8.writeFile(path9.join(installDir, DESIGN_MD), content, "utf-8");
    spinner.succeed(`Installed "${parsed.yaml.name}" as ${chalk8.cyan(finalId)}`);
    console.log();
    console.log(
      `  ${chalk8.dim("Use it with:")} cs-design init "My App" --system ${finalId}`
    );
    console.log();
  } catch (error) {
    spinner.fail("Installation failed.");
    const message = error instanceof Error ? error.message : String(error);
    logError(message);
    process.exit(1);
  }
}
async function systemsCreateCommand(name) {
  const systemId = name.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const installDir = path9.join(getGlobalSystemsDir(), systemId);
  if (await fs8.pathExists(installDir)) {
    logWarning(
      `System "${systemId}" already exists at ${chalk8.dim(installDir)}`
    );
    logError("Use a different name or remove the existing system first.");
    process.exit(1);
  }
  const spinner = ora2(`Creating design system "${name}"...`).start();
  try {
    await fs8.ensureDir(installDir);
    const content = generateEmptyDesignMd(name);
    await fs8.writeFile(path9.join(installDir, DESIGN_MD), content, "utf-8");
    spinner.succeed(`Created design system "${name}"`);
    console.log();
    console.log(`  ${chalk8.bold("ID:")}       ${systemId}`);
    console.log(`  ${chalk8.bold("Location:")} ${chalk8.dim(installDir)}`);
    console.log();
    console.log(
      `  ${chalk8.dim("Edit")} ${chalk8.cyan(path9.join(installDir, DESIGN_MD))} ${chalk8.dim("to customize your design system.")}`
    );
    console.log(
      `  ${chalk8.dim("Use it with:")} cs-design init "My App" --system ${systemId}`
    );
    console.log();
  } catch (error) {
    spinner.fail("Failed to create design system.");
    const message = error instanceof Error ? error.message : String(error);
    logError(message);
    process.exit(1);
  }
}

// src/commands/export-tokens.ts
import fs9 from "fs-extra";
import path10 from "path";
import chalk9 from "chalk";
import ora3 from "ora";

// src/sdk/exporter.ts
import {
  lint as googleLint3,
  TailwindV4EmitterHandler,
  serializeTailwindV4,
  DtcgEmitterHandler
} from "@google/design.md/linter";
function generateCss(yaml3) {
  const lines = ["/* Light theme (default) */", ":root {"];
  if (yaml3.colors) {
    lines.push("  /* Colors */");
    for (const [key, value] of Object.entries(yaml3.colors)) {
      lines.push(`  --color-${key}: ${value};`);
    }
    lines.push("");
  }
  if (yaml3.typography) {
    lines.push("  /* Typography */");
    for (const [key, token] of Object.entries(yaml3.typography)) {
      lines.push(`  --font-${key}-family: '${token.fontFamily}', sans-serif;`);
      lines.push(`  --font-${key}-size: ${token.fontSize};`);
      if (token.fontWeight !== void 0) {
        lines.push(`  --font-${key}-weight: ${token.fontWeight};`);
      }
      if (token.lineHeight !== void 0) {
        lines.push(`  --font-${key}-line-height: ${token.lineHeight};`);
      }
      if (token.letterSpacing) {
        lines.push(`  --font-${key}-letter-spacing: ${token.letterSpacing};`);
      }
    }
    lines.push("");
  }
  if (yaml3.rounded) {
    lines.push("  /* Border Radius */");
    for (const [key, value] of Object.entries(yaml3.rounded)) {
      lines.push(`  --radius-${key}: ${value};`);
    }
    lines.push("");
  }
  if (yaml3.spacing) {
    lines.push("  /* Spacing */");
    for (const [key, value] of Object.entries(yaml3.spacing)) {
      lines.push(`  --space-${key}: ${value};`);
    }
    lines.push("");
  }
  lines.push("}");
  const darkColors = yaml3["colors-dark"];
  if (darkColors && Object.keys(darkColors).length > 0) {
    lines.push("");
    lines.push('/* Dark theme \u2014 activated via data-theme="dark" attribute */');
    lines.push('[data-theme="dark"] {');
    for (const [key, value] of Object.entries(darkColors)) {
      lines.push(`  --color-${key}: ${value};`);
    }
    lines.push("}");
    lines.push("");
    lines.push("/* Dark theme \u2014 auto-activated via OS preference */");
    lines.push("@media (prefers-color-scheme: dark) {");
    lines.push('  :root:not([data-theme="light"]) {');
    for (const [key, value] of Object.entries(darkColors)) {
      lines.push(`    --color-${key}: ${value};`);
    }
    lines.push("  }");
    lines.push("}");
  }
  return lines.join("\n") + "\n";
}
function generateTailwind(yaml3) {
  const theme = {};
  if (yaml3.colors) {
    const colors = { ...yaml3.colors };
    const darkColors = yaml3["colors-dark"];
    if (darkColors) {
      colors.dark = { ...darkColors };
    }
    theme.colors = colors;
  }
  if (yaml3.typography) {
    const fontFamily = {};
    const fontSize = {};
    const seenFamilies = /* @__PURE__ */ new Set();
    for (const [key, token] of Object.entries(yaml3.typography)) {
      if (!seenFamilies.has(token.fontFamily)) {
        const familyKey = token.fontFamily.toLowerCase().replace(/\s+/g, "-");
        fontFamily[familyKey] = [token.fontFamily, "sans-serif"];
        seenFamilies.add(token.fontFamily);
      }
      const meta = {};
      if (token.lineHeight !== void 0) meta.lineHeight = String(token.lineHeight);
      if (token.letterSpacing) meta.letterSpacing = token.letterSpacing;
      if (token.fontWeight !== void 0) meta.fontWeight = String(token.fontWeight);
      fontSize[key] = [token.fontSize, meta];
    }
    theme.fontFamily = fontFamily;
    theme.fontSize = fontSize;
  }
  if (yaml3.rounded) {
    theme.borderRadius = { ...yaml3.rounded };
  }
  if (yaml3.spacing) {
    theme.spacing = { ...yaml3.spacing };
  }
  return `/** @type {import('tailwindcss').Config['theme']} */
export default ${JSON.stringify(theme, null, 2)};
`;
}
function generateJson(yaml3) {
  const tokens = {};
  if (yaml3.colors) {
    for (const [key, value] of Object.entries(yaml3.colors)) {
      tokens[`color.${key}`] = value;
    }
  }
  const darkColors = yaml3["colors-dark"];
  if (darkColors) {
    for (const [key, value] of Object.entries(darkColors)) {
      tokens[`color-dark.${key}`] = value;
    }
  }
  if (yaml3.typography) {
    for (const [key, token] of Object.entries(yaml3.typography)) {
      tokens[`font.${key}.family`] = token.fontFamily;
      tokens[`font.${key}.size`] = token.fontSize;
      if (token.fontWeight !== void 0) tokens[`font.${key}.weight`] = token.fontWeight;
      if (token.lineHeight !== void 0) tokens[`font.${key}.lineHeight`] = token.lineHeight;
      if (token.letterSpacing) tokens[`font.${key}.letterSpacing`] = token.letterSpacing;
    }
  }
  if (yaml3.rounded) {
    for (const [key, value] of Object.entries(yaml3.rounded)) {
      tokens[`radius.${key}`] = value;
    }
  }
  if (yaml3.spacing) {
    for (const [key, value] of Object.entries(yaml3.spacing)) {
      tokens[`space.${key}`] = value;
    }
  }
  return JSON.stringify(tokens, null, 2) + "\n";
}
function generateCssTailwind(content) {
  try {
    const report = googleLint3(content);
    const handler = new TailwindV4EmitterHandler();
    const result = handler.execute(report.designSystem);
    if (!result.success) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true, data: serializeTailwindV4(result.data.theme) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
function generateDtcg(content) {
  try {
    const report = googleLint3(content);
    const handler = new DtcgEmitterHandler();
    const result = handler.execute(report.designSystem);
    if (!result.success) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true, data: JSON.stringify(result.data, null, 2) + "\n" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
var FORMAT_EXTENSIONS = {
  css: "css",
  tailwind: "theme.js",
  json: "json",
  "css-tailwind": "css",
  dtcg: "tokens.json"
};
function exportTokens(content, format) {
  const extension = FORMAT_EXTENSIONS[format];
  if (!extension) {
    return {
      ok: false,
      error: `Unknown format "${format}". Supported: ${Object.keys(FORMAT_EXTENSIONS).join(", ")}`
    };
  }
  if (format === "css-tailwind") {
    const result = generateCssTailwind(content);
    if (!result.ok) return result;
    return { ok: true, data: { content: result.data, format, extension } };
  }
  if (format === "dtcg") {
    const result = generateDtcg(content);
    if (!result.ok) return result;
    return { ok: true, data: { content: result.data, format, extension } };
  }
  const parsed = parseDesignMd2(content);
  if (!parsed.ok) return parsed;
  const generators = {
    css: generateCss,
    tailwind: generateTailwind,
    json: generateJson
  };
  const generator = generators[format];
  if (!generator) {
    return { ok: false, error: `No generator for format "${format}"` };
  }
  try {
    const output = generator(parsed.data.yaml);
    return { ok: true, data: { content: output, format, extension } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// src/commands/export-tokens.ts
async function exportTokensCommand(options) {
  const designsDir = await requireProject();
  const designPath = path10.join(designsDir, DESIGN_MD);
  const content = await fs9.readFile(designPath, "utf-8");
  const spinner = ora3(`Exporting tokens as ${options.format}...`).start();
  const result = exportTokens(content, options.format);
  if (!result.ok) {
    spinner.fail("Export failed.");
    logError(result.error);
    process.exit(1);
  }
  try {
    const outputPath = options.out || path10.join(designsDir, `tokens.${result.data.extension}`);
    await fs9.ensureDir(path10.dirname(outputPath));
    await fs9.writeFile(outputPath, result.data.content, "utf-8");
    spinner.succeed(`Tokens exported to ${chalk9.cyan(outputPath)}`);
  } catch (error) {
    spinner.fail("Export failed.");
    logError(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// src/commands/apply.ts
import fs10 from "fs-extra";
import path11 from "path";
import ora4 from "ora";
async function applyCommand() {
  const designsDir = await requireProject();
  const designPath = path11.join(designsDir, DESIGN_MD);
  const content = await fs10.readFile(designPath, "utf-8");
  const parsed = parseDesignMd2(content);
  if (!parsed.ok) {
    logError(`Could not parse ${DESIGN_MD}: ${parsed.error}`);
    process.exit(1);
  }
  const spinner = ora4("Applying design system...").start();
  try {
    spinner.text = "Exporting tokens.css...";
    const css = generateCss(parsed.data.yaml);
    const tokensPath = path11.join(designsDir, "tokens.css");
    await fs10.writeFile(tokensPath, css, "utf-8");
    const screensDir = path11.join(designsDir, SCREENS_DIR);
    let screenCount = 0;
    if (await fs10.pathExists(screensDir)) {
      const files = await fs10.readdir(screensDir);
      screenCount = files.filter((f) => f.endsWith(".html")).length;
    }
    spinner.succeed("Design system applied!");
    console.log();
    logSuccess(`tokens.css exported \u2192 ${tokensPath}`);
    if (screenCount > 0) {
      logSuccess(`${screenCount} screen${screenCount !== 1 ? "s" : ""} will use the updated tokens via <link href="../tokens.css" />`);
    } else {
      logInfo("No screens found yet. Generate screens using the cs-design skill.");
    }
    console.log();
  } catch (error) {
    spinner.fail("Apply failed.");
    logError(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// src/commands/skills.ts
import fs11 from "fs-extra";
import path13 from "path";
import os3 from "os";
import { execSync } from "child_process";
import chalk10 from "chalk";
import ora5 from "ora";

// src/skills-registry.ts
import os2 from "os";
import path12 from "path";
var FRAMEWORKS = [
  {
    id: "react",
    name: "React",
    repo: "syncfusion/react-ui-components-skills",
    prefix: "syncfusion-react-"
  },
  {
    id: "angular",
    name: "Angular",
    repo: "syncfusion/angular-ui-components-skills",
    prefix: "syncfusion-angular-"
  },
  {
    id: "blazor",
    name: "Blazor",
    repo: "syncfusion/blazor-ui-components-skills",
    prefix: "syncfusion-blazor-"
  },
  {
    id: "javascript",
    name: "JavaScript",
    repo: "syncfusion/javascript-ui-controls-skills",
    prefix: "syncfusion-javascript-"
  },
  {
    id: "vue",
    name: "Vue",
    repo: "syncfusion/vue-ui-components-skills",
    prefix: "syncfusion-vue-"
  },
  {
    id: "maui",
    name: ".NET MAUI",
    repo: "syncfusion/maui-ui-components-skills",
    prefix: "syncfusion-maui-"
  },
  {
    id: "wpf",
    name: "WPF",
    repo: "syncfusion/wpf-ui-components-skills",
    prefix: "syncfusion-wpf-"
  },
  {
    id: "winui",
    name: "WinUI",
    repo: "syncfusion/winui-ui-components-skills",
    prefix: "syncfusion-winui-"
  },
  {
    id: "winforms",
    name: "WinForms",
    repo: "syncfusion/winforms-ui-components-skills",
    prefix: "syncfusion-winforms-"
  }
];
function getFrameworks() {
  return FRAMEWORKS;
}
function getFramework(id) {
  return FRAMEWORKS.find((f) => f.id === id);
}
function getFrameworkIds() {
  return FRAMEWORKS.map((f) => f.id);
}
function getCanonicalSkillsDir() {
  return path12.join(os2.homedir(), ".agents", "skills");
}
function getSymlinkTargets() {
  const home = os2.homedir();
  return [
    path12.join(home, ".codestudio", "skills"),
    path12.join(home, ".claude", "skills"),
    path12.join(home, ".copilot", "skills"),
    path12.join(home, ".continue", "skills"),
    path12.join(home, ".kiro", "skills"),
    path12.join(home, ".codeium", "windsurf", "skills")
  ];
}
function getRepoUrl(framework) {
  return `https://github.com/${framework.repo}.git`;
}

// src/commands/skills.ts
function getTmpDir() {
  return path13.join(os3.tmpdir(), "cs-design-skills-clone");
}
function cloneRepo(framework) {
  const tmpDir = getTmpDir();
  const cloneDir = path13.join(tmpDir, framework.id);
  fs11.removeSync(cloneDir);
  fs11.ensureDirSync(tmpDir);
  const url = getRepoUrl(framework);
  execSync(`git clone --depth 1 "${url}" "${cloneDir}"`, {
    stdio: "pipe",
    timeout: 6e4
  });
  return cloneDir;
}
function findSkillsRoot(cloneDir) {
  const skillsSubdir = path13.join(cloneDir, "skills");
  if (fs11.existsSync(skillsSubdir)) return skillsSubdir;
  return cloneDir;
}
function listSkillFolders(skillsRoot) {
  return fs11.readdirSync(skillsRoot, { withFileTypes: true }).filter(
    (d) => d.isDirectory() && fs11.existsSync(path13.join(skillsRoot, d.name, "SKILL.md"))
  ).map((d) => d.name);
}
function ensureSymlink(canonicalPath, targetDir, skillName) {
  const linkPath = path13.join(targetDir, skillName);
  try {
    const stat = fs11.lstatSync(linkPath);
    if (stat.isSymbolicLink() || stat.isDirectory()) {
      fs11.removeSync(linkPath);
    }
  } catch {
  }
  const relativePath = path13.relative(targetDir, canonicalPath);
  fs11.ensureDirSync(targetDir);
  fs11.symlinkSync(relativePath, linkPath);
}
async function skillsAddCommand(frameworkId, options) {
  const framework = getFramework(frameworkId);
  if (!framework) {
    logError(`Unknown framework "${frameworkId}".`);
    console.log();
    console.log("Available frameworks:");
    for (const f of getFrameworks()) {
      console.log(`  ${chalk10.cyan(f.id.padEnd(14))} ${f.name}`);
    }
    process.exit(1);
  }
  const spinner = ora5(
    `Installing Syncfusion ${framework.name} component skills...`
  ).start();
  try {
    spinner.text = `Cloning ${framework.repo}...`;
    const cloneDir = cloneRepo(framework);
    const skillsRoot = findSkillsRoot(cloneDir);
    let skillNames = listSkillFolders(skillsRoot);
    if (skillNames.length === 0) {
      spinner.fail("No skills found in the repository.");
      process.exit(1);
    }
    if (options.only) {
      const requested = options.only.split(",").map((s) => s.trim());
      const filtered = [];
      for (const req of requested) {
        const match = skillNames.find(
          (name) => name === req || name.endsWith(`-${req}`)
        );
        if (match) {
          filtered.push(match);
        } else {
          logWarning(`Skill "${req}" not found in ${framework.repo}`);
        }
      }
      if (filtered.length === 0) {
        spinner.fail("No matching skills found.");
        console.log();
        console.log("Available skills:");
        for (const name of skillNames.slice(0, 20)) {
          console.log(`  ${chalk10.dim(name)}`);
        }
        if (skillNames.length > 20) {
          console.log(`  ${chalk10.dim(`...and ${skillNames.length - 20} more`)}`);
        }
        process.exit(1);
      }
      skillNames = filtered;
    }
    spinner.text = `Installing ${skillNames.length} skills...`;
    const canonicalDir = getCanonicalSkillsDir();
    fs11.ensureDirSync(canonicalDir);
    let installed = 0;
    for (const skillName of skillNames) {
      const src = path13.join(skillsRoot, skillName);
      const dest = path13.join(canonicalDir, skillName);
      fs11.copySync(src, dest, { overwrite: true });
      installed++;
    }
    spinner.text = "Creating symlinks for agent discovery...";
    const symlinkTargets = getSymlinkTargets();
    let linkedAgents = 0;
    for (const targetDir of symlinkTargets) {
      try {
        for (const skillName of skillNames) {
          const canonicalPath = path13.join(canonicalDir, skillName);
          ensureSymlink(canonicalPath, targetDir, skillName);
        }
        linkedAgents++;
      } catch {
      }
    }
    fs11.removeSync(getTmpDir());
    spinner.succeed(
      `Installed ${chalk10.bold(installed)} Syncfusion ${framework.name} skills`
    );
    console.log();
    console.log(
      `  ${chalk10.bold("Canonical:")} ${chalk10.dim(canonicalDir)}`
    );
    console.log(
      `  ${chalk10.bold("Linked to:")} ${linkedAgents} agent directories`
    );
    console.log();
    if (installed <= 15) {
      for (const name of skillNames) {
        logSuccess(name);
      }
    } else {
      for (const name of skillNames.slice(0, 10)) {
        logSuccess(name);
      }
      console.log(
        chalk10.dim(`  ...and ${installed - 10} more`)
      );
    }
    console.log();
    console.log(
      chalk10.dim(
        "  Skills are now available to all AI agents (Code Studio, Claude, Copilot, Cursor, etc.)"
      )
    );
    console.log();
  } catch (error) {
    spinner.fail("Installation failed.");
    const message = error instanceof Error ? error.message : String(error);
    logError(message);
    if (message.includes("git")) {
      logInfo("Make sure git is installed and you have internet access.");
    }
    if (message.includes("not found") || message.includes("Repository")) {
      logInfo(
        `Repository ${framework.repo} may not be available yet.`
      );
    }
    process.exit(1);
  }
}
async function skillsListCommand(options) {
  const canonicalDir = getCanonicalSkillsDir();
  if (!fs11.existsSync(canonicalDir)) {
    if (options.json) {
      console.log(JSON.stringify({ skills: [] }, null, 2));
    } else {
      console.log();
      console.log(chalk10.dim("  No Syncfusion skills installed."));
      console.log();
      console.log(
        `  Run ${chalk10.cyan("cs-design skills add <framework>")} to install.`
      );
      console.log();
    }
    return;
  }
  const entries = fs11.readdirSync(canonicalDir, { withFileTypes: true }).filter(
    (d) => d.isDirectory() && d.name.startsWith("syncfusion-") && fs11.existsSync(path13.join(canonicalDir, d.name, "SKILL.md"))
  ).map((d) => d.name).sort();
  if (options.json) {
    const grouped2 = {};
    for (const name of entries) {
      const framework = detectFramework(name);
      if (!grouped2[framework]) grouped2[framework] = [];
      grouped2[framework].push(name);
    }
    console.log(
      JSON.stringify({ total: entries.length, frameworks: grouped2 }, null, 2)
    );
    return;
  }
  if (entries.length === 0) {
    console.log();
    console.log(chalk10.dim("  No Syncfusion skills installed."));
    console.log();
    console.log(
      `  Run ${chalk10.cyan("cs-design skills add <framework>")} to install.`
    );
    console.log();
    return;
  }
  const grouped = {};
  for (const name of entries) {
    const framework = detectFramework(name);
    if (!grouped[framework]) grouped[framework] = [];
    grouped[framework].push(name);
  }
  console.log();
  console.log(
    `${chalk10.bold("Installed Syncfusion Skills")} (${entries.length} total)`
  );
  console.log();
  for (const [framework, skills2] of Object.entries(grouped)) {
    console.log(`  ${chalk10.bold(framework)} (${skills2.length} skills)`);
    for (const skill of skills2) {
      console.log(`    ${chalk10.dim(skill)}`);
    }
    console.log();
  }
}
function detectFramework(skillName) {
  for (const f of getFrameworks()) {
    if (skillName.startsWith(f.prefix)) return f.name;
  }
  return "Other";
}
async function skillsRemoveCommand(frameworkId) {
  const framework = getFramework(frameworkId);
  if (!framework) {
    logError(`Unknown framework "${frameworkId}".`);
    console.log();
    console.log("Available frameworks:");
    for (const f of getFrameworks()) {
      console.log(`  ${chalk10.cyan(f.id.padEnd(14))} ${f.name}`);
    }
    process.exit(1);
  }
  const spinner = ora5(
    `Removing Syncfusion ${framework.name} skills...`
  ).start();
  try {
    const canonicalDir = getCanonicalSkillsDir();
    const symlinkTargets = getSymlinkTargets();
    let removed = 0;
    if (fs11.existsSync(canonicalDir)) {
      const entries = fs11.readdirSync(canonicalDir, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name.startsWith(framework.prefix));
      for (const entry of entries) {
        fs11.removeSync(path13.join(canonicalDir, entry.name));
        for (const targetDir of symlinkTargets) {
          const linkPath = path13.join(targetDir, entry.name);
          try {
            fs11.removeSync(linkPath);
          } catch {
          }
        }
        removed++;
      }
    }
    if (removed === 0) {
      spinner.info(`No Syncfusion ${framework.name} skills found to remove.`);
    } else {
      spinner.succeed(
        `Removed ${chalk10.bold(removed)} Syncfusion ${framework.name} skills`
      );
    }
    console.log();
  } catch (error) {
    spinner.fail("Removal failed.");
    const message = error instanceof Error ? error.message : String(error);
    logError(message);
    process.exit(1);
  }
}

// src/cli.ts
var VERSION = "0.1.0";
var program = new Command();
program.name("cs-design").description(
  "A CLI tool that provides design system context for AI coding agents."
).version(VERSION, "-v, --version");
program.command("init").description("Initialize a new design project in the current directory").argument("<project-name>", "Display name for the project").option(
  "-s, --system <system-id>",
  "Design system to use",
  "modern-minimal"
).option("-f, --force", "Overwrite existing .designs/ directory", false).action(async (projectName, options) => {
  await initCommand(projectName, options);
});
program.command("validate").description("Validate the current project's DESIGN.md (structural + deep lint)").action(async () => {
  await validateCommand();
});
program.command("lint").description(
  "Deep lint a DESIGN.md file (WCAG contrast, broken refs, orphaned tokens, etc.)"
).argument("[file]", "Path to DESIGN.md (defaults to .designs/DESIGN.md)").option("--json", "Output as JSON", false).action(async (file, options) => {
  await lintCommand({ file, json: options.json });
});
program.command("diff").description("Compare two DESIGN.md files and detect token-level regressions").argument("<before>", 'Path to the "before" DESIGN.md').argument("<after>", 'Path to the "after" DESIGN.md').option("--json", "Output as JSON", false).action(async (before, after, options) => {
  await diffCommand(before, after, options);
});
program.command("spec").description(
  "Output the DESIGN.md format specification (useful for agent prompts)"
).option("--rules", "Append the active linting rules table", false).option("--rules-only", "Output only the linting rules table", false).option("--format <format>", "Output format: markdown or json", "markdown").action(
  async (options) => {
    await specCommand(options);
  }
);
program.command("apply").description(
  "Re-export tokens and update all screens after DESIGN.md changes"
).action(async () => {
  await applyCommand();
});
var screens = program.command("screens").description("Manage project screens");
screens.command("list").description("List all screens in the current project").option("--json", "Output as JSON", false).action(async (options) => {
  await screensListCommand(options);
});
var systems = program.command("systems").description("Manage design systems");
systems.command("list").description("List all available design systems (built-in + installed)").action(async () => {
  await systemsListCommand();
});
systems.command("install").description("Install a design system from a source").argument(
  "<source>",
  "Source: registry name, github:user/repo, or local path"
).action(async (source) => {
  await systemsInstallCommand(source);
});
systems.command("create").description("Scaffold a new empty design system").argument("<name>", "Name for the new design system").action(async (name) => {
  await systemsCreateCommand(name);
});
var exportCmd = program.command("export").description("Export design artifacts");
exportCmd.command("tokens").description("Export design tokens from DESIGN.md to other formats").requiredOption(
  "--format <format>",
  "Output format: css, tailwind, json, css-tailwind, or dtcg"
).option("--out <path>", "Output file path (default: .designs/tokens.<ext>)").action(async (options) => {
  const validFormats = [
    "css",
    "tailwind",
    "json",
    "css-tailwind",
    "dtcg"
  ];
  if (!validFormats.includes(options.format)) {
    console.error(
      `Invalid format "${options.format}". Supported: ${validFormats.join(", ")}`
    );
    process.exit(1);
  }
  await exportTokensCommand({
    format: options.format,
    out: options.out
  });
});
var skills = program.command("skills").description("Manage Syncfusion component skills for AI agents");
skills.command("add").description("Install Syncfusion component skills for a framework").argument(
  "<framework>",
  `Framework: ${getFrameworkIds().join(", ")}`
).option(
  "--only <components>",
  "Install only specific components (comma-separated, e.g. grid,scheduler,charts)"
).action(async (framework, options) => {
  await skillsAddCommand(framework, options);
});
skills.command("list").description("List installed Syncfusion component skills").option("--json", "Output as JSON", false).action(async (options) => {
  await skillsListCommand(options);
});
skills.command("remove").description("Remove Syncfusion component skills for a framework").argument(
  "<framework>",
  `Framework: ${getFrameworkIds().join(", ")}`
).action(async (framework) => {
  await skillsRemoveCommand(framework);
});
program.parse();
//# sourceMappingURL=cli.js.map