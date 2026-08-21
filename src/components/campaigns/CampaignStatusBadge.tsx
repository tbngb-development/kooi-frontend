// src/components/campaigns/CampaignStatusBadge.tsx

import { Badge } from "@/components/ui/Badge";
import type { CampaignStatus } from "@/types";

const config: Record<
  CampaignStatus,
  {
    variant: "gray" | "success" | "warning" | "info" | "error";
    label: string;
    animate?: boolean;
  }
> = {
  DRAFT: { variant: "gray", label: "Draft" },
  SCHEDULED: { variant: "info", label: "Scheduled" }, 
  RUNNING: { variant: "success", label: "Running", animate: true },
  PAUSED: { variant: "warning", label: "Paused" },
  COMPLETED: { variant: "info", label: "Completed" },
  FAILED: { variant: "error", label: "Failed" },
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const { variant, label, animate } = config[status] ?? {
    variant: "gray",
    label: status,
  };
  return (
    <Badge variant={variant} dot animate={animate}>
      {label}
    </Badge>
  );
}
