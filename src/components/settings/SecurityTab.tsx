"use client";

import { KeyRound, Lock, LogOut, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLogout } from "@/hooks/useAuth";
import { toast } from "sonner";

export function SecurityTab() {
  const logoutMutation = useLogout();

  const handleChangePassword = () => {
    toast.info("Password change coming soon", {
      description: "Contact support to reset your password.",
    });
  };

  const handleSignOutAll = () => {
    toast.info("Session revocation coming soon");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Password */}
      <div className="flex items-start justify-between gap-4 pb-6 border-b border-surface-border">
        <div className="flex gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-subtle border border-surface-border text-text-muted shrink-0">
            <Lock size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-text-primary">
              Password
            </p>
            <p className="text-base text-text-muted mt-0.5">
              Update the passphrase for your account.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleChangePassword}
          leftIcon={<KeyRound size={13} />}
        >
          Change
        </Button>
      </div>

      {/* Active Session */}
      <div className="flex items-start justify-between gap-4 pb-6 border-b border-surface-border">
        <div className="flex gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-subtle border border-surface-border text-text-muted shrink-0">
            <LogOut size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-text-primary">
              Sign Out
            </p>
            <p className="text-base text-text-muted mt-0.5">
              End your current session and return to login.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => logoutMutation.mutate()}
          loading={logoutMutation.isPending}
          leftIcon={<LogOut size={13} />}
        >
          Sign Out
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="border border-error-100 bg-error-50/40 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-error-50 border border-error-100 text-error-600 shrink-0">
            <ShieldAlert size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-error-600">
              Revoke All Sessions
            </p>
            <p className="text-base text-text-muted mt-0.5 mb-3">
              Log out of every device where your account is currently active.
              Useful if you suspect unauthorized access.
            </p>
            <Button
              size="sm"
              variant="danger"
              onClick={handleSignOutAll}
              leftIcon={<ShieldAlert size={13} />}
            >
              Sign Out Everywhere
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
