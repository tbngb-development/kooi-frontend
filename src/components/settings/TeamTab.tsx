"use client";

import { useState } from "react";
import { Plus, Mail, Trash2, Copy, UserPlus, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useAuthStore } from "@/store/authStore";
import { useUsers, useDeleteUser } from "@/hooks/useUsers";
import { useCreateInvite } from "@/hooks/useInvites";
import { formatDate } from "@/lib/utils/formatDate";
import { TenantRole } from "@/types/tenant";

const inviteSchema = z.object({
  email: z.email("Enter a valid email address"),
  role: z.enum(["ADMIN", "USER"]),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export function TeamTab() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { user: currentUser } = useAuthStore();
  const { data: users, isLoading } = useUsers();
  const deleteUser = useDeleteUser();

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-base text-text-muted">
            {users?.length ?? 0} team member
            {(users?.length ?? 0) === 1 ? "" : "s"}
          </p>
          <Button
            size="sm"
            leftIcon={<UserPlus size={13} />}
            onClick={() => setInviteOpen(true)}
          >
            Invite Member
          </Button>
        </div>

        {/* Loading / Empty / List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : !users || users.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-surface-border rounded-lg">
            <UserPlus size={32} className="text-text-placeholder mx-auto" />
            <p className="text-base text-text-muted mt-3">
              No team members yet.
            </p>
            <p className="text-base text-text-placeholder mt-1">
              Invite someone to collaborate with you.
            </p>
          </div>
        ) : (
          <div className="border border-surface-border rounded-lg overflow-hidden divide-y divide-surface-border">
            {users.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-base font-semibold shrink-0">
                  {member.name?.charAt(0).toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-base font-semibold text-text-primary truncate">
                      {member.name}
                    </p>
                    <RoleBadge role={member.role} />
                    {currentUser?.id === member.id && (
                      <span className="text-base font-medium bg-info-50 text-info-600 border border-info-100 px-1.5 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-base text-text-muted truncate mt-0.5">
                    {member.email} · Joined {formatDate(member.createdAt)}
                  </p>
                </div>
                {currentUser?.id !== member.id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setDeleteTarget({ id: member.id, name: member.name })
                    }
                    leftIcon={<Trash2 size={13} className="text-error-500" />}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {inviteOpen && <InviteMemberModal onClose={() => setInviteOpen(false)} />}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={!!deleteTarget}
          title="Remove Team Member?"
          description={`This will permanently remove ${deleteTarget.name} from your workspace. They will lose all access immediately.`}
          confirmLabel="Remove Member"
          variant="danger"
          onConfirm={() => {
            deleteUser.mutate(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}

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
  const c = config[role];
  return (
    <span
      className={`inline-flex items-center gap-1 text-base font-semibold px-1.5 py-0.5 rounded ${c.className}`}
    >
      <Shield size={9} /> {c.label}
    </span>
  );
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────

function InviteMemberModal({ onClose }: { onClose: () => void }) {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const createInvite = useCreateInvite();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "USER" },
  });

  const onSubmit = (values: InviteFormValues) => {
    createInvite.mutate(values, {
      onSuccess: (data) => {
        setInviteUrl(data.inviteUrl);
      },
    });
  };

  const handleCopyLink = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Invite link copied to clipboard");
  };

  return (
    <Modal isOpen onClose={onClose} title="Invite Team Member">
      {inviteUrl ? (
        <div className="flex flex-col gap-4">
          <div className="bg-success-50 border border-success-100 rounded-lg p-4 text-center">
            <p className="text-base font-semibold text-success-600">
              Invite Link Generated
            </p>
            <p className="text-base text-text-muted mt-1">
              Share this link with your new team member. Expires in 7 days.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 border border-surface-border bg-surface-subtle rounded-md font-mono text-base text-text-secondary truncate">
              {inviteUrl}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyLink}
              leftIcon={<Copy size={13} />}
            >
              Copy
            </Button>
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="teammate@company.com"
            leftIcon={<Mail size={14} className="text-text-muted" />}
            error={errors.email?.message}
            {...register("email")}
          />

          <div>
            <label className="block text-base font-semibold text-text-secondary mb-1.5">
              Role
            </label>
            <select
              {...register("role")}
              className="w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="USER">Member — Can view and use resources</option>
              <option value="ADMIN">Admin — Full workspace access</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={createInvite.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={createInvite.isPending}
              leftIcon={<Plus size={13} />}
            >
              Generate Invite
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
