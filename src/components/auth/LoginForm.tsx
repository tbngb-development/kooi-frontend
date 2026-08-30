"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLogin, useSelectTenant } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Building,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { V1User, Membership } from "@/store/authStore";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"credentials" | "tenant-select">(
    "credentials",
  );

  const [tempUser, setTempUser] = useState<V1User | null>(null);
  const [availableTenants, setAvailableTenants] = useState<Membership[]>([]);

  const { mutate: login, isPending: isLoginPending } = useLogin();
  const { mutate: selectTenant, isPending: isSelectPending } =
    useSelectTenant();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (data: FormValues) => {
    login(data, {
      onSuccess: (res) => {
        if (res?.requiresTenantSelection) {
          setTempUser({
            id: res.user.id,
            email: res.user.email,
            name: res.user.name,
            isPlatformAdmin: res.user.isPlatformAdmin,
          });
          setAvailableTenants(res.memberships);
          setStep("tenant-select");
        }
      },
    });
  };

  const handleSelectTenant = (tenantId: string) => {
    if (!tempUser) return;
    selectTenant({
      tenantId,
      user: tempUser,
      memberships: availableTenants,
    });
  };

  // ─── Tenant Selection Step ─────────────────────────────────────────────
  if (step === "tenant-select" && tempUser) {
    return (
      <div className="bg-surface border border-surface-border rounded-xl shadow-sm p-7">
        <button
          onClick={() => setStep("credentials")}
          disabled={isSelectPending}
          className="flex items-center gap-1.5 text-base text-text-muted hover:text-text-primary transition-colors mb-5 disabled:opacity-50"
        >
          <ArrowLeft size={13} />
          <span>Back to sign in</span>
        </button>

        <div className="mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 border border-brand-100 text-brand-600 mb-4 shadow-sm">
            <Building size={20} />
          </div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            Select your workspace
          </h2>
          <p className="text-base text-text-muted mt-1.5">
            Hi {tempUser.name}, choose which workspace to enter.
          </p>
        </div>

        <div
          className="flex flex-col gap-2 max-h-72 overflow-y-auto thin-scrollbar pr-1 -mr-1"
          role="listbox"
          aria-label="Available workspaces"
        >
          {availableTenants.map((membership) => (
            <button
              key={membership.tenantId}
              onClick={() => handleSelectTenant(membership.tenantId)}
              disabled={isSelectPending}
              className="w-full flex items-center justify-between p-3.5 rounded-lg border border-surface-border hover:border-brand-500 hover:bg-brand-50/40 text-left transition-all group disabled:opacity-60 disabled:pointer-events-none focus-ring"
              role="option"
              aria-selected="false"
            >
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-text-primary group-hover:text-brand-700 truncate">
                  {membership.tenantName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck size={11} className="text-text-muted" />
                  <span className="text-base text-text-muted capitalize">
                    {membership.role.toLowerCase()}
                  </span>
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-text-muted group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all shrink-0"
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── Credentials Step ──────────────────────────────────────────────────
  return (
    <div className="bg-surface border border-surface-border rounded-xl shadow-sm p-7">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">
          Sign in
        </h2>
        <p className="text-base text-text-muted mt-1.5">
          Enter your credentials to access your Kooi workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@company.com"
          leftIcon={<Mail size={14} className="text-text-muted" />}
          error={errors.email?.message}
          disabled={isLoginPending}
          autoComplete="email"
          {...register("email")}
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-base font-semibold text-text-secondary">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-base font-medium text-brand-600 hover:text-brand-500 transition-colors"
              tabIndex={-1}
            >
              Forgot?
            </Link>
          </div>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<Lock size={14} className="text-text-muted" />}
            disabled={isLoginPending}
            autoComplete="current-password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="focus-ring rounded p-0.5 text-text-muted hover:text-text-secondary transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <Button
          type="submit"
          loading={isLoginPending}
          className="w-full mt-2 h-11 font-semibold"
        >
          Sign in
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-surface-border text-center">
        <p className="text-base text-text-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand-600 hover:text-brand-500 transition-colors"
          >
            Start free trial
          </Link>
        </p>
      </div>
    </div>
  );
}
