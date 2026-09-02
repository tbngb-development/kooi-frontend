"use client";

import { useQuery } from "@tanstack/react-query";
import { plansApi } from "@/lib/api/plans";
import { QUERY_KEYS } from "@/constants/config/query-keys";

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
