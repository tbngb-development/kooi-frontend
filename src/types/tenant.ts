export type TenantRole = "OWNER" | "ADMIN" | "USER";

export interface Membership {
  membershipId: string;
  tenantId: string;
  tenantName: string;
  role: TenantRole;
}

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
    qualificationRate: number;
  };
}
