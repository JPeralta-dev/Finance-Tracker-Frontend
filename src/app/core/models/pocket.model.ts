export interface PocketResponse {
  id: string;
  userId: string;
  name: string;
  percentage: number;
  monthlyLimit: number | null;
  currentSpending: number;
  percentageConsumed: number;
  isBotOriginated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePocketDto {
  name: string;
  percentage: number;
  monthlyLimit?: number | null;
}

export interface UpdatePocketDto {
  name?: string;
  percentage?: number;
  monthlyLimit?: number | null;
}

export interface PocketSpending {
  pocketId: string;
  totalSpending: number;
  monthlyLimit: number | null;
  percentageConsumed: number;
}
