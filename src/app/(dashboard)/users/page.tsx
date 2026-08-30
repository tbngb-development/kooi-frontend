"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Users, Shield, Mail, Lock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useUsers, useCreateUser, useDeleteUser } from "@/hooks/useUsers";
import { formatDate } from "@/lib/utils/formatDate";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import type { TeamMember } from "@/types";
import type { TenantRole } from "@/store/authStore";

// ─── Invite Form Validation Schema ───────────────────────────────────────────
const inviteSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Temporary password must be at least 8 characters"),
  role: z.enum(["ADMIN", "USER"]),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

// ─── Custom Status Badges ─────────────────────────────────────────────────────
function RoleBadge({ role }: { role: TenantRole }) {
  const config: Record<TenantRole, { label: string; className: string }> = {
    OWNER: {
      label: "Owner",
      className: "bg-brand-50 text-brand-700 border border-brand-100",
    },
    ADMIN: {
      label: "Admin",
      className: "bg-info-50 text-info-600 border border-info-100",
    },
    USER: {
      label: "Member",
      className:
        "bg-surface-subtle text-text-muted border border-surface-border",
    },
  };
  const c = config[role] ?? config.USER;
  return (
    <span
      className={`inline-flex items-center gap-1 text-base font-semibold px-2 py-0.5 rounded-full ${c.className}`}
    >
      <Shield size={10} />
      <span>{c.label}</span>
    </span>
  );
}

export default function UsersPage() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);

  const { user: currentUser, memberships, activeTenantId } = useAuthStore();

  // Queries & Mutations
  const { data: users, isLoading } = useUsers();
  const { mutate: createUser, isPending: creating } = useCreateUser();
  const { mutate: deleteUser, isPending: deleting } = useDeleteUser();

  // Active membership resolution
  const activeMembership = memberships.find(
    (m) => m.tenantId === activeTenantId,
  );
  const activeRole = activeMembership?.role ?? null;
  const isPlatformAdmin = currentUser?.isPlatformAdmin ?? false;

  // Permissions gate: ADMIN, OWNER, or PLATFORM ADMIN can view/manage
  const isPrivileged =
    activeRole === "ADMIN" || activeRole === "OWNER" || isPlatformAdmin;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "USER" },
  });

  // Guard: Unauthorized access layout
  if (!isPrivileged) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] px-4 max-w-7xl mx-auto">
        <EmptyState
          icon={<Shield size={24} className="text-error-500" />}
          title="Access Restricted"
          description="You do not have permission to view or manage team members. Please contact your workspace administrator to modify environment structures."
        />
      </div>
    );
  }

  if (isLoading) return <PageSpinner />;

  const onInvite = (data: InviteFormValues) => {
    createUser(data, {
      onSuccess: () => {
        setInviteOpen(false);
        reset();
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            Team Members
          </h2>
          <p className="text-base text-text-muted mt-1">
            Manage roles and configure workspace access privileges for Kooi
            agents
          </p>
        </div>
        <Button
          size="sm"
          leftIcon={<Plus size={13} />}
          onClick={() => setInviteOpen(true)}
          className="shadow-sm font-semibold"
        >
          Add Member
        </Button>
      </div>

      {/* Users Data Table */}
      {users && users.length > 0 ? (
        <div className="bg-surface rounded-xl border border-surface-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto thin-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-border bg-surface-subtle">
                  <th className="px-6 py-4 text-base font-bold text-text-muted uppercase tracking-wider">
                    Member Identity
                  </th>
                  <th className="px-4 py-4 text-base font-bold text-text-muted uppercase tracking-wider">
                    Assigned Role
                  </th>
                  <th className="px-4 py-4 text-base font-bold text-text-muted uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-surface-hover/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-sm font-bold shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-semibold text-text-primary truncate">
                            {u.name}
                          </p>
                          <p className="text-base text-text-muted mt-0.5 truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-base text-text-muted">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {u.id !== currentUser?.id && u.role !== "OWNER" && (
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-error-600 hover:bg-error-50 border border-transparent hover:border-error-100 transition-all ml-auto"
                          aria-label={`Remove member ${u.name}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<Users size={24} className="text-text-placeholder" />}
          title="No team members configured"
          description="Provision access by creating temporary credentials for teammates."
          action={
            <Button
              size="sm"
              leftIcon={<Plus size={13} />}
              onClick={() => setInviteOpen(true)}
              className="shadow-sm font-semibold"
            >
              Add first member
            </Button>
          }
        />
      )}

      {/* Provision Workspace Access Modal */}
      {inviteOpen && (
        <Modal
          isOpen={inviteOpen}
          onClose={() => {
            setInviteOpen(false);
            reset();
          }}
          size="lg"
          title="Provision Workspace Access"
        >
          <form
            onSubmit={handleSubmit(onInvite)}
            className="flex flex-col gap-4 mt-2"
          >
            <Input
              label="Full name"
              placeholder="Jane Smith"
              leftIcon={<Users size={14} className="text-text-muted" />}
              error={errors.name?.message}
              disabled={creating}
              {...register("name")}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="jane@company.com"
              leftIcon={<Mail size={14} className="text-text-muted" />}
              error={errors.email?.message}
              disabled={creating}
              {...register("email")}
            />

            <Input
              label="Temporary password"
              type="password"
              placeholder="At least 8 characters"
              leftIcon={<Lock size={14} className="text-text-muted" />}
              error={errors.password?.message}
              disabled={creating}
              {...register("password")}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-base font-semibold text-text-secondary">
                Assigned Role
              </label>
              <select
                {...register("role")}
                disabled={creating}
                className="w-full h-10 px-3 rounded-md border border-surface-border bg-surface text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="USER">
                  Member — View stats and manage campaign configurations
                </option>
                <option value="ADMIN">
                  Admin — Full workspace settings & team management control
                </option>
              </select>
              {errors.role?.message && (
                <p className="text-base text-error-600 mt-1">
                  {errors.role.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-surface-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setInviteOpen(false);
                  reset();
                }}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={creating}>
                Provision Account
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Revoke Membership Confirmation Modal */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (deleteTarget) {
              deleteUser(deleteTarget.id, {
                onSuccess: () => setDeleteTarget(null),
              });
            }
          }}
          title="Revoke Workspace Membership?"
          description={`Are you sure you want to remove "${deleteTarget.name}"? They will lose all active sessions and workspace access immediately.`}
          confirmLabel="Revoke Access"
          variant="danger"
          loading={deleting}
        />
      )}
    </div>
  );
}
