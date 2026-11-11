---
version: alpha
name: Indigo Panel System
description: A light, quiet SaaS design system. Near-black pill CTAs, deep indigo reserved for panels, coral tints only inside product mockups, Geist for every text surface.
colors:
  primary: "#0d0d0d"
  primary-hover: "#3d3d3d"
  on-primary: "#ffffff"
  brand-indigo: "#222875"
  brand-indigo-mid: "#333c83"
  brand-indigo-soft: "#879fc8"
  brand-indigo-deep: "#6678ac"
  accent-sky: "#cbefff"
  accent-sky-soft: "#badbf1"
  accent-coral: "#e1bbc7"
  accent-coral-soft: "#ffeaec"
  accent-coral-deep: "#690031"
  accent-coral-glow: "#ff584a"
  accent-green: "#b5e9ca"
  canvas: "#ffffff"
  surface-muted: "#ffeaec"
  ink: "#0d0d0d"
  ink-soft: "#3d3d3d"
  ink-tertiary: "#474748"
  ink-muted: "#646f79"
  ink-subtle: "#9ca6af"
  hairline: "#e7e7e7"
  semantic-error: "#a82424"
  semantic-success: "#0c6410"
  dark-canvas: "#0d0d0d"
  dark-surface: "#16171a"
  dark-surface-raised: "#1f2024"
  dark-hairline: "#2a2b2e"
  dark-primary: "#f5f5f5"
  dark-primary-hover: "#d9d9d9"
  dark-on-primary: "#0d0d0d"
  dark-ink: "#f5f5f5"
  dark-ink-soft: "#d4d4d4"
  dark-ink-muted: "#9ca6af"
  dark-ink-subtle: "#7a858f"
  dark-brand-indigo: "#222875"
  dark-focus-ring: "#879fc8"
  dark-accent-sky: "#12303d"
  dark-accent-coral: "#e1bbc7"
  dark-accent-coral-soft: "#3a1f27"
  dark-semantic-error: "#ff8a8a"
  dark-semantic-success: "#6fcf7f"
typography:
  display-xl:
    fontFamily: "Geist"
    fontSize: 72px
    fontWeight: 500
    lineHeight: 72px
    letterSpacing: -0.5px
  display-lg:
    fontFamily: "Geist"
    fontSize: 60px
    fontWeight: 500
    lineHeight: 60px
  display-md:
    fontFamily: "Geist"
    fontSize: 36px
    fontWeight: 400
    lineHeight: 43.2px
    letterSpacing: -0.36px
  display-md-light:
    fontFamily: "Geist"
    fontSize: 36px
    fontWeight: 300
    lineHeight: 46.8px
    letterSpacing: -0.36px
  heading-md:
    fontFamily: "Geist"
    fontSize: 30px
    fontWeight: 400
    lineHeight: 36px
  heading-sm:
    fontFamily: "Geist"
    fontSize: 24px
    fontWeight: 500
    lineHeight: 28.8px
  body-lg:
    fontFamily: "Geist"
    fontSize: 20px
    fontWeight: 300
    lineHeight: 30px
    letterSpacing: 0.4px
  body-md:
    fontFamily: "Geist"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
  body-md-light:
    fontFamily: "Geist"
    fontSize: 16px
    fontWeight: 300
    lineHeight: 24px
    letterSpacing: 0.32px
  body-sm:
    fontFamily: "Geist"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 21px
  button:
    fontFamily: "Geist"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 21px
    letterSpacing: 0.5px
  eyebrow:
    fontFamily: "Geist"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 16.5px
    letterSpacing: 0.44px
rounded:
  xs: 4px
  sm: 8px
  md: 10px
  lg: 16px
  xl: 20px
  pill: 100px
  capsule: 146px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  base: 14px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 40px
  section: 80px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 12px 24px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 12px 24px
  button-secondary-hover:
    backgroundColor: "{colors.accent-coral-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  pill-tab-default:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    padding: 8px 16px
  pill-tab-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    padding: 8px 16px
  ai-gallery-band:
    backgroundColor: "{colors.brand-indigo}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    padding: 32px
  feature-card-indigo:
    backgroundColor: "{colors.brand-indigo}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    padding: 32px
  feature-card-sky:
    backgroundColor: "{colors.accent-sky}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 32px
  use-case-tile:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 24px
  mockup-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 24px
  mockup-chip-coral:
    backgroundColor: "{colors.accent-coral-soft}"
    textColor: "{colors.accent-coral-deep}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.sm}"
    padding: 4px 8px
  ai-prompt-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    height: 64px
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 12px 16px
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    height: 56px
    padding: 0 32px
---

## Overview

A quiet, light interface that inverts two common SaaS conventions. First, the brand color `{colors.brand-indigo}` never fills a button. It fills large panels and bands, so it reads as atmosphere rather than action. Second, body text runs at weight 300 instead of the usual 400, which keeps paragraphs light and lets headlines carry the confidence.

Actions belong to near-black. The primary CTA is a 100px pill in `{colors.primary}`, and every interactive surface (buttons, tabs) shares that same pill geometry. Containers are rounded rectangles, so the contrast between "oval means action" and "rectangle means content" stays consistent.

Everything is set in **Geist**. One typeface, three weights (300, 400, 500), no second display family.

**Key Characteristics:**

- Indigo `{colors.brand-indigo}` is a panel fill, never a CTA color.
- Single typeface, Geist, with weight carrying the hierarchy: 500 for display, 300 for body.
- Primary CTA is a near-black pill at `{rounded.pill}`. Secondary is white with a hairline border.
- Coral tints (`{colors.accent-coral}`, `{colors.accent-coral-soft}`) live only inside product mockups.
- Pale sky `{colors.accent-sky}` opens a section before indigo cards appear.
- White canvas `{colors.canvas}` carries every above-the-fold surface.
- 14px (`{spacing.base}`) is the dominant inline spacing unit, tighter than the common 16px.

## Colors

- **Near-black ink (`#0d0d0d`)**: headlines, body, button fill, and the load-bearing color of the whole system. Never pure black.
- **Dark gray (`#3d3d3d`)**: hover state for near-black, and lighter ink inside dark cards.
- **Muted gray (`#646f79`)**: secondary text, footer rows, metadata.
- **Subtle gray (`#9ca6af`)**: placeholders and disabled text.
- **Indigo (`#222875`)**: panel and card fill only. Siblings `#333c83` and `#6678ac` handle subtle variation.
- **Focus blue (`#879fc8`)**: the accessibility focus ring. Rare, but required.
- **Pale sky (`#cbefff`, `#badbf1`)**: section backgrounds that ramp from canvas into indigo.
- **Coral family (`#e1bbc7`, `#ffeaec`, `#690031`, `#ff584a`)**: decorative dots, chips, and tags inside mockups. `#ff584a` is a single glow accent and should appear at most once per page.
- **Green (`#b5e9ca`)**: occasional supporting accent.
- **Hairline (`#e7e7e7`)**: the default 1px divider and card border.
- **Semantic**: error `#a82424`, success `#0c6410`.

## Typography

Geist is used for every text surface. Load it from Google Fonts or `next/font`, and always include a fallback stack that covers Traditional Chinese:

```css
font-family: "Geist", "Inter", "Noto Sans TC", system-ui, sans-serif;
```

Use Geist Mono for code and numeric tables when needed:

```css
font-family: "Geist Mono", ui-monospace, "SF Mono", Menlo, monospace;
```

Three details define the ramp:

1. Display sits at weight 500, with negative tracking only at the top (-0.5px at 72px, normal at 60px).
2. Body paragraphs run at weight 300 with positive tracking (+0.4px at 20px, +0.32px at 16px). This is the opposite of sites that tighten body text.
3. Buttons use 14px / 500 with +0.5px tracking. The wide setting signals action without resorting to uppercase.

Geist is slightly more geometric and a little wider than the original type pairing. If body text looks too loose, reduce the positive tracking by roughly 0.1px. Geist's variable font supports weight 300, so no extra file is needed.

The eyebrow token (11px / 500 / uppercase / +0.44px) is used for small labels above tiles.

## Layout

- Centered container, max width 1440px, 32px gutter (`{spacing.xl}`).
- Section padding is 80px (`{spacing.section}`) between bands.
- Inline rhythm is 14px (`{spacing.base}`) for pill padding, chip gaps, and small element spacing.
- Card padding is 32px for hero cards and 24px for tiles.
- Sections are either a single full-width band or a 4-up tile row. Avoid 2-up split layouts above the fold.
- Page rhythm: white, indigo card, white, pale-sky band, indigo cards.

## Elevation & Depth

No drop shadows on cards. White cards use a 1px `{colors.hairline}` border. Indigo cards have no border at all, because the color shift carries the lift on its own. The only glow is the single `{colors.accent-coral-glow}` accent on an illustration.

## Shapes

The radius scale is bimodal.

| Use                             | Token               | Value |
| ------------------------------- | ------------------- | ----- |
| Chips, inputs                   | `{rounded.sm}`      | 8px   |
| Mockup cards, base radius       | `{rounded.md}`      | 10px  |
| Hero cards, bands               | `{rounded.lg}`      | 16px  |
| Larger surfaces                 | `{rounded.xl}`      | 20px  |
| Buttons, tabs                   | `{rounded.pill}`    | 100px |
| Capsule chrome on illustrations | `{rounded.capsule}` | 146px |

## Components

- **button-primary**: near-black pill, white text, 1px white inner stroke, `{typography.button}`.
- **button-secondary**: white fill, `{colors.hairline}` 1px border, hover tints to `{colors.accent-coral-soft}`.
- **pill-tab-default / selected**: same pill geometry as buttons at smaller padding. Selected inverts to near-black.
- **ai-gallery-band**: `{colors.brand-indigo}` fill, 16px radius, 32px padding.
- **feature-card-indigo / feature-card-sky**: the indigo panel and the pale-sky band that opens the section.
- **use-case-tile**: white, hairline border, 10px radius, 24px padding.
- **mockup-card / mockup-chip-coral**: product illustration surfaces. Coral chips are allowed here and nowhere else.
- **ai-prompt-input**: search-style hero input, 64px tall.
- **text-input**: 8px radius, hairline border, 12px 16px padding.
- **top-nav**: 56px tall, 32px lateral padding, white background.

## Dark Mode

The dark theme keeps the same personality: near-black owns the action, indigo stays a panel fill, coral stays inside mockups. The main change is that the action color flips. On a near-black canvas, the primary pill becomes off-white with dark text.

### Mapping

| Role                             | Light token         | Dark token               | Dark value |
| -------------------------------- | ------------------- | ------------------------ | ---------- |
| Page background                  | `canvas`            | `dark-canvas`            | `#0d0d0d`  |
| Card surface                     | `canvas` + hairline | `dark-surface`           | `#16171a`  |
| Raised surface (menus, popovers) | `canvas` + hairline | `dark-surface-raised`    | `#1f2024`  |
| Divider, card border             | `hairline`          | `dark-hairline`          | `#2a2b2e`  |
| Primary CTA fill                 | `primary`           | `dark-primary`           | `#f5f5f5`  |
| Primary CTA hover                | `primary-hover`     | `dark-primary-hover`     | `#d9d9d9`  |
| Text on primary CTA              | `on-primary`        | `dark-on-primary`        | `#0d0d0d`  |
| Headlines, body                  | `ink`               | `dark-ink`               | `#f5f5f5`  |
| Secondary text                   | `ink-soft`          | `dark-ink-soft`          | `#d4d4d4`  |
| Muted text                       | `ink-muted`         | `dark-ink-muted`         | `#9ca6af`  |
| Placeholder, disabled            | `ink-subtle`        | `dark-ink-subtle`        | `#7a858f`  |
| Indigo panels                    | `brand-indigo`      | `dark-brand-indigo`      | `#222875`  |
| Focus ring                       | `brand-indigo-soft` | `dark-focus-ring`        | `#879fc8`  |
| Pale-sky band                    | `accent-sky`        | `dark-accent-sky`        | `#12303d`  |
| Coral chip text                  | `accent-coral-deep` | `dark-accent-coral`      | `#e1bbc7`  |
| Coral chip fill                  | `accent-coral-soft` | `dark-accent-coral-soft` | `#3a1f27`  |
| Error                            | `semantic-error`    | `dark-semantic-error`    | `#ff8a8a`  |
| Success                          | `semantic-success`  | `dark-semantic-success`  | `#6fcf7f`  |

### Rules

- **Indigo panels keep the same fill.** `#222875` already separates clearly from `#0d0d0d`, so no border is needed, same as in light mode.
- **Depth comes from surface steps, not shadows.** Use canvas, then surface, then raised. Cards on `dark-canvas` use `dark-surface` with a 1px `dark-hairline` border.
- **The pale-sky band becomes a deep teal.** The light `#cbefff` would glare on a dark page, so `dark-accent-sky` takes its place with `dark-ink` text.
- **Coral chips invert.** A dark rose fill with light rose text. They still appear only inside mockups.
- **Avoid pure white text.** `#f5f5f5` reduces glare against the near-black canvas.
- **Typography does not change.** Same Geist sizes, weights, and tracking. Check weight 300 body text visually on dark, and move to 400 if it looks too thin on your target screens.
- **Contrast.** `dark-ink-subtle` is intended for placeholders and disabled text only. Do not use it for content people need to read.

### CSS Variables

```css
:root {
  --canvas: #ffffff;
  --surface: #ffffff;
  --surface-raised: #ffffff;
  --hairline: #e7e7e7;
  --primary: #0d0d0d;
  --primary-hover: #3d3d3d;
  --on-primary: #ffffff;
  --ink: #0d0d0d;
  --ink-soft: #3d3d3d;
  --ink-muted: #646f79;
  --ink-subtle: #9ca6af;
  --brand-indigo: #222875;
  --focus-ring: #879fc8;
  --accent-sky: #cbefff;
  --coral-chip-text: #690031;
  --coral-chip-bg: #ffeaec;
  --error: #a82424;
  --success: #0c6410;
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --canvas: #0d0d0d;
    --surface: #16171a;
    --surface-raised: #1f2024;
    --hairline: #2a2b2e;
    --primary: #f5f5f5;
    --primary-hover: #d9d9d9;
    --on-primary: #0d0d0d;
    --ink: #f5f5f5;
    --ink-soft: #d4d4d4;
    --ink-muted: #9ca6af;
    --ink-subtle: #7a858f;
    --brand-indigo: #222875;
    --focus-ring: #879fc8;
    --accent-sky: #12303d;
    --coral-chip-text: #e1bbc7;
    --coral-chip-bg: #3a1f27;
    --error: #ff8a8a;
    --success: #6fcf7f;
    color-scheme: dark;
  }
}

:root[data-theme="dark"] {
  --canvas: #0d0d0d;
  --surface: #16171a;
  --surface-raised: #1f2024;
  --hairline: #2a2b2e;
  --primary: #f5f5f5;
  --primary-hover: #d9d9d9;
  --on-primary: #0d0d0d;
  --ink: #f5f5f5;
  --ink-soft: #d4d4d4;
  --ink-muted: #9ca6af;
  --ink-subtle: #7a858f;
  --brand-indigo: #222875;
  --focus-ring: #879fc8;
  --accent-sky: #12303d;
  --coral-chip-text: #e1bbc7;
  --coral-chip-bg: #3a1f27;
  --error: #ff8a8a;
  --success: #6fcf7f;
  color-scheme: dark;
}
```

The `data-theme` attribute lets a manual toggle override the system setting. Without it, the page follows `prefers-color-scheme`.

## Do's and Don'ts

- **Do** use `{colors.primary}` for every CTA (`{colors.dark-primary}` in dark mode).
- **Do** keep body text at weight 300 for paragraphs and 400 for UI text such as labels and small copy.
- **Do** use pill radius for every action surface and rounded rectangles for containers.
- **Do** keep a visible focus ring using `{colors.brand-indigo-soft}`.
- **Don't** fill a button with `{colors.brand-indigo}`. Indigo is for panels.
- **Don't** use rectangular buttons.
- **Don't** put coral on buttons, nav, or section backgrounds. It belongs inside mockups.
- **Don't** add shadows to cards. Use hairline borders or color contrast.
- **Don't** mix in a second typeface. Geist covers display and body.
- **Don't** use `{colors.accent-coral-glow}` more than once on a page.

## Known Gaps

- Dark mode values are a design proposal, not extracted from a production dark theme. Verify contrast and weight on real screens.
- Form error and validation states are not specified beyond `{colors.semantic-error}`.
- Motion timing is not defined. A safe default is 200ms ease-out for hover transitions.
- Component padding for buttons, tabs, and chips is a reasonable starting value, not a measured one. Adjust to taste.
