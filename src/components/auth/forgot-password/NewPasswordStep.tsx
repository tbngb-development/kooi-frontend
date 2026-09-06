"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordStrengthMeter } from "@/components/ui/PasswordStrengthMeter";

const newPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "At least 8 characters")
      .max(128, "Maximum 128 characters")
      .regex(/[A-Z]/, "At least one uppercase letter")
      .regex(/[a-z]/, "At least one lowercase letter")
      .regex(/[0-9]/, "At least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;

interface NewPasswordStepProps {
  isPending: boolean;
  globalError: string | null;
  onBack: () => void;
  onSubmit: (values: NewPasswordFormValues) => void;
}

export function NewPasswordStep({
  isPending,
  globalError,
  onBack,
  onSubmit,
}: NewPasswordStepProps) {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const newPasswordValue = watch("newPassword");

  const allRequirementsMet = useMemo(() => {
    const p = newPasswordValue || "";
    return (
      p.length >= 8 &&
      p.length <= 128 &&
      /[A-Z]/.test(p) &&
      /[a-z]/.test(p) &&
      /[0-9]/.test(p)
    );
  }, [newPasswordValue]);

  return (
    <>
      <button
        onClick={onBack}
        disabled={isPending}
        className="group flex items-center gap-2 text-base font-medium text-text-muted hover:text-text-primary transition-colors mb-6 disabled:opacity-50 cursor-pointer"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-0.5 transition-transform"
        />
        <span>Back</span>
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">
          Set new password
        </h2>
        <p className="text-base text-text-muted mt-1.5">
          Create a strong password for your account.
        </p>
      </div>

      {globalError && (
        <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-base text-error-700">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <Input
            label="New password"
            type={showNewPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            leftIcon={<Lock size={16} className="text-text-muted" />}
            disabled={isPending}
            autoComplete="new-password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowNewPassword((p) => !p)}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
                className="focus-ring rounded p-1 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <PasswordStrengthMeter password={newPasswordValue} />
        </div>

        <Input
          label="Confirm password"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Re-enter your password"
          leftIcon={<Lock size={16} className="text-text-muted" />}
          disabled={isPending}
          autoComplete="new-password"
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((p) => !p)}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              className="focus-ring rounded p-1 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          loading={isPending}
          disabled={!allRequirementsMet}
          className="w-full mt-2 h-11 font-semibold text-base transition-all shadow-sm active:scale-[0.98]"
        >
          Reset password
        </Button>
      </form>
    </>
  );
}
