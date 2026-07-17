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
import type { RegisterAssistantInput } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bolnaId: z.string().min(1, "Please select or enter a Bolna agent ID"),
});

type FormValues = z.infer<typeof schema>;

interface AssistantFormProps {
  onSubmit: (data: RegisterAssistantInput) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function AssistantForm({
  onSubmit,
  isLoading,
  submitLabel = "Register Assistant",
}: AssistantFormProps) {
  const [inputMode, setInputMode] = useState<"select" | "manual">("select");
  const {
    data: bolnaAgents,
    isLoading: agentsLoading,
    refetch,
  } = useBolnaAgents();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const selectedBolnaId = watch("bolnaId");
  console.log("selectedBolnaId: ", selectedBolnaId)
  console.log("Bolna Agent List: ", bolnaAgents)

  const bolnaAgentOptions =
    bolnaAgents?.map((a) => ({
      value: a.id,
      label: `${a.agent_name} (${a.id.slice(0, 8)}...)`,
    })) ?? [];

  const handleAgentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const agentId = e.target.value;
    const agent = bolnaAgents?.find((a) => a.id === agentId);
    setValue("bolnaId", agentId);
    // Auto-fill name from Bolna agent name
    if (agent) {
      setValue("name", agent.agent_name);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 max-w-2xl"
    >
      {/* Info Banner */}
      <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
        <div className="flex items-start gap-3">
          <Bot size={18} className="text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              Bolna Dashboard Agent
            </p>
            <p className="text-sm text-blue-600 mt-0.5">
              Configure your agent (prompt, voice, Sarvam TTS) in the Bolna
              dashboard, then register it here by selecting its Agent ID.
            </p>
            <a
              href="https://app.bolna.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-700 font-medium mt-2 hover:underline"
            >
              Open Bolna Dashboard
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-text-primary mb-4">
          Register Agent
        </h2>
        <div className="flex flex-col gap-4">
          {/* Agent ID Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-text-primary">
                Bolna Agent
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setInputMode(inputMode === "select" ? "manual" : "select")
                  }
                  className="text-xs text-text-muted hover:text-text-primary transition-colors"
                >
                  {inputMode === "select"
                    ? "Enter ID manually"
                    : "Select from list"}
                </button>
                {inputMode === "select" && (
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="text-xs text-text-muted hover:text-text-primary transition-colors"
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
                  <span className="text-sm text-text-muted">
                    Fetching agents from Bolna...
                  </span>
                </div>
              ) : bolnaAgentOptions.length === 0 ? (
                <div className="rounded-md bg-amber-50 border border-amber-100 p-3">
                  <p className="text-sm text-amber-700">
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
                  className="w-full h-10 px-3 rounded-md border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                error={errors.bolnaId?.message}
                {...register("bolnaId")}
              />
            )}

            {/* Hidden input for react-hook-form when using select mode */}
            {inputMode === "select" && (
              <input type="hidden" {...register("bolnaId")} />
            )}

            {errors.bolnaId && (
              <p className="text-xs text-error mt-1">
                {errors.bolnaId.message}
              </p>
            )}

            {/* Show selected ID */}
            {selectedBolnaId && (
              <p className="text-xs text-text-muted mt-1.5 font-mono">
                ID: {selectedBolnaId}
              </p>
            )}
          </div>

          {/* Friendly Name */}
          <Input
            label="Display name"
            placeholder="e.g. Real Estate Qualifier — Sarvam"
            hint="How this agent appears in your campaigns"
            error={errors.name?.message}
            {...register("name")}
          />
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={isLoading}>
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
