"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { plansApi } from "@/lib/api/plans";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import { toast } from "sonner";

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
      toast.success("Plan assigned to workspace!");
    },
    onError: (err: unknown) => {
      toast.error(getAxiosErrorMessage(err));
    },
  });
}
