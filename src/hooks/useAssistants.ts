"use client";

import { useQuery } from "@tanstack/react-query";
import { assistantsApi } from "@/lib/api/assistants";
import { QUERY_KEYS } from "@/constants/config/query-keys";

/**
 * Tenant Assistant queries.
 */

export function useAssistants() {
  return useQuery({
    queryKey: QUERY_KEYS.ASSISTANTS.all,
    queryFn: assistantsApi.getAll,
  });
}

export function useAssistant(id: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.ASSISTANTS.detail(id as string),
    queryFn: () => assistantsApi.getById(id as string),
    enabled: Boolean(id),
  });
}
