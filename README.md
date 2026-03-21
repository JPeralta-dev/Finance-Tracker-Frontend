# 💸 Personal Finance Tracker — Angular 17+

A youthful, minimalist personal finance tracker built with Angular 17 standalone components, signals, and Angular Router.

## Tech Stack

- Angular 17+ (standalone components, signals)
- Chart.js (via ng2-charts)
- @angular/animations
- RxJS
- TypeScript strict mode

## Getting Started

```bash
npm install
ng serve
```

App runs at `http://localhost:4200`. By default, the service layer uses the **mock data** (`of(mockData).pipe(delay(800))`). To switch to the real API, swap the `// MOCK` blocks in `finance.service.ts` with the real `HttpClient` calls.

---

## API Endpoints (Backend Contract)

The backend must implement the following REST endpoints. Base URL is configured in `environment.ts`.

### Summary

| Method | Endpoint        | Description            |
|--------|-----------------|------------------------|
| GET    | `/api/summary`  | Returns account summary |

**Response shape:**
```json
{
  "totalBalance": 12400.00,
  "totalIncome": 8200.00,
  "totalExpenses": 3800.00,
  "savingsRate": 53.7
}
```

---

### Transactions

| Method | Endpoint                  | Description               |
|--------|---------------------------|---------------------------|
| GET    | `/api/transactions`       | List all transactions (supports query params: `category`, `type`, `startDate`, `endDate`, `page`, `limit`, `sortBy`, `sortDir`) |
| GET    | `/api/transactions/:id`   | Get single transaction    |
| POST   | `/api/transactions`       | Create new transaction    |
| PUT    | `/api/transactions/:id`   | Update transaction        |
| DELETE | `/api/transactions/:id`   | Delete transaction        |

**Query params for GET /api/transactions:**
- `category` — filter by category name
- `type` — `income` | `expense`
- `startDate` — ISO date string
- `endDate` — ISO date string
- `page` — page number (default: 1)
- `limit` — items per page (default: 20)
- `sortBy` — `date` | `amount` | `category` (default: `date`)
- `sortDir` — `asc` | `desc` (default: `desc`)

**Transaction shape:**
```json
{
  "id": "uuid",
  "amount": 250.00,
  "type": "expense",
  "category": "Food",
  "description": "Grocery run",
  "date": "2024-06-15T00:00:00.000Z",
  "createdAt": "2024-06-15T10:32:00.000Z"
}
```

---

### Categories

| Method | Endpoint          | Description        |
|--------|-------------------|--------------------|
| GET    | `/api/categories` | List all categories with totals |

**Category shape:**
```json
{
  "id": "uuid",
  "name": "Food",
  "icon": "🍔",
  "color": "#FF5C4D",
  "total": 1240.00
}
```

---

### Chart

| Method | Endpoint             | Description             |
|--------|----------------------|-------------------------|
| GET    | `/api/chart/monthly` | Monthly income vs expenses for chart |

**ChartData shape:**
```json
[
  { "month": "Jan", "income": 5200, "expenses": 3100 },
  { "month": "Feb", "income": 4800, "expenses": 2900 }
]
```

---


## Backend

Se agregó una implementación completa en `backend/` con Express + MongoDB (Mongoose), validación con Zod y los modelos necesarios para `transactions` y `categories`.

```bash
cd backend
npm install
npm run dev
```

Configura las variables del backend usando `backend/.env.example`.

## Folder Structure

```
src/app/
├── core/
│   ├── models/
│   │   ├── transaction.model.ts
│   │   ├── summary.model.ts
│   │   ├── category.model.ts
│   │   └── chart.model.ts
│   └── services/
│       └── finance.service.ts
├── features/
│   ├── dashboard/
│   │   └── dashboard.component.ts
│   ├── transactions/
│   │   ├── transactions-list.component.ts
│   │   └── transaction-form.component.ts
│   └── categories/
│       └── categories.component.ts
├── shared/
│   ├── components/
│   │   ├── navbar.component.ts
│   │   ├── skeleton.component.ts
│   │   └── empty-state.component.ts
│   └── animations.ts
├── app.component.ts
├── app.routes.ts
├── app.config.ts
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

## Switching from Mock to Real API

In `finance.service.ts`, each method has two implementations:

```ts
// Real HTTP call (uncomment to use):
return this.http.get<Summary>(`${this.base}/summary`);

// MOCK (comment out when backend is ready):
return of(MOCK_SUMMARY).pipe(delay(800));
```

Just swap which line is active per method.
