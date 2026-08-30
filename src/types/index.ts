// ─── Re-exports from new modular type files ───────────────────────────────────
export type {
  ApiResponse,
  ApiError,
  ApiValidationError,
  Pagination,
  PaginatedLeadsResponse,
  PaginatedCallsResponse,
  ApiMeta,
} from "./api";

export type {
  User,
  LoginInput,
  RegisterInput,
  TokenPayload,
  LoginResponse,
  RegisterResponse,
  SelectTenantResponse,
  ProfileResponse,
  InviteInput,
  InviteResponse,
  AcceptInviteInput,
  TeamMember,
  CreateUserInput,
  UpdateUserInput,
  UserRole,
} from "./user";

export type { TenantRole, Membership, V1User } from "@/store/authStore";

export type {
  LeadBatch,
  RetryConfig,
  BatchStatus,
  BatchCreateResponse,
  BatchCreateStats,
  BatchStats,
} from "./batch";
import type { LeadBatch, RetryConfig } from "./batch";

// ─── Enums ────────────────────────────────────────────────────────────────────

export type CampaignStatus = "DRAFT" | "RUNNING" | "COMPLETED" | "FAILED";

export type LeadStatus =
  | "PENDING"
  | "CALLING"
  | "CALLED"
  | "QUALIFIED"
  | "NOT_QUALIFIED"
  | "NO_ANSWER"
  | "FAILED";

export type CallStatus =
  | "PENDING"
  | "CALLING"
  | "COMPLETED"
  | "FAILED"
  | "NO_ANSWER"
  | "BUSY";

// ─── Call Analysis Enums ──────────────────────────────────────────────────────

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

// ─── Tenant ───────────────────────────────────────────────────────────────────

export interface TenantCount {
  memberships: number;
  campaigns: number;
  leads: number;
  calls: number;
}

export interface Tenant {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  _count: TenantCount;
}

export interface TenantStats {
  tenant: Tenant;
  stats: {
    totalUsers: number;
    totalLeads: number;
    qualifiedLeads: number;
    totalCalls: number;
    completedCalls: number;
    activeCampaigns: number;
    qualificationRate: number; // numeric in admin API
  };
}

// ─── Assistant ────────────────────────────────────────────────────────────────

export interface AssistantConfig {
  voice?: {
    provider: string;
    voiceId: string;
  };
  [key: string]: unknown;
}

export interface Assistant {
  id: string;
  bolnaId: string;
  name: string;
  tenantId: string;
  config: AssistantConfig;
  createdAt: string;
}

export interface AssistantDetail {
  assistant: Assistant;
  variables: string[]; // V1: returns string[] not PromptInputField[]
}

/** @deprecated V1 returns string[] for variables */
export interface PromptInputField {
  key: string;
  label: string;
}

export interface RegisterAssistantInput {
  name: string;
  bolnaId: string;
}

export interface UpdateAssistantInput {
  name?: string;
}

export type CreateAssistantInput = RegisterAssistantInput;

export interface BolnaAgent {
  id: string;
  agent_name: string;
  agent_type: string;
  created_at: string;
}

// ─── Campaign ─────────────────────────────────────────────────────────────────

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
  assistant: {
    id: string;
    name: string;
    bolnaId: string;
  } | null;
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
  qualificationRate: string; // V1: string e.g. "45.2" (was number)
  bestPickupTime: string;
  bestConversionTime: string;
  topBudget: string;
  topConfiguration: string;
}

export type UpdateCampaignInput = Partial<CreateCampaignInput>;

/** V1 parse-leads response */
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

/** @deprecated Use ParseLeadsResult */
export interface UploadResult {
  total: number;
  valid: number;
  imported: number;
  duplicates: number;
  invalid: number;
  duplicateNumbers: string[];
}

// ─── Brochure ─────────────────────────────────────────────────────────────────

export interface BrochureSummary {
  id: string;
  projectName: string | null;
  developerName: string | null;
  city: string | null;
  area: string | null;
  configurations: string[];
  constructionStatus: string | null;
  confidence: number;
  isConfirmed: boolean;
  originalFileName: string;
  createdAt: string;
  campaigns: { id: string }[];
}

export interface Brochure {
  id: string;
  tenantId: string;
  originalFileName: string;
  fileSizeMB: string;
  pageCount: number;
  rawTextLength: number;

  projectName?: string | null;
  developerName?: string | null;
  reraNumber?: string | null;
  projectWebsite?: string | null;
  contactNumber?: string | null;

  city?: string | null;
  area?: string | null;
  state?: string | null;
  landmark?: string | null;
  fullAddress?: string | null;

  propertyTypes: string[];
  configurations: string[];
  totalUnits?: number | null;
  totalTowers?: number | null;
  totalFloors?: number | null;
  sizeMin?: number | null;
  sizeMax?: number | null;
  sizeUnit?: string | null;

  startingPrice?: number | null;
  maxPrice?: number | null;
  pricePerSqft?: number | null;
  priceLabel?: string | null;
  paymentPlan?: string | null;
  bankApprovals: string[];
  maintenanceCharge?: string | null;

  possessionDate?: string | null;
  launchDate?: string | null;
  constructionStatus?: string | null;

  amenities: string[];
  specifications: string[];
  nearbyInfrastructure: string[];
  usps: string[];

  minimumBudget?: number | null;
  maximumBudget?: number | null;
  targetBuyerProfile?: string | null;
  preferredLocations: string[];
  investmentType: string[];
  keyQualifyingQuestions: string[];

  confidence: number;
  extractionWarnings: string[];
  isConfirmed: boolean;
  confirmedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  campaigns: { id: string; name: string; status: string }[];
}

export interface BrochureExtractionResult {
  propertyDetails: PropertyDetails;
  flattenedForSave: FlattenedBrochure;
  pdfMeta: {
    fileName: string;
    pageCount: number;
    fileSizeBytes: number;
    fileSizeMB: string;
    textLength: number;
    truncated: boolean;
    extractedAt: string;
  };
  textQuality: {
    hasUsableText: boolean;
    avgCharsPerPage?: number;
    warning?: string | null;
  };
}

export interface FlattenedBrochure {
  originalFileName: string;
  fileSizeMB: string;
  pageCount: number;
  rawTextLength: number;

  projectName?: string | null;
  developerName?: string | null;
  reraNumber?: string | null;
  projectWebsite?: string | null;
  contactNumber?: string | null;

  city?: string | null;
  area?: string | null;
  state?: string | null;
  landmark?: string | null;
  fullAddress?: string | null;

  propertyTypes: string[];
  configurations: string[];
  totalUnits?: number | null;
  totalTowers?: number | null;
  totalFloors?: number | null;
  sizeMin?: number | null;
  sizeMax?: number | null;
  sizeUnit?: string | null;

  startingPrice?: number | null;
  maxPrice?: number | null;
  pricePerSqft?: number | null;
  priceLabel?: string | null;
  paymentPlan?: string | null;
  bankApprovals: string[];
  maintenanceCharge?: string | null;

  possessionDate?: string | null;
  launchDate?: string | null;
  constructionStatus?: string;

  amenities: string[];
  specifications: string[];
  nearbyInfrastructure: string[];
  usps: string[];

  minimumBudget?: number | null;
  maximumBudget?: number | null;
  targetBuyerProfile?: string | null;
  preferredLocations: string[];
  investmentType: string[];
  keyQualifyingQuestions: string[];

  confidence: number;
  extractionWarnings: string[];
}

export interface PropertyDetails {
  projectName: string | null;
  developerName: string | null;
  reraNumber: string | null;
  projectWebsite: string | null;
  contactNumber: string | null;
  location: {
    city: string | null;
    area: string | null;
    state: string | null;
    landmark: string | null;
    fullAddress: string | null;
  };
  propertyTypes: string[];
  configurations: string[];
  totalUnits: number | null;
  totalTowers: number | null;
  totalFloors: number | null;
  sizeRange: {
    min: number | null;
    max: number | null;
    unit: string | null;
  };
  pricing: {
    startingPrice: number | null;
    maxPrice: number | null;
    pricePerSqft: number | null;
    currency: string;
    priceLabel: string | null;
  };
  paymentPlan: string | null;
  bankApprovals: string[];
  maintenanceCharge: string | null;
  possessionDate: string | null;
  launchDate: string | null;
  constructionStatus: string;
  amenities: string[];
  specifications: string[];
  nearbyInfrastructure: string[];
  usps: string[];
  qualificationCriteria: {
    minimumBudget: number | null;
    maximumBudget: number | null;
    targetBuyerProfile: string | null;
    preferredLocations: string[];
    investmentType: string[];
    keyQualifyingQuestions: string[];
  };
  confidence: number;
  extractionWarnings: string[];
  rawTextLength: number;
}

// ─── Lead ─────────────────────────────────────────────────────────────────────

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

// ─── Call Analysis ────────────────────────────────────────────────────────────

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

// ─── Call ─────────────────────────────────────────────────────────────────────

export interface CallHistoryItem {
  attempt: number;
  bolnaCallId: string;
  status: string;
  duration: number | null;
  cost: number | null;
  timestamp: string;
  errorMessage: string | null;
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

export interface TranscriptMessage {
  role: "assistant" | "user";
  message: string;
  time?: string | number | null;
  endTime?: number;
  duration?: number;
  secondsFromStart?: number;
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

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardOverview {
  campaigns: {
    total: number;
    active: number;
  };
  leads: {
    total: number;
    qualified: number;
    notQualified: number;
    qualificationRate: string; // V1: string with "%" suffix
  };
  calls: {
    total: number;
    completed: number;
    failed: number;
    successRate: string; // V1: string with "%" suffix
  };
}

export interface DashboardQualifiedLead {
  leadId: string;
  name: string | null;
  phone: string;
  campaign: string;
  disposition: string | null;
  leadTemperature: string | null;
  qualifiedAt: string;
}

export interface DashboardRecentCall {
  id: string;
  bolnaCallId: string | null;
  status: string;
  duration: number | null;
  cost: number | null;
  recording: string | null;
  startedAt: string | null;
  createdAt: string;
  lead: { name: string | null; phone: string } | null;
  campaign: { name: string } | null;
  callAnalysis: {
    disposition: string | null;
    leadTemperature: string | null;
  } | null;
}

export interface DashboardActivity {
  recentCalls: DashboardRecentCall[];
  qualifiedLeads: DashboardQualifiedLead[];
  recentCampaigns: Array<{
    id: string;
    name: string;
    status: string;
    totalLeads: number;
    calledLeads: number;
    completedLeads: number;
    failedLeads: number;
    createdAt: string;
  }>;
}

export interface DashboardCampaign {
  id: string;
  name: string;
  status: string;
  assistant: string;
  totalLeads: number;
  calledLeads: number;
  completedLeads: number;
  failedLeads: number;
  completedRate: string; // V1: renamed from successRate
  progress: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

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

// ─── Legacy compat (remove after full migration) ─────────────────────────────

/** @deprecated Use Pagination from ./api */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/** @deprecated Use domain-specific paginated responses */
export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
  calls?: Call[];
  leads?: Lead[];
}

/** @deprecated */
export interface PaginatedResponse<T> {
  success: boolean;
  data: PaginatedData<T>;
  message: string;
}

/** @deprecated */
export interface IBaseQueryOptions {
  page: number;
  limit: number;
  search?: string;
  orderBy?: string;
  orderDir?: "asc" | "desc";
  includeDeleted?: boolean;
}

/** @deprecated */
export interface IUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

/** @deprecated */
export interface ILoginResponse {
  data: IUser;
  token?: string;
  message?: string;
}
