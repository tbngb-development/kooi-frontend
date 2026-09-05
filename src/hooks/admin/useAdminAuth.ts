"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  adminLogin as apiAdminLogin,
  adminLogout as apiAdminLogout,
} from "@/lib/api/admin/admin-auth";
import { useAuthStore } from "@/store/authStore";
import { AUTH_MESSAGES, AUTH_REDIRECTS } from "@/constants/config/auth.config";
import {
  setSessionIndicator,
  clearSessionIndicator,
} from "@/lib/session-cookies";
import type { User } from "@/types/user";

export function useAdminLogin() {
  const { setAuth, setActiveTenant } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: apiAdminLogin,
    onSuccess: (data) => {
      const user: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        isPlatformAdmin: data.user.isPlatformAdmin,
      };

      if (!user.isPlatformAdmin) {
        toast.error(AUTH_MESSAGES.ADMIN_UNAUTHORIZED);
        return;
      }

      setAuth(user, data.memberships);
      if (data.memberships.length > 0) {
        setActiveTenant(data.memberships[0].tenantId);
      }

      setSessionIndicator("SUPER_ADMIN", true);

      toast.success(AUTH_MESSAGES.ADMIN_WELCOME);
      router.push(AUTH_REDIRECTS.ADMIN_HOME);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useAdminLogout() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: apiAdminLogout,
    onMutate: () => {
      clearAuth();
      clearSessionIndicator();
    },
    onSuccess: () => {
      router.push(AUTH_REDIRECTS.ADMIN_LOGIN);
    },
    onError: () => {
      router.push(AUTH_REDIRECTS.ADMIN_LOGIN);
    },
  });
}
