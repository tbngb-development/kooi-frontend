"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminBolnaKeys,
  useCreateBolnaKey,
  useAssignBolnaKey,
  useDeactivateBolnaKey,
} from "@/hooks/admin/useAdminBolnaKeys";
import { useTenants } from "@/hooks/admin/useAdminTenants";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { KeyRound, Plus, UserPlus, Power, Eye, EyeOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminApiKeysPage() {
  const qc = useQueryClient();
  const { data: keys, isLoading, isFetching } = useAdminBolnaKeys();
  const { data: tenants } = useTenants();
  const createMutation = useCreateBolnaKey();
  const assignMutation = useAssignBolnaKey();
  const deactivateMutation = useDeactivateBolnaKey();

  const [showCreate, setShowCreate] = useState(false);
  const [keyId, setKeyId] = useState("");
  const [plainKey, setPlainKey] = useState("");
  const [keyType, setKeyType] = useState<"GENERAL" | "CUSTOM">("GENERAL");
  const [isDefault, setIsDefault] = useState(false);
  const [showPlain, setShowPlain] = useState(false);

  const [assignKeyId, setAssignKeyId] = useState<string | null>(null);
  const [assignTenantId, setAssignTenantId] = useState("");

  const [deactivateKeyId, setDeactivateKeyId] = useState<string | null>(null);

  const handleCreate = () => {
    createMutation.mutate(
      {
        keyIdentifier: keyId,
        plainTextKey: plainKey,
        type: keyType,
        isPlatformDefault: isDefault,
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          setKeyId("");
          setPlainKey("");
          setKeyType("GENERAL");
          setIsDefault(false);
        },
      },
    );
  };

  const handleAssign = () => {
    if (!assignKeyId || !assignTenantId) return;
    assignMutation.mutate(
      { id: assignKeyId, tenantId: assignTenantId },
      {
        onSuccess: () => {
          setAssignKeyId(null);
          setAssignTenantId("");
        },
      },
    );
  };

  const handleDeactivate = () => {
    if (!deactivateKeyId) return;
    deactivateMutation.mutate(deactivateKeyId, {
      onSuccess: () => setDeactivateKeyId(null),
    });
  };

  const tenantOptions =
    tenants?.map((t) => ({ value: t.id, label: t.name })) ?? [];

  return (
    <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Bolna API Keys
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage the pool of Bolna API keys distributed across tenants.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <RefreshButton
            onRefresh={() =>
              qc.invalidateQueries({
                queryKey: QUERY_KEYS.ADMIN_BOLNA_KEYS.all,
              })
            }
            isRefreshing={isFetching}
          />
          <Button
            onClick={() => setShowCreate(true)}
            className="gap-1.5 h-9 text-sm"
          >
            <Plus size={14} /> Add Key
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border border-surface-border rounded-xl bg-surface">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Spinner className="text-error-600" />
          </div>
        ) : !keys || keys.length === 0 ? (
          <EmptyState
            icon={<KeyRound size={24} />}
            title="No API keys"
            description="Add a Bolna API key to enable voice agent routing."
          />
        ) : (
          <div className="overflow-x-auto thin-scrollbar">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-muted text-text-secondary font-semibold">
                  <th className="px-5 py-3">Key Identifier</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Assigned Tenants</th>
                  <th className="px-5 py-3">Last Accessed</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-subtle font-medium text-text-primary">
                {keys.map((key) => (
                  <tr
                    key={key.id}
                    className="hover:bg-surface-muted/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold font-mono text-xs">
                        {key.keyIdentifier}
                      </p>
                      {key.isPlatformDefault && (
                        <Badge variant="purple" className="mt-1 text-[10px]">
                          Platform Default
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={key.type === "GENERAL" ? "info" : "warning"}
                      >
                        {key.type}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={key.isActive ? "success" : "error"}
                        dot={key.isActive}
                      >
                        {key.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-bold">
                      {key.assignedTenantCount}
                    </td>
                    <td className="px-5 py-4 text-xs text-text-muted">
                      {key.lastAccessedAt
                        ? formatDistanceToNow(new Date(key.lastAccessedAt), {
                            addSuffix: true,
                          })
                        : "Never"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {key.isActive && (
                          <>
                            <button
                              onClick={() => {
                                setAssignKeyId(key.id);
                                setAssignTenantId("");
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-surface-border text-xs font-semibold text-text-secondary hover:bg-surface-subtle transition-colors cursor-pointer"
                            >
                              <UserPlus size={12} /> Assign
                            </button>
                            <button
                              onClick={() => setDeactivateKeyId(key.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-error-100 text-xs font-semibold text-error-600 hover:bg-error-50 transition-colors cursor-pointer"
                            >
                              <Power size={12} /> Deactivate
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Key Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Add Bolna API Key"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Key Identifier"
            value={keyId}
            onChange={(e) => setKeyId(e.target.value)}
            placeholder="e.g. bolna-prod-01"
          />
          <div className="relative">
            <Input
              label="Plain Text Key"
              type={showPlain ? "text" : "password"}
              value={plainKey}
              onChange={(e) => setPlainKey(e.target.value)}
              placeholder="sk-..."
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPlain(!showPlain)}
                  className="text-text-muted hover:text-text-primary cursor-pointer"
                >
                  {showPlain ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />
          </div>
          <Select
            label="Key Type"
            value={keyType}
            onChange={(e) => setKeyType(e.target.value as "GENERAL" | "CUSTOM")}
            options={[
              { value: "GENERAL", label: "General Purpose" },
              { value: "CUSTOM", label: "Custom / Dedicated" },
            ]}
          />
          <label className="flex items-center gap-2 text-sm font-medium text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded border-surface-border"
            />
            Set as Platform Default
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              loading={createMutation.isPending}
              disabled={!keyId || !plainKey}
            >
              Add Key
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Modal */}
      <Modal
        isOpen={!!assignKeyId}
        onClose={() => setAssignKeyId(null)}
        title="Assign Key to Tenant"
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="Select Tenant"
            value={assignTenantId}
            onChange={(e) => setAssignTenantId(e.target.value)}
            options={tenantOptions}
            placeholder="Choose a tenant..."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAssignKeyId(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAssign}
              loading={assignMutation.isPending}
              disabled={!assignTenantId}
            >
              Assign
            </Button>
          </div>
        </div>
      </Modal>

      {/* Deactivate Confirm */}
      <ConfirmModal
        isOpen={!!deactivateKeyId}
        onClose={() => setDeactivateKeyId(null)}
        onConfirm={handleDeactivate}
        title="Deactivate API Key"
        description="This key will be deactivated immediately. All tenants currently using this key will be automatically reassigned to the platform default key. This action cannot be undone."
        confirmLabel="Deactivate"
        variant="danger"
        loading={deactivateMutation.isPending}
      />
    </div>
  );
}
