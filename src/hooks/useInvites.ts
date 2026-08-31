"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createInvite as apiCreateInvite } from "@/lib/api/auth";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import { InviteInput } from "@/types/auth";

export function useCreateInvite() {
  return useMutation({
    mutationFn: (input: InviteInput) => apiCreateInvite(input),
    onSuccess: () => {
      toast.success("Invite generated successfully");
    },
    onError: (err: unknown) => {
      toast.error(getAxiosErrorMessage(err));
    },
  });
}
