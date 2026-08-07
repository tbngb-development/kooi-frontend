// src/components/assistants/AdminAssistantSection.tsx

"use client";

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
} from "@/hooks/useAssistants";
import type {
  Assistant,
  RegisterAssistantInput,
  UpdateAssistantInput,
} from "@/types";
import { Bot, Plus } from "lucide-react";
import { useState } from "react";

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
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            AI Assistants
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Manage Bolna voice agents for this tenant
          </p>
        </div>
        <Button
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() => setModal({ mode: "create" })}
        >
          Add Assistant
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-8">
          <PageSpinner />
        </div>
      ) : assistants && assistants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <EmptyState
          icon={<Bot size={22} />}
          title="No assistants yet"
          description="Add a Bolna agent to this tenant so they can run campaigns."
          action={
            <Button
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => setModal({ mode: "create" })}
            >
              Add first assistant
            </Button>
          }
        />
      )}

      {/* ── Single wrapper modal handles both create & edit ─────────────── */}
      <AssistantModal
        state={modal}
        onClose={handleClose}
        onRegister={handleCreate}
        registering={registering}
        onUpdate={handleUpdate}
        updating={updating}
      />
    </>
  );
}
