"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/constants/routes/app.routes";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[GlobalError Boundary Catch]:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted px-4">
      <Card className="w-full max-w-md text-center p-8 bg-surface border border-surface-border rounded-xl shadow-md">
        <div className="flex justify-center mb-4">
          <div className="h-14 w-14 rounded-full bg-error-50 border border-error-100 flex items-center justify-center">
            <AlertTriangle size={28} className="text-error-600" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-text-primary mb-2">
          Something went wrong
        </h2>
        <p className="text-text-muted mb-6 text-sm">
          An unexpected interface or API mismatch error occurred. You can safely
          try again or return to your dashboard.
        </p>

        {error.digest && (
          <p className="text-xs text-text-placeholder mb-4 font-mono">
            Digest Ref: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="gap-2 h-10 px-4 font-semibold text-sm transition-all"
          >
            <RefreshCw size={14} />
            Try again
          </Button>
          <Button
            onClick={() => router.push(APP_ROUTES.DASHBOARD)}
            className="gap-2 h-10 px-4 font-semibold text-sm transition-all bg-surface-muted hover:bg-surface border border-surface-border text-text-primary"
          >
            <Home size={14} />
            Workspace Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
