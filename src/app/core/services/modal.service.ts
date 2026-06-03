import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  kind: 'income' | 'expense' | 'mixed';
}

export interface CategoryModalState {
  isOpen: boolean;
  isEditing: boolean;
  editingId: string | null;
  formData: CategoryFormData;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly _categoryModal = signal<CategoryModalState>({
    isOpen: false,
    isEditing: false,
    editingId: null,
    formData: { name: '', icon: '', color: '#9D50BB', kind: 'expense' },
  });

  readonly categoryModal = this._categoryModal.asReadonly();

  // Event emitted when a category is saved (create or update)
  private readonly _categorySaved = new Subject<void>();
  readonly categorySaved$ = this._categorySaved.asObservable();

  openCategoryModal(data?: Partial<CategoryFormData>, editingId?: string | null): void {
    this._categoryModal.set({
      isOpen: true,
      isEditing: !!editingId,
      editingId: editingId || null,
      formData: {
        name: data?.name || '',
        icon: data?.icon || '',
        color: data?.color || '#9D50BB',
        kind: data?.kind || 'expense',
      },
    });
  }

  closeCategoryModal(): void {
    this._categoryModal.set({
      isOpen: false,
      isEditing: false,
      editingId: null,
      formData: { name: '', icon: '', color: '#9D50BB', kind: 'expense' },
    });
  }

  updateFormData(updates: Partial<CategoryFormData>): void {
    this._categoryModal.update(state => ({
      ...state,
      formData: { ...state.formData, ...updates },
    }));
  }

  notifyCategorySaved(): void {
    this._categorySaved.next();
  }
}
