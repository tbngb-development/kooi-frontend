"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRegister } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registerSchema = z
  .object({
    tenantName: z.string().min(1, "Company name is required").max(100),
    name: z.string().min(1, "Full name is required").max(100),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include one uppercase letter")
      .regex(/[a-z]/, "Include one lowercase letter")
      .regex(/[0-9]/, "Include one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof registerSchema>;

const TRUST_MARKERS = [
  "14-day free trial",
  "No credit card required",
  "Setup in 5 minutes",
];

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate: register, isPending } = useRegister();

  const {
    register: rhfRegister,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(registerSchema) });

  const passwordValue = watch("password") ?? "";

  const onSubmit = (data: FormValues) => {
    const { confirmPassword: _, ...payload } = data;
    register(payload);
  };

  return (
    <div className="bg-surface border border-surface-border rounded-xl shadow-md p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">
          Create your account
        </h2>
        <p className="text-base text-text-muted mt-1.5 leading-normal">
          Deploy your first AI voice agent in under 5 minutes.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Company name"
          placeholder="Acme Corp"
          leftIcon={<Building2 size={16} className="text-text-muted" />}
          error={errors.tenantName?.message}
          disabled={isPending}
          autoComplete="organization"
          {...rhfRegister("tenantName")}
        />

        <Input
          label="Your name"
          placeholder="Jane Smith"
          leftIcon={<User size={16} className="text-text-muted" />}
          error={errors.name?.message}
          disabled={isPending}
          autoComplete="name"
          {...rhfRegister("name")}
        />

        <Input
          label="Work email"
          type="email"
          placeholder="you@company.com"
          leftIcon={<Mail size={16} className="text-text-muted" />}
          error={errors.email?.message}
          disabled={isPending}
          autoComplete="email"
          {...rhfRegister("email")}
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            leftIcon={<Lock size={16} className="text-text-muted" />}
            disabled={isPending}
            autoComplete="new-password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="focus-ring rounded p-1 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            error={errors.password?.message}
            {...rhfRegister("password")}
          />
          <PasswordStrengthMeter password={passwordValue} />
        </div>

        <Input
          label="Confirm password"
          type={showConfirm ? "text" : "password"}
          placeholder="Repeat your password"
          leftIcon={<Lock size={16} className="text-text-muted" />}
          disabled={isPending}
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
          {...rhfRegister("confirmPassword")}
        />

        <Button
          type="submit"
          loading={isPending}
          className="w-full mt-2 h-11 font-semibold text-base transition-all shadow-sm active:scale-[0.98]"
        >
          Start free trial
        </Button>

        {/* Trust Markers (Helper information uses text-sm) */}
        <div className="grid grid-cols-3 gap-2 pt-4 mt-1 border-t border-surface-border">
          {TRUST_MARKERS.map((marker) => (
            <div
              key={marker}
              className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 min-h-[32px]"
            >
              <CheckCircle2
                size={14}
                className="text-success-500 shrink-0 mt-0.5"
              />
              <span className="text-sm text-text-secondary font-medium leading-tight">
                {marker}
              </span>
            </div>
          ))}
        </div>

        {/* Terms Disclaimer */}
        <p className="text-sm text-text-muted text-center leading-relaxed mt-2 px-1">
          By creating an account, you agree to our{" "}
          <Link
            href="/terms"
            className="text-brand-600 hover:text-brand-500 font-medium underline underline-offset-2 transition-colors"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-brand-600 hover:text-brand-500 font-medium underline underline-offset-2 transition-colors"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <div className="mt-6 pt-5 border-t border-surface-border text-center">
        <p className="text-base text-text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-600 hover:text-brand-500 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Password Strength Meter ──────────────────────────────────────────
function PasswordStrengthMeter({ password }: { password: string }) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  const strength: {
    label: string;
    color: string;
    bg: string;
  } = (() => {
    if (score <= 1)
      return { label: "Weak", color: "text-error-600", bg: "bg-error-500" };
    if (score <= 2)
      return { label: "Fair", color: "text-warning-600", bg: "bg-warning-500" };
    if (score <= 3)
      return { label: "Good", color: "text-info-600", bg: "bg-info-500" };
    return { label: "Strong", color: "text-success-600", bg: "bg-success-500" };
  })();

  return (
    <div className="mt-2 min-h-[32px]">
      {password.length > 0 && (
        <div className="flex items-center justify-between gap-3 animate-slide-in">
          <div className="flex gap-1.5 flex-1">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  idx <= score ? strength.bg : "bg-surface-subtle"
                }`}
              />
            ))}
          </div>
          <span
            className={`text-xs font-bold tracking-wide uppercase shrink-0 ${strength.color}`}
          >
            {strength.label}
          </span>
        </div>
      )}
    </div>
  );
}
