/**
 * Corporate Clean — Built-in design system.
 * Professional, trustworthy. For enterprise, B2B platforms.
 */

export const CORPORATE_CLEAN_DESIGN_MD = `---
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

The palette is conservative and high-contrast. A deep navy primary conveys authority. The accent blue is institutional — trustworthy without being playful.

- **Primary (#0F172A):** Headlines, navigation, key UI anchors.
- **Secondary (#475569):** Body text, descriptions, secondary labels.
- **Accent (#0369A1):** Primary actions, links, active navigation.
- **Background (#FFFFFF):** Page background.
- **Surface (#F1F5F9):** Sidebar backgrounds, table headers, section fills.
- **Border (#CBD5E1):** Dividers, input borders, card outlines.
- **Semantic colors:** Success (green), Warning (amber), Error (red) — used strictly for status indicators.

## Typography

Source Sans Pro provides excellent readability at all sizes. The type scale is tighter than consumer products — optimized for information-dense interfaces.

- Headlines: Bold weight, moderate tracking. H1 at 42px for page titles.
- Body: Regular weight at 16px. Comfortable for long-form reading.
- Small/Caption: Used for table data, timestamps, and metadata.

## Layout

Use a 4px base grid with 8px increments for spacing. Content areas are wider (up to 1400px) to accommodate data-heavy layouts. Sidebars are 240–280px.

- **Page margins:** 24px (mobile), 32px (desktop).
- **Section gaps:** 32px between major sections.
- **Card padding:** 24px uniform.
- **Table cell padding:** 12px 16px.

## Elevation & Depth

Shadows are subtle and functional. Depth is primarily communicated through borders and background color changes.

- **Level 0:** No shadow, 1px border for definition.
- **Level 1:** \`0 1px 2px rgba(0,0,0,0.06)\` — cards, dropdowns.
- **Level 2:** \`0 4px 8px rgba(0,0,0,0.08)\` — modals, dialogs.

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
- Use consistent alignment — left-align text and data.
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
