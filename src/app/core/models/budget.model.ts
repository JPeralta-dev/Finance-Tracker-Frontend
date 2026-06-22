export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  categoryName?: string;
  monthlyLimit: number;
  alertThreshold: number;
  spentThisMonth: number;
  periodStart: string;
  createdAt: string;
}

export interface CreateBudgetDto {
  categoryId: string;
  monthlyLimit: number;
  alertThreshold?: number;
}

export interface UpdateBudgetDto {
  monthlyLimit?: number;
  alertThreshold?: number;
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  categoryId: string;
  categoryName?: string;
  spentAmount: number;
  limitAmount: number;
  thresholdPercent: number;
  currentPercent: number;
  message: string;
  createdAt: string;
}
