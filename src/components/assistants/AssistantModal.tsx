"use client";

import { Bot, Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { AssistantForm } from "@/components/assistants/AssistantForm";
import type {
  Assistant,
  RegisterAssistantInput,
  UpdateAssistantInput,
} from "@/types";

export type AssistantModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; assistant: Assistant };

interface AssistantModalProps {
  tenantId?: string;
  state: AssistantModalState;
  onClose: () => void;
  // Create hooks
  onRegister: (data: RegisterAssistantInput) => void;
  registering?: boolean;
  // Edit hooks
  onUpdate: (data: UpdateAssistantInput) => void;
  updating?: boolean;
  // Sync handlers (Admin CRUD mode)
  onSync?: (id: string) => void;
  syncing?: boolean;
}

export function AssistantModal({
  state,
  onClose,
  onRegister,
  registering,
  onUpdate,
  updating,
  onSync,
  syncing = false,
}: AssistantModalProps) {
  const isOpen = state.mode !== "closed";
  const isEdit = state.mode === "edit";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="p-0 overflow-hidden"
    >
      <div className="p-6">
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-surface-border">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${
              isEdit
                ? "bg-warning-50 text-warning-600 border border-warning-100"
                : "bg-brand-50 text-brand-600 border border-brand-100"
            }`}
          >
            {isEdit ? <Pencil size={18} /> : <Bot size={18} />}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-text-primary leading-tight">
              {isEdit
                ? "Configure Assistant"
                : "Assign Assistant Configuration"}
            </h2>
            <p className="text-base text-text-muted mt-1 leading-normal">
              {isEdit
                ? "Modify workspace display configurations"
                : "Register and assign a custom Bolna voice agent model to this workspace."}
            </p>
          </div>
        </div>

        {/* Dynamic Forms Mount Point */}
        {state.mode === "create" && (
          <AssistantForm
            onSubmit={onRegister}
            isLoading={registering}
            submitLabel="Assign Assistant"
            onCancel={onClose}
          />
        )}

        {state.mode === "edit" && (
          <AssistantForm
            key={state.assistant.id}
            editMode
            defaultValues={state.assistant}
            onSubmit={onUpdate}
            isLoading={updating}
            submitLabel="Save Changes"
            onCancel={onClose}
            onSync={onSync ? () => onSync(state.assistant.id) : undefined}
            syncing={syncing}
          />
        )}
      </div>
    </Modal>
  );
}
