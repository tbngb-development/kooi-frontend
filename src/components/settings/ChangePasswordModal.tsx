"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordStrengthMeter } from "@/components/ui/PasswordStrengthMeter";
import { useChangePassword } from "@/hooks/useAuth";

// ─── Schema ───────────────────────────────────────────────────────────────────

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "At least 8 characters")
      .max(128, "Maximum 128 characters")
      .regex(/[A-Z]/, "At least one uppercase letter")
      .regex(/[a-z]/, "At least one lowercase letter")
      .regex(/[0-9]/, "At least one number"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const changePasswordMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPasswordValue = watch("newPassword");

  if (!isOpen) return null;

  const onSubmit = (data: ChangePasswordFormValues) => {
    changePasswordMutation.mutate(
      {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  const handleClose = () => {
    if (changePasswordMutation.isPending) return;
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-surface border border-surface-border rounded-xl shadow-lg p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            Change password
          </h2>
          <button
            onClick={handleClose}
            disabled={changePasswordMutation.isPending}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Current Password */}
          <Input
            label="Current password"
            type={showOld ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<Lock size={16} className="text-text-muted" />}
            disabled={changePasswordMutation.isPending}
            autoComplete="current-password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowOld((p) => !p)}
                aria-label={showOld ? "Hide password" : "Show password"}
                className="focus-ring rounded p-1 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
              >
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            error={errors.oldPassword?.message}
            {...register("oldPassword")}
          />

          {/* New Password */}
          <div>
            <Input
              label="New password"
              type={showNew ? "text" : "password"}
              placeholder="At least 8 characters"
              leftIcon={<Lock size={16} className="text-text-muted" />}
              disabled={changePasswordMutation.isPending}
              autoComplete="new-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowNew((p) => !p)}
                  aria-label={showNew ? "Hide password" : "Show password"}
                  className="focus-ring rounded p-1 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />
            <PasswordStrengthMeter password={newPasswordValue} />
          </div>

          {/* Confirm Password */}
          <Input
            label="Confirm new password"
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter your new password"
            leftIcon={<Lock size={16} className="text-text-muted" />}
            disabled={changePasswordMutation.isPending}
            autoComplete="new-password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                className="focus-ring rounded p-1 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          {/* Info note */}
          <p className="text-sm text-text-muted bg-surface-subtle rounded-lg px-3 py-2 border border-surface-border">
            Changing your password will sign you out of all devices.
          </p>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={changePasswordMutation.isPending}
              className="flex-1 h-11 font-semibold text-base"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={changePasswordMutation.isPending}
              className="flex-1 h-11 font-semibold text-base transition-all shadow-sm active:scale-[0.98]"
            >
              Update password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
