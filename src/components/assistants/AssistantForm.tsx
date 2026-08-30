"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useAdminBolnaAgents } from "@/hooks/useAssistants";
import type {
  Assistant,
  RegisterAssistantInput,
  UpdateAssistantInput,
} from "@/types";

// ─── Unified Validation Schema ────────────────────────────────────────────────
const assistantFormSchema = z.object({
  name: z.string().min(2, "Display Name must be at least 2 characters"),
  bolnaId: z.string().min(1, "Bolna configuration identity is required"),
});

type FormValues = z.infer<typeof assistantFormSchema>;

interface AssistantFormProps {
  isLoading?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
  editMode?: boolean;
  defaultValues?: Assistant;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void;
  onSync?: () => void;
  syncing?: boolean;
}

export function AssistantForm({
  onSubmit,
  isLoading,
  submitLabel = "Assign Agent",
  onCancel,
  editMode = false,
  defaultValues,
  onSync,
  syncing = false,
}: AssistantFormProps) {
  const [inputMode, setInputMode] = useState<"select" | "manual">("select");

  // Admin hook queries GET /api/v1/admin/assistants/bolna-agents
  const {
    data: bolnaAgents,
    isLoading: agentsLoading,
    refetch,
  } = useAdminBolnaAgents();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(assistantFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      bolnaId: defaultValues?.bolnaId ?? "",
    },
  });

  const selectedBolnaId = watch("bolnaId");

  const bolnaAgentOptions =
    bolnaAgents?.map((a) => ({
      value: a.id,
      label: `${a.agent_name} (${a.id.slice(0, 8)}...)`,
    })) ?? [];

  const handleAgentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const agentId = e.target.value;
    const agent = bolnaAgents?.find((a) => a.id === agentId);
    setValue("bolnaId", agentId);
    if (agent) {
      setValue("name", agent.agent_name);
    }
  };

  const handleFormSubmit: SubmitHandler<FormValues> = (data) => {
    if (editMode) {
      onSubmit({ name: data.name } as UpdateAssistantInput);
    } else {
      onSubmit(data as RegisterAssistantInput);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-4"
    >
      {/* ── Selection Mode Header (Create only) ── */}
      {!editMode && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-base font-semibold text-text-secondary">
              Bolna Agent Identity
            </label>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  setInputMode(inputMode === "select" ? "manual" : "select")
                }
                className="text-base font-semibold text-brand-600 hover:text-brand-500 transition-colors"
              >
                {inputMode === "select" ? "Manual input" : "Fetch list"}
              </button>
              {inputMode === "select" && (
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="text-text-muted hover:text-text-primary transition-colors"
                  aria-label="Refresh agent registry"
                >
                  <RefreshCw
                    size={11}
                    className={agentsLoading ? "animate-spin" : ""}
                  />
                </button>
              )}
            </div>
          </div>

          {inputMode === "select" ? (
            agentsLoading ? (
              <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-surface-border bg-surface-subtle">
                <Spinner size="sm" />
                <span className="text-base text-text-muted">
                  Querying active registries on Bolna Dev...
                </span>
              </div>
            ) : bolnaAgentOptions.length === 0 ? (
              <div className="rounded-md bg-warning-50 border border-warning-100 p-3">
                <p className="text-base text-warning-700 leading-relaxed">
                  No active agent models identified on your platform config.
                  Ensure setup on{" "}
                  <a
                    href="https://app.bolna.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-bold"
                  >
                    Bolna Dashboard
                  </a>{" "}
                  prior to registration.
                </p>
              </div>
            ) : (
              <select
                onChange={handleAgentSelect}
                className="w-full h-10 px-3 rounded-md border border-surface-border bg-surface text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">Select Bolna identity...</option>
                {bolnaAgentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )
          ) : (
            <Input
              placeholder="e.g. ee24d63a-64a4-4548-87cb-468b95824920"
              error={errors.bolnaId?.message}
              {...register("bolnaId")}
            />
          )}

          {/* Hidden registry input binder */}
          {inputMode === "select" && (
            <input type="hidden" {...register("bolnaId")} />
          )}

          {selectedBolnaId && (
            <p className="text-[10px] text-text-placeholder font-mono leading-none mt-1">
              Active ID: {selectedBolnaId}
            </p>
          )}
        </div>
      )}

      {/* ── Bolna ID read-only display when editing ── */}
      {editMode && defaultValues?.bolnaId && (
        <div className="flex flex-col gap-1.5 pb-4 border-b border-surface-border">
          <label className="text-base font-semibold text-text-secondary">
            Assigned Agent ID
          </label>
          <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-md border border-surface-border bg-surface-subtle font-mono text-base text-text-secondary">
            <span>{defaultValues.bolnaId}</span>
            {onSync && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={syncing}
                onClick={onSync}
                leftIcon={<RefreshCw size={11} />}
                className="text-[10px] h-7 px-2 font-semibold bg-white border-surface-border"
              >
                Sync with Bolna
              </Button>
            )}
          </div>
          <p className="text-[10px] text-text-placeholder leading-normal mt-0.5">
            Target agent linkages are locked. Revoke and re-assign the assistant
            to modify target identities.
          </p>
        </div>
      )}

      {/* ── Display Name ── */}
      <Input
        label="Workspace Display Name"
        placeholder="e.g. Real Estate Qualifier — Sarvam"
        hint="Used to identify this voice model in campaign dropdown selections."
        error={errors.name?.message}
        {...register("name")}
      />

      {/* Form Action Controls */}
      <div className="flex justify-end gap-2 pt-4 border-t border-surface-border">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isLoading || syncing}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={isLoading} disabled={syncing}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
