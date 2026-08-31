import { Call } from "./call";
import type { Campaign } from "./campaign";

export type LeadStatus =
  | "PENDING"
  | "CALLING"
  | "CALLED"
  | "QUALIFIED"
  | "NOT_QUALIFIED"
  | "NO_ANSWER"
  | "FAILED";

export interface Lead {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  company: string | null;
  status: LeadStatus;
  doNotCall: boolean;
  tenantId: string;
  batchId: string | null;
  campaignId: string;
  campaign?: Pick<Campaign, "id" | "name"> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadDetail extends Lead {
  calls: Call[];
}

export interface LeadQueryParams {
  campaignId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "createdAt" | "name" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  search?: string;
}

export interface LeadStats {
  total: number;
  pending: number;
  calling: number;
  called: number;
  failed: number;
  noAnswer: number;
  doNotCall: number;
  qualified: number;
  qualificationRate: string;
}
