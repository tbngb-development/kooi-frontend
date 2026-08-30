"use client";

import { AssistantCard } from "@/components/assistants/AssistantCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { useAssistants } from "@/hooks/useAssistants";
import { Bot } from "lucide-react";

export default function AssistantsPage() {
  const { data: assistants, isLoading } = useAssistants();

  if (isLoading) return <PageSpinner />;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-text-primary tracking-tight">
          AI Voice Assistants
        </h2>
        <p className="text-base text-text-muted mt-1">
          Active voice agents assigned to your workspace campaigns.
        </p>
      </div>

      {/* Read-Only Grid Area */}
      {assistants && assistants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assistants.map((a) => (
            <AssistantCard key={a.id} assistant={a} canEdit={false} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bot size={22} className="text-text-placeholder" />}
          title="No voice assistants configured"
          description="Your platform administrator will provision and assign voice agents to this environment."
        />
      )}
    </div>
  );
}
