import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { CommonModule, CurrencyPipe, DecimalPipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Chart, registerables } from "chart.js";

import { FinanceService } from "../../core/services/finance.service";
import { Summary } from "../../core/models/summary.model";
import { Transaction } from "../../core/models/transaction.model";
import { ChartData } from "../../core/models/chart.model";
import { SkeletonComponent } from "../../shared/components/skeleton.component";
import {
  cardEntrance,
  staggerList,
  fadeSlideIn,
} from "../../shared/animations";

Chart.register(...registerables);

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CurrencyPipe,
    DecimalPipe,
    SkeletonComponent,
  ],
  animations: [cardEntrance, staggerList, fadeSlideIn],
  template: `
    <div class="dashboard">
      <!-- Header -->
      <div class="page-header" @fadeSlideIn>
        <div>
          <h1>Dashboard</h1>
          <p class="subtitle">Here's your financial overview</p>
        </div>
        <a routerLink="/transactions/new" class="btn-primary"
          >+ New Transaction</a
        >
      </div>

      <!-- Summary Cards -->
      <section class="cards-grid">
        @if (loading()) {
          @for (s of [1, 2, 3, 4]; track s) {
            <div class="card skeleton-card">
              <app-skeleton height="14px" width="80px" radius="4px" />
              <app-skeleton height="36px" width="140px" radius="6px" />
              <app-skeleton height="12px" width="60px" radius="4px" />
            </div>
          }
        } @else if (summary()) {
          <div class="card card--balance" @cardEntrance>
            <span class="card-label">Total Balance</span>
            <span class="card-value">{{
              summary()!.totalBalance | currency: "USD" : "symbol" : "1.0-0"
            }}</span>
            <span class="card-badge positive">↑ This month</span>
          </div>
          <div class="card card--income" @cardEntrance>
            <span class="card-label">Total Income</span>
            <span class="card-value">{{
              summary()!.totalIncome | currency: "USD" : "symbol" : "1.0-0"
            }}</span>
            <span class="card-badge positive">Income</span>
          </div>
          <div class="card card--expense" @cardEntrance>
            <span class="card-label">Total Expenses</span>
            <span class="card-value">{{
              summary()!.totalExpenses | currency: "USD" : "symbol" : "1.0-0"
            }}</span>
            <span class="card-badge negative">Expenses</span>
          </div>
          <div class="card card--savings" @cardEntrance>
            <span class="card-label">Savings Rate</span>
            <span class="card-value"
              >{{ summary()!.savingsRate | number: "1.1-1" }}%</span
            >
            <div class="savings-bar">
              <div
                class="savings-fill"
                [style.width.%]="summary()!.savingsRate"
              ></div>
            </div>
          </div>
        }
      </section>

      <!-- Chart -->
      <section class="chart-section" @fadeSlideIn>
        <div class="section-header">
          <h2>Monthly Overview</h2>
          <span class="section-label">Last 6 months</span>
        </div>
        <div class="chart-card">
          @if (chartLoading()) {
            <div class="chart-skeleton">
              <app-skeleton height="220px" radius="8px" />
            </div>
          } @else {
            <div class="chart-legend" aria-hidden="true">
              <span class="legend-item">
                <span class="legend-dot legend-dot--income"></span>
                Income
              </span>
              <span class="legend-item">
                <span class="legend-dot legend-dot--expense"></span>
                Expenses
              </span>
            </div>
            <canvas #chartCanvas></canvas>
          }
        </div>
      </section>

      <!-- Recent Transactions -->
      <section class="recent-section">
        <div class="section-header">
          <h2>Recent Transactions</h2>
          <a routerLink="/transactions" class="see-all">See all →</a>
        </div>
        <div class="tx-list" [@staggerList]="transactions().length">
          @if (txLoading()) {
            @for (s of [1, 2, 3, 4, 5]; track s) {
              <div class="tx-row skeleton-row">
                <app-skeleton width="36px" height="36px" radius="50%" />
                <div class="tx-skeleton-text">
                  <app-skeleton height="14px" width="160px" radius="4px" />
                  <app-skeleton height="12px" width="80px" radius="4px" />
                </div>
                <app-skeleton height="18px" width="80px" radius="4px" />
              </div>
            }
          } @else if (recentTransactions().length === 0) {
            <div class="empty-tx">
              <span class="empty-tx-icon">TX</span>
              <p>
                No transactions yet.
                <a routerLink="/transactions/new">Add one!</a>
              </p>
            </div>
          } @else {
            @for (tx of recentTransactions(); track tx.id) {
              <a
                [routerLink]="['/transactions', tx.id]"
                class="tx-row"
                @fadeSlideIn
              >
                <div
                  class="tx-icon"
                  [style.background]="categoryColor(tx.category)"
                >
                  {{ categoryIcon(tx.category) }}
                </div>
                <div class="tx-info">
                  <span class="tx-desc">{{ tx.description }}</span>
                  <span class="tx-meta"
                    >{{ tx.category }} · {{ tx.date | date: "MMM d" }}</span
                  >
                </div>
                <span
                  class="tx-amount"
                  [class.income]="tx.type === 'income'"
                  [class.expense]="tx.type === 'expense'"
                >
                  {{ tx.type === "income" ? "+" : "-"
                  }}{{ tx.amount | currency: "USD" : "symbol" : "1.0-0" }}
                </span>
              </a>
            }
          }
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .dashboard {
        display: flex;
        flex-direction: column;
        gap: 36px;
      }

      .page-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      h1 {
        font-family: "Clash Display", sans-serif;
        font-size: 32px;
        font-weight: 700;
        color: #111;
        margin: 0;
        letter-spacing: -0.5px;
      }
      .subtitle {
        color: #888;
        margin: 4px 0 0;
        font-size: 15px;
      }
      .btn-primary {
        padding: 10px 22px;
        background: #ff5c4d;
        color: white;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.15s ease;
        white-space: nowrap;
      }
      .btn-primary:hover {
        background: #e54535;
        transform: translateY(-1px);
      }
      .btn-primary:active {
        transform: scale(0.97);
      }
      .empty-tx-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 14px;
        background: rgba(0, 0, 0, 0.05);
        color: #555;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
      }

      /* Cards */
      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 16px;
      }
      .card {
        background: white;
        border-radius: 14px;
        padding: 22px 22px 18px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
        display: flex;
        flex-direction: column;
        gap: 8px;
        position: relative;
        overflow: hidden;
        transition:
          transform 0.18s ease,
          box-shadow 0.18s ease;
      }
      .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.09);
      }
      .card::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
      }
      .card--balance::before {
        background: #111;
      }
      .card--income::before {
        background: #10b981;
      }
      .card--expense::before {
        background: #ff5c4d;
      }
      .card--savings::before {
        background: #6366f1;
      }

      .card-label {
        font-size: 12px;
        font-weight: 600;
        color: #999;
        text-transform: uppercase;
        letter-spacing: 0.6px;
      }
      .card-value {
        font-family: "Clash Display", sans-serif;
        font-size: 28px;
        font-weight: 700;
        color: #111;
        letter-spacing: -0.5px;
      }
      .card-badge {
        font-size: 11px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 20px;
        width: fit-content;
      }
      .card-badge.positive {
        background: rgba(16, 185, 129, 0.12);
        color: #10b981;
      }
      .card-badge.negative {
        background: rgba(255, 92, 77, 0.12);
        color: #ff5c4d;
      }

      .savings-bar {
        height: 5px;
        background: #eee;
        border-radius: 99px;
        overflow: hidden;
        margin-top: 4px;
      }
      .savings-fill {
        height: 100%;
        background: #6366f1;
        border-radius: 99px;
        transition: width 1s ease;
      }

      .skeleton-card {
        gap: 14px;
      }

      /* Section headers */
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
      }
      h2 {
        font-family: "Clash Display", sans-serif;
        font-size: 20px;
        font-weight: 600;
        color: #111;
        margin: 0;
      }
      .section-label {
        font-size: 13px;
        color: #aaa;
      }
      .see-all {
        font-size: 13px;
        color: #ff5c4d;
        text-decoration: none;
        font-weight: 600;
      }
      .see-all:hover {
        text-decoration: underline;
      }

      /* Chart */
      .chart-card {
        background: white;
        border-radius: 14px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
        min-height: 320px;
      }
      .chart-legend {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }
      .legend-item {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #666;
        font-size: 12px;
        font-weight: 500;
      }
      .legend-dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        display: inline-block;
      }
      .legend-dot--income {
        background: #10b981;
      }
      .legend-dot--expense {
        background: #ff5c4d;
      }
      .chart-card canvas {
        width: 100%;
        height: 260px;
        max-height: 260px;
      }
      .chart-skeleton {
        padding: 8px 0;
      }

      /* Transactions */
      .tx-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .tx-row {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 13px 16px;
        border-radius: 12px;
        text-decoration: none;
        color: inherit;
        transition: background 0.15s ease;
        cursor: pointer;
      }
      .tx-row:hover {
        background: rgba(0, 0, 0, 0.03);
      }
      .skeleton-row {
        pointer-events: none;
      }

      .tx-icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
      }
      .tx-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }
      .tx-desc {
        font-size: 14px;
        font-weight: 500;
        color: #111;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tx-meta {
        font-size: 12px;
        color: #aaa;
      }
      .tx-skeleton-text {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .tx-amount {
        font-size: 14px;
        font-weight: 700;
        white-space: nowrap;
      }
      .tx-amount.income {
        color: #10b981;
      }
      .tx-amount.expense {
        color: #ff5c4d;
      }

      .empty-tx {
        text-align: center;
        padding: 32px;
        color: #aaa;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }
      .empty-tx span {
        font-size: 32px;
      }
      .empty-tx a {
        color: #ff5c4d;
        text-decoration: none;
        font-weight: 600;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild("chartCanvas") chartCanvas!: ElementRef<HTMLCanvasElement>;

  private financeService = inject(FinanceService);

  summary = signal<Summary | null>(null);
  transactions = signal<Transaction[]>([]);
  chartData = signal<ChartData[]>([]);
  loading = signal(true);
  txLoading = signal(true);
  chartLoading = signal(true);

  recentTransactions = computed(() => this.transactions().slice(0, 6));

  private chart: Chart | null = null;

  private CATEGORY_META: Record<string, { icon: string; color: string }> = {
    Food: { icon: "FD", color: "rgba(255,92,77,0.15)" },
    Transport: { icon: "TR", color: "rgba(77,166,255,0.15)" },
    Entertainment: { icon: "EN", color: "rgba(168,85,247,0.15)" },
    Shopping: { icon: "SH", color: "rgba(245,158,11,0.15)" },
    Health: { icon: "HL", color: "rgba(16,185,129,0.15)" },
    Rent: { icon: "RE", color: "rgba(99,102,241,0.15)" },
    Salary: { icon: "SA", color: "rgba(34,211,238,0.15)" },
    Freelance: { icon: "FR", color: "rgba(244,114,182,0.15)" },
    Utilities: { icon: "UT", color: "rgba(132,204,22,0.15)" },
  };

  categoryIcon(cat: string) {
    return this.CATEGORY_META[cat]?.icon ?? "OT";
  }
  categoryColor(cat: string) {
    return this.CATEGORY_META[cat]?.color ?? "rgba(0,0,0,0.07)";
  }

  ngOnInit() {
    this.financeService.getSummary().subscribe((data) => {
      this.summary.set(data);
      this.loading.set(false);
    });

    this.financeService.getTransactions().subscribe((data) => {
      this.transactions.set(data);
      this.txLoading.set(false);
    });

    this.financeService.getMonthlyChart().subscribe((data) => {
      this.chartData.set(data);
      this.chartLoading.set(false);
      setTimeout(() => this.renderChart(), 50);
    });
  }

  ngAfterViewInit() {
    if (this.chartData().length > 0) this.renderChart();
  }

  private renderChart() {
    if (!this.chartCanvas?.nativeElement) return;
    if (this.chart) this.chart.destroy();

    const data = this.chartData();
    const ctx = this.chartCanvas.nativeElement.getContext("2d")!;

    const incomeGradient = ctx.createLinearGradient(0, 0, 0, 260);
    incomeGradient.addColorStop(0, "rgba(16,185,129,0.25)");
    incomeGradient.addColorStop(1, "rgba(16,185,129,0)");

    const expenseGradient = ctx.createLinearGradient(0, 0, 0, 260);
    expenseGradient.addColorStop(0, "rgba(255,92,77,0.18)");
    expenseGradient.addColorStop(1, "rgba(255,92,77,0)");

    this.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((d) => d.month),
        datasets: [
          {
            label: "Income",
            data: data.map((d) => d.income),
            borderColor: "#10B981",
            backgroundColor: incomeGradient,
            borderWidth: 2.5,
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#10B981",
          },
          {
            label: "Expenses",
            data: data.map((d) => d.expenses),
            borderColor: "#FF5C4D",
            backgroundColor: expenseGradient,
            borderWidth: 2.5,
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#FF5C4D",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "white",
            titleColor: "#111",
            bodyColor: "#666",
            borderColor: "rgba(0,0,0,0.08)",
            borderWidth: 1,
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: (ctx) => ` $${(ctx.parsed.y ?? 0).toLocaleString()}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: "DM Sans", size: 12 }, color: "#aaa" },
          },
          y: {
            grid: { color: "rgba(0,0,0,0.04)" },
            ticks: {
              font: { family: "DM Sans", size: 12 },
              color: "#aaa",
              callback: (v) => `$${Number(v).toLocaleString()}`,
            },
          },
        },
      },
    });
  }
}
