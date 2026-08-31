export interface DashboardOverview {
  campaigns: { total: number; active: number };
  leads: {
    total: number;
    qualified: number;
    notQualified: number;
    qualificationRate: string;
  };
  calls: {
    total: number;
    completed: number;
    failed: number;
    successRate: string;
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
  completedRate: string;
  progress: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}
