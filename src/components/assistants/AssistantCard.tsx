"use client";

import { useState } from "react";
import { Bot, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { formatDate } from "@/lib/utils/formatDate";
import type { Assistant } from "@/types/assistant";

interface AssistantCardProps {
  assistant: Assistant;
  canEdit?: boolean;
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
      <Card className="flex flex-col justify-between border-surface-border bg-surface hover:shadow-md transition-all duration-200">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 border border-brand-100 text-brand-600 shrink-0 shadow-xs">
                <Bot size={16} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-text-primary truncate">
                  {assistant.name}
                </h3>
                <p className="text-base text-text-muted mt-0.5">
                  Allocated {formatDate(assistant.createdAt)}
                </p>
              </div>
            </div>
            <Badge variant="success" dot>
              Active
            </Badge>
          </div>

          {/* Configuration Data Panel */}
          <div className="flex flex-col gap-2 pt-3 border-t border-surface-border">
            <div className="flex items-center justify-between text-base">
              <span className="text-text-muted">Agent ID</span>
              <span className="font-mono font-semibold text-text-secondary bg-surface-subtle border border-surface-border px-1.5 py-0.5 rounded">
                {assistant.bolnaId.slice(0, 12)}…
              </span>
            </div>

            {assistant.config?.voice && (
              <div className="flex items-center justify-between text-base">
                <span className="text-text-muted">Synthesizer Voice</span>
                <span className="font-mono font-semibold text-text-secondary bg-surface-subtle border border-surface-border px-1.5 py-0.5 rounded truncate max-w-[140px]">
                  {String(assistant.config.voice?.voiceId ?? "Default")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Administration Edit Triggers */}
        {canEdit && (onEdit || onDelete) && (
          <div className="flex items-center gap-2 border-t border-surface-border pt-3 mt-4">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Pencil size={12} />}
                className="flex-1 text-base font-semibold border-surface-border"
                onClick={() => onEdit(assistant)}
              >
                Configure
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Trash2 size={12} />}
                onClick={() => setConfirmDelete(true)}
                className="text-base font-semibold text-error-600 hover:bg-error-50 hover:text-error-600"
              >
                Revoke
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Safe Revocation Overlay */}
      {onDelete && (
        <ConfirmModal
          isOpen={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => {
            onDelete(assistant.id);
            setConfirmDelete(false);
          }}
          title="Revoke Assistant Assignment?"
          description={`Are you sure you want to revoke "${assistant.name}" assignment? Active campaigns using this voice model will halt instantly.`}
          loading={deleteLoading}
        />
      )}
    </>
  );
}
