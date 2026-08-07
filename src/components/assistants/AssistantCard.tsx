// src/components/assistants/AssistantCard.tsx

'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { formatDate } from '@/lib/utils/formatDate';
import type { Assistant } from '@/types';
import { Bot, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface AssistantCardProps {
  assistant: Assistant;
  canEdit?: boolean;
  // Admin mode — callbacks instead of router navigation
  onEdit?: (assistant: Assistant) => void;
  onDelete?: (id: string) => void;
  deleteLoading?: boolean;
}

export function AssistantCard({
  assistant,
  canEdit = false,
  onEdit,
  onDelete,
  deleteLoading = false,
}: AssistantCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <Card className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
              <Bot size={18} className="text-brand-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                {assistant.name}
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Created {formatDate(assistant.createdAt)}
              </p>
            </div>
          </div>
          <Badge variant="success" dot>
            Active
          </Badge>
        </div>

        {/* Bolna ID */}
        <div className="text-xs text-text-muted border-t border-surface-border pt-3 font-mono">
          ID:{' '}
          <span className="font-medium text-text-secondary">
            {assistant.bolnaId.slice(0, 8)}…
          </span>
        </div>

        {/* Voice config if present */}
        {assistant.config?.voice && (
          <div className="text-xs text-text-muted">
            Voice:{' '}
            <span className="font-medium text-text-secondary">
              {String(assistant.config.voice?.voiceId ?? '—')}
            </span>
          </div>
        )}

        {/* Actions — only rendered when canEdit=true and callbacks provided */}
        {canEdit && (onEdit || onDelete) && (
          <div className="flex items-center gap-2 border-t border-surface-border pt-3">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Pencil size={13} />}
                className="flex-1"
                onClick={() => onEdit(assistant)}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Trash2 size={13} />}
                onClick={() => setConfirmDelete(true)}
                className="text-error-600 hover:bg-error-50"
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Confirm delete modal */}
      {onDelete && (
        <ConfirmModal
          isOpen={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => {
            onDelete(assistant.id);
            setConfirmDelete(false);
          }}
          title="Delete Assistant"
          description={`Are you sure you want to delete "${assistant.name}"? This action cannot be undone.`}
          loading={deleteLoading}
        />
      )}
    </>
  );
}