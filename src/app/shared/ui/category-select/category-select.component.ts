import {
  Component,
  forwardRef,
  signal,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { ICONS, getCategoryIcon } from '../../icons/icon-registry';
import { Category } from '../../../core/models/category.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { CategoryTranslatePipe } from '../../../core/pipes/category-translate.pipe';
import { FtSubtleRevealDirective } from '../../../shared/directives/ft-subtle-reveal.directive';

interface CategoryOption extends Category {
  iconKey: string;
}

@Component({
  selector: 'ft-category-select',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe, CategoryTranslatePipe, FtSubtleRevealDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CategorySelectComponent),
      multi: true,
    },
  ],
  templateUrl: './category-select.component.html',
  styleUrl: './category-select.component.scss',
})
export class CategorySelectComponent implements ControlValueAccessor {
  readonly categories = input.required<CategoryOption[]>();
  readonly placeholder = input<string>('Select a category');
  readonly addCategory = output<void>();

  private el = inject(ElementRef);

  // State
  readonly isOpen = signal(false);
  readonly searchQuery = signal('');
  readonly highlightedIndex = signal(-1);

  // CVA
  private _value = '';
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  // Computed
  readonly filteredCategories = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.categories();
    return this.categories().filter((cat) =>
      cat.name.toLowerCase().includes(query)
    );
  });

  readonly selectedCategory = computed(() => {
    if (!this._value) return null;
    return this.categories().find((c) => c.name === this._value) || null;
  });

  // CVA methods
  writeValue(value: string): void {
    this._value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Optional: handle disabled state via CSS class
    this.el.nativeElement.classList.toggle('disabled', isDisabled);
  }

  // Actions
  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    this.isOpen.set(true);
    this.searchQuery.set('');
    this.highlightedIndex.set(-1);
  }

  close(): void {
    this.isOpen.set(false);
    this.searchQuery.set('');
    this.highlightedIndex.set(-1);
    this.onTouched();
  }

  selectCategory(name: string): void {
    this._value = name;
    this.onChange(name);
    this.close();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.highlightedIndex.set(0);
  }

  onKeyDown(event: KeyboardEvent): void {
    const items = this.filteredCategories();
    if (!this.isOpen()) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        this.open();
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex.set(
          Math.min(this.highlightedIndex() + 1, items.length - 1)
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex.set(
          Math.max(this.highlightedIndex() - 1, 0)
        );
        break;
      case 'Enter':
        event.preventDefault();
        const idx = this.highlightedIndex();
        if (idx >= 0 && idx < items.length) {
          this.selectCategory(items[idx].name);
        }
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (
      this.isOpen() &&
      !this.el.nativeElement.contains(event.target)
    ) {
      this.close();
    }
  }

  onAddCategory(): void {
    this.close();
    this.addCategory.emit();
  }

  trackByCategory(_index: number, cat: CategoryOption): string {
    return cat.id;
  }
}
