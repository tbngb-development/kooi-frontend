import { Badge } from "@/components/ui/Badge";
import type { CampaignStatus } from "@/types";

const STATUS_CONFIG: Record<
  CampaignStatus,
  {
    label: string;
    variant: "default" | "success" | "warning" | "error" | "info" | "gray";
  }
> = {
  DRAFT: { label: "Draft", variant: "gray" },
  RUNNING: { label: "Running", variant: "success" },
  COMPLETED: { label: "Completed", variant: "info" },
  FAILED: { label: "Failed", variant: "error" },
};

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
}

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
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
