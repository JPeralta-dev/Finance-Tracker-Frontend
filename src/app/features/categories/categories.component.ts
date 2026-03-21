import { Component, OnInit, signal, inject } from "@angular/core";
import { CommonModule, CurrencyPipe } from "@angular/common";
import { RouterLink } from "@angular/router";

import { FinanceService } from "../../core/services/finance.service";
import { Category } from "../../core/models/category.model";
import { SkeletonComponent } from "../../shared/components/skeleton.component";
import { EmptyStateComponent } from "../../shared/components/empty-state.component";
import {
  fadeSlideIn,
  staggerList,
  cardEntrance,
} from "../../shared/animations";

@Component({
  selector: "app-categories",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CurrencyPipe,
    SkeletonComponent,
    EmptyStateComponent,
  ],
  animations: [fadeSlideIn, staggerList, cardEntrance],
  template: `
    <div class="cat-page" @fadeSlideIn>
      <div class="page-header">
        <div>
          <h1>Categories</h1>
          <p class="subtitle">Spending breakdown by category</p>
        </div>
      </div>

      <!-- Stats row -->
      @if (!loading() && categories().length > 0) {
        <div class="stats-row" @fadeSlideIn>
          <div class="stat-item">
            <span class="stat-label">Total tracked</span>
            <span class="stat-value">{{ categories().length }} categories</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-label">Highest spend</span>
            <span class="stat-value">{{ topCategory()?.name ?? "" }}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-label">Total expenses</span>
            <span class="stat-value">{{
              totalExpenses() | currency: "USD" : "symbol" : "1.0-0"
            }}</span>
          </div>
        </div>
      }

      <!-- Grid -->
      <div class="cat-grid" [@staggerList]="categories().length">
        @if (loading()) {
          @for (s of [1, 2, 3, 4, 5, 6, 7, 8, 9]; track s) {
            <div class="cat-card skeleton-card" @cardEntrance>
              <div class="sk-icon"></div>
              <app-skeleton height="16px" width="80px" radius="5px" />
              <app-skeleton height="24px" width="100px" radius="5px" />
              <app-skeleton height="6px" width="100%" radius="99px" />
            </div>
          }
        } @else if (categories().length === 0) {
          <div class="empty-wrap">
            <app-empty-state
              icon="🏷️"
              title="No categories yet"
              message="Add some transactions to see categories appear here."
              actionLink="/transactions/new"
              actionLabel="+ New Transaction"
            />
          </div>
        } @else {
          @for (cat of categories(); track cat.id) {
            <div class="cat-card" @cardEntrance [style.--cat-color]="cat.color">
              <div class="cat-icon-wrap" [style.background]="cat.color + '22'">
                <span class="cat-icon">{{ cat.icon }}</span>
              </div>
              <span class="cat-name">{{ cat.name }}</span>
              <span class="cat-total">{{
                cat.total | currency: "USD" : "symbol" : "1.0-0"
              }}</span>
              <div class="cat-bar">
                <div
                  class="cat-fill"
                  [style.width.%]="percentage(cat.total)"
                  [style.background]="cat.color"
                ></div>
              </div>
              <span class="cat-pct"
                >{{ percentage(cat.total) | number: "1.0-0" }}% of total</span
              >
              <a
                [routerLink]="['/transactions']"
                [queryParams]="{ category: cat.name }"
                class="cat-link"
                >View transactions →</a
              >
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [
    `
      .cat-page {
        display: flex;
        flex-direction: column;
        gap: 28px;
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

      /* Stats */
      .stats-row {
        display: flex;
        align-items: center;
        gap: 0;
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
        padding: 18px 24px;
        flex-wrap: wrap;
        gap: 16px;
      }
      .stat-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        min-width: 140px;
      }
      .stat-label {
        font-size: 11px;
        font-weight: 700;
        color: #aaa;
        text-transform: uppercase;
        letter-spacing: 0.6px;
      }
      .stat-value {
        font-family: "Clash Display", sans-serif;
        font-size: 18px;
        font-weight: 700;
        color: #111;
      }
      .stat-divider {
        width: 1px;
        height: 36px;
        background: rgba(0, 0, 0, 0.07);
        flex-shrink: 0;
      }

      /* Grid */
      .cat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 16px;
      }
      .empty-wrap {
        grid-column: 1 / -1;
      }

      .cat-card {
        background: white;
        border-radius: 14px;
        padding: 22px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
        display: flex;
        flex-direction: column;
        gap: 10px;
        transition:
          transform 0.18s ease,
          box-shadow 0.18s ease;
        cursor: default;
        border: 1.5px solid transparent;
      }
      .cat-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
        border-color: var(--cat-color, rgba(0, 0, 0, 0.08));
      }

      .cat-icon-wrap {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cat-icon {
        font-size: 22px;
      }
      .cat-name {
        font-size: 15px;
        font-weight: 700;
        color: #111;
      }
      .cat-total {
        font-family: "Clash Display", sans-serif;
        font-size: 22px;
        font-weight: 700;
        color: #111;
        letter-spacing: -0.3px;
      }

      .cat-bar {
        height: 5px;
        background: #f0f0ec;
        border-radius: 99px;
        overflow: hidden;
      }
      .cat-fill {
        height: 100%;
        border-radius: 99px;
        transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .cat-pct {
        font-size: 11px;
        color: #aaa;
        font-weight: 600;
      }

      .cat-link {
        font-size: 12px;
        color: #ff5c4d;
        text-decoration: none;
        font-weight: 600;
        margin-top: 2px;
        opacity: 0;
        transition: opacity 0.15s;
      }
      .cat-card:hover .cat-link {
        opacity: 1;
      }

      /* Skeleton */
      .skeleton-card {
        gap: 12px;
      }
      .sk-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: linear-gradient(
          90deg,
          #e8e8e4 25%,
          #f0f0ec 50%,
          #e8e8e4 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.4s ease-in-out infinite;
      }
      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      @media (max-width: 480px) {
        .cat-grid {
          grid-template-columns: 1fr 1fr;
        }
        .stat-divider {
          display: none;
        }
      }
    `,
  ],
})
export class CategoriesComponent implements OnInit {
  private financeService = inject(FinanceService);

  categories = signal<Category[]>([]);
  loading = signal(true);

  topCategory = () => {
    const sorted = [...this.categories()].sort((a, b) => b.total - a.total);
    return sorted[0] ?? null;
  };

  totalExpenses = () => this.categories().reduce((sum, c) => sum + c.total, 0);

  percentage(total: number): number {
    const max = this.totalExpenses();
    if (!max) return 0;
    return (total / max) * 100;
  }

  ngOnInit() {
    this.financeService.getCategories().subscribe((data) => {
      this.categories.set(data);
      this.loading.set(false);
    });
  }
}
