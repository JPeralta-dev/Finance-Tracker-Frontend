# Proposal: Landing Page Productization

## Intent

Convert landing visitors into users by adding pricing transparency, social proof, trust signals, SEO, and legal compliance.

## Scope

### In Scope

| # | Deliverable | Description |
|---|-------------|-------------|
| 1 | Pricing section | Tier cards (Free/Premium/Premium Plus) |
| 2 | Testimonials | Social proof (placeholder) |
| 3 | Aggressive CTAs | "Start your 30-day free trial" |
| 4 | FAQ section | Accordion for pricing, features |
| 5 | Plan comparison | Free vs Premium table |
| 6 | Trust signals | Security badges, encryption |
| 7 | Footer + legal | Terms, Privacy, Cookie links |
| 8 | SEO / Meta | Open Graph, keywords, OG image |

### Out of Scope

Payment/Stripe changes, real testimonial collection, backend legal management, analytics.

## Capabilities

### New Capabilities

- `landing-pricing`: Tier cards + comparison (items 1 & 5)
- `landing-testimonials`: Social proof (item 2)
- `landing-faq`: FAQ accordion (item 4)
- `landing-trust-signals`: Security badges (item 6)
- `landing-legal`: Legal pages + footer links (item 7)
- `landing-seo`: Meta tags + OG (item 8)

### Modified Capabilities

- `landing`: Hero/final CTA copy (item 3). Footer links (item 7).

## Approach

1. Extract `TierCard` → `shared/models/tier.model.ts`
2. Create 6 standalone components under `landing/components/`
3. Create 3 legal pages under `features/legal/`
4. Add OG image → `assets/og/`; wire meta tags
5. Update footer `#` → routerLinks; update CTA copy
6. **8 granular commits** — one per deliverable

## Affected Areas

| Area | Impact |
|------|--------|
| `landing/components/` | 6 new components |
| `landing.component.html` | Wire sections |
| `subscription.page.ts` | Import shared model |
| `shared/models/tier.model.ts` | New model |
| `features/legal/` | 3 pages + routing |
| `footer/` | Replace `#` links |
| `index.html` + `assets/og/` | Meta + OG |

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| OG image missing | High | Placeholder SVG |
| No real testimonials | High | Swappable placeholder |
| Legal pages need content | Medium | "Coming soon" |
| Tier extraction breaks subscription | Low | Identical shape; test |

## Rollback Plan

Each commit independently revertable. Components are additive — remove from `landing.component.html` to disable.

## Dependencies

- OG image (1200×630)
- Legal content (placeholder)
- Testimonials (placeholder)

## Success Criteria

- [ ] All 8 sections render on desktop + mobile
- [ ] Pricing matches subscription data
- [ ] Footer links work (no `#` dead links)
- [ ] OG tags present; image loads
- [ ] FAQ accordion works
- [ ] Tests pass; no regressions
- [ ] 8 separate commits
