import apiClient from "@/lib/axios";
import { ADMIN_WALLET_ENDPOINTS } from "@/constants/api-routes/admin/wallet-endpoint";
import type { ApiResponse } from "@/types/api";
import type {
  Wallet,
  WalletTransactionsPage,
  AdjustWalletInput,
} from "@/types/wallet";

export const adminWalletApi = {
  get: async (tenantId: string): Promise<Wallet> => {
    const res = await apiClient.get<ApiResponse<Wallet>>(
      ADMIN_WALLET_ENDPOINTS.BASE,
      {
        params: { tenantId },
      },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch admin wallet");
    }
    return res.data.data;
  },

  listTransactions: async (
    tenantId: string,
    page = 1,
    limit = 20,
  ): Promise<WalletTransactionsPage> => {
    const res = await apiClient.get<ApiResponse<WalletTransactionsPage>>(
      ADMIN_WALLET_ENDPOINTS.TRANSACTIONS,
      { params: { tenantId, page, limit } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch transactions");
    }
    return res.data.data;
  },

  adjust: async (input: AdjustWalletInput): Promise<Wallet> => {
    const res = await apiClient.post<ApiResponse<Wallet>>(
      ADMIN_WALLET_ENDPOINTS.ADJUST,
      input,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to adjust wallet");
    }
    return res.data.data;
  },
};
