"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAdminLogin } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const adminSchema = z.object({
  email: z.string().email("Enter a valid admin identity email"),
  password: z.string().min(1, "Password is required"),
});

type AdminFormValues = z.infer<typeof adminSchema>;

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useAdminLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminFormValues>({ resolver: zodResolver(adminSchema) });

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-surface-muted px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto border-error-100 bg-surface text-text-primary shadow-lg rounded-lg">
        {/* Header Section */}
        <div className="mb-6">
          <div className="h-12 w-12 rounded-xl bg-error-50 border border-error-100 flex items-center justify-center text-error-600 mb-4 shadow-sm animate-pulse">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            Super Admin Access
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Restricted zone — authorized platform systems personnel only.
          </p>
        </div>

        {/* Credentials Form */}
        <form
          onSubmit={handleSubmit((data) => login(data))}
          className="flex flex-col gap-4"
        >
          <Input
            label="Admin Email address"
            type="email"
            placeholder="admin@system.com"
            leftIcon={<Mail size={14} className="text-text-muted" />}
            error={errors.email?.message}
            disabled={isPending}
            className="bg-surface-subtle text-text-primary border-surface-border placeholder-text-placeholder focus:ring-error-500 focus:border-error-500"
            {...register("email")}
          />

          <Input
            label="Security Passphrase"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<Lock size={14} className="text-text-muted" />}
            disabled={isPending}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="focus-ring rounded p-1 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
            error={errors.password?.message}
            className="bg-surface-subtle text-text-primary border-surface-border placeholder-text-placeholder focus:ring-error-500 focus:border-error-500"
            {...register("password")}
          />

          <Button
            type="submit"
            loading={isPending}
            className="w-full mt-2 bg-error-600 hover:bg-error-500 text-text-inverse font-semibold shadow-sm transition-all border-none"
          >
            Authenticate Admin Session
          </Button>
        </form>
      </Card>
    </div>
  );
}
