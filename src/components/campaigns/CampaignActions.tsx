// src/components/campaigns/CampaignActions.tsx

"use client";

import { Button } from "@/components/ui/Button";
import { useStartCampaign, usePauseCampaign } from "@/hooks/useCampaigns";
import type { CampaignStatus } from "@/types";
import { Pause, Play } from "lucide-react";

interface CampaignActionsProps {
  campaignId: string;
  status: CampaignStatus;
}

export function CampaignActions({ campaignId, status }: CampaignActionsProps) {
  const { mutate: start, isPending: starting } = useStartCampaign(campaignId);
  const { mutate: pause, isPending: pausing } = usePauseCampaign(campaignId);

  if (status === "RUNNING") {
    return (
      <Button
        variant="outline"
        leftIcon={<Pause size={14} />}
        onClick={() => pause()}
        loading={pausing}
      >
        Pause Campaign
      </Button>
    );
  }

  // DRAFT, PAUSED, COMPLETED all show Start — backend filters
  // PENDING leads so only newly uploaded leads run on COMPLETED re-run
  if (status === "DRAFT" || status === "PAUSED" || status === "COMPLETED") {
    const label = status === "PAUSED" ? "Resume Campaign" : "Start Campaign";

    return (
      <Button
        leftIcon={<Play size={14} />}
        onClick={() => start()}
        loading={starting}
      >
        {label}
      </Button>
    );
  }

  // FAILED — no action available
  return null;
}
