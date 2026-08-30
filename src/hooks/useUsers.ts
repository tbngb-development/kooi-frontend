"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersApi } from "@/lib/api/users";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import type { CreateUserInput, UpdateUserInput } from "@/types";

export const USERS_KEY = ["users"] as const;

export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: usersApi.getAll,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInput) => usersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
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
      qc.invalidateQueries({ queryKey: USERS_KEY });
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
      qc.invalidateQueries({ queryKey: USERS_KEY });
      toast.success("Member removed from workspace");
    },
    onError: (err: unknown) => {
      toast.error(getAxiosErrorMessage(err));
    },
  });
}
