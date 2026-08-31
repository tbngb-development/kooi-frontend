"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ShieldAlert, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { ADMIN_ROUTES } from "@/constants/routes/admin.routes";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[Platform Admin Error Boundary Catch]:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted px-4">
      <Card className="w-full max-w-md text-center p-8 bg-surface border border-error-100 rounded-xl shadow-md">
        <div className="flex justify-center mb-4">
          <div className="h-14 w-14 rounded-full bg-error-50 border border-error-100 flex items-center justify-center">
            <ShieldAlert size={28} className="text-error-600 animate-pulse" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-text-primary mb-2">
          Platform Admin Error
        </h2>
        <p className="text-text-muted mb-6 text-sm">
          A critical system error occurred within the administrative scope.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="gap-2 h-10 px-4 font-semibold text-sm transition-all bg-error-600 hover:bg-error-500 border-none"
          >
            <RefreshCw size={14} />
            Retry System
          </Button>
          <Button
            onClick={() => router.push(ADMIN_ROUTES.DASHBOARD)}
            className="gap-2 h-10 px-4 font-semibold text-sm transition-all bg-surface-muted hover:bg-surface border border-surface-border text-text-primary"
          >
            <Home size={14} />
            Admin Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
