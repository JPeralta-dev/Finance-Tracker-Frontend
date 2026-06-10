import { Component, OnInit, signal, inject, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Subscription } from 'rxjs';
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
  providers: [provideIcons(ICONS)],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit, OnDestroy {
  private financeService = inject(FinanceService);
  private toast = inject(ToastService);
  private i18n = inject(TranslationService);
  private modalService = inject(ModalService);

  categories = signal<Category[]>([]);
  loading = signal(true);

  // Confirm dialog state
  confirmVisible = signal(false);
  private pendingDeleteCategory: Category | null = null;

  private categorySavedSub?: Subscription;

  // Computed
  topCategory = computed(() => {
    const sorted = [...this.categories()].sort((a, b) => b.total - a.total);
    return sorted[0] ?? { name: '-' };
  });

  totalExpenses = computed(() =>
    this.categories().reduce((sum, c) => sum + c.total, 0)
  );

  ngOnInit(): void {
    this.loadCategories();
    this.categorySavedSub = this.modalService.categorySaved$.subscribe(() => {
      this.loadCategories();
    });
  }

  ngOnDestroy(): void {
    this.categorySavedSub?.unsubscribe();
  }

  private loadCategories(): void {
    this.loading.set(true);
    this.financeService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error(this.i18n.translate('common.toasts.categories_load_failed'));
      },
    });
  }

  percentage(total: number): number {
    const max = this.totalExpenses();
    if (!max) return 0;
    return (total / max) * 100;
  }

  categoryMark(name: string): string {
    return name
      .split(/[^A-Za-z0-9]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join('') || 'OT';
  }

  // CRUD Actions
  openCreateForm(): void {
    this.modalService.openCategoryModal({
      name: '',
      icon: '',
      color: '#9D50BB',
      kind: 'expense',
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

