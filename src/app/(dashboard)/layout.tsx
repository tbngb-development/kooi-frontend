"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useTenantStore } from "@/store/tenantStore";
import { useMyPlan } from "@/hooks/usePlans";
import { APP_ROUTES } from "@/constants/routes/app.routes";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Spinner } from "@/components/ui/Spinner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, activeTenantId } = useAuthStore();
  const { setTenantContext } = useTenantStore();

  const [hasHydrated, setHasHydrated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // 1. Wait for Zustand persist to finish hydrating from localStorage
  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasHydrated(true);
    }
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
    return () => unsubscribe();
  }, []);

  const { data: tenantPlan, isLoading: isPlanLoading } = useMyPlan();

  useEffect(() => {
    // Do not perform auth checks until Zustand rehydration is complete
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.replace(
        `${APP_ROUTES.LOGIN}?callbackUrl=${encodeURIComponent(pathname)}`,
      );
      return;
    }

    if (isPlanLoading) return;

    // Platform Admins bypass the plan/payment restriction
    if (user?.isPlatformAdmin) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthorized(true);
      return;
    }

    if (tenantPlan) {
      setTenantContext(activeTenantId, tenantPlan.plan, tenantPlan.status);

      if (
        tenantPlan.status === "PENDING_PAYMENT" ||
        tenantPlan.status === "EXPIRED" ||
        tenantPlan.status === "CANCELLED"
      ) {
        router.replace(APP_ROUTES.ONBOARDING_PLANS);
      } else {
        setIsAuthorized(true);
      }
    } else {
      router.replace(APP_ROUTES.ONBOARDING_PLANS);
    }
  }, [
    hasHydrated,
    isAuthenticated,
    user,
    activeTenantId,
    tenantPlan,
    isPlanLoading,
    router,
    pathname,
    setTenantContext,
  ]);

  if (!hasHydrated || isPlanLoading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <Spinner className="text-brand-600 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex bg-surface-muted min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
