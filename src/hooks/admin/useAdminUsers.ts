"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminUsersApi } from "@/lib/api/admin/admin-users";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import type { AdminUsersPage } from "@/types/user";

export const ADMIN_USERS_KEYS = {
  all: ["admin", "users"] as const,
  list: (params: Record<string, unknown>) =>
    [...ADMIN_USERS_KEYS.all, "list", params] as const,
};

export function useAdminUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ADMIN_USERS_KEYS.list(params ?? {}),
    queryFn: () => adminUsersApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useDeactivateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminUsersApi.setActive(id, isActive),
    onMutate: async ({ id, isActive }) => {
      await qc.cancelQueries({ queryKey: ADMIN_USERS_KEYS.all });
      const previousState = qc.getQueriesData<AdminUsersPage>({
        queryKey: ADMIN_USERS_KEYS.all,
      });

      qc.setQueriesData<AdminUsersPage>(
        { queryKey: ADMIN_USERS_KEYS.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((u) => (u.id === id ? { ...u, isActive } : u)),
          };
        },
      );

      return { previousState };
    },
    onError: (err, _, context) => {
      if (context?.previousState) {
        context.previousState.forEach(([key, val]) =>
          qc.setQueryData(key, val),
        );
      }
      toast.error(getAxiosErrorMessage(err));
    },
    onSuccess: (data) => {
      toast.success(
        `User state successfully updated to ${data.isActive ? "Active" : "Inactive"}`,
      );
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ADMIN_USERS_KEYS.all });
    },
  });
}
