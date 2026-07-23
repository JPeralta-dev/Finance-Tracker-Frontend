# Tasks: Landing Page Productization

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~950 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Tasks 1-3 (pricing) → PR 2: Tasks 4-6 (social proof) → PR 3: Tasks 7-8 (legal + polish) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Tier model + pricing cards + comparison table | PR 1 | `ng test --include='**/(pricing|comparison-table)/**'` | Open landing, verify 3 pricing cards + comparison renders | Revert tier.model.ts, pricing/, comparison-table/, landing imports, i18n keys |
| 2 | Testimonials + FAQ + trust signals | PR 2 | `ng test --include='**/(testimonials|faq|trust-signals)/**'` | Open landing, verify carousel, accordion, badges | Revert testimonials/, faq/, trust-signals/, landing additions, i18n keys |
| 3 | Legal pages + footer + CTA + SEO | PR 3 | `ng test --include='**/(legal|footer|hero|seo)/**'` | Navigate /legal/terms, check meta tags in <head> | Revert legal pages, routes, footer mods, CTA copy, OG image, Meta calls |

## Phase 1: Foundation

- [x] **1.1** — Create `core/models/tier.model.ts` (TierCard, TierFeature, TierComparisonRow, Testimonial, FaqItem interfaces)
- [x] **1.2** — Add `landing.*` i18n keys to `en.json` + `es.json` for all sections

## Phase 2: Component Implementation

- [x] **2.1** — Create `pricing.component.ts|html|scss` — responsive 3-tier cards grid; wire `<ft-pricing>` in landing
- [x] **2.2** — Create `comparison-table.component.ts|html|scss` — CSS Grid feature table; wire in landing
- [x] **2.3** — Create `testimonials.component.ts|html|scss` — custom carousel prev/next/dots; wire in landing
- [x] **2.4** — Create `faq.component.ts|html|scss` — Angular Animations accordion, single-open; wire in landing
- [x] **2.5** — Create `trust-signals.component.ts|html|scss` — glass-morphism badge grid; wire in landing
- [x] **2.6** — Create legal page components: `terms/privacy/cookies.component.ts|html|scss` + lazy routes in `app.routes.ts`
- [x] **2.7** — Modify `footer.component.ts|html` — replace `href="#"` with `routerLink`, import RouterLink
- [x] **2.8** — Update CTA copy in `hero-section.component.html` + `final-cta.component.html` to "Start your 30-day free trial"

## Phase 3: SEO & Assets

- [x] **3.1** — Create `assets/og/og-image.svg` — 1200×630 SVG placeholder
- [x] **3.2** — Inject `Meta` service in `landing.component.ts` — set description, keywords, og:title, og:description, og:image, og:type, og:url

## Phase 4: Verification

- [ ] **4.1** — Verify each section renders at desktop/mobile breakpoints
- [ ] **4.2** — Verify legal routes resolve and footer links navigate correctly
- [ ] **4.3** — Verify OG meta tags present in `<head>` and CTA shows new copy
- [x] **4.4** — `ng build --prod` compiles with no errors

## Commit Map (8 commits = user requirement)

| Commit | Task | Description |
|--------|------|-------------|
| 1 | 1.1–1.2 | Foundation — tier model + i18n keys |
| 2 | 2.1 | Pricing tier cards |
| 3 | 2.2 | Plan comparison table |
| 4 | 2.3 | Testimonials carousel |
| 5 | 2.4 | FAQ accordion |
| 6 | 2.5 | Trust signals badges |
| 7 | 2.6–2.7 | Legal pages + footer links + routes |
| 8 | 2.8, 3.1–3.2 | Aggressive CTAs + SEO + OG image |
