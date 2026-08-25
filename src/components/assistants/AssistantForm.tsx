// src/components/assistants/AssistantForm.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useBolnaAgents } from "@/hooks/useAssistants";
import { ExternalLink, RefreshCw, Bot } from "lucide-react";
import type { Assistant, RegisterAssistantInput, UpdateAssistantInput } from "@/types";

// ── Schema ────────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bolnaId: z.string().min(1, "Please select or enter a Bolna agent ID"),
});

const editSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bolnaId: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;
type EditFormValues = z.infer<typeof editSchema>;
type FormValues = RegisterFormValues | EditFormValues;

// ── Props ─────────────────────────────────────────────────────────────────────
interface AssistantFormBaseProps {
  isLoading?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

interface RegisterModeProps extends AssistantFormBaseProps {
  editMode?: false;
  defaultValues?: undefined;
  onSubmit: (data: RegisterAssistantInput) => void;
}

interface EditModeProps extends AssistantFormBaseProps {
  editMode: true;
  defaultValues: Assistant;
  onSubmit: (data: UpdateAssistantInput) => void;
}

type AssistantFormProps = RegisterModeProps | EditModeProps;

// ── Component ─────────────────────────────────────────────────────────────────
export function AssistantForm({
  onSubmit,
  isLoading,
  submitLabel = "Register Assistant",
  onCancel,
  editMode = false,
  defaultValues,
}: AssistantFormProps) {
  const [inputMode, setInputMode] = useState<"select" | "manual">("select");

  const {
    data: bolnaAgents,
    isLoading: agentsLoading,
    refetch,
  } = useBolnaAgents();

  const schema = editMode ? editSchema : registerSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: editMode
      ? { name: defaultValues?.name ?? '', bolnaId: defaultValues?.bolnaId ?? '' }
      : { name: '', bolnaId: '' },
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

  // Cast submit handler — TS narrows correctly via editMode prop
  const handleFormSubmit = (data: FormValues) => {
    if (editMode) {
      (onSubmit as (d: UpdateAssistantInput) => void)({ name: data.name });
    } else {
      (onSubmit as (d: RegisterAssistantInput) => void)(
        data as RegisterAssistantInput
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-5"
    >

      <Card>
        <h2 className="text-base font-semibold text-text-primary mb-4">
          {editMode ? 'Update Assistant' : 'Register Agent'}
        </h2>
        <div className="flex flex-col gap-4">

          {/* ── Bolna Agent picker — only when creating ── */}
          {!editMode && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-base font-medium text-text-primary">
                  Bolna Agent
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setInputMode(
                        inputMode === "select" ? "manual" : "select"
                      )
                    }
                    className="text-sm text-text-muted hover:text-text-primary transition-colors"
                  >
                    {inputMode === "select"
                      ? "Enter ID manually"
                      : "Select from list"}
                  </button>
                  {inputMode === "select" && (
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="text-sm text-text-muted hover:text-text-primary transition-colors"
                    >
                      <RefreshCw size={12} />
                    </button>
                  )}
                </div>
              </div>

              {inputMode === "select" ? (
                agentsLoading ? (
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-border bg-surface-secondary">
                    <Spinner size="sm" />
                    <span className="text-base text-text-muted">
                      Fetching agents from Bolna...
                    </span>
                  </div>
                ) : bolnaAgentOptions.length === 0 ? (
                  <div className="rounded-md bg-amber-50 border border-amber-100 p-3">
                    <p className="text-base text-amber-700">
                      No agents found in your Bolna dashboard.{" "}
                      <a
                        href="https://app.bolna.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium"
                      >
                        Create one first
                      </a>
                      .
                    </p>
                  </div>
                ) : (
                  <select
                    onChange={handleAgentSelect}
                    className="w-full h-10 px-3 rounded-md border border-border bg-surface text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Select a Bolna agent...</option>
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
                  error={(errors as { bolnaId?: { message?: string } }).bolnaId?.message}
                  {...register("bolnaId")}
                />
              )}

              {/* Hidden input for react-hook-form when using select mode */}
              {inputMode === "select" && (
                <input type="hidden" {...register("bolnaId")} />
              )}

              {(errors as { bolnaId?: { message?: string } }).bolnaId && (
                <p className="text-sm text-error mt-1">
                  {(errors as { bolnaId?: { message?: string } }).bolnaId?.message}
                </p>
              )}

              {selectedBolnaId && (
                <p className="text-sm text-text-muted mt-1.5 font-mono">
                  ID: {selectedBolnaId}
                </p>
              )}
            </div>
          )}

          {/* ── Bolna ID read-only display when editing ── */}
          {editMode && defaultValues?.bolnaId && (
            <div>
              <p className="text-base font-medium text-text-primary mb-1.5">
                Bolna Agent ID
              </p>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-surface-border bg-surface-subtle font-mono text-sm text-text-muted">
                {defaultValues.bolnaId}
              </div>
              <p className="text-sm text-text-muted mt-1">
                Agent ID cannot be changed. Delete and re-register to use a different agent.
              </p>
            </div>
          )}

          {/* ── Display Name — always shown ── */}
          <Input
            label="Display name"
            placeholder="e.g. Real Estate Qualifier — Sarvam"
            hint="How this agent appears in campaigns"
            error={errors.name?.message}
            {...register("name")}
          />
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" loading={isLoading}>
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel ?? (() => history.back())}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}