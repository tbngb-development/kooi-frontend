import type { TenantRole } from "./tenant";

export interface User {
  id: string;
  email: string;
  name: string;
  isPlatformAdmin: boolean;
}

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: TenantRole;
  createdAt: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password?: string;
  role?: TenantRole;
}

export interface UpdateUserInput {
  name?: string;
  role?: TenantRole;
}

export interface AdminUserTenantMap {
  tenantId: string;
  tenantName: string;
  role: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  tenants: AdminUserTenantMap[];
}

export interface AdminUsersPage {
  items: AdminUser[];
  total: number;
  page: number;
  limit: number;
}
