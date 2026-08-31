"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface RefreshButtonProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
  label?: string;
}

export function RefreshButton({
  onRefresh,
  isRefreshing = false,
  label = "Refresh",
}: RefreshButtonProps) {
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onRefresh}
      loading={isRefreshing}
      className="gap-1.5"
    >
      <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
      {label}
    </Button>
  );
}

/* Usage
 *  const qc = useQueryClient();
 * const { isFetching } = useLeads();
 *
 * return (
 *   <RefreshButton
 *    onRefresh={() => qc.invalidateQueries({ queryKey: QUERY_KEYS.LEADS.all })}
 *    isRefreshing={isFetching}
 *  />
 * );
 *
 */
