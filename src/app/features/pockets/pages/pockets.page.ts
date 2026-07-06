import {
  Component,
  signal,
  inject,
  OnInit,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';

import { IconComponent } from '../../../shared/icons/icon.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

import { PocketsService } from '../../../core/services/pockets.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { ToastService } from '../../../core/services/toast.service';
import { PocketResponse, CreatePocketDto, UpdatePocketDto } from '../../../core/models/pocket.model';

type PageState = 'loading' | 'ready' | 'empty' | 'error';
type ModalMode = 'create' | 'edit' | null;

@Component({
  selector: 'ft-pockets-page',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, TranslatePipe],
  templateUrl: './pockets.page.html',
  styleUrl: './pockets.page.scss',
})
export class PocketsPage implements OnInit {
  private readonly pocketsService = inject(PocketsService);
  private readonly currencyService = inject(CurrencyService);
  private readonly toast = inject(ToastService);

  readonly pockets = signal<PocketResponse[]>([]);
  readonly state = signal<PageState>('loading');

  // Modal state
  readonly modalMode = signal<ModalMode>(null);
  readonly selectedPocket = signal<PocketResponse | null>(null);

  // Form fields
  readonly formName = signal('');
  readonly formPercentage = signal<number | null>(null);
  readonly formMonthlyLimit = signal<number | null>(null);
  readonly formError = signal('');

  // Confirm delete
  readonly pocketToDelete = signal<PocketResponse | null>(null);
  readonly showDeleteConfirm = signal(false);

  readonly currencySymbol = computed(() => this.currencyService.currencyConfig().symbol);

  // Total percentage of all pockets (for validation)
  readonly totalPercentage = computed(() =>
    this.pockets().reduce((sum, p) => sum + p.percentage, 0),
  );

  ngOnInit(): void {
    this.loadPockets();
  }

  // ─── Load pockets ────────────────────────────────────────────────

  loadPockets(): void {
    this.state.set('loading');
    this.pocketsService.list().pipe(
      catchError(() => {
        this.state.set('error');
        return of([]);
      }),
    ).subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.state.set('empty');
          this.pockets.set([]);
        } else {
          this.pockets.set(data);
          this.state.set('ready');
        }
      },
    });
  }

  // ─── Progress helpers ────────────────────────────────────────────

  progress(pocket: PocketResponse): number {
    if (!pocket.monthlyLimit || pocket.monthlyLimit <= 0) return 0;
    return Math.min(100, Math.round((pocket.currentSpending / pocket.monthlyLimit) * 100));
  }

  remaining(pocket: PocketResponse): number {
    if (!pocket.monthlyLimit) return 0;
    return Math.max(0, pocket.monthlyLimit - pocket.currentSpending);
  }

  formatCurrency(value: number): string {
    return this.currencyService.format(value);
  }

  // ─── Percentage validation ───────────────────────────────────────

  canAddPercentage(newPercentage: number): boolean {
    const currentTotal = this.pockets()
      .filter(p => p.id !== this.selectedPocket()?.id)
      .reduce((sum, p) => sum + p.percentage, 0);
    return currentTotal + newPercentage <= 100;
  }

  remainingPercentage(): number {
    const currentTotal = this.pockets()
      .filter(p => p.id !== this.selectedPocket()?.id)
      .reduce((sum, p) => sum + p.percentage, 0);
    return 100 - currentTotal;
  }

  // ─── Modal: Create ───────────────────────────────────────────────

  openCreateModal(): void {
    this.modalMode.set('create');
    this.formName.set('');
    this.formPercentage.set(null);
    this.formMonthlyLimit.set(null);
    this.formError.set('');
  }

  // ─── Modal: Edit ─────────────────────────────────────────────────

  openEditModal(pocket: PocketResponse): void {
    this.selectedPocket.set(pocket);
    this.modalMode.set('edit');
    this.formName.set(pocket.name);
    this.formPercentage.set(pocket.percentage);
    this.formMonthlyLimit.set(pocket.monthlyLimit);
    this.formError.set('');
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.selectedPocket.set(null);
    this.formError.set('');
  }

  // ─── Form submission ─────────────────────────────────────────────

  validateForm(): boolean {
    const name = this.formName().trim();
    const percentage = this.formPercentage();

    if (!name) {
      this.formError.set('El nombre es obligatorio');
      return false;
    }
    if (!percentage || percentage <= 0 || percentage > 100) {
      this.formError.set('El porcentaje debe estar entre 1 y 100');
      return false;
    }
    if (!this.canAddPercentage(percentage)) {
      this.formError.set(`El total de porcentajes no puede superar 100%. Disponible: ${this.remainingPercentage()}%`);
      return false;
    }
    return true;
  }

  onSubmitCreate(): void {
    if (!this.validateForm()) return;

    const dto: CreatePocketDto = {
      name: this.formName().trim(),
      percentage: this.formPercentage()!,
      monthlyLimit: this.formMonthlyLimit() || null,
    };

    this.pocketsService.create(dto).pipe(
      catchError(() => {
        this.formError.set('Error al crear el pocket. Intentá de nuevo.');
        return of(null);
      }),
    ).subscribe({
      next: (pocket) => {
        if (pocket) {
          this.toast.success('Pocket creado', `"${pocket.name}" fue creado exitosamente`);
          this.closeModal();
          this.loadPockets();
        }
      },
    });
  }

  onSubmitEdit(): void {
    if (!this.validateForm()) return;
    const pocket = this.selectedPocket();
    if (!pocket) return;

    const dto: UpdatePocketDto = {
      name: this.formName().trim(),
      percentage: this.formPercentage()!,
    };
    if (this.formMonthlyLimit() !== null) {
      dto.monthlyLimit = this.formMonthlyLimit();
    }

    this.pocketsService.update(pocket.id, dto).pipe(
      catchError(() => {
        this.formError.set('Error al actualizar el pocket. Intentá de nuevo.');
        return of(null);
      }),
    ).subscribe({
      next: (updated) => {
        if (updated) {
          this.toast.success('Pocket actualizado', `"${updated.name}" fue actualizado`);
          this.closeModal();
          this.loadPockets();
        }
      },
    });
  }

  // ─── Delete ──────────────────────────────────────────────────────

  confirmDelete(pocket: PocketResponse): void {
    this.pocketToDelete.set(pocket);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.pocketToDelete.set(null);
    this.showDeleteConfirm.set(false);
  }

  executeDelete(): void {
    const pocket = this.pocketToDelete();
    if (!pocket) return;

    this.pocketsService.delete(pocket.id).pipe(
      catchError(() => {
        this.toast.error('Error', 'No se pudo eliminar el pocket');
        return of(null);
      }),
    ).subscribe({
      next: () => {
        this.toast.success('Pocket eliminado', `"${pocket.name}" fue eliminado`);
        this.cancelDelete();
        this.loadPockets();
      },
    });
  }

  // ─── Retry ───────────────────────────────────────────────────────

  retry(): void {
    this.loadPockets();
  }
}
