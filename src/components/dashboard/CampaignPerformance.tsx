"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useDashboardCampaignPerformance } from "@/hooks/useDashboard";
import { dashboardApi } from "@/lib/api/dashboard";
import { formatDate } from "@/lib/utils/formatDate";
import { formatPaisa } from "@/lib/utils/formatMoney";
import type { DashboardFilters } from "@/types/dashboard";
import { Download, Table as TableIcon } from "lucide-react";

interface Props {
  filters: DashboardFilters;
}

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

export function CampaignPerformance({ filters }: Props) {
  const { data, isLoading } = useDashboardCampaignPerformance(filters);

  const handleExport = () => {
    const url = dashboardApi.buildExportCampaignPerformanceUrl(filters);
    window.open(url, "_blank");
  };

  return (
    <Card padding="none">
      <CardHeader className="px-5 pt-5 pb-4 mb-0">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-50 text-secondary-600">
            <TableIcon size={16} />
          </div>
          <CardTitle>Campaign Performance</CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download size={14} />}
          onClick={handleExport}
        >
          Export CSV
        </Button>
      </CardHeader>

      {isLoading ? (
        <div className="flex h-56 items-center justify-center">
          <Spinner />
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title="No campaigns"
          description="Create a campaign to see performance metrics here."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-y border-surface-border bg-surface-subtle">
                <Th align="left">Campaign</Th>
                <Th align="left">Status</Th>
                <Th align="right">Leads</Th>
                <Th align="right">Called</Th>
                <Th align="right">Qualified</Th>
                <Th align="right">Qualification</Th>
                <Th align="right">Spend</Th>
                <Th align="right">Cost / Lead</Th>
                <Th align="left">Started</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {data.data.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-surface-hover transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-text-primary">
                    <div className="flex flex-col">
                      <span>{c.name}</span>
                      <span className="text-xs text-text-muted">
                        {c.assistantName}
                      </span>
                    </div>
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
                  <td className="px-4 py-3 text-right text-text-secondary">
                    {c.totalLeads.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right text-text-secondary">
                    {c.calledLeads.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-success-600">
                    {c.qualifiedLeads.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right text-text-secondary">
                    {c.qualificationRate.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right text-text-secondary">
                    {formatPaisa(c.totalSpendPaisa)}
                  </td>
                  <td className="px-4 py-3 text-right text-text-secondary">
                    {formatPaisa(c.avgCostPerLeadPaisa)}
                  </td>
                  <td className="px-5 py-3 text-text-muted whitespace-nowrap">
                    {c.startedAt ? formatDate(c.startedAt, "MMM d, yyyy") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function Th({
  children,
  align,
}: {
  children: React.ReactNode;
  align: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wide ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}
