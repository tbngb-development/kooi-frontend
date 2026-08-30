"use client";

import { useState, useEffect } from "react";
import { Building2, Save } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import {
  useCurrentWorkspace,
  useUpdateCurrentWorkspace,
} from "@/hooks/useTenants";
import { formatDate } from "@/lib/utils/formatDate";
import { toast } from "sonner";

export function WorkspaceTab() {
  const { data: workspace, isLoading } = useCurrentWorkspace();
  const updateMutation = useUpdateCurrentWorkspace();

  const [name, setName] = useState("");

  useEffect(() => {
    if (workspace?.name) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(workspace.name);
    }
  }, [workspace?.name]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Workspace name cannot be empty");
      return;
    }
    updateMutation.mutate({ name: name.trim() });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!workspace) {
    return (
      <p className="text-base text-text-muted text-center py-8">
        Unable to resolve active workspace. Please refresh.
      </p>
    );
  }

  const isDirty = name.trim() !== workspace.name;

  return (
    <div className="flex flex-col gap-6">
      {/* Workspace Identity */}
      <div className="flex items-start gap-4 pb-6 border-b border-surface-border">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 border border-brand-100 text-brand-600 shrink-0 shadow-xs">
          <Building2 size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-text-primary tracking-tight truncate">
              {workspace.name}
            </h3>
            {workspace.isActive ? (
              <Badge variant="success" dot animate>
                Active
              </Badge>
            ) : (
              <Badge variant="gray" dot>
                Deactivated
              </Badge>
            )}
          </div>
          <p className="text-base text-text-muted mt-1">
            Provisioned {formatDate(workspace.createdAt)}
          </p>
        </div>
      </div>

      {/* Editable Configuration */}
      <div className="flex flex-col gap-4">
        <Input
          label="Workspace Name"
          leftIcon={<Building2 size={14} className="text-text-muted" />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
        />
      </div>

      {/* Resource Counts */}
      <div>
        <p className="text-base font-bold text-text-muted uppercase tracking-wider mb-2">
          Workspace Resources
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ResourceCounter
            label="Members"
            count={workspace._count.memberships}
          />
          <ResourceCounter
            label="Campaigns"
            count={workspace._count.campaigns}
          />
          <ResourceCounter label="Leads" count={workspace._count.leads} />
          <ResourceCounter label="Calls" count={workspace._count.calls} />
        </div>
      </div>

      {/* Save Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-surface-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setName(workspace.name)}
          disabled={!isDirty || updateMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isDirty}
          loading={updateMutation.isPending}
          leftIcon={<Save size={13} />}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function ResourceCounter({ label, count }: { label: string; count: number }) {
  return (
    <div className="bg-surface-subtle border border-surface-border rounded-lg px-3 py-2.5">
      <p className="text-2xl font-bold text-text-primary leading-tight">
        {count}
      </p>
      <p className="text-base text-text-muted mt-0.5">{label}</p>
    </div>
  );
}
