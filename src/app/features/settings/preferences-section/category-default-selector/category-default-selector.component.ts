import { Component, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { firstValueFrom } from 'rxjs';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { FtSubtleRevealDirective } from '../../../../shared/directives/ft-subtle-reveal.directive';
import { FinanceService } from '../../../../core/services/finance.service';
import type { Category } from '../../../../core/models/category.model';

@Component({
  selector: 'app-category-default-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, TranslatePipe, FtSubtleRevealDirective],
  templateUrl: './category-default-selector.component.html',
  styleUrl: './category-default-selector.component.scss',
})
export class CategoryDefaultSelectorComponent implements OnInit {
  private readonly financeService = inject(FinanceService);

  delay = input<number>(0);

  readonly categories = signal<Category[]>([]);
  readonly selectedId = signal<string | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);

  ngOnInit(): void {
    this.load();
  }

  get expenseCategories(): Category[] {
    return this.categories().filter((c) => c.kind === 'expense');
  }

  get hasChanges(): boolean {
    return this.selectedId() !== (this._savedId ?? null);
  }

  private _savedId: string | null = null;

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [cats, pref] = await Promise.all([
        firstValueFrom(this.financeService.getCategories()),
        firstValueFrom(this.financeService.getDefaultCategory()),
      ]);
      this.categories.set(cats ?? []);
      this.selectedId.set(pref?.defaultCategoryId ?? null);
      this._savedId = pref?.defaultCategoryId ?? null;
    } catch {
      this.error.set('Error loading preferences');
    } finally {
      this.loading.set(false);
    }
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.error.set(null);
    this.success.set(false);
    try {
      const res = await firstValueFrom(this.financeService.setDefaultCategory(this.selectedId()));
      this._savedId = res?.defaultCategoryId ?? null;
      this.selectedId.set(this._savedId);
      this.success.set(true);
    } catch {
      this.error.set('Error saving preference');
    } finally {
      this.saving.set(false);
    }
  }
}
