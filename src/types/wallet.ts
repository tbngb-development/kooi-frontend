// ── Transaction Types ────────────────────────────────────────────────────────

export type WalletTxType =
  | "CREDIT"
  | "DEBIT"
  | "BONUS"
  | "BONUS_EXPIRY"
  | "REFUND"
  | "ADJUSTMENT";

export type WalletTxSourceType =
  | "RECHARGE"
  | "CALL"
  | "PLAN_BONUS"
  | "BONUS_EXPIRY"
  | "ADMIN_ADJUSTMENT"
  | "REFUND";

// ── Wallet ───────────────────────────────────────────────────────────────────

export interface Wallet {
  id: string;
  tenantId: string;
  /** Real money balance (integer paisa) */
  cashBalance: number;
  /** Promotional balance from plan bonus (integer paisa) */
  bonusBalance: number;
  /** cashBalance + valid bonusBalance (integer paisa) */
  totalBalance: number;
  bonusExpiresAt: string | null;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Transaction ──────────────────────────────────────────────────────────────

export interface WalletTransaction {
  id: string;
  walletId: string;
  tenantId: string;
  type: WalletTxType;
  /** Always positive; `type` determines direction */
  amount: number;
  /** Signed cash change (negative = debit) */
  cashDelta: number;
  /** Signed bonus change (negative = debit) */
  bonusDelta: number;
  cashBalanceAfter: number;
  bonusBalanceAfter: number;
  currency: string;
  description: string;
  sourceType: WalletTxSourceType | null;
  sourceId: string | null;
  createdAt: string;
}

export interface WalletTransactionPage {
  items: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Admin ────────────────────────────────────────────────────────────────────

export interface AdjustWalletInput {
  tenantId: string;
  /** Positive integer in paisa */
  amount: number;
  type: WalletTxType;
  /** Which balance bucket to target (default CASH) */
  targetBalance?: "CASH" | "BONUS";
  description: string;
  /** Only relevant when type = BONUS */
  bonusExpiresAt?: string | null;
}
