// src/components/calls/TranscriptViewer.tsx

import type { TranscriptMessage } from "@/types";
import { cn } from "@/lib/utils/cn";
import { Bot, User } from "lucide-react";
import { formatTranscriptDuration } from "@/lib/utils/formatDate";

interface TranscriptViewerProps {
  messages?: TranscriptMessage[] | null;
  rawTranscript?: string | null; // 👈 Add raw string fallback support
}

/**
 * Safely parses raw multi-line transcripts like:
 * "assistant: Hi Abbas...\nuser: yes\n"
 */
function parseRawTranscript(transcriptStr: string): TranscriptMessage[] {
  if (!transcriptStr) return [];

  const lines = transcriptStr.split("\n");
  const parsed: TranscriptMessage[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Matches prefixes: assistant:, user:, agent:, lead:, customer: (case-insensitive)
    const match = trimmed.match(
      /^(assistant|user|agent|lead|customer):\s*(.*)$/i,
    );
    if (match) {
      const rolePrefix = match[1].toLowerCase();
      const textMessage = match[2].trim();

      const role: "assistant" | "user" =
        rolePrefix === "assistant" || rolePrefix === "agent"
          ? "assistant"
          : "user";

      parsed.push({
        role,
        message: textMessage,
      });
    } else {
      // If a line doesn't match the prefix but we already have conversational blocks,
      // append the text to the last conversational block (handles multi-line bubbles).
      if (parsed.length > 0) {
        parsed[parsed.length - 1].message += "\n" + trimmed;
      } else {
        // Fallback default block
        parsed.push({
          role: "assistant",
          message: trimmed,
        });
      }
    }
  }

  return parsed;
}

export function TranscriptViewer({
  messages,
  rawTranscript,
}: TranscriptViewerProps) {
  // Use structured messages if available, otherwise fall back to parsing the raw string
  const resolvedMessages =
    messages && messages.length > 0
      ? messages
      : rawTranscript
        ? parseRawTranscript(rawTranscript)
        : [];

  if (resolvedMessages.length === 0) {
    return (
      <p className="text-base text-text-muted text-center py-8">
        No transcript available.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto thin-scrollbar pr-1">
      {resolvedMessages.map((msg, idx) => {
        const isAssistant = msg.role === "assistant";
        return (
          <div
            key={idx}
            className={cn(
              "flex gap-2.5",
              isAssistant ? "flex-row" : "flex-row-reverse",
            )}
          >
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full shrink-0 mt-0.5",
                isAssistant
                  ? "bg-brand-100 text-brand-600"
                  : "bg-surface-subtle text-text-muted",
              )}
            >
              {isAssistant ? <Bot size={13} /> : <User size={13} />}
            </div>
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-3.5 py-2.5",
                isAssistant
                  ? "bg-brand-50 text-text-primary rounded-tl-none"
                  : "bg-surface-subtle text-text-primary rounded-tr-none",
              )}
            >
              <p className="text-[10px] font-bold text-text-muted mb-1 uppercase tracking-wider">
                {isAssistant ? "AI Assistant" : "Lead"}
              </p>
              <p className="text-base text-text-primary leading-relaxed whitespace-pre-line">
                {msg.message}
              </p>
              {msg.time && (
                <p className="text-sm text-text-placeholder mt-1 text-right">
                  {formatTranscriptDuration(msg.secondsFromStart)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
