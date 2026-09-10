export type WalletTxType =
  | "CREDIT"
  | "DEBIT"
  | "REFUND"
  | "BONUS"
  | "ADJUSTMENT";

export interface Wallet {
  id: string;
  tenantId: string;
  balance: number; // in paisa
  bonusBalance: number; // in paisa
  bonusExpiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: WalletTxType;
  amount: number; // in paisa
  balanceAfter: number; // in paisa
  description: string;
  createdAt: string;
}

export interface WalletTransactionPage {
  items: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
}

/** Admin payload for manually adjusting a tenant's wallet balance */
export interface AdjustWalletInput {
  tenantId: string;
  amount: number; // in paisa
  type?: WalletTxType;
  description: string;
}
