"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useAuthStore } from "@/store/authStore";
import { Spinner } from "@/components/ui/Spinner";
import { ADMIN_ROUTES } from "@/constants/routes/admin.routes";
import { APP_ROUTES } from "@/constants/routes/app.routes";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  const [hasHydrated, setHasHydrated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // 1. Wait for Zustand persist to hydrate state from localStorage
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

  // 2. Perform authentication and platform admin authorization check
  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.replace(
        `${ADMIN_ROUTES.LOGIN}?callbackUrl=${encodeURIComponent(pathname)}`,
      );
      return;
    }

    if (!user?.isPlatformAdmin) {
      // Non-admin trying to access admin panel -> redirect to tenant dashboard
      router.replace(APP_ROUTES.DASHBOARD);
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthorized(true);
  }, [hasHydrated, isAuthenticated, user, router, pathname]);

  if (!hasHydrated || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8 text-error-600" />
          <p className="text-sm font-medium text-text-muted animate-pulse">
            Authenticating platform administrator privileges...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-surface-muted min-h-screen w-full">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
