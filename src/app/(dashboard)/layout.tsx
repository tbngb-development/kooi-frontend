"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
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
  const { isAuthenticated, user } = useAuthStore();
  const { data: tenantPlan, isLoading } = useMyPlan();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(APP_ROUTES.LOGIN);
      return;
    }

    if (isLoading) return;

    // Platform Admins bypass the onboarding payment restriction
    if (user?.isPlatformAdmin) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthorized(true);
      return;
    }

    // Force redirection if onboarding payment is required
    if (tenantPlan?.status === "PENDING_PAYMENT") {
      router.replace(APP_ROUTES.ONBOARDING_PAYMENT);
    } else {
      setIsAuthorized(true);
    }
  }, [isAuthenticated, user, tenantPlan, isLoading, router]);

  if (!isAuthorized || isLoading) {
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
