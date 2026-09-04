export type GoalType =
  | 'savings'               // Meta de ahorro/acumulación (ej. Casa, Viaje $2M)
  | 'monthly_ceiling'       // Techo global de gastos del mes (ej. Máx $3.5M/mes)
  | 'category_cap';         // Límite mensual en categoría/negocio (ej. Insumos < $200k)

export type GoalStatus = 'active' | 'achieved' | 'expired' | 'paused';

export type GoalHealthStatus =
  | 'on_track'     // ✅ Va al ritmo correcto
  | 'at_risk'      // ⚠️ Riesgo de pasarse o retrasarse
  | 'critical'     // 🔴 Sobrepasó el límite o no llegará a la fecha
  | 'achieved'     // 🎉 Cumplida
  | 'paused';      // ⏸️ En pausa

export interface GoalPacing {
  currentProgressPercent: number;    // % alcanzado o gastado hasta hoy
  timeElapsedPercent: number;        // % de días del mes/plazo transcurridos
  projectedEndAmount: number;        // Proyección al ritmo actual
  projectedCompletionDate?: string;  // Para 'savings': fecha estimada calculada
  dailyAllowanceRemaining?: number;  // Para 'caps': presupuesto restante por día
  daysRemaining: number;             // Días restantes en el periodo o plazo
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  type?: GoalType;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  period?: 'monthly' | 'weekly';
  pocketId?: string;
  categoryId?: string;
  categoryIds?: string[];
  autoAllocatePercent?: number;
  status: GoalStatus;
  health?: GoalHealthStatus;
  pacing?: GoalPacing;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateGoalDto {
  name: string;
  type?: GoalType;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string;
  period?: 'monthly' | 'weekly';
  pocketId?: string;
  categoryId?: string;
  categoryIds?: string[];
  autoAllocatePercent?: number;
}

export interface UpdateGoalDto {
  name?: string;
  type?: GoalType;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: string;
  period?: 'monthly' | 'weekly';
  pocketId?: string;
  categoryId?: string;
  categoryIds?: string[];
  autoAllocatePercent?: number;
  status?: GoalStatus;
}

export interface GoalProjection {
  projectedBalance: number;
  projectedSavings: number;
  monthsUntilGoal: number | null;
  confidence: 'low' | 'medium' | 'high';
}

