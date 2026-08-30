"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/TextArea";
import { Select } from "@/components/ui/Select";
import { RetryConfigEditor } from "./RetryConfigEditor";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import Link from "next/link";
import type { Assistant, RetryConfig } from "@/types";

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
}

export function CampaignDetailsStep({
  assistants,
  initialValues,
  onNext,
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Card>
        <h3 className="text-base font-semibold text-text-primary mb-4">
          Campaign Details
        </h3>
        <div className="flex flex-col gap-4">
          <Input
            label="Campaign name"
            placeholder="Q4 Lead Outreach — Lodha Bellavista"
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
              <p className="text-base text-amber-700">
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

      <Card>
        <h3 className="text-base font-semibold text-text-primary mb-2">
          Default Batch Auto-Retry Strategy
        </h3>
        <p className="text-base text-text-muted mb-4">
          All new lead batches in this campaign will inherit these settings
          unless overridden during upload.
        </p>
        <RetryConfigEditor value={retryConfig} onChange={setRetryConfig} />
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={assistantOptions.length === 0}>
          Next — Configure Variables
        </Button>
      </div>
    </form>
  );
}
