"use client";

import { use } from "react";
import { useTenant } from "@/hooks/admin/useAdminTenants";
import { useAdminLead } from "@/hooks/admin/useAdminLeads";
import { ADMIN_ROUTES } from "@/constants/routes/admin.routes";
import { AdminTenantNav } from "@/components/admin/AdminTenantNav";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { User, PhoneCall, ShieldAlert } from "lucide-react";
import Link from "next/link";

const statusVariant: Record<
  string,
  "gray" | "info" | "blue" | "success" | "warning" | "default" | "error"
> = {
  PENDING: "gray",
  CALLING: "info",
  CALLED: "blue",
  QUALIFIED: "success",
  NOT_QUALIFIED: "warning",
  NO_ANSWER: "default",
  FAILED: "error",
};

interface PageProps {
  params: Promise<{ id: string; leadId: string }>;
}

export default function AdminLeadDetailPage({ params }: PageProps) {
  const { id: tenantId, leadId } = use(params);
  const { data: tenant } = useTenant(tenantId);
  const { data: lead, isLoading } = useAdminLead(tenantId, leadId);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <Spinner className="text-error-600" />
      </div>
    );
  if (!lead)
    return (
      <div className="p-8 text-center text-text-muted">Lead not found.</div>
    );

  return (
    <div className="flex flex-col min-h-screen bg-surface-muted">
      <AdminTenantNav tenantId={tenantId} tenantName={tenant?.name ?? "..."} />
      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        <AdminPageHeader
          title={lead.name ?? "Unknown Lead"}
          description={lead.phone}
          backHref={ADMIN_ROUTES.TENANT_LEADS(tenantId)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <User size={15} /> Lead Info
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Name</span>
                <span className="font-medium">{lead.name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Phone</span>
                <span className="font-mono">{lead.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Email</span>
                <span>{lead.email ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Company</span>
                <span>{lead.company ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Status</span>
                <Badge variant={statusVariant[lead.status] ?? "default"}>
                  {lead.status}
                </Badge>
              </div>
              {lead.doNotCall && (
                <div className="flex items-center gap-2 text-error-600 font-semibold">
                  <ShieldAlert size={14} /> Do Not Call
                </div>
              )}
            </div>
          </Card>

          <Card className="lg:col-span-2 p-5">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4">
              <PhoneCall size={15} /> Call History ({lead.calls?.length ?? 0})
            </h3>
            {!lead.calls || lead.calls.length === 0 ? (
              <EmptyState icon={<PhoneCall size={24} />} title="No calls yet" />
            ) : (
              <div className="space-y-3">
                {lead.calls.map((call) => (
                  <Link
                    key={call.id}
                    href={ADMIN_ROUTES.TENANT_CALL_DETAIL(tenantId, call.id)}
                    className="flex items-center justify-between p-3 rounded-lg border border-surface-border hover:bg-surface-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          call.status === "COMPLETED"
                            ? "success"
                            : call.status === "FAILED"
                              ? "error"
                              : "info"
                        }
                      >
                        {call.status}
                      </Badge>
                      <span className="text-xs font-mono text-text-muted">
                        {call.id.slice(0, 12)}...
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                      <span>{call.duration ? `${call.duration}s` : "—"}</span>
                      <span>
                        {call.startedAt
                          ? new Date(call.startedAt).toLocaleString()
                          : "—"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
