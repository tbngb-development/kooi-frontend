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
