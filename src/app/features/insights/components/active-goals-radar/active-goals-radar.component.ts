import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { Goal, GoalHealthStatus } from '../../../../core/models/goal.model';
import { Pocket } from '../../../../core/models/pocket.model';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { FtCurrencyPipe } from '../../../../core/pipes/ft-currency.pipe';

@Component({
  selector: 'ft-active-goals-radar',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe, FtCurrencyPipe],
  templateUrl: './active-goals-radar.component.html',
  styleUrl: './active-goals-radar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveGoalsRadarComponent {
  readonly goals = input<Goal[]>([]);
  readonly pockets = input<Pocket[]>([]);

  readonly fundPocket = output<{ pocketId: string; goalId?: string; suggestedAmount?: number }>();
  readonly createGoal = output<void>();
  readonly editGoal = output<Goal>();

  getHealthIcon(health?: GoalHealthStatus): string {
    switch (health) {
      case 'on_track':
      case 'achieved':
        return 'check';
      case 'at_risk':
      case 'critical':
        return 'warning';
      default:
        return 'info';
    }
  }

  getPocketName(pocketId?: string): string | null {
    if (!pocketId) return null;
    const pocket = this.pockets().find((p) => p.id === pocketId);
    return pocket?.name ?? null;
  }

  onFundClicked(goal: Goal): void {
    if (goal.pocketId) {
      this.fundPocket.emit({
        pocketId: goal.pocketId,
        goalId: goal.id,
      });
    }
  }
}
