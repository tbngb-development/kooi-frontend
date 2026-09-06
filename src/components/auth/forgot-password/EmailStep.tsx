"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { APP_ROUTES } from "@/constants/routes/app.routes";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export type EmailStepFormValues = z.infer<typeof emailSchema>;

interface EmailStepProps {
  defaultEmail?: string;
  isPending: boolean;
  globalError: string | null;
  onSubmit: (values: EmailStepFormValues) => void;
}

export function EmailStep({
  defaultEmail = "",
  isPending,
  globalError,
  onSubmit,
}: EmailStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailStepFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: defaultEmail },
  });

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">
          Reset your password
        </h2>
        <p className="text-base text-text-muted mt-1.5">
          Enter your email and we&apos;ll send you a verification code.
        </p>
      </div>

      {globalError && (
        <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-base text-error-700">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@company.com"
          leftIcon={<Mail size={16} className="text-text-muted" />}
          error={errors.email?.message}
          disabled={isPending}
          autoComplete="email"
          {...register("email")}
        />

        <Button
          type="submit"
          loading={isPending}
          className="w-full mt-2 h-11 font-semibold text-base transition-all shadow-sm active:scale-[0.98]"
        >
          Send verification code
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-surface-border text-center">
        <Link
          href={APP_ROUTES.LOGIN}
          className="text-base font-medium text-brand-600 hover:text-brand-500 transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </>
  );
}
