"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tenantsApi } from "@/lib/api/tenants";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import type { Tenant } from "@/types";

const TENANTS_KEY = ["tenants"] as const;
const WORKSPACE_KEY = ["workspace"] as const;

// ─── Tenant Workspace Hooks (for /settings/workspace) ───────────────────────

export function useCurrentWorkspace() {
  return useQuery({
    queryKey: WORKSPACE_KEY,
    queryFn: tenantsApi.getCurrent,
  });
}

export function useUpdateCurrentWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => tenantsApi.updateCurrent(data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: WORKSPACE_KEY });
      toast.success(`Workspace renamed to "${updated.name}"`);
    },
    onError: (err: unknown) => {
      toast.error(getAxiosErrorMessage(err));
    },
  });
}

// ─── Platform Admin Hooks (for /admin/tenants) ───────────────────────────────

export function useTenants() {
  return useQuery({
    queryKey: TENANTS_KEY,
    queryFn: tenantsApi.adminGetAll,
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: [...TENANTS_KEY, id],
    queryFn: () => tenantsApi.adminGetById(id),
    enabled: !!id,
  });
}

export function useTenantStats(id: string) {
  return useQuery({
    queryKey: [...TENANTS_KEY, id, "stats"],
    queryFn: () => tenantsApi.adminGetStats(id),
    enabled: !!id,
  });
}

export function useToggleTenantStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      tenantsApi.adminUpdate(id, { isActive }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: TENANTS_KEY });
      qc.invalidateQueries({ queryKey: [...TENANTS_KEY, variables.id] });
      toast.success(
        `Tenant ${variables.isActive ? "activated" : "deactivated"} successfully`,
      );
    },
    onError: (err: unknown) => {
      toast.error(getAxiosErrorMessage(err));
    },
  });
}

export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Pick<Tenant, "isActive" | "name">>;
    }) => tenantsApi.adminUpdate(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: TENANTS_KEY });
      qc.invalidateQueries({ queryKey: [...TENANTS_KEY, variables.id] });
      toast.success("Tenant configuration updated");
    },
    onError: (err: unknown) => {
      toast.error(getAxiosErrorMessage(err));
    },
  });
}
