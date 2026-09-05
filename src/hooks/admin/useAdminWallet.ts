"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminWalletApi } from "@/lib/api/admin/admin-wallet";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import type { AdjustWalletInput } from "@/types/wallet";

export const ADMIN_WALLET_KEYS = {
  wallet: (tenantId: string) => ["admin", "wallet", tenantId] as const,
  transactions: (tenantId: string, page: number, limit: number) =>
    ["admin", "wallet", tenantId, "transactions", page, limit] as const,
};

export function useAdminWallet(tenantId: string) {
  return useQuery({
    queryKey: ADMIN_WALLET_KEYS.wallet(tenantId),
    queryFn: () => adminWalletApi.get(tenantId),
    enabled: !!tenantId,
  });
}

export function useAdminWalletTransactions(
  tenantId: string,
  page = 1,
  limit = 20,
) {
  return useQuery({
    queryKey: ADMIN_WALLET_KEYS.transactions(tenantId, page, limit),
    queryFn: () => adminWalletApi.listTransactions(tenantId, page, limit),
    enabled: !!tenantId,
    placeholderData: (prev) => prev,
  });
}

export function useAdjustWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdjustWalletInput) => adminWalletApi.adjust(input),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ADMIN_WALLET_KEYS.wallet(variables.tenantId),
      });
      qc.invalidateQueries({
        queryKey: ["admin", "wallet", variables.tenantId, "transactions"],
      });
      toast.success("Wallet balanced adjusted successfully");
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });
}
