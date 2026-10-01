import { Component, OnInit, signal, inject, computed, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../shared/icons/icon-registry';
import { FinanceService } from '../../core/services/finance.service';
import { Category } from '../../core/models/category.model';
import { SkeletonComponent } from '../../shared/components/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { CategoryTranslatePipe } from '../../core/pipes/category-translate.pipe';
import { FtSubtleRevealDirective } from '../../shared/directives/ft-subtle-reveal.directive';
import { ToastService } from '../../core/services/toast.service';
import { TranslationService } from '../../core/services/translation.service';
import { FtCurrencyPipe } from '../../core/pipes/ft-currency.pipe';
import { ModalService } from '../../core/services/modal.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { categoryMark } from '../../shared/utils/category-mark';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    FtCurrencyPipe,
    SkeletonComponent,
    EmptyStateComponent,
    NgIcon,
    TranslatePipe,
    CategoryTranslatePipe,
    FtSubtleRevealDirective,
    ConfirmDialogComponent,
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons(ICONS)],
})
export class CategoriesComponent implements OnInit {
  private financeService = inject(FinanceService);
  private toast = inject(ToastService);
  private i18n = inject(TranslationService);
  private modalService = inject(ModalService);
  private destroyRef = inject(DestroyRef);

  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal(false);
  activeTab = signal<'all' | 'expense' | 'income'>('all');
  readonly skeletonArray = Array.from({ length: 6 }, (_, i) => i);

  // Confirm dialog state
  confirmVisible = signal(false);
  private pendingDeleteCategory: Category | null = null;

  // Computed collections separated by conceptual kind
  expenseCategories = computed(() =>
    this.categories().filter((c) => c.kind === 'expense')
  );

  incomeCategories = computed(() =>
    this.categories().filter((c) => c.kind === 'income')
  );

  mixedCategories = computed(() =>
    this.categories().filter((c) => c.kind === 'mixed')
  );

  // Totals calculated strictly per kind
  totalExpenses = computed(() =>
    this.expenseCategories().reduce((sum, c) => sum + (c.total || 0), 0)
  );

  totalIncome = computed(() =>
    this.incomeCategories().reduce((sum, c) => sum + (c.total || 0), 0)
  );

  topExpenseCategory = computed(() => {
    const sorted = [...this.expenseCategories()].sort((a, b) => (b.total || 0) - (a.total || 0));
    return sorted[0] ?? { name: '-' };
  });

  topIncomeCategory = computed(() => {
    const sorted = [...this.incomeCategories()].sort((a, b) => (b.total || 0) - (a.total || 0));
    return sorted[0] ?? { name: '-' };
  });

  // Backward compatibility alias for topCategory
  topCategory = computed(() => this.topExpenseCategory());

  ngOnInit(): void {
    this.loadCategories();
    this.modalService.categorySaved$.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.loadCategories();
    });
  }

  private loadCategories(): void {
    this.loading.set(true);
    this.error.set(false);
    this.financeService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
        this.toast.error(this.i18n.translate('common.toasts.categories_load_failed'));
      },
    });
  }

  retry(): void {
    this.loadCategories();
  }

  setActiveTab(tab: 'all' | 'expense' | 'income'): void {
    this.activeTab.set(tab);
  }

  categoryPercentage(cat: Category): number {
    const base = cat.kind === 'income' ? this.totalIncome() : this.totalExpenses();
    if (!base || base <= 0) return 0;
    return Math.min(((cat.total || 0) / base) * 100, 100);
  }

  percentage(total: number, kind: 'expense' | 'income' | 'mixed' = 'expense'): number {
    const base = kind === 'income' ? this.totalIncome() : this.totalExpenses();
    if (!base || base <= 0) return 0;
    return Math.min((total / base) * 100, 100);
  }

  categoryMark = categoryMark;

  // CRUD Actions
  openCreateForm(kind: 'expense' | 'income' = 'expense'): void {
    this.modalService.openCategoryModal({
      name: '',
      icon: '',
      color: kind === 'income' ? '#10B981' : '#A855F7',
      kind: kind,
    });
  }

  openEditForm(cat: Category): void {
    this.modalService.openCategoryModal(
      {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        kind: cat.kind,
      },
      cat.id
    );
  }

  deleteCategory(cat: Category): void {
    if (cat.isDefault) {
      this.toast.error(this.i18n.translate('common.toasts.category_cannot_delete'));
      return;
    }

    this.pendingDeleteCategory = cat;
    this.confirmVisible.set(true);
  }

  onConfirmDelete(): void {
    const cat = this.pendingDeleteCategory;
    if (!cat) return;

    this.financeService.deleteCategory(cat.id).subscribe({
      next: () => {
        this.loadCategories();
        this.toast.success(this.i18n.translate('common.toasts.category_deleted'));
      },
      error: (err) => {
        this.toast.error(err.error?.message || this.i18n.translate('common.toasts.category_delete_failed'));
      },
    });

    this.confirmVisible.set(false);
    this.pendingDeleteCategory = null;
  }

  onCancelDelete(): void {
    this.confirmVisible.set(false);
    this.pendingDeleteCategory = null;
  }
}
