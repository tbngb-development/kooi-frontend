export type BatchStatus =
  | "CREATED"
  | "SCHEDULED"
  | "RUNNING"
  | "STOPPED"
  | "COMPLETED"
  | "FAILED";

export interface RetryConfig {
  enabled: boolean;
  max_retries: number;
  retry_on_statuses?: Array<"no-answer" | "busy" | "failed" | "error">;
  retry_on_voicemail?: boolean;
  retry_intervals_minutes?: number[];
}

export interface LeadBatch {
  id: string;
  bolnaBatchId: string | null;
  campaignId: string;
  tenantId: string;
  status: BatchStatus;
  fileName: string | null;
  originalFileUrl: string | null;
  transformedCsvUrl: string | null;
  totalLeads: number;
  calledLeads: number;
  completedLeads: number;
  failedLeads: number;
  retryConfig: RetryConfig | null;
  scheduledAt: string | null;
  bolnaScheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  _count?: {
    leads: number;
    calls: number;
  };
}

export interface BatchCreateStats {
  totalRows: number;
  validIndian: number;
  filteredNonIndian: number;
  imported: number;
}

export interface BatchCreateResponse {
  batch: LeadBatch;
  stats: BatchCreateStats;
}

export interface BatchStats {
  batch: LeadBatch;
  leads: Array<{ status: string; _count: number }>;
  calls: Array<{ status: string; _count: number }>;
  totalCost: number;
}

export interface BatchBalanceWarning {
  balance: number; // in paisa
  estimatedCost: number; // in paisa
}

export interface RunOrScheduleBatchResponse {
  batch: LeadBatch;
  message: string;
  balanceWarning?: BatchBalanceWarning;
}
