"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/TextArea";
import { Select } from "@/components/ui/Select";
import { RetryConfigEditor } from "./RetryConfigEditor";
import { FloatingBottomBar } from "./FloatingBottomBar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Assistant } from "@/types/assistant";
import { RetryConfig } from "@/types/batch";

const schema = z.object({
  name: z.string().min(2, "Campaign name must be at least 2 characters"),
  description: z.string().optional(),
  assistantId: z.string().min(1, "Please select an assistant"),
});

type FormValues = z.infer<typeof schema>;

interface CampaignDetailsStepProps {
  assistants: Assistant[];
  initialValues: (FormValues & { defaultRetryConfig?: RetryConfig }) | null;
  onNext: (data: FormValues & { defaultRetryConfig?: RetryConfig }) => void;
  onCancel: () => void;
}

export function CampaignDetailsStep({
  assistants,
  initialValues,
  onNext,
  onCancel,
}: CampaignDetailsStepProps) {
  const [retryConfig, setRetryConfig] = useState<RetryConfig | undefined>(
    initialValues?.defaultRetryConfig ?? undefined,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? {
      name: "",
      description: "",
      assistantId: "",
    },
  });

  const assistantOptions = assistants.map((a) => ({
    value: a.id,
    label: a.name,
  }));

  const onSubmit = (data: FormValues) => {
    onNext({
      ...data,
      defaultRetryConfig: retryConfig,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card className="p-6">
        <h3 className="text-base font-bold text-text-primary mb-5">
          General Settings
        </h3>
        <div className="flex flex-col gap-5">
          <Input
            label="Campaign Name"
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
            <div className="rounded-lg bg-amber-50 border border-amber-200/70 p-4">
              <p className="text-sm text-amber-800 leading-relaxed">
                No AI assistants assigned to your workspace. Please{" "}
                <a
                  href="mailto:support@kooi.io"
                  className="font-semibold underline hover:text-amber-950 transition-colors"
                >
                  contact your administrator
                </a>{" "}
                to provision and assign an assistant to your account.
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

      <Card className="p-6">
        <h3 className="text-base font-bold text-text-primary mb-1">
          Default Batch Auto-Retry Strategy
        </h3>
        <p className="text-sm text-text-muted mb-5">
          All new lead batches in this campaign will inherit these settings
          unless overridden during upload.
        </p>
        <RetryConfigEditor value={retryConfig} onChange={setRetryConfig} />
      </Card>

      {/* ── Center Centered Pill-shaped Floating Bottom Bar ──────────────── */}
      <FloatingBottomBar
        onCancel={onCancel}
        rightAction={
          <Button
            type="submit"
            disabled={assistantOptions.length === 0}
            rightIcon={<ArrowRight size={16} />}
            className="rounded-full shadow-sm font-bold"
          >
            Next Step
          </Button>
        }
      />
    </form>
  );
}
