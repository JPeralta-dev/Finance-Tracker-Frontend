# Design: Landing Page Productization

## Technical Approach

Six new standalone components under `src/app/features/landing/components/` implementing pricing tiers, testimonials, FAQ accordion, trust signals, and legal pages. Shared pricing model extracted to `src/app/core/models/tier.model.ts` for reuse between landing and subscription pages. Angular Meta service for SEO tags, CSS Grid for comparison table, Angular Animations for FAQ accordion, custom carousel with CSS transitions for testimonials.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| **Tier model location** | `core/models/tier.model.ts` | `features/landing/models/` | Shared domain concept; subscription page already imports from `core/models` |
| **Comparison table layout** | CSS Grid | Flexbox | Grid handles feature rows × tier columns alignment better; responsive with `overflow-x` scroll wrapper |
| **Testimonial carousel** | Custom CSS transitions | Third-party library | Lightweight, matches existing animation patterns (ft-subtle-reveal), no dependency |
| **FAQ accordion animation** | Angular Animations + CSS | Pure CSS | Angular Animations provide `@trigger` for expand/collapse with height auto, smoother than CSS max-height hacks |
| **Legal pages routing** | Lazy-loaded standalone components | Eager loading | Follows existing pattern in `app.routes.ts`; no guards needed |
| **OG image** | SVG stored in `assets/og/og-image.svg` | PNG | SVG scales crisply, smaller file, editable; 1200×630 viewport embedded |

## Data Flow

```
TierModel (tier.model.ts)
    ├── LandingPricingComponent (input)
    ├── LandingComparisonTableComponent (input)
    └── SubscriptionPage (already imports from core/models)

TestimonialModel → LandingTestimonialsComponent
    └── @Input() testimonials: Testimonial[]

FaqItem[] (i18n keys) → LandingFaqComponent
    └── @Input() items: { questionKey: string; answerKey: string }[]

TrustBadge[] → LandingTrustSignalsComponent
    └── @Input() badges: { icon: string; labelKey: string }[]

MetaService.updateTitle() + updateTag() → LandingComponent.ngOnInit()
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/core/models/tier.model.ts` | Create | Shared `TierCard`, `TierFeature`, `TierComparisonRow` interfaces |
| `src/app/features/landing/components/pricing/pricing.component.ts` | Create | Tier cards grid with CTA buttons |
| `src/app/features/landing/components/pricing/pricing.component.html` | Create | Three-column grid template |
| `src/app/features/landing/components/pricing/pricing.component.scss` | Create | Responsive grid, card styling |
| `src/app/features/landing/components/comparison-table/comparison-table.component.ts` | Create | Feature comparison table |
| `src/app/features/landing/components/comparison-table/comparison-table.component.html` | Create | CSS Grid table template |
| `src/app/features/landing/components/comparison-table/comparison-table.component.scss` | Create | Horizontal scroll on mobile |
| `src/app/features/landing/components/testimonials/testimonials.component.ts` | Create | Carousel with prev/next |
| `src/app/features/landing/components/testimonials/testimonials.component.html` | Create | Slide template |
| `src/app/features/landing/components/testimonials/testimonials.component.scss` | Create | CSS transition animations |
| `src/app/features/landing/components/faq/faq.component.ts` | Create | Accordion with Angular Animations |
| `src/app/features/landing/components/faq/faq.component.html` | Create | Expand/collapse trigger template |
| `src/app/features/landing/components/faq/faq.component.scss` | Create | Accordion styling + animation |
| `src/app/features/landing/components/trust-signals/trust-signals.component.ts` | Create | Badges with glass morphism |
| `src/app/features/landing/components/trust-signals/trust-signals.component.html` | Create | Badge grid template |
| `src/app/features/landing/components/trust-signals/trust-signals.component.scss` | Create | Responsive badge layout |
| `src/app/features/landing/pages/legal/terms.component.ts` | Create | Terms placeholder page |
| `src/app/features/landing/pages/legal/terms.component.html` | Create | "Coming soon" content |
| `src/app/features/landing/pages/legal/terms.component.scss` | Create | Legal page base styles |
| `src/app/features/landing/pages/legal/privacy.component.ts` | Create | Privacy placeholder page |
| `src/app/features/landing/pages/legal/privacy.component.html` | Create | "Coming soon" content |
| `src/app/features/landing/pages/legal/privacy.component.scss` | Create | Legal page base styles |
| `src/app/features/landing/pages/legal/cookies.component.ts` | Create | Cookies placeholder page |
| `src/app/features/landing/pages/legal/cookies.component.html` | Create | "Coming soon" content |
| `src/app/features/landing/pages/legal/cookies.component.scss` | Create | Legal page base styles |
| `src/app/features/landing/landing.component.ts` | Modify | Import 6 new components, inject Meta service, set OG tags |
| `src/app/features/landing/landing.component.html` | Modify | Add `<ft-pricing>`, `<ft-testimonials>`, `<ft-faq>`, `<ft-trust-signals>` sections |
| `src/app/features/landing/landing.component.scss` | Modify | Add new section wrapper styles |
| `src/app/features/landing/components/footer/footer.component.ts` | Modify | Add RouterLink import |
| `src/app/features/landing/components/footer/footer.component.html` | Modify | Replace `href="#"` with `routerLink` |
| `src/app/features/landing/components/hero-section/hero-section.component.html` | Modify | Update CTA copy to i18n key |
| `src/app/features/landing/components/final-cta/final-cta.component.html` | Modify | Update CTA copy to i18n key |
| `src/app/app.routes.ts` | Modify | Add 3 lazy routes for legal pages |
| `src/assets/og/og-image.svg` | Create | OG image placeholder (1200×630) |
| `src/assets/i18n/en.json` | Modify | Add landing.pricing, landing.testimonials, landing.faq, landing.trust, landing.legal, landing.seo keys |
| `src/assets/i18n/es.json` | Modify | Add Spanish translations for new keys |

## Interfaces / Contracts

```typescript
// src/app/core/models/tier.model.ts
export type SubscriptionTier = 'free' | 'premium' | 'premium_plus';

export interface TierFeature {
  text: string;
  included: boolean;
}

export interface TierCard {
  id: SubscriptionTier;
  nameKey: string;        // i18n translation key
  price: string;
  priceAnnual: string;
  annualSavings?: string;
  popular: boolean;
  features: string[];      // i18n translation keys
  ctaKey: string;          // i18n translation key
  highlighted: boolean;
}

export interface TierComparisonRow {
  featureKey: string;      // i18n translation key
  free: boolean;
  premium: boolean;
  premiumPlus: boolean;
}
```

```typescript
// Testimonials
export interface Testimonial {
  name: string;
  role: string;
  textKey: string;         // i18n key
  avatarInitials: string;
}
```

```typescript
// FAQ
export interface FaqItem {
  questionKey: string;     // i18n key
  answerKey: string;        // i18n key
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | TierModel interfaces, FaqItem logic, carousel index math | Vitest unit tests |
| Component | PricingComponent renders 3 cards, ComparisonTable renders grid, FAQ expand/collapse | Angular TestBed with `ComponentFixture` |
| Integration | Landing page renders all 6 sections, legal routes navigate | Playwright E2E |
| Accessibility | ARIA roles, keyboard nav on FAQ, focus management | axe-core in Playwright |

## Threat Matrix

N/A — no routing to shell commands, subprocesses, VCS automation, executable classification, or process-integration boundaries. Pure UI/routing change.

## Animation Specs

**FAQ Accordion**:
- `@expand` trigger: `height: 0 → *`, `opacity: 0 → 1`, duration 250ms, `easeOut`
- `@collapse` trigger: `height: * → 0`, `opacity: 1 → 0`, duration 200ms, `easeIn`
- Only one item expanded at a time via signal tracking

**Testimonial Carousel**:
- Slide transition: `transform: translateX(-100%) → translateX(0)`, duration 400ms, `easeSmooth`
- Auto-advance: disabled (manual only for placeholder)
- Dots indicator: CSS `scale()` on active dot

## Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| `< 768px` | Pricing: 1-column stack; Trust: 2-column grid; Comparison: horizontal scroll |
| `768–1023px` | Pricing: 2-column; Trust: 3-column |
| `≥ 1024px` | Pricing: 3-column; Trust: row; Comparison: full table |

## i18n Strategy

All user-facing strings use translation pipe (`| translate`) with keys under `landing.*` namespace. New keys added to both `en.json` and `es.json`. Legal page titles use `landing.legal.terms`, `landing.legal.privacy`, `landing.legal.cookies`.

## Open Questions

- [ ] OG image SVG design — need branding assets to finalize the placeholder SVG
- [ ] Testimonial placeholder content — need realistic placeholder text rather than lorem ipsum
- [ ] FAQ items — need actual Q&A content from stakeholders
- [ ] Trust badge icons — need to confirm which ng-icons are available in icon-registry
