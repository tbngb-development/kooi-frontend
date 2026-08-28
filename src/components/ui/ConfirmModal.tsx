// src/components/ui/ConfirmModal.tsx

"use client";

import { Button } from "./Button";
import { Modal } from "./Modal";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-4 sm:gap-5">
        <p className="text-sm sm:text-base text-text-muted leading-relaxed wrap-break-word">
          {description}
        </p>

        {/* Responsive action buttons: stacked on mobile, inline on tablet/desktop */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 pt-2 sm:pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto justify-center"
          >
            {cancelLabel}
          </Button>

          <Button
            variant={variant}
            size="sm"
            onClick={onConfirm}
            loading={loading}
            className="w-full sm:w-auto justify-center"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
