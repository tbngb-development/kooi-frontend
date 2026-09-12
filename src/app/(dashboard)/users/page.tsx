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
import { TenantRole } from "@/types/tenant";
import { TeamMember } from "@/types/user";

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
      className: "bg-info-50 text-info-700 border border-info-200",
    },
    USER: {
      label: "Member",
      className:
        "bg-surface-subtle text-text-secondary border border-surface-border",
    },
  };
  const c = config[role] ?? config.USER;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${c.className}`}
    >
      <Shield size={12} strokeWidth={2.5} />
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
          icon={<Shield size={28} className="text-error-500" />}
          title="Access Restricted"
          description="You do not have permission to view or manage team members. Please contact your workspace administrator."
        />
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="py-12">
        <PageSpinner />
      </div>
    );

  const onInvite = (data: InviteFormValues) => {
    createUser(data, {
      onSuccess: () => {
        setInviteOpen(false);
        reset();
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Users size={24} className="text-brand-600" />
            Team Members
          </h1>
          <p className="text-sm font-medium text-text-muted mt-1">
            Manage roles and configure workspace access privileges for your
            team.
          </p>
        </div>
        <Button
          size="md"
          leftIcon={<Plus size={16} strokeWidth={2.5} />}
          onClick={() => setInviteOpen(true)}
          className="w-full sm:w-auto shadow-sm"
        >
          Add Member
        </Button>
      </div>

      {/* ─── Users Data Table ─── */}
      {users && users.length > 0 ? (
        <div className="bg-surface rounded-xl border border-surface-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto thin-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-border bg-surface-subtle">
                  <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">
                    Member Identity
                  </th>
                  <th className="px-5 py-4 text-xs font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">
                    Assigned Role
                  </th>
                  <th className="px-5 py-4 text-xs font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">
                    Joined Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-surface-hover/60 transition-colors duration-normal ease-out"
                  >
                    {/* Identity */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-bold shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-bold text-text-primary truncate">
                            {u.name}
                          </p>
                          <p className="text-sm font-medium text-text-muted mt-0.5 truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <RoleBadge role={u.role} />
                        {currentUser?.id === u.id && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-surface-muted text-text-muted border border-surface-border px-1.5 py-0.5 rounded-md">
                            You
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-base font-medium text-text-secondary">
                        {formatDate(u.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {u.id !== currentUser?.id && u.role !== "OWNER" ? (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(u)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-error-600 hover:bg-error-50 border border-transparent hover:border-error-200 transition-all ml-auto focus-ring"
                          aria-label={`Remove member ${u.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <span className="text-sm text-text-placeholder italic inline-block w-8 text-center">
                          —
                        </span>
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
          icon={<Users size={28} className="text-text-placeholder" />}
          title="No team members configured"
          description="Provision access by creating credentials for your teammates."
          action={
            <Button
              size="md"
              leftIcon={<Plus size={16} />}
              onClick={() => setInviteOpen(true)}
              className="shadow-sm font-semibold"
            >
              Add first member
            </Button>
          }
        />
      )}

      {/* ─── Provision Workspace Access Modal ─── */}
      {inviteOpen && (
        <Modal
          isOpen={inviteOpen}
          onClose={() => {
            setInviteOpen(false);
            reset();
          }}
          size="md"
          title="Provision Workspace Access"
        >
          <form
            onSubmit={handleSubmit(onInvite)}
            className="flex flex-col gap-5 mt-2"
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
              <label className="text-base font-medium text-text-secondary">
                Assigned Role
              </label>
              <select
                {...register("role")}
                disabled={creating}
                className="w-full h-9 px-3 rounded-md border border-surface-border bg-surface text-base font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-text-placeholder transition-colors cursor-pointer"
              >
                <option value="USER">
                  Member — View stats and manage campaign configurations
                </option>
                <option value="ADMIN">
                  Admin — Full workspace settings & team management control
                </option>
              </select>
              {errors.role?.message && (
                <p className="text-sm text-error-600 mt-1">
                  {errors.role.message}
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 mt-2 border-t border-surface-border">
              <Button
                type="button"
                variant="outline"
                size="md"
                className="w-full sm:w-auto"
                onClick={() => {
                  setInviteOpen(false);
                  reset();
                }}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="md"
                loading={creating}
                className="w-full sm:w-auto"
              >
                Provision Account
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── Revoke Membership Confirmation Modal ─── */}
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
