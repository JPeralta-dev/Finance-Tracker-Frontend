import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../../icons/icon-registry';
import { ModalService } from '../../../core/services/modal.service';
import { FinanceService } from '../../../core/services/finance.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { CategoryTranslatePipe } from '../../../core/pipes/category-translate.pipe';

@Component({
  selector: 'ft-category-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, TranslatePipe, CategoryTranslatePipe],
  template: `
    @if (isVisible()) {
      <div
        class="modal-overlay t-modal"
        [class.is-open]="isOpen()"
        [class.is-closing]="isClosing()"
        (click)="close()"
      >
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ (modal().isEditing ? 'categories.edit_title' : 'categories.new_title') | translate }}</h2>
            <button class="modal-close" (click)="close()">
              <ng-icon name="close" size="1.25rem" />
            </button>
          </div>

          <form (ngSubmit)="submit()" class="modal-form">
            <!-- Name -->
            <div class="form-group">
              <label>{{ 'categories.form.name' | translate }}</label>
              <input
                type="text"
                [ngModel]="modal().formData.name"
                (ngModelChange)="updateField('name', $event)"
                name="name"
                required
                maxlength="50"
                [placeholder]="'categories.form.name_placeholder' | translate"
              />
            </div>

            <!-- Kind -->
            <div class="form-group">
              <label>{{ 'categories.form.kind' | translate }}</label>
              <div class="kind-toggle">
                <button type="button" class="kind-btn" [class.active]="modal().formData.kind === 'expense'" (click)="updateField('kind', 'expense')">
                  {{ 'categories.form.expense' | translate }}
                </button>
                <button type="button" class="kind-btn" [class.active]="modal().formData.kind === 'income'" (click)="updateField('kind', 'income')">
                  {{ 'categories.form.income' | translate }}
                </button>
                <button type="button" class="kind-btn" [class.active]="modal().formData.kind === 'mixed'" (click)="updateField('kind', 'mixed')">
                  {{ 'categories.form.mixed' | translate }}
                </button>
              </div>
            </div>

            <!-- Color -->
            <div class="form-group">
              <label>{{ 'categories.form.color' | translate }}</label>
              <div class="color-picker">
                <input type="color" [ngModel]="modal().formData.color" (ngModelChange)="updateField('color', $event)" name="color" />
                <span>{{ modal().formData.color }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="modal-actions">
              <button type="button" class="btn-cancel" (click)="close()">
                {{ 'common.cancel' | translate }}
              </button>
              <button type="submit" class="btn-submit" [disabled]="submitting()">
                @if (submitting()) {
                  <span class="spinner"></span>
                }
                {{ 'common.save' | translate }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styleUrl: './category-modal.component.scss',
})
export class CategoryModalComponent {
  private modalService = inject(ModalService);
  private financeService = inject(FinanceService);
  private toast = inject(ToastService);
  private i18n = inject(TranslationService);

  readonly modal = this.modalService.categoryModal;
  readonly submitting = signal(false);

  // Modal CSS transition state machine
  readonly isVisible = signal(false);
  readonly isOpen = signal(false);
  readonly isClosing = signal(false);

  constructor() {
    effect(() => {
      const state = this.modal();
      const wantsOpen = state.isOpen;
      if (wantsOpen) {
        this.isVisible.set(true);
        // Next tick: trigger open animation
        requestAnimationFrame(() => this.isOpen.set(true));
      } else if (this.isVisible()) {
        // Start close animation
        this.isOpen.set(false);
        this.isClosing.set(true);
        // Read close duration from CSS custom property
        const closeMs = this.readCloseDuration();
        setTimeout(() => {
          this.isClosing.set(false);
          this.isVisible.set(false);
        }, closeMs);
      }
    });
  }

  private readCloseDuration(): number {
    const val = getComputedStyle(document.documentElement)
      .getPropertyValue('--modal-close-dur')
      .trim();
    return parseFloat(val) || 150;
  }

  updateField(field: string, value: string): void {
    this.modalService.updateFormData({ [field]: value });
  }

  close(): void {
    this.modalService.closeCategoryModal();
  }

  submit(): void {
    const data = this.modal().formData;
    if (!data.name || !data.color) return;

    this.submitting.set(true);

    const payload = {
      name: data.name,
      icon: data.icon || this.categoryMark(data.name),
      color: data.color,
      kind: data.kind,
    };

    const request = this.modal().isEditing && this.modal().editingId
      ? this.financeService.updateCategory(this.modal().editingId!, payload)
      : this.financeService.createCategory(payload);

    request.subscribe({
      next: () => {
        this.submitting.set(false);
        this.modalService.notifyCategorySaved();
        this.close();
        this.toast.success(
          this.modal().isEditing
            ? this.i18n.translate('common.toasts.category_updated')
            : this.i18n.translate('common.toasts.category_created')
        );
      },
      error: (err) => {
        this.submitting.set(false);
        this.toast.error(err.error?.message || this.i18n.translate('common.toasts.category_save_failed'));
      },
    });
  }

  private categoryMark(name: string): string {
    return name
      .split(/[^A-Za-z0-9]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join('') || 'OT';
  }
}
