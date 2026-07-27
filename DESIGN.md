---
name: Flowr Finance
description: Your money, perfectly organized — a personal finance tracker wrapped in obsidian glass.
colors:
  amethyst-pulse-start: "#D946EF"
  amethyst-pulse-mid: "#A855F7"
  amethyst-pulse-end: "#7C3AED"
  obsidian-void: "#120B1A"
  deep-plum: "#1D1426"
  shadow-amethyst: "#2A1E35"
  twilight-stone: "#362845"
  pale-iris: "#F3E8FF"
  frosted-iris: "rgba(243, 232, 255, 0.75)"
  faded-iris: "rgba(243, 232, 255, 0.45)"
  glass-surface: "rgba(29, 20, 38, 0.72)"
  glass-border: "rgba(255, 255, 255, 0.08)"
  glass-border-hover: "rgba(255, 255, 255, 0.16)"
  verdant: "#06D6A0"
  coral-ember: "#FF6B6B"
  solar-amber: "#FFD93D"
  lavender-mist: "#A78BFA"
  border-subtle: "rgba(255, 255, 255, 0.06)"
  border-default: "rgba(255, 255, 255, 0.1)"
  border-strong: "rgba(255, 255, 255, 0.16)"
typography:
  display:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.04em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
components:
  button-primary:
    backgroundColor: "linear-gradient(135deg, {colors.amethyst-pulse-start}, {colors.amethyst-pulse-mid})"
    textColor: "{colors.obsidian-void}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  button-secondary:
    backgroundColor: "{colors.twilight-stone}"
    textColor: "{colors.pale-iris}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.frosted-iris}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  button-danger:
    backgroundColor: "rgba(255, 107, 107, 0.1)"
    textColor: "{colors.coral-ember}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  card:
    backgroundColor: "{colors.glass-surface}"
    rounded: "{rounded.md}"
  badge-success:
    backgroundColor: "rgba(6, 214, 160, 0.1)"
    textColor: "{colors.verdant}"
    rounded: "{rounded.xs}"
    padding: "3px 8px"
  badge-danger:
    backgroundColor: "rgba(255, 107, 107, 0.1)"
    textColor: "{colors.coral-ember}"
    rounded: "{rounded.xs}"
    padding: "3px 8px"
  badge-warning:
    backgroundColor: "rgba(255, 217, 61, 0.1)"
    textColor: "{colors.solar-amber}"
    rounded: "{rounded.xs}"
    padding: "3px 8px"
  badge-info:
    backgroundColor: "rgba(167, 139, 250, 0.15)"
    textColor: "{colors.lavender-mist}"
    rounded: "{rounded.xs}"
    padding: "3px 8px"
---

# Design System: Flowr Finance

## Overview

**Creative North Star: "The Glass Vault"**

Flowr Finance is a glass vault for personal wealth — transparent, impenetrable, and illuminated with surgical precision. Every surface exists to reveal data, never to obscure it. The interface is intimate and tactile: it responds to touch with measured feedback, surfaces float on backdrop-blur rather than sitting on shadows, and the darkness is not emptiness but depth.

The primary accent — Amethyst Pulse — is a fuchsia-to-violet gradient reserved for the single most important action or metric on any screen. Its rarity is the point. When you see it, you know where to act. The rest of the interface lives in layered obsidian tones: Obsidian Void (#120B1A) for the deepest background, ascending through Deep Plum, Shadow Amethyst, and Twilight Stone toward Pale Iris text. No decorative gradients. No ornament. No spectacle.

This is a tool for people who manage real money. It must feel like confidence, not entertainment.

**Key Characteristics:**
- Glass-first depth: backdrop-blur separates surfaces, not hard shadows
- Single accent: Amethyst Pulse appears on ≤10% of any screen
- Tactile response: every interaction has feedback within 150ms (hover lift 2px, active compress 0.97x)
- Intimate typography: Space Grotesk for authority, Inter for clarity, JetBrains Mono for numbers
- Numbers are sacred: financial data never animates for decoration
- Dark-first with a complete light theme ("Purple/Lila") for accessibility and preference

## Colors

The palette lives on a single hue axis — violet — with semantic accents branching into green (success), coral (danger), amber (warning), and lavender (info). The dark theme is the default; the light theme inverts backgrounds and softens saturation while preserving the same semantic mapping.

### Primary

- **Amethyst Pulse Start** (#D946EF): The vibrant fuchsia entry point of the accent gradient. Used as the gradient start, focus ring color, and notification badge dot.
- **Amethyst Pulse Mid** (#A855F7): The midpoint of the accent gradient. Appears in larger gradient surfaces and hover glow effects.
- **Amethyst Pulse End** (#7C3AED): The deepest violet in the gradient. Used as the gradient terminus and in subtle accent backgrounds.

### Neutral

- **Obsidian Void** (#120B1A): Primary background. The deepest layer — the vault floor. Applied to `body`, page backgrounds, and the fixed background layer.
- **Deep Plum** (#1D1426): Secondary background. Card backs, sidebar surfaces, modal backgrounds that sit one layer above the void.
- **Shadow Amethyst** (#2A1E35): Tertiary background. Hover states on secondary surfaces, selected list items, skeleton shimmer base.
- **Twilight Stone** (#362845): Elevated surface. Active dropdown panels, tooltip backgrounds, the highest resting surface before glass takes over.
- **Pale Iris** (#F3E8FF): Primary text. High-contrast against all dark backgrounds. Used for headings, body text, and primary UI labels.
- **Frosted Iris** (rgba(243, 232, 255, 0.75)): Secondary text. Supporting copy, descriptions, placeholder text on darker surfaces.
- **Faded Iris** (rgba(243, 232, 255, 0.45)): Tertiary text. Timestamps, metadata, disabled labels, subtlest UI chrome.

### Semantic

- **Verdant** (#06D6A0): Success. Income indicators, positive deltas, completion states. Glow: `0 0 20px rgba(6, 214, 160, 0.2)`.
- **Coral Ember** (#FF6B6B): Danger. Expense indicators, destructive actions, error states. Glow: `0 0 20px rgba(255, 107, 107, 0.2)`.
- **Solar Amber** (#FFD93D): Warning. Attention signals, pending states, caution badges.
- **Lavender Mist** (#A78BFA): Info. Neutral highlights, chart accent 4, informational badges.

### Named Rules

**The Pulse Rule.** The Amethyst Pulse gradient is used on ≤10% of any given screen. Its rarity is the point. It marks the single most important action (primary CTA), the single most important metric (hero KPI), or the single most important navigation target (current page). If you see it in three places, at least two are wrong.

**The Glass Border Rule.** Borders are never opaque. At rest, glass borders sit at 6–8% white opacity. On hover, they shift to 12–16%. A hard 1px solid border belongs only to error states and active input focus — and even then, the focus ring is a glow, not a line.

**The One Accent Rule.** Amethyst Pulse is the only decorative gradient in the system. Semantic colors (Verdant, Coral Ember, Solar Amber) are used flat — never in gradients, never with glow effects beyond their defined shadow tokens. A semantic color in a gradient is a system error.

## Typography

**Display Font:** Space Grotesk (with system-ui fallback)
**Body Font:** Inter (with system-ui fallback)
**Mono Font:** JetBrains Mono (with ui-monospace fallback)

**Character:** Space Grotesk brings geometric precision and quiet authority to headings — it says "this is serious" without feeling corporate. Inter provides neutral, highly-legible body text that disappears into the content. JetBrains Mono handles numbers and code with monospace clarity. The pairing is intimate and modern: headings have personality, body text is pure utility.

### Hierarchy

- **Display** (700, 26px/clamp, 1.2 line-height): Hero page titles, form headers, the largest single heading on a page. Negative tracking (-0.02em). Used exactly once per view.
- **Headline** (600, 20px, 1.3 line-height): Section headers within pages. Used by `SectionHeaderComponent`. Negative tracking (-0.01em).
- **Title** (600, 16–18px, 1.4 line-height): Card titles, modal titles, panel headers. The workhorse heading level.
- **Body** (400, 13–15px, 1.55 line-height): Paragraphs, list items, table cells, form labels. Never exceeds 75 characters per line in prose contexts.
- **Label** (600, 11–13px, 1.0 line-height, 0.04em tracking, uppercase): Form field labels, badge text, table headers, navigation items. Uppercase transform is semantic — it signals "this is chrome, not content."
- **Mono** (400, 13px, 1.5 line-height): Currency amounts, percentages, transaction IDs, any numeric data. Always tabular-nums for alignment.

### Named Rules

**The Number Font Rule.** Any string containing currency symbols, decimal points, or comparison operators must render in JetBrains Mono. Body font on a dollar amount is a bug.

**The One Hero Rule.** Display weight (700) appears exactly once per view. Two 700-weight headings on screen means the hierarchy collapsed.

## Layout

The spatial model is a centered column with a 1440px max-width (`--content-max-width`), breathing horizontal padding (12px mobile → 16px tablet → 24px desktop), and a 64px sticky topbar. Below the topbar, content flows in a single vertical stack with 32px section gaps.

Columns are not part of the system. The layout is editorial: one primary reading column, with cards and panels floating within it. On dashboard views, a Bento-style grid (2–3 columns, responsive) organizes KPI cards, charts, and activity feeds, but the grid is an exception for data-dense surfaces — the default is single-column.

**Breakpoints:** 375px (xs), 768px (md), 1024px (lg), 1440px (xl). Mobile-first. The topbar collapses its navigation at 768px, switching to a slide-in mobile menu with `aria-label`. Modals become bottom-sheets below 640px.

**Spacing rhythm:** All padding and margin values come from the 4px scale (4, 8, 12, 16, 20, 24, 32, 40, 48). No custom one-off spacings. The rhythm is tight at small sizes (4–8px between related elements) and opens up at section boundaries (24–32px between sections).

**Touch targets:** All interactive elements below 768px have a minimum 44×44px hit area. The `touch-target` SCSS mixin enforces this.

## Elevation & Depth

This system uses pure glass depth — **no structural shadows at rest.** Surfaces separate from the background through backdrop-blur (12px blur on glass surfaces) rather than box-shadow. The vault is volumetric: you perceive layers through translucency, not through drop shadows.

### Shadow Vocabulary

Shadows exist only as state responses, never as default surface treatment:

- **Glass hover lift** (`0 4px 12px rgba(0, 0, 0, 0.5)`): Applied to glass panels and hoverable cards on hover. Subtle, ambient, reinforces the 2px translateY lift.
- **Modal backdrop** (`0 24px 60px rgba(0, 0, 0, 0.5)`): The modal's separation from the page. Deep enough to signal modality, soft enough to keep focus on content.
- **Glow accent** (`0 0 30px rgba(217, 70, 239, 0.25)`): Reserved for primary buttons and hoverable premium cards. The only intentionally visible glow in the system.
- **Glow success** (`0 0 20px rgba(6, 214, 160, 0.2)`): Positive confirmation states, income highlights.
- **Glow danger** (`0 0 20px rgba(255, 107, 107, 0.2)`): Error states, destructive action confirmation.
- **No shadow at rest.** A card with a box-shadow before any interaction is a visual bug. The default state is flat glass.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state: hover, focus, or modal elevation. If a card casts a shadow while the user is reading it, the system is decorating, not communicating.

**The Blur-First Rule.** Backdrop-blur (12–16px) is the primary depth mechanism. When glass is not available (reduced-motion, performance constraints), fall back to a 2% opacity bump on the background — never to an unsolicited shadow.

## Shapes

The form language is gently rounded with a clear hierarchy: **4px** for the smallest interactive chrome (badges, tags, keyboard shortcuts), **8px** for primary interactive elements (buttons, inputs, select menus), **12px** for containers (cards, panels, dropdowns), **16px** for larger surfaces (modals, sheets), and **24px** for the outermost containers (hero cards, feature panels). The system never uses fully sharp corners (0px).

Borders follow the Glass Border Rule: translucent at rest (6–10% white), strengthening on hover (12–16%). The only solid borders in the system are error-state inputs and the 1px top-edge highlight on cards — a subtle gradient line (`transparent → glass-border-hover → transparent`) that gives glass surfaces a physical edge without a hard perimeter.

Buttons, inputs, and badges share the 8px radius. Cards and panels share 12px. This consistency means any element with 12px corners is perceived as a container; any element with 8px corners is perceived as an interactive control. The shape language teaches the eye without decoration.

## Components

### Buttons (`ft-button`)

**Character:** Light and floating. Primary buttons carry the Amethyst Pulse gradient and lift 1px on hover with a glow halo. Secondary, ghost, and danger variants are restrained — flat backgrounds with border or transparency shifts.

- **Shape:** 8px radius (`--radius-sm`). Pill shape is not used for buttons.
- **Primary:** `linear-gradient(135deg, var(--accent-start), var(--accent-mid))` background, Obsidian Void text. Padding: 10px 20px (md), 6px 12px (sm), 14px 28px (lg). Shadow: `0 2px 8px rgba(6, 214, 160, 0.25)`. Hover: glow intensifies to `0 4px 16px rgba(6, 214, 160, 0.35)`, 1px lift.
- **Secondary:** Twilight Stone background, Pale Iris text, 1px glass-border. Hover: background shifts to Shadow Amethyst, border strengthens.
- **Ghost:** Transparent background, Frosted Iris text. Hover: 5% white background, Pale Iris text.
- **Danger:** Coral Ember 10% background, Coral Ember text, 20% Coral Ember border. Hover: background deepens to 20%.
- **Loading:** Spinner replaces content, opacity preserved, pointer-events disabled.
- **Disabled:** 40% opacity, cursor not-allowed, no hover effects.
- **Active:** `scale(0.97)` on press. Duration: 150ms ease-out.

### Cards (`ft-card`)

**Character:** A glass container that floats. The optional header (title + subtitle) uses Space Grotesk for the title and Faded Iris for the subtitle. Hoverable cards lift 2px with a glass-border-hover border and shadow-lg.

- **Shape:** 12px radius (`--radius-md`).
- **Background:** `var(--glass-bg)` with 16px backdrop-blur.
- **Top highlight:** `::before` pseudo-element with a 1px gradient line (transparent → glass-border-hover → transparent) at 50% opacity.
- **Header padding:** 20px 24px 0.
- **Body padding:** 20px 24px.
- **No-padding mode:** Removes body padding for custom inner layouts.

### Glass Panel (`ft-glass-panel`)

**Character:** The raw glass container — more primitive than Card, used when you need glass without the card's semantic header structure. Three variants: default (standard glass), elevated (more opaque, stronger border, shadow-md), subtle (transparent, border-subtle only). Supports hoverable lift.

- **Shape:** 12px radius (`--radius-md`).
- **Default:** `var(--glass-bg)`, 16px blur, `var(--glass-border)`.
- **Elevated:** `rgba(21, 29, 46, 0.88)`, 16px blur, `var(--border-default)`, `var(--shadow-md)`.
- **Subtle:** Transparent background, `var(--border-subtle)` border only.

### Badges (`ft-badge`)

**Character:** Semantic color chips for categories, status, and tags. Small and tight — they label, never dominate. Two sizes: sm (3px 8px padding, 11px font) and md (5px 12px, 12px font).

- **Shape:** 4px radius (`--radius-xs`). Tighter than buttons to signal "this is a label, not a control."
- **Default:** Elevated background, Frosted Iris text, subtle border.
- **Success / Danger / Warning / Info:** 10% background of semantic color, semantic color text, 20% border of semantic color.
- **No hover, no active state.** Badges are not interactive.

### Inputs / Fields

**Character:** Clean, minimal — a single border with a focus glow. No inner shadows, no background gradients. The input is a transparent window into the vault. When focused, the Amethyst Pulse border + glow signals "you are editing real data."

- **Shape:** 8px radius (`--radius-sm`).
- **Default:** Deep Plum background, 1.5px glass-border, Pale Iris text, 15px font.
- **Focus:** Border shifts to Amethyst Pulse Start, box-shadow `0 0 0 3px var(--accent-glow)`. Outline is suppressed — the glow is the focus ring.
- **Error:** Border shifts to Coral Ember. Error message below in 12px Coral Ember, 500 weight.
- **Placeholder:** Faded Iris.
- **Select:** Custom chevron via background-image SVG. Same styling as text inputs.
- **Currency:** Left-padded 34px to accommodate a currency symbol positioned absolute at 14px left.

### Modals (`ft-modal`)

**Character:** A centered glass card floating over a dark blur backdrop. On mobile, it becomes a bottom sheet. Entry animation: 200ms scale+fade. Exit: 200ms reverse.

- **Shape:** 18px radius (desktop), 18px 18px 0 0 (mobile bottom sheet).
- **Background:** Deep Plum with glass-border.
- **Overlay:** `rgba(0, 0, 0, 0.55)` with 6px blur.
- **Sizes:** sm (380px), md (480px), lg (640px), xl (820px) max-width.
- **Header:** 20px 24px padding, glass-border bottom separator, close button (32×32px, 8px radius).
- **Body:** 24px padding, scrollable, Frosted Iris text.
- **Footer:** 16px 24px padding, glass-border top separator, 15% black background tint. Actions right-aligned with 12px gap.
- **Reduced motion:** All animations collapsed to 0.01ms.

### Navigation (`topbar`)

**Character:** A floating glass bar. Transparent at the top of the page, it acquires glass morphism (backdrop-blur, border, shadow-sm) on scroll. Navigation items are ghost buttons (36×36px, 8px radius). The logo uses Space Grotesk 700 at 18px with the Amethyst Pulse start color for the icon.

- **Height:** 64px.
- **Max width:** 1440px centered.
- **Scroll transition:** Background and border transition over 250ms ease-smooth.
- **Mobile:** Navigation collapses below 768px. Hamburger button appears (36×36px). Mobile menu is a slide-down panel.
- **Notification badge:** 8px Amethyst Pulse dot, positioned top-right of action buttons.

### Pagination

**Character:** Minimal number strip with an accent-active state. Page buttons are 32×32px ghost buttons. The active page gets a Verdant 12% background with Verdant border.

## Do's and Don'ts

### Do:

- **Do** use the Amethyst Pulse gradient only for the single most important action or metric on screen. If it appears in three places, remove two.
- **Do** use backdrop-blur (12–16px) as the primary depth mechanism. Shadows are for state responses, not default surfaces.
- **Do** animate interactions within 150ms (buttons, toggles) to 250ms (cards, panel reveals). Faster than 150ms feels mechanical; slower than 250ms feels sluggish.
- **Do** use JetBrains Mono for any string containing currency symbols, decimal points, or percentage signs.
- **Do** keep body text under 75 characters per line in prose contexts. Financial data is dense enough without wide columns.
- **Do** use the 4px spacing scale exclusively. If you need a value not in {4, 8, 12, 16, 20, 24, 32, 40, 48}, the layout needs refactoring, not a new spacing value.
- **Do** respect `prefers-reduced-motion`: all animations collapse to 0.01ms. The interface must remain fully functional without motion.

### Don't:

- **Don't** animate financial numbers for decoration. Count-up animations on load are acceptable. Bounce, spin, pulse, or color-cycle on static data is never acceptable.
- **Don't** use solid borders at rest. The Glass Border Rule applies everywhere except error states and active focus.
- **Don't** add a new color outside the defined palette. The system has one accent gradient, four semantic colors, four background tones, and three text opacities. That's the complete vocabulary.
- **Don't** mix font families within a single typographic element. A heading in Inter or body text in Space Grotesk breaks the hierarchy contract.
- **Don't** use box-shadow on resting surfaces. A card with a shadow before interaction means the Flat-By-Default Rule was violated.
- **Don't** ship a screen without a visible focus ring. Every interactive element must show `:focus-visible` with the 2px Amethyst Pulse outline + 2px offset.
