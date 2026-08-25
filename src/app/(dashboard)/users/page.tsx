// src/app/(dashboard)/users/page.tsx

'use client';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSpinner } from '@/components/ui/Spinner';
import { useUsers, useCreateUser, useDeleteUser } from '@/hooks/useUsers';
import { useAuthStore } from '@/store/authStore';
import { formatDate } from '@/lib/utils/formatDate';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { User } from '@/types';

const inviteSchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Min 8 characters'),
  role: z.enum(['ADMIN', 'USER']),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

const ROLE_OPTIONS = [
  { value: 'USER', label: 'User (read-only)' },
  { value: 'ADMIN', label: 'Admin (full access)' },
];

function RoleBadge({ role }: { role: string }) {
  if (role === 'ADMIN') return <Badge variant="info">Admin</Badge>;
  return <Badge variant="gray">User</Badge>;
}

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const { data: users, isLoading } = useUsers();
  const { mutate: createUser, isPending: creating } = useCreateUser();
  const { mutate: deleteUser, isPending: deleting } = useDeleteUser();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'USER' },
  });

  if (currentUser?.role !== 'ADMIN') {
    return (
      <EmptyState
        title="Access restricted"
        description="Only admins can manage team members."
        icon={<Users size={22} />}
      />
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
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Team</h2>
          <p className="text-base text-text-muted mt-0.5">
            Manage your team members
          </p>
        </div>
        <Button
          leftIcon={<Plus size={15} />}
          onClick={() => setInviteOpen(true)}
        >
          Invite Member
        </Button>
      </div>

      {users && users.length > 0 ? (
        <div className="bg-surface rounded-lg border border-surface-border overflow-hidden">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-surface-border bg-surface-subtle">
                <th className="text-left px-5 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                  Member
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                  Role
                </th>
                <th className="text-left px-5 py-3 text-sm font-medium text-text-muted uppercase tracking-wide">
                  Joined
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-sm font-semibold shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{u.name}</p>
                        <p className="text-sm text-text-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-5 py-3 text-text-muted text-sm">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => setDeleteTarget(u)}
                        className="flex h-7 w-7 items-center justify-center rounded text-text-muted hover:text-error-600 hover:bg-error-50 transition-colors ml-auto"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<Users size={22} />}
          title="No team members yet"
          description="Invite your first team member to get started."
        />
      )}

      {/* Invite Modal */}
      <Modal
        isOpen={inviteOpen}
        onClose={() => {
          setInviteOpen(false);
          reset();
        }}
        title="Invite Team Member"
      >
        <form
          onSubmit={handleSubmit(onInvite)}
          className="flex flex-col gap-4"
        >
          <Input
            label="Full name"
            placeholder="Jane Smith"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email address"
            type="email"
            placeholder="jane@company.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Temporary password"
            type="password"
            placeholder="At least 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />
          <Select
            label="Role"
            options={ROLE_OPTIONS}
            error={errors.role?.message}
            {...register('role')}
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setInviteOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={creating}>
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
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
        title="Remove Team Member"
        description={`Are you sure you want to remove ${deleteTarget?.name}? They will lose access immediately.`}
        loading={deleting}
      />
    </div>
  );
}