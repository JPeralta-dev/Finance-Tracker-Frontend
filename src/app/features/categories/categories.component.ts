import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
import { modalAnimation } from '../../shared/animations';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    BrowserAnimationsModule,
    FtCurrencyPipe,
    SkeletonComponent,
    EmptyStateComponent,
    NgIcon,
    TranslatePipe,
    CategoryTranslatePipe,
    FtSubtleRevealDirective,
  ],
  providers: [provideIcons(ICONS)],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  animations: [modalAnimation],
})
export class CategoriesComponent implements OnInit {
  private financeService = inject(FinanceService);
  private toast = inject(ToastService);
  private i18n = inject(TranslationService);

  categories = signal<Category[]>([]);
  loading = signal(true);
  submitting = signal(false);

  // Form state
  showForm = signal(false);
  editingCategory = signal<Category | null>(null);
  formName = signal('');
  formIcon = signal('');
  formColor = signal('#9D50BB');
  formKind = signal<'income' | 'expense' | 'mixed'>('expense');

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
    this.editingCategory.set(null);
    this.formName.set('');
    this.formIcon.set('');
    this.formColor.set('#9D50BB');
    this.formKind.set('expense');
    this.showForm.set(true);
  }

  openEditForm(cat: Category): void {
    this.editingCategory.set(cat);
    this.formName.set(cat.name);
    this.formIcon.set(cat.icon);
    this.formColor.set(cat.color);
    this.formKind.set(cat.kind);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingCategory.set(null);
  }

  onAnimationDone(event: AnimationEvent): void {
    if (event.toState === 'void') {
      this.editingCategory.set(null);
    }
  }

  submitForm(): void {
    if (!this.formName() || !this.formColor()) return;

    this.submitting.set(true);
    const payload = {
      name: this.formName(),
      icon: this.formIcon() || this.categoryMark(this.formName()),
      color: this.formColor(),
      kind: this.formKind(),
    };

    const request = this.editingCategory()
      ? this.financeService.updateCategory(this.editingCategory()!.id, payload)
      : this.financeService.createCategory(payload);

    request.subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeForm();
        this.loadCategories();
        this.toast.success(
          this.editingCategory() ? this.i18n.translate('common.toasts.category_updated') : this.i18n.translate('common.toasts.category_created')
        );
      },
      error: (err) => {
        this.submitting.set(false);
        this.toast.error(err.error?.message || this.i18n.translate('common.toasts.category_save_failed'));
      },
    });
  }

  deleteCategory(cat: Category): void {
    if (cat.isDefault) {
      this.toast.error(this.i18n.translate('common.toasts.category_cannot_delete'));
      return;
    }

    const catName = this.i18n.translate(cat.name);
    if (confirm(`Delete "${catName}"? Transactions will be moved to "Other".`)) {
      this.financeService.deleteCategory(cat.id).subscribe({
        next: () => {
          this.loadCategories();
          this.toast.success(this.i18n.translate('common.toasts.category_deleted'));
        },
        error: (err) => {
          this.toast.error(err.error?.message || this.i18n.translate('common.toasts.category_delete_failed'));
        },
      });
    }
  }
}
