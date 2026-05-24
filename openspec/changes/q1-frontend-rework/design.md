# Design: Q1 Frontend Rework

## Technical Approach

**Stage 1 — Auth Fix (auth spec):** Add JWT expiry check to `authGuard` using a lightweight decode (no library). Add `clearTokens()` call in the `authInterceptor` on 401 refresh failure. Modify `redirectIfAuthGuard` to use `authService.isAuthenticated()` signal instead of raw localStorage. No new files needed.

**Stage 2 — Language + Mobile (i18n, landing specs):** Convert text buttons in `PublicNavbarComponent` to a globe icon button with dropdown. Create `LanguageDropdownComponent` in `shared/components/language-dropdown/` using `ClickOutsideDirective`. Make navbar responsive — hide secondary actions behind collapsible toggle below 768px. CTA stays visible; "Sign In" becomes icon-only.

**Stage 3 — Currency Service (currency spec):** Create `CurrencyService` in `core/services/currency.service.ts` with a `CurrencyConfig` signal. Inject into `ChartService` tooltip callbacks via closure capture. Components in categories, stat-card, recent-activity, and transaction-row migrate to the service. Add `ftCurrency` pipe for templates.

**Stage 4 — Analytics + Insights (analytics, user-insights specs):** Create lazy-loaded `features/analytics/` page at `/analytics` (update route). Reuse `AreaChart` and `DonutChart` from shared charts library. Create `AnalyticsPage` with three sections: monthly trends, category breakdown, income vs expense. Fetch from existing `FinanceService` endpoints. Move `InsightsPanelComponent` to `shared/components/insights-panel/` and import into `ProfilePage`.

---

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|---|---|---|---|
| **Auth interceptor 401 handling** | Add `authService.clearTokens()` call on refresh failure inside `authInterceptor` catchError. Guards remain as-is. | Add 401 handling inside guards, create separate interceptor | Single source of truth in interceptor; guards already delegate to authService |
| **Currency service shape** | `CurrencyService` with `signal<CurrencyConfig>`. `CurrencyConfig` has `code, symbol, locale, decimals`. No observable/Subject. | BehaviorSubject, service with static methods | Signal is the project convention (see auth.service.ts) |
| **Chart.js tooltip currency** | Inject `CurrencyService` into `ChartService`, capture current config in tooltip callback closure at config creation time. Update chart data to re-create config on currency change. | Pass formatter function as param to chart methods | ChartService already reads from CSS; closure capture keeps changes local to chart creation |
| **Insights panel reuse** | Move `InsightsPanelComponent` from `features/dashboard/components/insights-panel/` to `shared/components/insights-panel/`. Import in profile. | Leave in dashboard, import with relative path from feature | Shared usage convention; easier import path via shared alias |
| **Language dropdown location** | Create `LanguageDropdownComponent` in `shared/components/language-dropdown/`. Use in both `PublicNavbarComponent` and `TopbarComponent`. | Inline in PublicNavbar, only in PublicNavbar | Reuse across private topbar too; cleaner separation of concerns |
| **Analytics MVP scope** | AreaChart (income/expense monthly), DonutChart (category breakdown), summary comparison table. Client-side aggregation fallback if no backend endpoint. | Full P&L, budget vs actual, export | Proposal scope; reuse existing chart components |
| **Topbar title suppression** | Compare `pageTitle()` value against `NAV_ITEMS` labels in `TopbarComponent.ts`. Hide title if matched. | Pass nav match flag from router | No router changes needed; comparison is straightforward |

---

## Data Flow

```
Auth flow:
  HTTP 401 → authInterceptor.catchError → refreshToken() fails → clearTokens() → router.navigate /login
  authGuard → reads authService.isAuthenticated() signal → true = proceed, false = /login
  redirectIfAuthGuard → reads authService.isAuthenticated() signal → true = /dashboard, false = proceed

Currency flow:
  CurrencyService (signal<CurrencyConfig>) → injected into ChartService
  ChartService.createAreaConfig() → closure captures current config
  tooltip callback → uses captured config.symbol/locale/decimals
  Component (stat-card, etc.) → uses CurrencyService.format(value) or ftCurrency pipe
  On currency change → signal updates → components react (OnPush + signal)

Duplicate title flow:
  Router event → pageTitle.set(ROUTE_TITLES[url]) → compare against NAV_ITEMS labels
  → if match, title hidden; if no match, title shown
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/core/guards/auth.guard.ts` | Modify | Add JWT decode for expiry check; use authService.isAuthenticated() signal |
| `src/app/core/guards/redirect-if-auth.guard.ts` | Modify | Use authService.isAuthenticated() signal instead of localStorage |
| `src/app/core/interceptors/auth.interceptor.ts` | Modify | Call `clearTokens()` + navigate `/login` on refresh failure |
| `src/app/core/services/currency.service.ts` | Create | CurrencyService with CurrencyConfig interface, signal, format methods |
| `src/app/core/pipes/ft-currency.pipe.ts` | Create | ftCurrency pipe using CurrencyService |
| `src/app/shared/components/language-dropdown/language-dropdown.component.ts` | Create | Globe icon + dropdown with ES/EN/FR |
| `src/app/shared/components/language-dropdown/language-dropdown.component.html` | Create | Dropdown template |
| `src/app/shared/components/language-dropdown/language-dropdown.component.scss` | Create | Styles |
| `src/app/shared/components/insights-panel/insights-panel.component.ts` | Create | Move from dashboard/features |
| `src/app/shared/components/insights-panel/insights-panel.component.html` | Create | Move from dashboard/features |
| `src/app/shared/components/insights-panel/insights-panel.component.scss` | Create | Move from dashboard/features |
| `src/app/shared/directives/count-up.directive.ts` | Modify | `ease = 1 - Math.pow(1 - progress, 2)` (quadratic), duration default 2500ms |
| `src/app/shared/layout/topbar/topbar.component.ts` | Modify | Hide pageTitle when route matches nav item label |
| `src/app/shared/layout/topbar/topbar.component.html` | Modify | Add language-dropdown to right section |
| `src/app/shared/charts/chart.service.ts` | Modify | Inject CurrencyService; tooltip callbacks use CurrencyService config |
| `src/app/features/landing/components/public-navbar/public-navbar.component.ts` | Modify | Replace text buttons with LanguageDropdownComponent |
| `src/app/features/landing/components/public-navbar/public-navbar.component.html` | Modify | Replace language buttons section with `<ft-language-dropdown>` |
| `src/app/features/landing/components/public-navbar/public-navbar.component.scss` | Modify | Mobile responsive — collapse secondary actions below 768px |
| `src/app/features/landing/landing.component.html` | Modify | Responsive navbar wrapper |
| `src/app/features/landing/landing.component.ts` | Modify | Add viewport listener for responsive navbar |
| `src/app/features/analytics/pages/analytics.page.ts` | Create | Analytics page component |
| `src/app/features/analytics/pages/analytics.page.html` | Create | Three-section layout |
| `src/app/features/analytics/pages/analytics.page.scss` | Create | Styles |
| `src/app/features/dashboard/components/insights-panel/` | Delete | Moved to shared |
| `src/app/features/profile/profile.page.ts` | Modify | Import FinanceService, fetch user insights, inject InsightsPanelComponent |
| `src/app/features/profile/profile.page.html` | Modify | Add `<ft-insights-panel>` section |
| `src/app/features/categories/categories.component.ts` | Modify | Use CurrencyService for amounts |
| `src/app/features/dashboard/components/stat-card/stat-card.component.ts` | Modify | Use CurrencyService for formatting |
| `src/app/features/dashboard/components/recent-activity/recent-activity.component.ts` | Modify | Use CurrencyService for amounts |
| `src/app/features/transactions/components/transaction-row/transaction-row.component.ts` | Modify | Use CurrencyService for amount display |
| `src/app/app.routes.ts` | Modify | Add `path: 'analytics'` lazy route; remove redirect |

---

## Interfaces / Contracts

```typescript
// CurrencyConfig
interface CurrencyConfig {
  code: string;      // 'USD' | 'EUR' | etc.
  symbol: string;    // '$' | '€' | etc.
  locale: string;    // 'en-US' | 'de-DE' | etc.
  decimals: number;  // 2
}

// Analytics types
interface AnalyticsMonth {
  month: string;
  income: number;
  expense: number;
}

interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

interface AnalyticsSummary {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  topCategory: string;
}

// UserStats (profile insights)
interface UserStats {
  accountAge: string;        // e.g. "3 months"
  totalTransactions: number;
  topCategory: string;
  averageMonthlySpend: number;
}
```

---

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Unit | CurrencyService: format, signal update, default config | `describe('CurrencyService')` with TestBed |
| Unit | Auth guards: valid token, expired token, no token | Mock authService.isAuthenticated signal |
| Unit | CountUpDirective: quadratic easing, duration 2500ms default | Test element textContent after animation frame |
| Unit | LanguageDropdown: click outside closes, selection applies | Simulate click events, assert dropdown hide |
| Unit | Topbar title suppression: route matches nav item | Mock Router.events, assert pageTitle signal |
| Integration | AuthInterceptor: 401 triggers clearTokens | Mock HttpClient, expect clearTokens call |
| Integration | ChartService: tooltip uses currency config | Create chart config, inspect tooltip callback |
| Integration | Analytics page: loads with data, shows empty state | Mock FinanceService, assert chart renders |