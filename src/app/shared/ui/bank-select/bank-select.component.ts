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
} from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms'
import { NgIcon } from '@ng-icons/core'
import { TranslatePipe } from '../../../core/pipes/translate.pipe'
import { FtSubtleRevealDirective } from '../../../shared/directives/ft-subtle-reveal.directive'
import type { BankSummary } from '../../../core/models/bank.model'

@Component({
  selector: 'ft-bank-select',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe, FtSubtleRevealDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BankSelectComponent),
      multi: true,
    },
  ],
  templateUrl: './bank-select.component.html',
  styleUrl: './bank-select.component.scss',
})
export class BankSelectComponent implements ControlValueAccessor {
  readonly banks = input.required<BankSummary[]>()
  readonly placeholder = input<string>('Select a bank')
  readonly addBank = output<void>()

  private el = inject(ElementRef)

  readonly isOpen = signal(false)
  readonly searchQuery = signal('')
  readonly highlightedIndex = signal(-1)

  // CVA
  private _value = signal<string>('')
  private onChange: (value: string) => void = () => {}
  private onTouched: () => void = () => {}

  readonly filteredBanks = computed(() => {
    const query = this.searchQuery().toLowerCase().trim()
    if (!query) return this.banks()
    return this.banks().filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        (b.domain && b.domain.toLowerCase().includes(query))
    )
  })

  readonly selectedBank = computed(() => {
    const val = this._value()
    if (!val) return null
    return this.banks().find((b) => b.id === val) || null
  })

  writeValue(value: string): void {
    this._value.set(value ?? '')
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    this.el.nativeElement.classList.toggle('disabled', isDisabled)
  }

  toggle(): void {
    if (this.isOpen()) this.close()
    else this.open()
  }

  open(): void {
    this.isOpen.set(true)
    this.searchQuery.set('')
    this.highlightedIndex.set(-1)
  }

  close(): void {
    this.isOpen.set(false)
    this.searchQuery.set('')
    this.highlightedIndex.set(-1)
    this.onTouched()
  }

  selectBank(id: string): void {
    this._value.set(id)
    this.onChange(id)
    this.close()
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value
    this.searchQuery.set(value)
    this.highlightedIndex.set(0)
  }

  onKeyDown(event: KeyboardEvent): void {
    const items = this.filteredBanks()
    if (!this.isOpen()) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault()
        this.open()
      }
      return
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        this.close()
        break
      case 'ArrowDown':
        event.preventDefault()
        this.highlightedIndex.set(Math.min(this.highlightedIndex() + 1, items.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        this.highlightedIndex.set(Math.max(this.highlightedIndex() - 1, 0))
        break
      case 'Enter':
        event.preventDefault()
        const idx = this.highlightedIndex()
        if (idx >= 0 && idx < items.length) {
          this.selectBank(items[idx].id)
        }
        break
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.el.nativeElement.contains(event.target)) {
      this.close()
    }
  }

  onAddBank(): void {
    this.close()
    this.addBank.emit()
  }

  trackByBank(_index: number, bank: BankSummary): string {
    return bank.id
  }
}
