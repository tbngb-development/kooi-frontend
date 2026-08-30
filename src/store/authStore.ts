import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── V1 Types ─────────────────────────────────────────────────────────────────
export type TenantRole = "OWNER" | "ADMIN" | "USER";

export interface V1User {
  id: string;
  email: string;
  name: string;
  isPlatformAdmin: boolean;
}

export interface Membership {
  membershipId: string;
  tenantId: string;
  tenantName: string;
  role: TenantRole;
}

// ─── Store ────────────────────────────────────────────────────────────────────
interface AuthState {
  user: V1User | null;
  memberships: Membership[];
  activeTenantId: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: V1User, memberships: Membership[]) => void;
  setActiveTenant: (tenantId: string) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<V1User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      memberships: [],
      activeTenantId: null,
      isAuthenticated: false,

      setAuth: (user, memberships) =>
        set({
          user,
          memberships,
          // Auto-select if only one tenant
          activeTenantId:
            memberships.length === 1 ? memberships[0].tenantId : null,
          isAuthenticated: true,
        }),

      setActiveTenant: (tenantId) => set({ activeTenantId: tenantId }),

      clearAuth: () =>
        set({
          user: null,
          memberships: [],
          activeTenantId: null,
          isAuthenticated: false,
        }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: "auth-storage",
      // V1: No token to persist — cookies handle auth
      partialize: (state) => ({
        user: state.user,
        memberships: state.memberships,
        activeTenantId: state.activeTenantId,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// ─── Derived Helpers (use outside React or in selectors) ──────────────────────
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
