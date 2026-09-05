"use client";

import { use } from "react";
import { useTenant } from "@/hooks/admin/useAdminTenants";
import {
  useAdminCall,
  useAdminCallTranscript,
} from "@/hooks/admin/useAdminCalls";
import { ADMIN_ROUTES } from "@/constants/routes/admin.routes";
import { AdminTenantNav } from "@/components/admin/AdminTenantNav";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import {
  PhoneCall,
  MessageSquare,
  Thermometer,
  Target,
  Clock,
  IndianRupee,
} from "lucide-react";
import { paisaToInr } from "@/constants/config/wallet.config";

const tempVariant: Record<
  string,
  "error" | "warning" | "info" | "blue" | "gray"
> = {
  HOT: "error",
  WARM: "warning",
  NURTURE: "info",
  COLD: "blue",
  NOT_APPLICABLE: "gray",
};

interface PageProps {
  params: Promise<{ id: string; callId: string }>;
}

export default function AdminCallDetailPage({ params }: PageProps) {
  const { id: tenantId, callId } = use(params);
  const { data: tenant } = useTenant(tenantId);
  const { data: call, isLoading } = useAdminCall(tenantId, callId);
  const { data: transcript } = useAdminCallTranscript(tenantId, callId);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <Spinner className="text-error-600" />
      </div>
    );
  if (!call)
    return (
      <div className="p-8 text-center text-text-muted">Call not found.</div>
    );

  const analysis = call.callAnalysis;
  const messages =
    transcript?.transcriptMessages ?? call.transcriptMessages ?? [];

  return (
    <div className="flex flex-col min-h-screen bg-surface-muted">
      <AdminTenantNav tenantId={tenantId} tenantName={tenant?.name ?? "..."} />
      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        <AdminPageHeader
          title={`Call ${call.id.slice(0, 12)}...`}
          backHref={ADMIN_ROUTES.TENANT_CALLS(tenantId)}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Status", value: call.status, icon: PhoneCall },
            {
              label: "Duration",
              value: call.duration ? `${call.duration}s` : "—",
              icon: Clock,
            },
            {
              label: "Cost",
              value: call.platformCost ? paisaToInr(call.platformCost) : "₹0.00",
              icon: IndianRupee,
            },
            {
              label: "Lead",
              value: call.lead?.name ?? call.lead?.phone ?? "—",
              icon: Target,
            },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={i} className="p-4 flex items-center gap-3">
                <Icon size={16} className="text-text-muted shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-placeholder">
                    {s.label}
                  </p>
                  <p className="text-sm font-bold text-text-primary">
                    {s.value}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {analysis && (
          <Card className="p-5">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4">
              <Thermometer size={15} /> Call Analysis
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-text-muted block text-xs">
                  Disposition
                </span>
                <Badge
                  variant={
                    analysis.disposition === "NOT_INTERESTED" ||
                    analysis.disposition === "DO_NOT_CALL"
                      ? "error"
                      : "success"
                  }
                >
                  {analysis.disposition ?? "—"}
                </Badge>
              </div>
              <div>
                <span className="text-text-muted block text-xs mb-1">
                  Temperature
                </span>
                <Badge
                  variant={
                    tempVariant[analysis.leadTemperature ?? ""] ?? "gray"
                  }
                >
                  {analysis.leadTemperature ?? "—"}
                </Badge>
              </div>
              <div>
                <span className="text-text-muted block text-xs">Budget</span>
                <span className="font-medium">
                  {analysis.budgetRange ?? "—"}
                </span>
              </div>
              <div>
                <span className="text-text-muted block text-xs">Timeline</span>
                <span className="font-medium">
                  {analysis.purchaseTimeline ?? "—"}
                </span>
              </div>
              <div>
                <span className="text-text-muted block text-xs">
                  Configuration
                </span>
                <span className="font-medium">
                  {analysis.preferredConfiguration ?? "—"}
                </span>
              </div>
              <div>
                <span className="text-text-muted block text-xs">Purpose</span>
                <span className="font-medium">
                  {analysis.purchasePurpose ?? "—"}
                </span>
              </div>
              <div>
                <span className="text-text-muted block text-xs">
                  Next Action
                </span>
                <span className="font-medium">
                  {analysis.preferredNextAction ?? "—"}
                </span>
              </div>
              <div>
                <span className="text-text-muted block text-xs">
                  Location Match
                </span>
                <Badge
                  variant={
                    analysis.locationMatch === "MATCH"
                      ? "success"
                      : analysis.locationMatch === "MISMATCH"
                        ? "error"
                        : "gray"
                  }
                >
                  {analysis.locationMatch ?? "—"}
                </Badge>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-5">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4">
            <MessageSquare size={15} /> Transcript ({messages.length} messages)
          </h3>
          {messages.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">
              No transcript available.
            </p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto thin-scrollbar pr-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "assistant"
                        ? "bg-surface-subtle border border-surface-border text-text-primary rounded-tl-sm"
                        : "bg-brand-50 border border-brand-100 text-brand-900 rounded-tr-sm"
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60">
                      {msg.role === "assistant" ? "AI Agent" : "Customer"}
                    </p>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {call.recording && (
          <Card className="p-5">
            <h3 className="text-sm font-bold text-text-primary mb-3">
              Recording
            </h3>
            <audio controls src={call.recording} className="w-full" />
          </Card>
        )}
      </div>
    </div>
  );
}
