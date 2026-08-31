export type CampaignStatus = "DRAFT" | "RUNNING" | "COMPLETED" | "FAILED";

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: CampaignStatus;
  totalLeads: number;
  calledLeads: number;
  completedLeads: number;
  failedLeads: number;
  createdAt: string;
  updatedAt: string;
  assistant: { id: string; name: string; bolnaId: string } | null;
  brochure: {
    id: string;
    projectName: string | null;
    city: string | null;
    configurations: string[];
  } | null;
  batches: Array<{
    id: string;
    status: string;
    totalLeads: number;
    completedLeads: number;
  }>;
}

export interface CreateCampaignInput {
  name: string;
  description?: string;
  assistantId: string;
  brochureId?: string;
  variables?: Record<string, string>;
  defaultRetryConfig?: {
    enabled: boolean;
    max_retries?: number;
    retry_on_statuses?: Array<"no-answer" | "busy" | "failed">;
    retry_on_voicemail?: boolean;
    retry_intervals_minutes?: number[];
  };
}

export type UpdateCampaignInput = Partial<CreateCampaignInput>;

export interface CampaignStats {
  campaign: Campaign;
  leads: Array<{ status: string; _count: number }>;
  calls: Array<{ status: string; _count: number }>;
}

export interface CampaignPerformance {
  hotLeads: number;
  callbacks: number;
  siteVisits: number;
  dnc: number;
  totalCost: number;
  costPerLead: number;
  qualificationRate: string;
  bestPickupTime: string;
  bestConversionTime: string;
  topBudget: string;
  topConfiguration: string;
}

export interface ParseLeadsResult {
  total: number;
  valid: number;
  invalid: number;
  nonIndian: number;
  nonIndianNumbers: string[];
  inFileDuplicates: number;
  inFileDuplicateNumbers: string[];
  dbDuplicates: number;
  dbDuplicateNumbers: string[];
  readyToImport: number;
}

