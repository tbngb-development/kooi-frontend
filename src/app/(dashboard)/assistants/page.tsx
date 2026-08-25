// src/app/(dashboard)/assistants/page.tsx

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
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          AI Assistants
        </h2>
        <p className="text-base text-text-muted mt-0.5">
          AI voice agents configured for your organisation
        </p>
      </div>

      {/* Read-only grid */}
      {assistants && assistants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assistants.map((a) => (
            <AssistantCard key={a.id} assistant={a} canEdit={false} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bot size={22} />}
          title="No assistants configured"
          description="Your platform admin will set up AI assistants for your organisation."
        />
      )}
    </div>
  );
}
