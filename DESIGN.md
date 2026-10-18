---
name: Brake It Easy
description: A calm, friendly iPhone interface for reflecting on driving after a trip.
colors:
  primary: "#007F94"
  primary-pressed: "#006D80"
  canvas: "#F7FBFC"
  sky: "#E3F3FC"
  peach: "#FCEFE7"
  sea-glass: "#EDF7F7"
  mint: "#E2F5EF"
  blue: "#E5F3FA"
  white: "#FFFFFF"
  ink: "#24333A"
  muted: "#546F78"
  coral: "#E86662"
  line: "#DCE9EB"
typography:
  title:
    fontFamily: "Avenir Next, sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "Avenir Next, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Avenir Next, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.35
rounded:
  small: "14px"
  card: "20px"
  sheet: "28px"
  pill: "999px"
spacing:
  page: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    height: "54px"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
---

## Overview

**Creative North Star: "A quiet moment after the drive."** The interface borrows the supplied reference's soft color fields, approachable rounded type, simple centered composition, and clear turquoise action. The mood is reassuring and curious. The recap gives the driver room to look at actual observations after parking.

**Key Characteristics:** Pastel screen backgrounds; dark, legible text; one prominent action per state; a solid teal Start drive circle with a car icon; compact cards and rounded sheets.

## Colors

**The Calm Surface Rule.** Use sky for Home, sea glass for History and Recording, and a near-white canvas for the recap. Use mint for environmental context and blue for driving observations. Teal carries actions and graph traces; coral marks a selected moment. Peach is limited to the practice card.

## Typography

**The One Voice Rule.** Use Avenir Next throughout with sentence case. Titles are short and strong; body copy is conversational; labels support scanning. Keep technical caveats behind an explicit detail action.

## Layout

Keep content within the device safe area. Use the shared page inset (24px), generous vertical space, and a centered hero action on Home. The timed drive screen stays sparse. Recap cards follow the order interactive graph, environmental impact, driving awareness, one practice.

## Elevation & Depth

Prefer tonal separation to shadows. White cards sit on pastel backgrounds; thin borders are reserved for quiet controls and chart guides.

## Shapes

Use softly rounded cards (20px), bottom sheets (28px), and a solid circular Start drive action. The car icon makes the action specific to driving; avoid segmented circular progress motifs.

## Components

**The One Action Rule.** The main action is teal with white text and at least a 44pt touch target. Secondary actions appear as a small white card or text link. The graph supports dragging the marker to read time and speed. Moment rows open a bottom sheet with a chart and one-line explanation.

## Do's and Don'ts

- Do label fuel and CO₂ as estimates, and credit the recorded data in the Home info sheet.
- Do keep live recording free of scores and coaching prompts.
- Don't use uppercase display slogans, neon accents, dense nesting, or decorative speed lines.
- Don't imply that a motion spike establishes fault or that the app measures emissions directly.
