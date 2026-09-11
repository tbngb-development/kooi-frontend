"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { plansApi } from "@/lib/api/plans";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import { toast } from "sonner";
import { ChangePlanRequest } from "@/types/plan";

export function useAvailablePlans() {
  return useQuery({
    queryKey: QUERY_KEYS.PLANS.available(),
    queryFn: plansApi.getAvailable,
  });
}

export function useMyPlan() {
  return useQuery({
    queryKey: QUERY_KEYS.PLANS.mine(),
    queryFn: plansApi.getMine,
  });
}

export function useSelectPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => plansApi.select(planId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PLANS.mine() });
      toast.success("Plan selected — complete payment to activate.");
    },
    onError: (err: unknown) => {
      toast.error(getAxiosErrorMessage(err));
    },
  });
}

export function useChangePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ChangePlanRequest) => plansApi.changePlan(input),
    onSuccess: (data) => {
      if (data.effectiveImmediately) {
        qc.invalidateQueries({ queryKey: QUERY_KEYS.PLANS.mine() });
        qc.invalidateQueries({ queryKey: QUERY_KEYS.WALLET.all });
        toast.success(
          `Plan ${data.direction === "DOWNGRADE" ? "downgraded" : "changed"} successfully!`,
        );
      }
      // When requiresPayment === true, the calling component handles the
      // payment flow and invalidates caches after verification.
    },
    onError: (err: unknown) => {
      toast.error(getAxiosErrorMessage(err));
    },
  });
}
