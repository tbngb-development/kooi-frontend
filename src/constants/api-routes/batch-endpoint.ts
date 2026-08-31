import { API_PREFIXES } from "@/constants/config/api-prefix";

/**
 * Tenant batch calling sequence sub-routes.
 * Backend module: `modules/batches/presentation/buildBatchRoutes`
 */
export const BATCH_ENDPOINTS = {
  BASE: (campaignId: string) =>
    `${API_PREFIXES.TENANT}/campaigns/${campaignId}/batches`,
  BY_ID: (campaignId: string, batchId: string) =>
    `${API_PREFIXES.TENANT}/campaigns/${campaignId}/batches/${batchId}`,
  RUN: (campaignId: string, batchId: string) =>
    `${API_PREFIXES.TENANT}/campaigns/${campaignId}/batches/${batchId}/run`,
  SCHEDULE: (campaignId: string, batchId: string) =>
    `${API_PREFIXES.TENANT}/campaigns/${campaignId}/batches/${batchId}/schedule`,
  STOP: (campaignId: string, batchId: string) =>
    `${API_PREFIXES.TENANT}/campaigns/${campaignId}/batches/${batchId}/stop`,
  RESUME: (campaignId: string, batchId: string) =>
    `${API_PREFIXES.TENANT}/campaigns/${campaignId}/batches/${batchId}/resume`,
  STATS: (campaignId: string, batchId: string) =>
    `${API_PREFIXES.TENANT}/campaigns/${campaignId}/batches/${batchId}/stats`,
} as const;
