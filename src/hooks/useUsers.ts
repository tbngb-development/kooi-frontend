"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersApi } from "@/lib/api/users";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import type { CreateUserInput, UpdateUserInput } from "@/types/user";

/**
 * Workspace member list hooks.
 */

export function useUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.USERS.all,
    queryFn: usersApi.getAll,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInput) => usersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.USERS.all });
      toast.success("Member added to workspace");
    },
    onError: (err: unknown) => {
      toast.error(getAxiosErrorMessage(err));
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.USERS.all });
      toast.success("Member details updated");
    },
    onError: (err: unknown) => {
      toast.error(getAxiosErrorMessage(err));
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.USERS.all });
      toast.success("Member removed from workspace");
    },
    onError: (err: unknown) => {
      toast.error(getAxiosErrorMessage(err));
    },
  });
}
