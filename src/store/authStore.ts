import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AUTH_STORAGE_KEY } from "@/constants/config/auth.config";
import type { User } from "@/types/user";
import type { Membership, TenantRole } from "@/types/tenant";

interface AuthState {
  user: User | null;
  memberships: Membership[];
  activeTenantId: string | null;
  isAuthenticated: boolean;
  paymentRequired: boolean; // NEW

  setAuth: (user: User, memberships: Membership[]) => void;
  setActiveTenant: (tenantId: string) => void;
  setPaymentRequired: (required: boolean) => void; // NEW
  clearAuth: () => void;
  updateUser: (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      memberships: [],
      activeTenantId: null,
      isAuthenticated: false,
      paymentRequired: false,

      setAuth: (user, memberships) =>
        set({
          user,
          memberships,
          activeTenantId:
            memberships.length === 1 ? memberships[0].tenantId : null,
          isAuthenticated: true,
        }),

      setActiveTenant: (tenantId) => set({ activeTenantId: tenantId }),

      setPaymentRequired: (required) => set({ paymentRequired: required }),

      clearAuth: () =>
        set({
          user: null,
          memberships: [],
          activeTenantId: null,
          isAuthenticated: false,
          paymentRequired: false,
        }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        memberships: state.memberships,
        activeTenantId: state.activeTenantId,
        isAuthenticated: state.isAuthenticated,
        paymentRequired: state.paymentRequired,
      }),
    },
  ),
);

export const getActiveMembership = (): Membership | undefined => {
  const { memberships, activeTenantId } = useAuthStore.getState();
  return memberships.find((m) => m.tenantId === activeTenantId);
};

export const getActiveRole = (): TenantRole | null => {
  return getActiveMembership()?.role ?? null;
};

export const isOwnerOrAdmin = (): boolean => {
  const role = getActiveRole();
  return role === "OWNER" || role === "ADMIN";
};
