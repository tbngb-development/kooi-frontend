// src/components/leads/LeadStatusBadge.tsx

import { Badge } from "@/components/ui/Badge";
import type { LeadStatus } from "@/types/lead";

const config: Record<
  LeadStatus,
  {
    variant: "gray" | "blue" | "purple" | "success" | "error" | "warning";
    label: string;
    animate?: boolean;
  }
> = {
  PENDING: { variant: "gray", label: "Pending" },
  CALLING: { variant: "blue", label: "Calling", animate: true },
  CALLED: { variant: "purple", label: "Called" },
  QUALIFIED: { variant: "success", label: "Qualified" },
  NOT_QUALIFIED: { variant: "error", label: "Not Qualified" },
  NO_ANSWER: { variant: "warning", label: "No Answer" },
  FAILED: { variant: "error", label: "Failed" },
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
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
