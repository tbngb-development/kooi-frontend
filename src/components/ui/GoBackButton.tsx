// src/components/ui/GoBackButton.tsx

"use client";

import { useRouter } from "next/navigation";
import { type ReactNode } from "react";

interface GoBackButtonProps {
  children?: ReactNode;
  className?: string;
  icon?: boolean;
}

export default function GoBackButton({
  children,
  className = "",
  icon = true,
}: GoBackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`
        inline-flex items-center justify-center gap-2
        px-5 py-2.5
        text-base font-medium
        text-text-secondary
        bg-surface
        border border-surface-border
        rounded-lg
        shadow-xs
        hover:bg-surface-hover
        hover:text-text-primary
        active:bg-surface-subtle
        focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:ring-offset-2
        transition-all duration-200
        cursor-pointer
        group
        ${className}
      `}
    >
      {icon && (
        <svg
          className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      )}
      {children || "Go Back"}
    </button>
  );
}