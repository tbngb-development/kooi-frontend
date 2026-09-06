import { Zap } from "lucide-react";

interface SidebarLogoProps {
  tenantName: string;
}

export function SidebarLogo({ tenantName }: SidebarLogoProps) {
  return (
    <div className="flex items-center gap-2.5 px-4 h-14 border-b border-zinc-800 shrink-0">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 shadow-lg shadow-brand-900/30">
        <Zap size={16} className="text-white fill-white" />
      </div>
      <div className="min-w-0">
        <p className="text-base font-semibold text-zinc-100 truncate leading-none">
          {tenantName}
        </p>
        <p className="text-xs text-zinc-400 mt-1 leading-none">AI Agent Hub</p>
      </div>
    </div>
  );
}