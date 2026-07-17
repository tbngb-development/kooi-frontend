// src/components/campaigns/CampaignDetailsForm.tsx

"use client";

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/TextArea";
import { Select } from "@/components/ui/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ChevronLeft, Building2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { Assistant } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Campaign name must be at least 2 characters"),
  description: z.string().optional(),
  assistantId: z.string().min(1, "Please select an assistant"),
});

type FormValues = z.infer<typeof schema>;

interface CampaignDetailsFormProps {
  assistants: Assistant[];
  isCreating: boolean;
  brochureName: string | null;
  hasBrochure: boolean;
  onSubmit: (data: FormValues) => void;
  onBack: () => void;
}

export function CampaignDetailsForm({
  assistants,
  isCreating,
  brochureName,
  hasBrochure,
  onSubmit,
  onBack,
}: CampaignDetailsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      // Auto-fill name from brochure project name
      name: brochureName ? `${brochureName} — Campaign` : "",
    },
  });

  const assistantOptions = assistants.map((a) => ({
    value: a.id,
    label: a.name,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Brochure linked indicator */}
      {hasBrochure && (
        <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-100 p-3">
          <CheckCircle2 size={16} className="text-green-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">
              Property brochure linked
            </p>
            <p className="text-xs text-green-600">
              {brochureName
                ? `"${brochureName}" details will be injected into every call`
                : "Brochure data will be injected into every call"}
            </p>
          </div>
        </div>
      )}

      {!hasBrochure && (
        <div className="flex items-center gap-3 rounded-lg bg-surface-secondary border border-border p-3">
          <Building2 size={16} className="text-text-muted shrink-0" />
          <p className="text-xs text-text-muted">
            {` No brochure linked — calls will use your assistant's base prompt only.`}
          </p>
        </div>
      )}

      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Campaign Details
        </h3>
        <div className="flex flex-col gap-4">
          <Input
            label="Campaign name"
            placeholder="Q4 Lead Outreach"
            error={errors.name?.message}
            {...register("name")}
          />
          <TextArea
            label="Description (optional)"
            placeholder="Brief description of this campaign's goals..."
            rows={2}
            {...register("description")}
          />

          {assistantOptions.length === 0 ? (
            <div className="rounded-md bg-amber-50 border border-amber-100 p-3">
              <p className="text-sm text-amber-700">
                No assistants found.{" "}
                <Link href="/assistants/new" className="underline font-medium">
                  Register an assistant first
                </Link>
                .
              </p>
            </div>
          ) : (
            <Select
              label="AI Assistant"
              options={assistantOptions}
              placeholder="Select an assistant"
              error={errors.assistantId?.message}
              {...register("assistantId")}
            />
          )}
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          loading={isCreating}
          disabled={assistantOptions.length === 0}
        >
          Create Campaign
        </Button>
        <Button
          type="button"
          variant="outline"
          leftIcon={<ChevronLeft size={14} />}
          onClick={onBack}
          disabled={isCreating}
        >
          Back
        </Button>
      </div>
    </form>
  );
}
