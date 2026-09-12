"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  useCurrentWorkspace,
  useUpdateCurrentWorkspace,
} from "@/hooks/useTenants";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { User as UserIcon, Mail, Building2, Save } from "lucide-react";
import { toast } from "sonner";

export function ProfileWorkspaceTab() {
  const { user, memberships, activeTenantId } = useAuthStore();
  const { data: workspace, isLoading: workspaceLoading } =
    useCurrentWorkspace();
  const updateMutation = useUpdateCurrentWorkspace();

  const [workspaceName, setWorkspaceName] = useState("");

  const activeMembership = memberships.find(
    (m) => m.tenantId === activeTenantId,
  );
  const isPrivileged =
    activeMembership?.role === "OWNER" ||
    activeMembership?.role === "ADMIN" ||
    user?.isPlatformAdmin;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (workspace?.name) setWorkspaceName(workspace.name);
  }, [workspace?.name]);

  const handleProfileSave = () => {
    toast.info("Profile updates restricted", {
      description:
        "Contact platform administration to change your core identity.",
    });
  };

  const handleWorkspaceSave = () => {
    if (!workspaceName.trim()) {
      toast.error("Workspace name cannot be empty");
      return;
    }
    updateMutation.mutate({ name: workspaceName.trim() });
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-8">
      {/* ─── Part 1: Personal Identity (Read-only) ─── */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-2xl font-bold shrink-0">
            {user.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-text-primary tracking-tight truncate">
              {user.name}
            </h3>
            <p className="text-sm font-medium text-text-muted truncate mt-0.5">
              {user.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            leftIcon={<UserIcon size={14} className="text-text-placeholder" />}
            defaultValue={user.name}
            disabled
          />
          <Input
            label="Email Address"
            leftIcon={<Mail size={14} className="text-text-placeholder" />}
            defaultValue={user.email}
            disabled
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleProfileSave} size="sm" variant="secondary">
            Request Identity Change
          </Button>
        </div>
      </div>

      <div className="h-px w-full bg-surface-border" />

      {/* ─── Part 2: Active Workspace Context ─── */}
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
            Active Workspace Configuration
          </h3>
          <p className="text-sm text-text-secondary font-medium">
            Manage the branding and identity of your current organization.
          </p>
        </div>

        {workspaceLoading ? (
          <div className="py-8 flex justify-center">
            <Spinner className="text-brand-600" />
          </div>
        ) : !workspace ? (
          <p className="text-sm text-text-muted italic">
            Workspace context unavailable.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              <Input
                label="Organization Name"
                leftIcon={
                  <Building2 size={14} className="text-text-placeholder" />
                }
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                maxLength={100}
                disabled={!isPrivileged}
              />
            </div>

            {isPrivileged && (
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWorkspaceName(workspace.name)}
                  disabled={
                    workspaceName.trim() === workspace.name ||
                    updateMutation.isPending
                  }
                >
                  Discard Revisions
                </Button>
                <Button
                  size="sm"
                  onClick={handleWorkspaceSave}
                  disabled={workspaceName.trim() === workspace.name}
                  loading={updateMutation.isPending}
                  leftIcon={<Save size={14} />}
                >
                  Save Workspace
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
