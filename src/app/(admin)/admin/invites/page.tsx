"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminInvites,
  useCreateOwnerInvite,
} from "@/hooks/admin/useAdminInvites";
import { useAdminPlans } from "@/hooks/admin/useAdminPlans";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Plus, Check, Copy } from "lucide-react";
import type { InviteStatus } from "@/types/invite";

// Explicit non-coerced validation schema
const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  tenantName: z.string().min(1, "Workspace name required"),
  planId: z.string().min(1, "Selection required"),
  expiryDays: z.number().min(3, "Minimum 3 days").max(7, "Maximum 7 days"),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

const statusVariants: Record<
  InviteStatus,
  "warning" | "success" | "gray" | "error"
> = {
  PENDING: "warning",
  ACCEPTED: "success",
  EXPIRED: "gray",
  REVOKED: "error",
};

export default function AdminInvitesPage() {
  const qc = useQueryClient();
  const { data: invites, isLoading, isFetching } = useAdminInvites();
  const { data: plans } = useAdminPlans(false); // Fetch active plans only
  const createMutation = useCreateOwnerInvite();

  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      tenantName: "",
      planId: "",
      expiryDays: 7,
    },
  });

  const handleCreate = (data: InviteFormValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setShowForm(false);
        reset({
          email: "",
          tenantName: "",
          planId: "",
          expiryDays: 7,
        });
      },
    });
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Invite link copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const planOptions =
    plans?.map((p) => ({
      value: p.id,
      label: `${p.name} (₹${(p.perMinuteRate / 100).toFixed(2)}/min)`,
    })) ?? [];

  return (
    <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Tenant Invitations
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Authorize tenant signups by sending custom workspace invitation
            packages.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <RefreshButton
            onRefresh={() =>
              qc.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_INVITES.all })
            }
            isRefreshing={isFetching}
          />
          <Button
            onClick={() => setShowForm(true)}
            className="gap-1.5 h-9 text-sm"
          >
            <Plus size={14} /> Send Invite
          </Button>
        </div>
      </div>

      {/* Invites Catalog */}
      <Card className="overflow-hidden border border-surface-border rounded-xl bg-surface">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Spinner className="text-error-600" />
          </div>
        ) : !invites || invites.length === 0 ? (
          <EmptyState
            icon={<Mail size={24} />}
            title="No invites sent"
            description="Provision an invite to register workspace owners."
          />
        ) : (
          <div className="overflow-x-auto thin-scrollbar">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-muted text-text-secondary font-semibold">
                  <th className="px-5 py-3">Recipient Owner</th>
                  <th className="px-5 py-3">Workspace Name</th>
                  <th className="px-5 py-3">Assigned Plan</th>
                  <th className="px-5 py-3">Invite Status</th>
                  <th className="px-5 py-3">Expiry</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-subtle font-medium text-text-primary">
                {invites.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-surface-muted/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-text-primary">{inv.email}</p>
                      <p className="text-xs text-text-placeholder font-mono">
                        {inv.id.slice(0, 14)}...
                      </p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-text-secondary">
                      {inv.tenantName}
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold">
                      {inv.planName}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={statusVariants[inv.status]}
                        dot={inv.status === "PENDING"}
                        animate={inv.status === "PENDING"}
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-xs text-text-muted">
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {inv.status === "PENDING" && (
                        <button
                          onClick={() => handleCopy(inv.id, inv.inviteUrl)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-border text-xs font-semibold text-text-secondary hover:bg-surface-subtle transition-colors cursor-pointer"
                        >
                          {copiedId === inv.id ? (
                            <>
                              <Check size={12} className="text-brand-600" />{" "}
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy size={12} /> Copy Link
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Invite Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Send Tenant Invitation"
        size="md"
      >
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <Input
            label="Owner Email"
            error={errors.email?.message}
            {...register("email")}
            placeholder="owner@company.com"
          />
          <Input
            label="Workspace / Tenant Name"
            error={errors.tenantName?.message}
            {...register("tenantName")}
            placeholder="Acme Builders Ltd"
          />
          <Select
            label="Default Service Plan"
            error={errors.planId?.message}
            options={planOptions}
            placeholder="Select plan package..."
            {...register("planId")}
          />
          <Input
            label="Invite Link Expiry (Days)"
            type="number"
            error={errors.expiryDays?.message}
            {...register("expiryDays", { valueAsNumber: true })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button size="sm" type="submit" loading={createMutation.isPending}>
              Generate Invitation Link
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
