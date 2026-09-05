import apiClient from "@/lib/axios";
import { WALLET_ENDPOINTS } from "@/constants/api-routes/wallet-endpoint";
import type { ApiResponse } from "@/types/api";
import type { Wallet, WalletTransactionsPage } from "@/types/wallet";

export const walletApi = {
  get: async (): Promise<Wallet> => {
    const res = await apiClient.get<ApiResponse<Wallet>>(WALLET_ENDPOINTS.BASE);
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch wallet");
    }
    return res.data.data;
  },

  listTransactions: async (
    page = 1,
    limit = 20,
  ): Promise<WalletTransactionsPage> => {
    const res = await apiClient.get<ApiResponse<WalletTransactionsPage>>(
      WALLET_ENDPOINTS.TRANSACTIONS,
      { params: { page, limit } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch transactions");
    }
    return res.data.data;
  },

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
