import {
  Component,
  signal,
  inject,
  OnInit,
  computed,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, of, finalize } from 'rxjs';

import { IconComponent } from '../../../shared/icons/icon.component';

import { GoalsService } from '../../../core/services/goals.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { ToastService } from '../../../core/services/toast.service';
import { Goal, CreateGoalDto, UpdateGoalDto, GoalProjection } from '../../../core/models/goal.model';

type PageState = 'loading' | 'ready' | 'empty' | 'error';
type ModalMode = 'create' | 'edit' | 'add-amount' | null;

interface GoalWithProjection extends Goal {
  projection?: GoalProjection;
  monthsEstimate?: number | null;
}

@Component({
  selector: 'ft-goals-page',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './goals.page.html',
  styleUrl: './goals.page.scss',
})
export class GoalsPage implements OnInit {
  private readonly goalsService = inject(GoalsService);
  private readonly currencyService = inject(CurrencyService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly goals = signal<GoalWithProjection[]>([]);
  readonly state = signal<PageState>('loading');

  // Modal state
  readonly modalMode = signal<ModalMode>(null);
  readonly selectedGoal = signal<GoalWithProjection | null>(null);

  // Form fields
  readonly formName = signal('');
  readonly formTargetAmount = signal<number | null>(null);
  readonly formDeadline = signal('');
  readonly formAddAmount = signal<number | null>(null);
  readonly formError = signal('');

  // Confirm delete
  readonly goalToDelete = signal<Goal | null>(null);
  readonly showDeleteConfirm = signal(false);

  readonly currencySymbol = computed(() => this.currencyService.currencyConfig().symbol);

  ngOnInit(): void {
    this.loadGoals();
  }

  // ─── Load goals ────────────────────────────────────────────────

  loadGoals(): void {
    this.state.set('loading');
    this.goalsService.getGoals().pipe(
      catchError(() => {
        this.state.set('error');
        return of([]);
      }),
    ).subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.state.set('empty');
          this.goals.set([]);
        } else {
          const goalsWithProjection = data.map(g => ({
            ...g,
            monthsEstimate: this.estimateMonths(g),
          }));
          this.goals.set(goalsWithProjection);
          this.state.set('ready');
        }
      },
    });
  }

  // ─── Progress helpers ──────────────────────────────────────────

  progress(goal: Goal): number {
    if (goal.targetAmount <= 0) return 0;
    return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  }

  remaining(goal: Goal): number {
    return Math.max(0, goal.targetAmount - goal.currentAmount);
  }

  estimateMonths(goal: Goal): number | null {
    const remaining = this.remaining(goal);
    if (remaining <= 0) return 0;
    const created = new Date(goal.createdAt);
    const now = new Date();
    const monthsElapsed = Math.max(1, (now.getTime() - created.getTime()) / (30 * 24 * 60 * 60 * 1000));
    const monthlyRate = goal.currentAmount / monthsElapsed;
    if (monthlyRate <= 0) return null;
    return Math.ceil(remaining / monthlyRate);
  }

  formatCurrency(value: number): string {
    return this.currencyService.format(value);
  }

  // ─── Modal: Create ─────────────────────────────────────────────

  openCreateModal(): void {
    this.modalMode.set('create');
    this.formName.set('');
    this.formTargetAmount.set(null);
    this.formDeadline.set('');
    this.formError.set('');
  }

  // ─── Modal: Edit ───────────────────────────────────────────────

  openEditModal(goal: GoalWithProjection): void {
    this.selectedGoal.set(goal);
    this.modalMode.set('edit');
    this.formName.set(goal.name);
    this.formTargetAmount.set(goal.targetAmount);
    this.formDeadline.set(goal.deadline ? goal.deadline.split('T')[0] : '');
    this.formError.set('');
  }

  // ─── Modal: Add amount ─────────────────────────────────────────

  openAddAmountModal(goal: GoalWithProjection): void {
    this.selectedGoal.set(goal);
    this.modalMode.set('add-amount');
    this.formAddAmount.set(null);
    this.formError.set('');
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.selectedGoal.set(null);
    this.formError.set('');
  }

  // ─── Form submission ───────────────────────────────────────────

  validateForm(): boolean {
    const name = this.formName().trim();
    const targetAmount = this.formTargetAmount();

    if (!name) {
      this.formError.set('El nombre es obligatorio');
      return false;
    }
    if (!targetAmount || targetAmount <= 0) {
      this.formError.set('El monto objetivo debe ser mayor a 0');
      return false;
    }
    return true;
  }

  onSubmitCreate(): void {
    if (!this.validateForm()) return;

    const dto: CreateGoalDto = {
      name: this.formName().trim(),
      targetAmount: this.formTargetAmount()!,
      currentAmount: 0,
      deadline: this.formDeadline() || '',
    };

    this.goalsService.createGoal(dto).pipe(
      catchError(() => {
        this.formError.set('Error al crear la meta. Intentá de nuevo.');
        return of(null);
      }),
    ).subscribe({
      next: (goal) => {
        if (goal) {
          this.toast.success('Meta creada', `"${goal.name}" fue creada exitosamente`);
          this.closeModal();
          this.loadGoals();
        }
      },
    });
  }

  onSubmitEdit(): void {
    if (!this.validateForm()) return;
    const goal = this.selectedGoal();
    if (!goal) return;

    const dto: UpdateGoalDto = {
      name: this.formName().trim(),
      targetAmount: this.formTargetAmount()!,
    };
    if (this.formDeadline()) {
      dto.deadline = this.formDeadline();
    }

    this.goalsService.updateGoal(goal.id, dto).pipe(
      catchError(() => {
        this.formError.set('Error al actualizar la meta. Intentá de nuevo.');
        return of(null);
      }),
    ).subscribe({
      next: (updated) => {
        if (updated) {
          this.toast.success('Meta actualizada', `"${updated.name}" fue actualizada`);
          this.closeModal();
          this.loadGoals();
        }
      },
    });
  }

  onSubmitAddAmount(): void {
    const amount = this.formAddAmount();
    const goal = this.selectedGoal();
    if (!amount || amount <= 0 || !goal) {
      this.formError.set('Ingresá un monto válido mayor a 0');
      return;
    }

    const dto: UpdateGoalDto = {
      currentAmount: goal.currentAmount + amount,
    };

    this.goalsService.updateGoal(goal.id, dto).pipe(
      catchError(() => {
        this.formError.set('Error al actualizar el progreso. Intentá de nuevo.');
        return of(null);
      }),
    ).subscribe({
      next: (updated) => {
        if (updated) {
          this.toast.success('Progreso actualizado', `Se agregaron ${this.formatCurrency(amount)} a "${updated.name}"`);
          this.closeModal();
          this.loadGoals();
        }
      },
    });
  }

  // ─── Delete ────────────────────────────────────────────────────

  confirmDelete(goal: Goal): void {
    this.goalToDelete.set(goal);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.goalToDelete.set(null);
    this.showDeleteConfirm.set(false);
  }

  executeDelete(): void {
    const goal = this.goalToDelete();
    if (!goal) return;

    this.goalsService.deleteGoal(goal.id).pipe(
      catchError(() => {
        this.toast.error('Error', 'No se pudo eliminar la meta');
        return of(null);
      }),
    ).subscribe({
      next: () => {
        this.toast.success('Meta eliminada', `"${goal.name}" fue eliminada`);
        this.cancelDelete();
        this.loadGoals();
      },
    });
  }

  // ─── Retry ─────────────────────────────────────────────────────

  retry(): void {
    this.loadGoals();
  }

  // ─── Emoji helper ──────────────────────────────────────────────

  /** Return an emoji icon based on goal name keywords */
  getGoalEmoji(goal: Goal): string {
    const name = goal.name.toLowerCase();
    if (name.includes('moto') || name.includes('auto') || name.includes('carro')) return '🏍️';
    if (name.includes('viaje') || name.includes('vacacion') || name.includes('europa')) return '✈️';
    if (name.includes('casa') || name.includes('depa') || name.includes('apartamento')) return '🏠';
    if (name.includes('educa') || name.includes('curso') || name.includes('master')) return '📚';
    if (name.includes('emergencia') || name.includes('fondo') || name.includes('reserva')) return '🛡️';
    if (name.includes('tech') || name.includes('compu') || name.includes('laptop') || name.includes('celular')) return '💻';
    if (name.includes('inversion') || name.includes('invertir') || name.includes('crypto')) return '📈';
    if (name.includes('boda') || name.includes('casamiento')) return '💍';
    if (name.includes('salud') || name.includes('dentista') || name.includes('medico')) return '🏥';
    return '🎯';
  }
}
