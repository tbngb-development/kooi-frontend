import apiClient from "@/lib/axios";
import { WALLET_ENDPOINTS } from "@/constants/api-routes/wallet-endpoint";
import type { ApiResponse } from "@/types/api";
import type {
  Wallet,
  WalletTransactionPage,
  WalletTxType,
} from "@/types/wallet";

export const walletApi = {
  /**
   * GET /v1/wallet
   * Returns cashBalance, bonusBalance, totalBalance, currency.
   */
  get: async (): Promise<Wallet> => {
    const res = await apiClient.get<ApiResponse<Wallet>>(WALLET_ENDPOINTS.BASE);
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch wallet");
    }
    return res.data.data;
  },

  /**
   * GET /v1/wallet/transactions?page=&limit=&type=
   * `type` filter is optional — omit to get all types.
   */
  listTransactions: async (
    page = 1,
    limit = 20,
    type?: WalletTxType,
  ): Promise<WalletTransactionPage> => {
    const res = await apiClient.get<ApiResponse<WalletTransactionPage>>(
      WALLET_ENDPOINTS.TRANSACTIONS,
      { params: { page, limit, ...(type ? { type } : {}) } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch transactions");
    }
    return res.data.data;
  },

  /**
   * @deprecated Threshold is now managed via PlanVersion.lowBalanceThreshold.
   * Kept for backward compatibility — remove once backend endpoint is confirmed gone.
   */
  setThreshold: async (threshold: number): Promise<Wallet> => {
    const res = await apiClient.patch<ApiResponse<Wallet>>(
      WALLET_ENDPOINTS.THRESHOLD,
      { threshold },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to update threshold");
    }
    return res.data.data;
  },
};
