"use client";

import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User as UserIcon, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function ProfileTab() {
  const { user, memberships, activeTenantId } = useAuthStore();
  const activeMembership = memberships.find(
    (m) => m.tenantId === activeTenantId,
  );

  const handleSave = () => {
    toast.info("Profile updates coming soon", {
      description: "Contact your workspace admin to change your name or email.",
    });
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Avatar & Identity Panel */}
      <div className="flex items-center gap-4 pb-6 border-b border-surface-border">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-2xl font-bold shrink-0">
          {user.name?.charAt(0).toUpperCase() ?? "U"}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-text-primary tracking-tight truncate">
            {user.name}
          </h3>
          <p className="text-base text-text-muted truncate">{user.email}</p>
          {user.isPlatformAdmin && (
            <span className="inline-flex items-center gap-1 mt-1.5 text-base font-mono font-bold bg-error-50 border border-error-100 text-error-600 px-2 py-0.5 rounded uppercase tracking-wider">
              <ShieldCheck size={11} /> Platform Admin
            </span>
          )}
        </div>
      </div>

      {/* Editable Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          leftIcon={<UserIcon size={14} className="text-text-muted" />}
          defaultValue={user.name}
          disabled
        />
        <Input
          label="Email Address"
          leftIcon={<Mail size={14} className="text-text-muted" />}
          defaultValue={user.email}
          disabled
        />
      </div>

      {/* Membership Context */}
      {activeMembership && (
        <div className="bg-surface-subtle border border-surface-border rounded-lg p-4">
          <p className="text-base font-bold text-text-muted uppercase tracking-wider">
            Active Workspace Context
          </p>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-base font-semibold text-text-primary">
                {activeMembership.tenantName}
              </p>
              <p className="text-base text-text-muted mt-0.5">
                Role · {activeMembership.role}
              </p>
            </div>
            <span className="text-base bg-success-50 border border-success-100 text-success-600 font-semibold px-2 py-1 rounded">
              ACTIVE
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end pt-4 border-t border-surface-border">
        <Button onClick={handleSave} size="sm">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
