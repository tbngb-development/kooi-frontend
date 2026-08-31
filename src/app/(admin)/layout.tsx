"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useAuthStore } from "@/store/authStore";
import { Spinner } from "@/components/ui/Spinner";
import { ADMIN_ROUTES } from "@/constants/routes/admin.routes";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Session Verification & Role enforcement
    if (!isAuthenticated) {
      router.replace(ADMIN_ROUTES.LOGIN);
    } else if (!user?.isPlatformAdmin) {
      // Bounce unauthorized tenant users out of the admin console
      router.replace("/dashboard");
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthorized(true);
    }
  }, [user, isAuthenticated, router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8 text-error-600" />
          <p className="text-sm font-medium text-text-muted animate-pulse">
            Authenticating system privileges...
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
