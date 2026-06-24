/**
 * Bold Creative — Built-in design system.
 * Vibrant, expressive. For marketing, portfolios, creative agencies.
 */

export const BOLD_CREATIVE_DESIGN_MD = `---
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

Sora for headlines — geometric, modern, and bold. DM Sans for body — clean and highly readable. The contrast between the two creates visual interest.

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
- **Level 1:** \`0 2px 8px rgba(30,10,60,0.06)\` — cards.
- **Level 2:** \`0 8px 24px rgba(30,10,60,0.10)\` — modals, featured cards.
- **Accent glow:** \`0 4px 16px rgba(240,85,55,0.20)\` — hover on accent buttons.

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
- Use bold, confident headlines — don't be shy with size.
- Let sections breathe with generous spacing.
- Use the accent color to create clear focal points.
- Add subtle hover animations (scale, shadow) for interactivity.
- Use real photography or bold illustrations.

**Don't:**
- Don't use more than 2 accent colors.
- Don't crowd content — whitespace is a feature.
- Don't use thin font weights for headlines.
- Don't use sharp corners (less than 6px radius).
- Don't use generic stock photography.
- Don't center-align paragraphs longer than 3 lines.
`;
