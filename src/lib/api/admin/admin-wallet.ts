import apiClient from "@/lib/axios";
import { ADMIN_WALLET_ENDPOINTS } from "@/constants/api-routes/admin/wallet-endpoint";
import type { ApiResponse } from "@/types/api";
import type {
  Wallet,
  WalletTransactionPage,
  WalletTxType,
  AdjustWalletInput,
} from "@/types/wallet";

export const adminWalletApi = {
  /** GET /v1/admin/wallet/tenants/:tenantId */
  get: async (tenantId: string): Promise<Wallet> => {
    const res = await apiClient.get<ApiResponse<Wallet>>(
      ADMIN_WALLET_ENDPOINTS.TENANT_WALLET(tenantId),
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch tenant wallet");
    }
    return res.data.data;
  },

  /** GET /v1/admin/wallet/tenants/:tenantId/transactions */
  listTransactions: async (
    tenantId: string,
    page = 1,
    limit = 20,
    type?: WalletTxType,
  ): Promise<WalletTransactionPage> => {
    const res = await apiClient.get<ApiResponse<WalletTransactionPage>>(
      ADMIN_WALLET_ENDPOINTS.TENANT_TRANSACTIONS(tenantId),
      { params: { page, limit, ...(type ? { type } : {}) } },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch transactions");
    }
    return res.data.data;
  },

  /**
   * POST /v1/admin/wallet/adjust
   * `targetBalance` defaults to CASH. Set to BONUS for bonus credits.
   */
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
