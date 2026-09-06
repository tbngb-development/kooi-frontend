import { Card } from "@/components/ui/Card";
import type { Campaign } from "@/types/campaign";
import { Flame, Phone, Users } from "lucide-react";
import Link from "next/link";

interface CampaignQuickActionsProps {
  campaign: Campaign;
}

export function CampaignQuickActions({ campaign }: CampaignQuickActionsProps) {
  const id = campaign.id;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <QuickActionCard
        href={`/campaigns/${id}/leads`}
        icon={<Users size={18} />}
        iconBg="bg-info-100 group-hover:bg-info-500"
        iconColor="text-info-600"
        title="View Leads"
        subtitle={`${campaign.totalLeads} total lead${campaign.totalLeads !== 1 ? "s" : ""}`}
      />
      <QuickActionCard
        href={`/campaigns/${id}/calls`}
        icon={<Phone size={18} />}
        iconBg="bg-secondary-50 group-hover:bg-secondary-500"
        iconColor="text-secondary-600"
        title="View Calls"
        subtitle={`${campaign.calledLeads} call${campaign.calledLeads !== 1 ? "s" : ""} made`}
      />
      <QuickActionCard
        href={`/campaigns/${id}/calls?leadTemperature=HOT,WARM`}
        icon={<Flame size={18} />}
        iconBg="bg-amber-100 group-hover:bg-amber-500"
        iconColor="text-amber-600"
        title="Qualified Calls"
        subtitle={`${campaign.completedLeads} completed (HOT / WARM)`}
      />
    </div>
  );
}

function QuickActionCard({
  href,
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group h-full">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors shrink-0 ${iconBg}`}
          >
            <span
              className={`${iconColor} group-hover:text-white transition-colors`}
            >
              {icon}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary">{title}</p>
            <p className="text-sm text-text-muted truncate">{subtitle}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
