// src/components/dashboard/CampaignPerformance.tsx

"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { DashboardCampaign } from "@/types/dashboard";

const statusVariant: Record<
  string,
  "success" | "info" | "warning" | "error" | "gray"
> = {
  RUNNING: "success",
  PAUSED: "warning",
  COMPLETED: "info",
  DRAFT: "gray",
  FAILED: "error",
};

interface CampaignPerformanceProps {
  campaigns: DashboardCampaign[];
}

export function CampaignPerformance({ campaigns }: CampaignPerformanceProps) {
  return (
    <Card padding="none">
      <CardHeader className="px-5 pt-5 pb-4">
        <CardTitle>Campaign Performance</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-base">
          <thead>
            <tr className="border-y border-surface-border bg-surface-subtle">
              <th className="text-left px-5 py-2.5 text-base font-medium text-text-muted uppercase tracking-wide">
                Campaign
              </th>
              <th className="text-left px-4 py-2.5 text-base font-medium text-text-muted uppercase tracking-wide">
                Status
              </th>
              <th className="text-right px-4 py-2.5 text-base font-medium text-text-muted uppercase tracking-wide">
                Progress
              </th>
              <th className="text-right px-5 py-2.5 text-base font-medium text-text-muted uppercase tracking-wide">
                Success
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {campaigns.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-surface-hover transition-colors"
              >
                <td className="px-5 py-3 font-medium text-text-primary">
                  {c.name}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={statusVariant[c.status] ?? "gray"}
                    dot
                    animate={c.status === "RUNNING"}
                  >
                    {c.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {(() => {
                      const progressValue = parseFloat(
                        c.progress.replace("%", ""),
                      );

                      return (
                        <>
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-subtle">
                            <div
                              className="h-full rounded-full bg-brand-500 transition-all"
                              style={{
                                width: `${Math.max(0, Math.min(100, progressValue))}%`,
                              }}
                            />
                          </div>
                          <span className="w-10 text-right text-base text-text-muted">
                            {c.progress}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </td>
                <td className="px-5 py-3 text-right font-medium text-success-600">
                  {c.completedLeads}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
