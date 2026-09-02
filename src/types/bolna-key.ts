export type BolnaKeyType = "GENERAL" | "CUSTOM";

export interface BolnaApiKey {
  id: string;
  keyIdentifier: string;
  type: BolnaKeyType;
  isPlatformDefault: boolean;
  isActive: boolean;
  assignedTenantCount: number;
  lastAccessedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBolnaKeyInput {
  keyIdentifier: string;
  plainTextKey: string;
  type: BolnaKeyType;
  isPlatformDefault?: boolean;
}
