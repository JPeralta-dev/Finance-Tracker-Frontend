/**
 * Shared UI Components — Barrel Export
 *
 * All core UI primitives for the Obsidian Glass design system.
 * Import individually for tree-shaking:
 *   import { GlassPanelComponent } from './shared/ui';
 */

export { GlassPanelComponent } from './glass-panel/glass-panel.component';
export { UiButtonComponent } from './ui-button/ui-button.component';
export { UiInputComponent } from './ui-input/ui-input.component';
export { UiCardComponent } from './ui-card/ui-card.component';
export { UiBadgeComponent } from './ui-badge/ui-badge.component';
export { SectionHeaderComponent } from './section-header/section-header.component';

// Types
export type { GlassVariant } from './glass-panel/glass-panel.component';
export type { ButtonVariant, ButtonSize } from './ui-button/ui-button.types';
export type { BadgeVariant, BadgeSize } from './ui-badge/ui-badge.types';
