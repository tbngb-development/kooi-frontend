"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { walletApi } from "@/lib/api/wallet";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import { QUERY_KEYS } from "@/constants/config/query-keys";

export function useWallet() {
  return useQuery({
    queryKey: QUERY_KEYS.WALLET.all,
    queryFn: walletApi.get,
  });
}

export function useWalletTransactions(page = 1, limit = 20) {
  return useQuery({
    queryKey: QUERY_KEYS.WALLET.transactions(page, limit),
    queryFn: () => walletApi.listTransactions(page, limit),
    placeholderData: (prev) => prev,
  });
}

export function useSetWalletThreshold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (threshold: number) => walletApi.setThreshold(threshold),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WALLET.all });
      toast.success("Low balance threshold updated");
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });
}