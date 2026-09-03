"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { usePublicInvite, useAcceptOwnerInvite } from "@/hooks/useOwnerInvite";
import { useSelectTenant } from "@/hooks/useAuth"; // Import select tenant hook
import { useAuthStore } from "@/store/authStore";
import { APP_ROUTES } from "@/constants/routes/app.routes";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Eye, EyeOff, Lock, User as UserIcon, ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { User } from "@/types/user";
import type { Membership } from "@/types/tenant";

const acceptSchema = z.object({
  name: z.string().min(1, "Display name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AcceptFormValues = z.infer<typeof acceptSchema>;

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function AcceptInvitePage({ params }: PageProps) {
  const { token } = use(params);
  const router = useRouter();
  const { setPaymentRequired } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const { data: invite, isLoading, error } = usePublicInvite(token);
  const { mutate: acceptInvite, isPending: isAccepting } =
    useAcceptOwnerInvite();
  const { mutate: selectTenant, isPending: isSelectingTenant } =
    useSelectTenant();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptFormValues>({
    resolver: zodResolver(acceptSchema),
    defaultValues: { name: "", password: "" },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <Spinner className="text-brand-600 h-8 w-8" />
      </div>
    );
  }

  if (error || !invite || invite.status !== "PENDING") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted p-4">
        <Card className="max-w-md w-full p-8 text-center border-error-100">
          <ShieldAlert size={44} className="text-error-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary">
            Invitation Invalid
          </h2>
          <p className="text-sm text-text-muted mt-2 mb-6">
            This invitation link has expired, been revoked, or already accepted.
            Contact your administrator for assistance.
          </p>
          <Button
            onClick={() => router.push(APP_ROUTES.LOGIN)}
            className="w-full"
          >
            Back to Sign In
          </Button>
        </Card>
      </div>
    );
  }

  const onSubmit = (data: AcceptFormValues) => {
    acceptInvite(
      {
        token,
        email: invite.email,
        name: data.name,
        password: data.password,
      },
      {
        onSuccess: (res) => {
          const userObj: User = {
            id: res.user.id,
            email: res.user.email,
            name: res.user.name,
            isPlatformAdmin: false,
          };

          const structuredMembership: Membership = {
            membershipId: res.membership.id,
            tenantId: res.tenant.id,
            tenantName: res.tenant.name,
            role: res.membership.role,
          };

          // Lock the payment required flag before selecting tenant context
          setPaymentRequired(res.paymentRequired);

          // Force context selection immediately after account activation
          selectTenant({
            tenantId: res.tenant.id,
            user: userObj,
            memberships: [structuredMembership],
          });
        },
      },
    );
  };

  const isWorking = isAccepting || isSelectingTenant;

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted p-4 sm:p-6 lg:p-8">
      <Card className="max-w-md w-full p-6 sm:p-8 border border-surface-border rounded-xl shadow-md bg-surface">
        <div className="mb-6">
          <Badge variant="purple" className="mb-3">
            Workspace Invitation
          </Badge>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Claim Workspace
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Complete your profile setup to configure the{" "}
            <strong className="text-text-secondary">{invite.tenantName}</strong>{" "}
            workspace.
          </p>
        </div>

        <Alert variant="info" className="mb-5">
          Plan Package:{" "}
          <strong className="font-extrabold capitalize">
            {invite.plan.name}
          </strong>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Identity"
            type="email"
            value={invite.email}
            disabled
            className="bg-surface-subtle"
          />

          <Input
            label="Full Display Name"
            error={errors.name?.message}
            disabled={isWorking}
            leftIcon={<UserIcon size={14} className="text-text-placeholder" />}
            placeholder="John Doe"
            {...register("name")}
          />

          <div className="relative">
            <Input
              label="Establish Access Password"
              type={showPassword ? "text" : "password"}
              error={errors.password?.message}
              disabled={isWorking}
              leftIcon={<Lock size={14} className="text-text-placeholder" />}
              placeholder="••••••••"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-text-placeholder hover:text-text-primary cursor-pointer focus:outline-none"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
              {...register("password")}
            />
          </div>

          <Button
            type="submit"
            loading={isWorking}
            className="w-full mt-2 h-11 text-base font-semibold"
          >
            Activate Account
          </Button>
        </form>
      </Card>
    </div>
  );
}
