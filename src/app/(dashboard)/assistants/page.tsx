"use client";

import { AssistantCard } from "@/components/assistants/AssistantCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { useAssistants } from "@/hooks/useAssistants";
import { Bot } from "lucide-react";

export default function AssistantsPage() {
  const { data: assistants, isLoading } = useAssistants();

  if (isLoading)
    return (
      <div className="py-12">
        <PageSpinner />
      </div>
    );

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10">
      {/* ─── Page Header ─── */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
          AI Voice Assistants
        </h1>
        <p className="text-sm font-medium text-text-muted mt-1">
          Active voice agents assigned and provisioned for your workspace
          campaigns.
        </p>
      </div>

      {/* ─── Read-Only Grid Area ─── */}
      {assistants && assistants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {assistants.map((a) => (
            <AssistantCard key={a.id} assistant={a} canEdit={false} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bot size={28} className="text-text-placeholder" />}
          title="No voice assistants configured"
          description="Your platform administrator will provision and assign voice agents to this environment."
        />
      )}
    </div>
  );
}
