export type CallStatus =
  | "PENDING"
  | "CALLING"
  | "COMPLETED"
  | "FAILED"
  | "NO_ANSWER"
  | "BUSY";

export type Disposition =
  | "INTERESTED_SEND_DETAILS"
  | "QUALIFIED_CONSULTANT_FOLLOWUP"
  | "SITE_VISIT_INTEREST"
  | "INTERESTED_GENERAL"
  | "FOLLOWUP_REQUESTED"
  | "NOT_INTERESTED"
  | "DO_NOT_CALL"
  | "WRONG_NUMBER"
  | "ALREADY_PURCHASED"
  | "BROKER"
  | "LANGUAGE_CALLBACK_REQUIRED"
  | "CALL_ENDED_BY_CUSTOMER"
  | "CALL_ENDED_ABUSIVE"
  | "NO_RESPONSE"
  | "CALL_DROPPED";

export type LeadTemperature =
  | "HOT"
  | "WARM"
  | "NURTURE"
  | "COLD"
  | "NOT_APPLICABLE";

export type PurchaseTimeline =
  | "WITHIN_3_MONTHS"
  | "WITHIN_6_MONTHS"
  | "WITHIN_1_YEAR"
  | "AFTER_1_YEAR"
  | "FLEXIBLE"
  | "NOT_SHARED";

export type PurchasePurpose = "OWN_USE" | "INVESTMENT" | "BOTH" | "NOT_SHARED";

export type PreferredNextAction =
  | "SEND_DETAILS"
  | "CONSULTANT_CALL"
  | "SITE_VISIT"
  | "FOLLOWUP_CALL"
  | "NONE";

export type ContactChannel = "WHATSAPP" | "EMAIL" | "NOT_ASKED";

export type LocationMatch =
  | "MATCH"
  | "MISMATCH"
  | "NOT_ASKED"
  | "NOT_MENTIONED";

export type ExtractionFlag = "YES" | "NO";

export interface CallAnalysis {
  id: string;
  callId?: string;
  tenantId?: string;
  disposition: Disposition | null;
  leadTemperature: LeadTemperature | null;
  preferredConfiguration: string | null;
  budgetRange: string | null;
  purchaseTimeline: PurchaseTimeline | null;
  purchasePurpose: PurchasePurpose | null;
  locationMatch: LocationMatch | null;
  customerLocationPref: string | null;
  preferredNextAction: PreferredNextAction | null;
  preferredContactChannel: ContactChannel | null;
  followupSchedule: string | null;
  doNotCall: ExtractionFlag | null;
  languageSupportRequired: ExtractionFlag | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CallHistoryItem {
  attempt: number;
  bolnaCallId: string;
  status: string;
  duration: number | null;
  cost: number | null;
  timestamp: string;
  errorMessage: string | null;
}

export interface TranscriptMessage {
  role: "assistant" | "user";
  message: string;
  time?: string | number | null;
  endTime?: number;
  duration?: number;
  secondsFromStart?: number;
}

export interface Call {
  id: string;
  bolnaCallId: string | null;
  tenantId: string;
  campaignId: string;
  leadId: string;
  batchId: string | null;
  status: CallStatus;
  duration: number | null;
  cost: number | null;
  platformCost: number | null;
  billableSeconds: number | null;
  recording: string | null;
  transcript: string | null;
  transcriptMessages: TranscriptMessage[] | null;
  summary: string | null;
  callHistory: CallHistoryItem[] | null;
  campaign?: { id: string; name: string } | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt?: string;
  callAnalysis?: CallAnalysis | null;
  lead?: { id: string; name: string | null; phone: string } | null;
}

export interface CallTranscriptResponse {
  transcript: string | null;
  transcriptMessages: Array<{
    role: "assistant" | "user";
    message: string;
    time: string | null;
  }> | null;
  summary: string | null;
  duration: number | null;
  recording: string | null;
  callAnalysis: {
    id: string;
    disposition: Disposition | null;
    leadTemperature: LeadTemperature | null;
  } | null;
}

export interface CallQueryParams {
  campaignId?: string;
  leadId?: string;
  status?: string;
  disposition?: string;
  leadTemperature?: string;
  locationMatch?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "startedAt" | "duration" | "cost" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  search?: string;
}

export interface CallStats {
  total: number;
  completed: number;
  failed: number;
  noAnswer: number;
  busy: number;
  avgDuration: number;
  qualifiedCount: number;
  qualificationRate: string;
  dispositionBreakdown: Record<string, number>;
  temperatureBreakdown: Record<string, number>;
}
