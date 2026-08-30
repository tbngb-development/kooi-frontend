"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  login as apiLogin,
  adminLogin as apiAdminLogin,
  register as apiRegister,
  selectTenant as apiSelectTenant,
  logout as apiLogout,
} from "@/lib/api/auth";
import { useAuthStore, type V1User, type Membership } from "@/store/authStore";
import type { LoginInput, RegisterInput } from "@/types/user";

/**
 * Lightweight non-sensitive session indicator cookie for middleware routing.
 * Secure HttpOnly cookies (access_token/refresh_token) are sent automatically.
 */
function setSessionIndicator(role: string, isPlatformAdmin: boolean) {
  document.cookie = `has-session=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  document.cookie = `user-role=${role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  if (isPlatformAdmin) {
    document.cookie = `is-platform-admin=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  }
}

function clearSessionIndicator() {
  document.cookie = "has-session=; path=/; max-age=0";
  document.cookie = "user-role=; path=/; max-age=0";
  document.cookie = "is-platform-admin=; path=/; max-age=0";
}

export function useLogin() {
  const { setAuth, setActiveTenant } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: apiLogin,
    onSuccess: (data) => {
      // If server demands tenant selection, let the component UI handle the state transition
      if (data.requiresTenantSelection) {
        return;
      }

      // Single tenant flow
      const user: V1User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        isPlatformAdmin: data.user.isPlatformAdmin,
      };

      setAuth(user, data.memberships);
      if (data.memberships.length > 0) {
        const active = data.memberships[0];
        setActiveTenant(active.tenantId);
        setSessionIndicator(active.role, user.isPlatformAdmin);
      }

      toast.success(`Welcome back, ${user.name}!`);

      if (user.isPlatformAdmin) {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSelectTenant() {
  const { setAuth, setActiveTenant } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      tenantId,
      user,
      memberships,
    }: {
      tenantId: string;
      user: V1User;
      memberships: Membership[];
    }) => {
      const res = await apiSelectTenant(tenantId);
      return { res, user, memberships };
    },
    onSuccess: ({ res, user, memberships }) => {
      setAuth(user, memberships);
      setActiveTenant(res.membership.tenantId);
      setSessionIndicator(res.membership.role, user.isPlatformAdmin);

      toast.success(`Workspace loaded: ${res.membership.tenantName}`);

      if (user.isPlatformAdmin) {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useAdminLogin() {
  const { setAuth, setActiveTenant } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: apiAdminLogin,
    onSuccess: (data) => {
      const user: V1User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        isPlatformAdmin: data.user.isPlatformAdmin,
      };

      if (!user.isPlatformAdmin) {
        toast.error("Not authorized. Platform administrator access required.");
        return;
      }

      setAuth(user, data.memberships);
      if (data.memberships.length > 0) {
        setActiveTenant(data.memberships[0].tenantId);
        setSessionIndicator(data.memberships[0].role, true);
      } else {
        setSessionIndicator("ADMIN", true);
      }

      toast.success("Welcome, Platform Administrator!");
      router.push("/admin/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRegister() {
  const { setAuth, setActiveTenant } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: apiRegister,
    onSuccess: (data) => {
      const user: V1User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        isPlatformAdmin: false,
      };

      const structuredMembership: Membership = {
        membershipId: data.membership.id,
        tenantId: data.tenant.id,
        tenantName: data.tenant.name,
        role: data.membership.role,
      };

      setAuth(user, [structuredMembership]);
      setActiveTenant(data.tenant.id);
      setSessionIndicator(structuredMembership.role, false);

      toast.success("Organization environment provisioned successfully!");
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: apiLogout,
    onMutate: async () => {
      // Optimistic clear to prevent protected content flashes
      clearAuth();
      clearSessionIndicator();
    },
    onSuccess: () => {
      toast.success("Session closed successfully");
      router.push("/login");
    },
    onError: () => {
      // Hard routing cleanup fallback
      router.push("/login");
    },
  });
}

export function useAdminLogout() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: apiLogout,
    onMutate: () => {
      clearAuth();
      clearSessionIndicator();
    },
    onSuccess: () => {
      router.push("/admin/login");
    },
    onError: () => {
      router.push("/admin/login");
    },
  });
}
