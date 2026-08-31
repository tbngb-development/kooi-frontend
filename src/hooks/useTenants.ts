"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tenantsApi } from "@/lib/api/tenants";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import { QUERY_KEYS } from "@/constants/config/query-keys";

/**
 * Workspace settings/metadata hooks.
 */

export function useCurrentWorkspace() {
  return useQuery({
    queryKey: QUERY_KEYS.WORKSPACE.current,
    queryFn: tenantsApi.getCurrent,
  });
}

export function useCurrentWorkspaceStats() {
  return useQuery({
    queryKey: QUERY_KEYS.WORKSPACE.stats,
    queryFn: tenantsApi.getCurrentStats,
  });
}

export function useUpdateCurrentWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => tenantsApi.updateCurrent(data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKSPACE.current });
      toast.success(`Workspace renamed to "${updated.name}"`);
    },
    onError: (err: unknown) => {
      toast.error(getAxiosErrorMessage(err));
    },
  });
}
