"use client";

import { use, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/hooks/admin/useAdminTenants";
import {
  useAdminAssistants,
  useAdminBolnaAgents,
  useAdminRegisterAssistant,
  useAdminDeleteAssistant,
} from "@/hooks/admin/useAdminAssistants";
import { adminAssistantsApi } from "@/lib/api/admin/admin-assistants";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import { ADMIN_ROUTES } from "@/constants/routes/admin.routes";
import { AdminTenantNav } from "@/components/admin/AdminTenantNav";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { getAxiosErrorMessage } from "@/lib/axios-error-message";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bot, Plus, RefreshCw, Pencil, Trash2 } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminTenantAssistantsPage({ params }: PageProps) {
  const { id: tenantId } = use(params);
  const qc = useQueryClient();

  const { data: tenant } = useTenant(tenantId);
  const {
    data: assistants,
    isLoading,
    isFetching,
  } = useAdminAssistants(tenantId);
  const { data: bolnaAgents } = useAdminBolnaAgents();

  const registerMutation = useAdminRegisterAssistant(tenantId);
  const deleteMutation = useAdminDeleteAssistant(tenantId);

  // Inline mutations for sync and rename to avoid hook-order issues
  const syncMutation = useMutation({
    mutationFn: (id: string) => adminAssistantsApi.adminSync(tenantId, id),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.ASSISTANTS.adminList(tenantId),
      });
      toast.success("Synchronized with Bolna");
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      adminAssistantsApi.adminUpdate(id, { name, tenantId }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.ASSISTANTS.adminList(tenantId),
      });
      setEditId(null);
      toast.success("Assistant renamed");
    },
    onError: (err: unknown) => toast.error(getAxiosErrorMessage(err)),
  });

  const [showRegister, setShowRegister] = useState(false);
  const [regName, setRegName] = useState("");
  const [regBolnaId, setRegBolnaId] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleRegister = () => {
    registerMutation.mutate(
      { name: regName, bolnaId: regBolnaId },
      {
        onSuccess: () => {
          setShowRegister(false);
          setRegName("");
          setRegBolnaId("");
        },
      },
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-muted">
      <AdminTenantNav tenantId={tenantId} tenantName={tenant?.name ?? "..."} />
      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        <AdminPageHeader
          title="Assistants"
          description="Manage AI voice agents assigned to this tenant"
          backHref={ADMIN_ROUTES.TENANT_DETAIL(tenantId)}
          onRefresh={() =>
            qc.invalidateQueries({
              queryKey: QUERY_KEYS.ASSISTANTS.adminList(tenantId),
            })
          }
          isRefreshing={isFetching}
          actions={
            <Button
              onClick={() => setShowRegister(true)}
              className="gap-1.5 h-9 text-sm"
            >
              <Plus size={14} /> Register Agent
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full p-12 flex justify-center">
              <Spinner className="text-error-600" />
            </div>
          ) : !assistants || assistants.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={<Bot size={24} />}
                title="No assistants assigned"
                description="Register a Bolna agent to get started."
              />
            </div>
          ) : (
            assistants.map((ast) => (
              <Card key={ast.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-error-50 border border-error-100 flex items-center justify-center text-error-600">
                      <Bot size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary text-sm">
                        {ast.name}
                      </h3>
                      <p className="text-[10px] font-mono text-text-placeholder">
                        {ast.bolnaId}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" dot>
                    Active
                  </Badge>
                </div>

                <p className="text-xs text-text-muted font-mono truncate">
                  ID: {ast.id}
                </p>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => syncMutation.mutate(ast.id)}
                    disabled={syncMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-border text-xs font-semibold text-text-secondary hover:bg-surface-subtle transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw
                      size={12}
                      className={syncMutation.isPending ? "animate-spin" : ""}
                    />{" "}
                    Sync
                  </button>
                  <button
                    onClick={() => {
                      setEditId(ast.id);
                      setEditName(ast.name);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-border text-xs font-semibold text-text-secondary hover:bg-surface-subtle transition-colors cursor-pointer"
                  >
                    <Pencil size={12} /> Rename
                  </button>
                  <button
                    onClick={() => setDeleteId(ast.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-error-100 text-xs font-semibold text-error-600 hover:bg-error-50 transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Register Modal */}
      <Modal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        title="Register Bolna Agent"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Display Name"
            value={regName}
            onChange={(e) => setRegName(e.target.value)}
            placeholder="e.g. Sales Agent v2"
          />
          <Select
            label="Bolna Agent"
            value={regBolnaId}
            onChange={(e) => setRegBolnaId(e.target.value)}
            options={
              bolnaAgents?.map((a) => ({
                value: a.id,
                label: `${a.agent_name} (${a.agent_type})`,
              })) ?? []
            }
            placeholder="Select a Bolna agent..."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRegister(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleRegister}
              loading={registerMutation.isPending}
              disabled={!regName || !regBolnaId}
            >
              Register
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rename Modal */}
      <Modal
        isOpen={!!editId}
        onClose={() => setEditId(null)}
        title="Rename Assistant"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="New Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditId(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() =>
                editId && renameMutation.mutate({ id: editId, name: editName })
              }
              loading={renameMutation.isPending}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() =>
          deleteId &&
          deleteMutation.mutate(deleteId, {
            onSuccess: () => setDeleteId(null),
          })
        }
        title="Remove Assistant"
        description="This will revoke the tenant's access to this agent. Active campaigns using this agent will not be affected."
        confirmLabel="Remove"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
