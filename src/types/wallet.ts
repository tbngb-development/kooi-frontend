export interface Wallet {
  id: string;
  tenantId: string;
  balance: number;
  bonusBalance: number;
  bonusExpiresAt: string | null;
  isActive: boolean;
  lowBalanceThreshold: number | null;
  lowBalanceAlertSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export type WalletTxType =
  | "CREDIT"
  | "DEBIT"
  | "REFUND"
  | "BONUS"
  | "ADJUSTMENT";

export type WalletTxReferenceType =
  | "CALL"
  | "RECHARGE"
  | "PLAN_BONUS"
  | "ADJUSTMENT";

export interface WalletTransaction {
  id: string;
  type: WalletTxType;
  amount: number;
  balanceAfter: number;
  bonusBalanceAfter: number;
  description: string;
  referenceType: WalletTxReferenceType | null;
  referenceId: string | null;
  createdAt: string;
}

export interface WalletTransactionsPage {
  items: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
}

export interface BalanceWarning {
  balance: number;
  estimatedCost: number;
}
