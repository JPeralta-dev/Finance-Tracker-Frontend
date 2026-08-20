---
target: src/app/features/landing/components/hero-visual/hero-visual.component.html
total_score: 17
max_score: 28
na_heuristics: 5,7,9,10
p0_count: 0
p1_count: 2
timestamp: 2026-08-19T21-59-50Z
slug: components-hero-visual-hero-visual-component-html
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | The static screenshot gives product context but no visible workflow feedback. |
| 2 | Match System / Real World | 3 | A Mac dashboard is familiar, but the transaction-to-insight behavior is not shown. |
| 3 | User Control and Freedom | 3 | The landing CTA and navigation are clear; the visual itself is non-interactive. |
| 4 | Consistency and Standards | 3 | Glass, violet glow, and dark surfaces fit Kipu, though the pedestal stacks too many depth effects. |
| 5 | Error Prevention | n/a | Not applicable to a static hero visual. |
| 6 | Recognition Rather Than Recall | 3 | The dashboard is recognizable, but its key takeaway is not immediately obvious. |
| 7 | Flexibility and Efficiency | n/a | Not applicable to a persuasive hero visual. |
| 8 | Aesthetic and Minimalist Design | 3 | Strong product proof, with a slightly over-authored glass treatment. |
| 9 | Error Recovery | n/a | Not applicable to a static hero visual. |
| 10 | Help and Documentation | n/a | Not applicable to this visual-only surface. |
| **Total** | | **17/28** | **Acceptable foundation, needs focused refinement** |

#### Design Specificity Verdict

The Mac screenshot is a meaningful improvement over the fabricated dashboard card because it proves the real product exists. The glass pedestal gives it physical presence and fits the Obsidian Glass visual language. However, a Mac with a dark analytics dashboard and violet glow is still a category-familiar fintech/SaaS pattern. The hero currently sells polish and analysis, not Kipu's distinctive channel-first promise.

The deterministic detector completed successfully with zero findings for `hero-visual.component.html`. No browser automation was available, so no live screenshot, computed-style, or overlay validation was possible.

#### Overall Impression

The composition is correctly placed: copy and CTA on the left, product proof on the right, and the Mac is large enough to read as the hero's visual anchor. The biggest opportunity is to reduce the glass pedestal's visual volume and make the surrounding story explain what happens before the dashboard: a user sends a transaction and Kipu organizes it.

#### What's Working

- The real Mac mockup creates stronger trust than the previous invented dashboard.
- The screenshot has clear visual priority and sits in the correct hero column.
- The glass surface separates the product from the dark background without blurring the screenshot itself.

#### Priority Issues

- **[P1] The dashboard is generic product proof**: Visitors can see analysis, but not why Kipu is different from a spreadsheet or bank app. Add one concise visual cue near the Mac showing the channel-to-dashboard journey, without adding another competing card stack.
- **[P1] The glass pedestal is louder than the product**: The 22px blur, bright border, inset highlights, large shadow, purple glow, and image shadow create too many depth signals. Reduce the border and resting shadow, keeping one highlight and one controlled elevation shadow.
- **[P2] Mobile readability is unproven**: The full dashboard contains dense charts and labels that may become decorative at 320px-430px. Test those widths and consider a mobile crop or a simplified alternate asset if the dashboard cannot be read.
- **[P2] Obsolete hero CSS remains**: `.main-card` and `.float-card` rules remain after the template was replaced. Remove or isolate them so future edits do not accidentally revive the old composition.
- **[P2] Image layout stability needs explicit dimensions**: Add `width="1350"` and `height="1080"` to reduce layout-shift risk for this above-the-fold image.

#### Cognitive Load

Four of eight checks fail: visual hierarchy, one-thing-at-a-time, working memory, and progressive disclosure. The user sees a polished but dense dashboard before understanding the simple input-to-insight story. The surrounding hero has one primary CTA, so the load is moderate rather than catastrophic.

#### Persona Red Flags

**Jordan, first-timer**: Cannot tell whether Kipu requires manual data entry; the screenshot explains what the app looks like, not how it helps.

**Riley, stress tester**: The heavy above-the-fold image has no browser-validated mobile or 200% zoom behavior; the stale unused card styles could create future regressions.

**Casey, distracted mobile user**: The proof appears after the copy when the hero stacks, and dense dashboard content may be unreadable on a phone.

#### Minor Observations

- `fetchpriority="high"` and `decoding="async"` are appropriate; do not lazy-load this hero asset.
- The alt text is present and currently describes Kipu accurately.
- Reduced-motion handling exists for the product-shot animation; validate the surrounding reveal directive in a real browser.
- Hard-coded glass colors make the light theme a separate validation point; tokenizing them would improve consistency.

#### Questions to Consider

- What if the hero showed the moment a transaction arrives from Telegram or WhatsApp, not only the final analysis?
- Is the glass pedestal helping the visitor understand the product, or mainly demonstrating the visual effect?
- What single fact should the visitor understand from the dashboard before clicking the CTA?
