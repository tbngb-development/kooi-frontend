"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminWalletApi } from "@/lib/api/admin/admin-wallet";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import { toast } from "sonner";
import type { AdjustWalletInput, WalletTxType } from "@/types/wallet";

export function useAdminWallet(tenantId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_WALLET.balance(tenantId ?? ""),
    queryFn: () => adminWalletApi.get(tenantId!),
    enabled: !!tenantId,
  });
}

export function useAdminWalletTransactions(
  tenantId: string | null,
  page = 1,
  limit = 20,
  type?: WalletTxType,
) {
  return useQuery({
    queryKey: [
      ...QUERY_KEYS.ADMIN_WALLET.all(tenantId ?? ""),
      "transactions",
      page,
      limit,
      ...(type ? [type] : []),
    ],
    queryFn: () =>
      adminWalletApi.listTransactions(tenantId!, page, limit, type),
    enabled: !!tenantId,
    placeholderData: (prev) => prev,
  });
}

export function useAdminAdjustWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdjustWalletInput) => adminWalletApi.adjust(input),
    onSuccess: (_, input) => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.ADMIN_WALLET.all(input.tenantId),
      });
      toast.success("Wallet adjusted");
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });
}
