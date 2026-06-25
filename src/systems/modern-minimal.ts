/**
 * Modern Minimal — Built-in design system.
 * Clean, product-oriented. For SaaS, dashboards, utility pages.
 */

export const MODERN_MINIMAL_DESIGN_MD = `---
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

Modern Minimal is a clean, product-oriented design system built for SaaS tools, dashboards, and utility pages. It emphasizes clarity, whitespace, and functional hierarchy. The visual language is restrained — every element earns its place.

**Mood:** Professional, focused, trustworthy, modern.
**Best for:** SaaS products, admin dashboards, developer tools, analytics platforms.

## Colors

The palette is intentionally narrow. A near-black primary anchors all text and key UI elements. The accent blue is used sparingly — only for interactive elements and primary actions.

- **Primary (#1A1C1E):** Headlines, body text, primary buttons.
- **Secondary (#6C7278):** Supporting text, labels, metadata.
- **Accent (#2563EB):** Links, primary CTAs, active states, focus rings.
- **Background (#FFFFFF):** Page background.
- **Surface (#F8FAFC):** Cards, panels, elevated containers.
- **Border (#E2E8F0):** Dividers, input borders, table lines.
- **Success/Warning/Error:** Semantic feedback only — never decorative.

## Typography

Inter is the sole typeface. The type scale uses a modular ratio with tight letter-spacing on headings for a modern feel. Body text is set at 16px with generous line-height for readability.

- Headlines: Bold weight, tight tracking, clear hierarchy from H1 (48px) down to H4 (20px).
- Body: Regular weight, 1.6 line-height for comfortable reading.
- Small/Caption: Used for metadata, timestamps, and secondary information.

## Layout

Use an 8px grid. All spacing values are multiples of 4px. Content areas max out at 1200px with generous side padding (24–48px). Cards and sections use consistent internal padding (24px).

- **Page margins:** 24px (mobile), 48px (desktop).
- **Section gaps:** 48px between major sections, 24px between related groups.
- **Card padding:** 24px uniform.

## Elevation & Depth

Minimal shadow usage. Depth is communicated through background color shifts (white → surface gray) rather than heavy shadows.

- **Level 0:** No shadow (flat on background).
- **Level 1:** \`0 1px 3px rgba(0,0,0,0.08)\` — cards, dropdowns.
- **Level 2:** \`0 4px 12px rgba(0,0,0,0.10)\` — modals, popovers.

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
- Use whitespace generously — let content breathe.
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
