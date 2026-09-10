"use client";

import { useQuery } from "@tanstack/react-query";
import { walletApi } from "@/lib/api/wallet";
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
