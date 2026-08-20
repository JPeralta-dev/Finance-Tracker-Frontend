---
target: src/app/shared/components/tour/tour-overlay.component.ts
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-07-30T19-25-25Z
slug: p-shared-components-tour-tour-overlay-component-ts
---
# Impeccable Critique — Onboarding Tour (driver.js)

**Method:** dual-agent
**Target:** src/app/shared/components/tour/tour-overlay.component.ts
**Mode:** Operate

## Driver.js Verification

driver.js v1.8.0 is imported and actively used. The component delegates all rendering (overlay, cutout, popover, positioning, keyboard nav, animations) to driver.js. No custom overlay code remains. Template is empty. ViewEncapsulation.None enables style overrides to reach driver.js DOM.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Progress counter present; no feedback for missing target elements |
| 2 | Match System / Real World | 3 | Copy is warm; Telegram assumes platform familiarity |
| 3 | User Control and Freedom | 4 | Close/skip/replay/resume + Esc |
| 4 | Consistency and Standards | 3 | CSS variables throughout; stagePadding: 10 is lone magic number |
| 5 | Error Prevention | 2 | CTA buttons promise actions that don't execute |
| 6 | Recognition Rather Than Recall | 3 | Elements highlighted; Done step has no recap |
| 7 | Flexibility and Efficiency | 3 | Resume works; no direct step jumping; forced auto-start at 1500ms |
| 8 | Aesthetic and Minimalist Design | 3 | Glass popover fits Obsidian Glass; pulse colors hardcoded to dark theme |
| 9 | Error Recovery | 1 | localStorage persistence for refresh; zero error handling |
| 10 | Help and Documentation | 3 | The tour is the help; replay available |
| **Total** | | **28/40** | **Good** |

## Priority Issues

### P0: CTA buttons deceive users
Steps 2-4 show action labels ("Connect Telegram", "Set up categories", "Log an expense") as Next button text. actionRoute exists on step definitions but is never consumed by the overlay. Clicking just advances the tour.

### P1: Hardcoded Amethyst Pulse colors break light theme
8 instances of rgba(217, 70, 239, ...) in tour-overlay.component.ts lines 130-131, 139-140, 145-146, 151, 213. These are #D946EF — dark theme accent-start. Light theme accent-start is #A78BFA. Pulse ring glows in dark magenta regardless of active theme.

### P1: No graceful fallback for missing target elements
No try/catch around driverInstance.drive(). No selector validation. Crash = user trapped in black overlay.

### P2: Done step emotionally empty
Targets body with highlightPadding: 0. No recap, no celebration, no concrete next action. Peak-end rule violation.

### P3: stagePadding: 10 is a magic number
All other spacing uses 4px scale. Use 8 or 12.

## Detector Findings
CLI scan: 0 findings. Manual scan: 8 hardcoded rgba() values found. All radius/spacing in-scale. driver.js properly installed and importable.
