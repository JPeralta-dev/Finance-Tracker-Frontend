export type GoalStatus = 'active' | 'achieved' | 'expired';

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  categoryId?: string;
  status: GoalStatus;
  createdAt: string;
}

export interface CreateGoalDto {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  deadline: string;
  categoryId?: string;
}

export interface UpdateGoalDto {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: string;
  categoryId?: string;
  status?: GoalStatus;
}

export interface GoalProjection {
  projectedBalance: number;
  projectedSavings: number;
  monthsUntilGoal: number | null;
  confidence: 'low' | 'medium' | 'high';
}
