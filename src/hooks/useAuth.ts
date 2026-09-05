"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  login as apiLogin,
  register as apiRegister,
  selectTenant as apiSelectTenant,
  logout as apiLogout,
} from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";
import { useTenantStore } from "@/store/tenantStore";
import { AUTH_MESSAGES, AUTH_REDIRECTS } from "@/constants/config/auth.config";
import {
  setSessionIndicator,
  clearSessionIndicator,
} from "@/lib/session-cookies";
import type { User } from "@/types/user";
import type { Membership } from "@/types/tenant";
import { APP_ROUTES } from "@/constants/routes/app.routes";

export function useLogin() {
  const { setAuth, setActiveTenant } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: apiLogin,
    onSuccess: (data) => {
      if (data.requiresTenantSelection) return;

      const user: User = {
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

      toast.success(AUTH_MESSAGES.WELCOME_BACK(user.name));
      router.push(
        user.isPlatformAdmin
          ? AUTH_REDIRECTS.ADMIN_HOME
          : AUTH_REDIRECTS.TENANT_HOME,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSelectTenant() {
  const { setAuth, setActiveTenant } = useAuthStore();
  const { setTenantContext } = useTenantStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      tenantId,
      user,
      memberships,
    }: {
      tenantId: string;
      user: User;
      memberships: Membership[];
    }) => {
      const res = await apiSelectTenant(tenantId);
      return { res, user, memberships };
    },
    onSuccess: ({ res, user, memberships }) => {
      setAuth(user, memberships);
      setActiveTenant(res.membership.tenantId);
      setSessionIndicator(res.membership.role, user.isPlatformAdmin);

      // Pre-initialize tenant store workspace profile ID
      setTenantContext(res.membership.tenantId, null, "NONE");

      toast.success(AUTH_MESSAGES.WORKSPACE_LOADED(res.membership.tenantName));
      router.push(
        user.isPlatformAdmin
          ? AUTH_REDIRECTS.ADMIN_HOME
          : AUTH_REDIRECTS.TENANT_HOME,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
export function useRegister() {
  const { setAuth, setActiveTenant } = useAuthStore();
  const { setTenantContext } = useTenantStore();
  const router = useRouter();

  return useMutation({
    mutationFn: apiRegister,
    onSuccess: (data) => {
      const user: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        isPlatformAdmin: false,
      };

      const membership: Membership = {
        membershipId: data.membership.id,
        tenantId: data.tenant.id,
        tenantName: data.tenant.name,
        role: data.membership.role,
      };

      setAuth(user, [membership]);
      setActiveTenant(data.tenant.id);
      setSessionIndicator(membership.role, false);

      // Initialize workspace with an unassigned NONE plan status
      setTenantContext(data.tenant.id, null, "NONE");

      toast.success(AUTH_MESSAGES.ORG_PROVISIONED);

      // Route direct to plan selection catalog
      router.push(APP_ROUTES.ONBOARDING_PLANS);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
export function useLogout() {
  const { clearAuth } = useAuthStore();
  const { clearTenantContext } = useTenantStore();
  const router = useRouter();

  return useMutation({
    mutationFn: apiLogout,
    onMutate: () => {
      clearAuth();
      clearTenantContext();
      clearSessionIndicator();
    },
    onSuccess: () => {
      toast.success(AUTH_MESSAGES.SESSION_CLOSED);
      router.push(AUTH_REDIRECTS.TENANT_LOGIN);
    },
    onError: () => {
      router.push(AUTH_REDIRECTS.TENANT_LOGIN);
    },
  });
}
