"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/api/payments";
import { QUERY_KEYS } from "@/constants/config/query-keys";

export function useCreateOrder() {
  return useMutation({
    mutationFn: paymentsApi.createOrder,
  });
}

export function useVerifyPayment() {
  return useMutation({
    mutationFn: paymentsApi.verify,
  });
}

/**
 * Polls order status every 5s while INITIATED.
 * Disable by passing `orderId = null`.
 */
export function useOrderStatus(orderId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.PAYMENTS.orderStatus(orderId ?? ""),
    queryFn: () => paymentsApi.getOrderStatus(orderId!),
    enabled: !!orderId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "INITIATED" ? 5_000 : false;
    },
    retry: false,
  });
}
