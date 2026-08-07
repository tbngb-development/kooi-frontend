// src/components/assistants/AssistantModal.tsx

'use client';

import { Modal } from '@/components/ui/Modal';
import { AssistantForm } from '@/components/assistants/AssistantForm';
import type { Assistant, RegisterAssistantInput, UpdateAssistantInput } from '@/types';
import { Bot, Pencil } from 'lucide-react';

// ── Modal state type (shared with AdminAssistantSection) ──────────────────────
export type AssistantModalState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; assistant: Assistant };

interface AssistantModalProps {
  state: AssistantModalState;
  onClose: () => void;
  // Create
  onRegister: (data: RegisterAssistantInput) => void;
  registering?: boolean;
  // Edit
  onUpdate: (data: UpdateAssistantInput) => void;
  updating?: boolean;
}

export function AssistantModal({
  state,
  onClose,
  onRegister,
  registering,
  onUpdate,
  updating,
}: AssistantModalProps) {
  const isOpen = state.mode !== 'closed';
  const isEdit = state.mode === 'edit';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-surface-border">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${
            isEdit
              ? 'bg-amber-50 text-amber-600'
              : 'bg-brand-100 text-brand-600'
          }`}
        >
          {isEdit ? <Pencil size={18} /> : <Bot size={18} />}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-text-primary">
            {isEdit ? 'Edit Assistant' : 'Add Assistant'}
          </h2>
          <p className="text-sm text-text-muted mt-0.5">
            {isEdit
              ? 'Update the assistant display name'
              : 'Register a Bolna agent for this tenant'}
          </p>
        </div>
      </div>

      {/* ── Form ──────────────────────────────────────────────────────── */}
      {state.mode === 'create' && (
        <AssistantForm
          onSubmit={onRegister}
          isLoading={registering}
          submitLabel="Register Assistant"
          onCancel={onClose}
        />
      )}

      {state.mode === 'edit' && (
        <AssistantForm
          key={state.assistant.id}
          editMode
          defaultValues={state.assistant}
          onSubmit={onUpdate}
          isLoading={updating}
          submitLabel="Save Changes"
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}