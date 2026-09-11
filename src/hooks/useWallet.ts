"use client";

import { useQuery } from "@tanstack/react-query";
import { walletApi } from "@/lib/api/wallet";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import type { WalletTxType } from "@/types/wallet";

export function useWallet() {
  return useQuery({
    queryKey: QUERY_KEYS.WALLET.balance(),
    queryFn: walletApi.get,
  });
}

export function useWalletTransactions(
  page = 1,
  limit = 20,
  type?: WalletTxType,
) {
  return useQuery({
    queryKey: QUERY_KEYS.WALLET.transactions(page, limit, type),
    queryFn: () => walletApi.listTransactions(page, limit, type),
    placeholderData: (prev) => prev,
  });
}
