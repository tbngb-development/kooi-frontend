"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface RefreshButtonProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
  label?: string;
  className?: string;
}

export function RefreshButton({
  onRefresh,
  isRefreshing = false,
  label = "Refresh",
  className,
}: RefreshButtonProps) {
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onRefresh}
      disabled={isRefreshing}
      leftIcon={
        <RefreshCw
          size={14}
          className={`shrink-0 transition-transform ${
            isRefreshing ? "animate-spin" : ""
          }`}
        />
      }
      className={className}
    >
      {label}
    </Button>
  );
}
