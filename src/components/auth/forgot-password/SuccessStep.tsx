"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { APP_ROUTES } from "@/constants/routes/app.routes";

interface SuccessStepProps {
  loginUrl?: string; 
}

export function SuccessStep({ loginUrl = APP_ROUTES.LOGIN }: SuccessStepProps) {
  return (
    <div className="flex flex-col items-center text-center py-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-50 border border-success-200 mb-5">
        <CheckCircle2 size={32} className="text-success-600" />
      </div>
      <h2 className="text-2xl font-bold text-text-primary tracking-tight">
        Password reset successful!
      </h2>
      <p className="text-base text-text-muted mt-2">
        Redirecting you to the login page…
      </p>
      <Link
        href={loginUrl}
        className="mt-6 text-base font-semibold text-brand-600 hover:text-brand-500 transition-colors"
      >
        Go to login now
      </Link>
    </div>
  );
}
