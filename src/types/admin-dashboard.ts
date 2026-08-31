export interface AdminDashboardOverview {
  totalTenants: number;
  activeTenants: number;
  totalCampaigns: number;
  totalCalls: number;
  totalDurationMinutes: number;
}

export interface AdminTenantHealth {
  tenantId: string;
  tenantName: string;
  isActive: boolean;
  totalCampaigns: number;
  totalCalls: number;
  completedCalls: number;
  failedCalls: number;
}

export type AdminActivityType =
  | "CAMPAIGN_STARTED"
  | "BATCH_COMPLETED"
  | "CALL_COMPLETED"
  | "CALL_FAILED";

export interface AdminActivityItem {
  id: string;
  tenantId: string;
  tenantName: string;
  type: AdminActivityType;
  message: string;
  timestamp: string;
}
