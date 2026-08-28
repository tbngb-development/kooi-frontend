import { Badge } from "@/components/ui/Badge";
import type { BatchStatus } from "@/types/batch";

const STATUS_CONFIG: Record<
  BatchStatus,
  { label: string; variant: "default" | "success" | "warning" | "error" | "info" | "gray" }
> = {
  CREATED: { label: "Created", variant: "gray" },
  SCHEDULED: { label: "Scheduled", variant: "info" },
  RUNNING: { label: "Running", variant: "success" },
  STOPPED: { label: "Stopped", variant: "warning" },
  COMPLETED: { label: "Completed", variant: "success" },
  FAILED: { label: "Failed", variant: "error" },
};

interface BatchStatusBadgeProps {
  status: BatchStatus;
}

export function BatchStatusBadge({ status }: BatchStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    variant: "gray" as const,
  };

  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}