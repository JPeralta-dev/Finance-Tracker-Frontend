import { Component, ChangeDetectionStrategy, input, output, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { Pocket } from '../../../../core/models/pocket.model';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { FtCurrencyPipe } from '../../../../core/pipes/ft-currency.pipe';

@Component({
  selector: 'ft-fund-pocket-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, TranslatePipe, FtCurrencyPipe],
  templateUrl: './fund-pocket-modal.component.html',
  styleUrl: './fund-pocket-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FundPocketModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly pocketId = input<string | null>(null);
  readonly suggestedAmount = input<number | null>(null);
  readonly pockets = input<Pocket[]>([]);

  readonly close = output<void>();
  readonly fund = output<{ pocketId: string; amount: number }>();

  readonly selectedPocketId = signal<string>('');
  readonly amount = signal<number>(0);

  readonly targetPocket = computed(() => {
    const id = this.selectedPocketId();
    return this.pockets().find((p) => p.id === id) ?? null;
  });

  constructor() {
    effect(() => {
      const pid = this.pocketId();
      if (pid) {
        this.selectedPocketId.set(pid);
      } else if (this.pockets().length > 0) {
        this.selectedPocketId.set(this.pockets()[0].id);
      }

      const suggested = this.suggestedAmount();
      if (suggested && suggested > 0) {
        this.amount.set(suggested);
      }
    });
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

  onSubmit(): void {
    const pId = this.selectedPocketId();
    const amt = Number(this.amount());
    if (pId && amt > 0) {
      this.fund.emit({ pocketId: pId, amount: amt });
    }
  }
}
