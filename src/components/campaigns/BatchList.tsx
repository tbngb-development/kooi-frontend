import {
  FileSpreadsheet,
  Users,
  Phone,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useBatches } from "@/hooks/useBatches";
import { BatchStatusBadge } from "./BatchStatusBadge";
import { BatchActions } from "./BatchActions";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateOnly, formatTimeOnly } from "@/lib/utils/formatDate";

interface BatchListProps {
  campaignId: string;
}

export function BatchList({ campaignId }: BatchListProps) {
  const { data: batches, isLoading, error } = useBatches(campaignId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-error-200 bg-error-50 p-4 text-base text-error-700">
        Failed to load batches
      </div>
    );
  }

  if (!batches || batches.length === 0) {
    return (
      <EmptyState
        icon={<FileSpreadsheet size={24} />}
        title="No batches yet"
        description="Upload a CSV / XLS / XLSX file to create your first batch of leads."
      />
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-surface-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-base">
          <thead className="bg-surface-subtle border-b border-surface-border">
            <tr>
              <th className="px-4 py-3 text-left text-base font-medium text-text-muted whitespace-nowrap">
                File
              </th>
              <th className="px-4 py-3 text-left text-base font-medium text-text-muted whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-center text-base font-medium text-text-muted whitespace-nowrap">
                Leads
              </th>
              <th className="px-4 py-3 text-center text-base font-medium text-text-muted whitespace-nowrap">
                Called
              </th>
              <th className="px-4 py-3 text-center text-base font-medium text-text-muted whitespace-nowrap">
                Completed
              </th>
              <th className="px-4 py-3 text-center text-base font-medium text-text-muted whitespace-nowrap">
                Failed
              </th>
              <th className="px-4 py-3 text-left text-base font-medium text-text-muted whitespace-nowrap">
                Created
              </th>
              <th className="px-4 py-3 text-left text-base font-medium text-text-muted whitespace-nowrap">
                Scheduled
              </th>
              <th className="px-4 py-3 text-center text-base font-medium text-text-muted whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {batches.map((batch) => (
              <tr
                key={batch.id}
                className="hover:bg-surface-hover transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet
                      size={14}
                      className="text-text-muted shrink-0"
                    />
                    <span className="max-w-[200px] truncate font-medium text-text-primary">
                      {batch.fileName ?? "Unknown"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <BatchStatusBadge status={batch.status} />
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <span className="inline-flex items-center justify-center gap-1 text-text-secondary">
                    <Users size={12} className="text-text-muted" />
                    {batch.totalLeads}
                  </span>
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <span className="inline-flex items-center justify-center gap-1 text-info-600">
                    <Phone size={12} />
                    {batch.calledLeads}
                  </span>
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <span className="inline-flex items-center justify-center gap-1 text-success-600">
                    <CheckCircle size={12} />
                    {batch.completedLeads}
                  </span>
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <span className="inline-flex items-center justify-center gap-1 text-error-500">
                    <XCircle size={12} />
                    {batch.failedLeads}
                  </span>
                </td>
                <td className="px-4 py-3 text-base text-text-muted whitespace-nowrap">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-base font-medium text-text-primary leading-none">
                      {formatTimeOnly(batch.createdAt)}
                    </span>
                    <span className="text-base text-text-muted leading-none">
                      {formatDateOnly(batch.createdAt)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-base text-text-muted whitespace-nowrap">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-base font-medium text-text-primary leading-none">
                      {formatTimeOnly(batch.scheduledAt)}
                    </span>
                    <span className="text-base text-text-muted leading-none">
                      {formatDateOnly(batch.scheduledAt)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center justify-center">
                    <BatchActions
                      campaignId={campaignId}
                      batchId={batch.id}
                      status={batch.status}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
