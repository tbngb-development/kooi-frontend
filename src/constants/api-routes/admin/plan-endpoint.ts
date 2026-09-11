import { API_PREFIXES } from "@/constants/config/api-prefix";

const BASE = `${API_PREFIXES.ADMIN}/plans`;

export const ADMIN_PLAN_ENDPOINTS = {
  /** GET  — list all plans (?includeInactive=true) */
  LIST: BASE,

  /** GET  — single plan with all versions */
  DETAIL: (id: string) => `${BASE}/${id}` as const,

  /** POST — create plan + v1 */
  CREATE: BASE,

  /** PATCH — metadata only (no commercial fields) */
  UPDATE_META: (id: string) => `${BASE}/${id}` as const,

  // ── Version lifecycle ────────────────────────────────────────────────────

  /** POST — create a new DRAFT version under a plan */
  CREATE_VERSION: (planId: string) => `${BASE}/${planId}/versions` as const,

  /** POST — publish a DRAFT version (archives previous PUBLISHED) */
  PUBLISH_VERSION: (versionId: string) =>
    `${BASE}/versions/${versionId}/publish` as const,

  /** POST — archive a version */
  ARCHIVE_VERSION: (versionId: string) =>
    `${BASE}/versions/${versionId}/archive` as const,

  // ── Enterprise overrides ─────────────────────────────────────────────────

  /** PATCH — set per-tenant commercial overrides */
  TENANT_OVERRIDES: (tenantId: string) =>
    `${BASE}/tenants/${tenantId}/overrides` as const,
  /** POST — admin-initiated plan change with optional fee waiver */
  CHANGE_TENANT_PLAN: (tenantId: string) =>
    `${BASE}/tenants/${tenantId}/change-plan` as const,
} as const;
