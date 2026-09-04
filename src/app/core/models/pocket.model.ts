export interface PocketResponse {
  id: string;
  userId: string;
  name: string;
  percentage: number;
  monthlyLimit: number | null;
  currentSpending: number;
  percentageConsumed: number;
  isBotOriginated: boolean;
  linkedGoalId?: string | null;
  targetAmount?: number | null;
  currentBalance?: number;
  autoAllocateEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Pocket = PocketResponse;

export interface CreatePocketDto {
  name: string;
  percentage: number;
  monthlyLimit?: number | null;
  linkedGoalId?: string | null;
  targetAmount?: number | null;
  autoAllocateEnabled?: boolean;
}

export interface UpdatePocketDto {
  name?: string;
  percentage?: number;
  monthlyLimit?: number | null;
  linkedGoalId?: string | null;
  targetAmount?: number | null;
  autoAllocateEnabled?: boolean;
}

export interface PocketSpending {
  pocketId: string;
  totalSpending: number;
  monthlyLimit: number | null;
  percentageConsumed: number;
}

