/**
 * Template for creating a new empty design system via `cs-design systems create`.
 */

export function generateEmptyDesignMd(name: string): string {
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
