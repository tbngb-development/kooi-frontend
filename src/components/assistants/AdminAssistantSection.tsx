"use client";

import { useState } from "react";
import { Bot, Plus } from "lucide-react";
import { AssistantCard } from "@/components/assistants/AssistantCard";
import {
  AssistantModal,
  type AssistantModalState,
} from "@/components/assistants/AssistantModal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import {
  useAdminAssistants,
  useAdminDeleteAssistant,
  useAdminRegisterAssistant,
  useAdminUpdateAssistant,
  useAdminSyncAssistant,
} from "@/hooks/useAssistants";
import type {
  Assistant,
  RegisterAssistantInput,
  UpdateAssistantInput,
} from "@/types/assistant";

interface AdminAssistantSectionProps {
  tenantId: string;
}

export function AdminAssistantSection({
  tenantId,
}: AdminAssistantSectionProps) {
  const [modal, setModal] = useState<AssistantModalState>({ mode: "closed" });

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: assistants, isLoading } = useAdminAssistants(tenantId);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { mutate: registerAssistant, isPending: registering } =
    useAdminRegisterAssistant(tenantId);

  const { mutate: deleteAssistant, isPending: deleting } =
    useAdminDeleteAssistant(tenantId);

  const editingId = modal.mode === "edit" ? modal.assistant.id : "";
  const { mutate: updateAssistant, isPending: updating } =
    useAdminUpdateAssistant(editingId, tenantId);

  const { mutate: syncAssistant, isPending: syncing } = useAdminSyncAssistant(
    editingId,
    tenantId,
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleCreate(data: RegisterAssistantInput) {
    registerAssistant(data, {
      onSuccess: () => setModal({ mode: "closed" }),
    });
  }

  function handleUpdate(data: UpdateAssistantInput) {
    updateAssistant(data, {
      onSuccess: () => setModal({ mode: "closed" }),
    });
  }

  function handleSync(id: string) {
    syncAssistant(undefined, {
      onSuccess: () => setModal({ mode: "closed" }),
    });
  }

  function handleDelete(id: string) {
    deleteAssistant(id);
  }

  function handleEdit(assistant: Assistant) {
    setModal({ mode: "edit", assistant });
  }

  function handleClose() {
    setModal({ mode: "closed" });
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-surface-border">
        <div>
          <h3 className="text-base font-bold text-text-primary">
            Workspace Voice Assistants
          </h3>
          <p className="text-base text-text-muted mt-0.5">
            Manage allocations and synch models for this tenant workspace
            environment
          </p>
        </div>
        <Button
          size="sm"
          leftIcon={<Plus size={13} />}
          onClick={() => setModal({ mode: "create" })}
          className="shadow-sm font-semibold"
        >
          Add Assistant
        </Button>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <PageSpinner />
        </div>
      ) : assistants && assistants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {assistants.map((a) => (
            <AssistantCard
              key={a.id}
              assistant={a}
              canEdit
              onEdit={handleEdit}
              onDelete={handleDelete}
              deleteLoading={deleting}
            />
          ))}
        </div>
      ) : (
        <div className="pt-2">
          <EmptyState
            icon={<Bot size={22} className="text-text-placeholder" />}
            title="No voice assistants configured"
            description="Tenant cannot execute campaigns until a Bolna agent configuration is assigned."
            action={
              <Button
                size="sm"
                leftIcon={<Plus size={13} />}
                onClick={() => setModal({ mode: "create" })}
                className="shadow-sm font-semibold"
              >
                Assign first assistant
              </Button>
            }
          />
        </div>
      )}

      {/* Admin Central Form Modal Component */}
      <AssistantModal
        tenantId={tenantId}
        state={modal}
        onClose={handleClose}
        onRegister={handleCreate}
        registering={registering}
        onUpdate={handleUpdate}
        updating={updating}
        onSync={handleSync}
        syncing={syncing}
      />
    </>
  );
}
