"use client";

import { cn } from "@/lib/utils/cn";
import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

type Placement = "right" | "left" | "top" | "bottom";
type Align = "start" | "center" | "end";

interface PopoverProps {
  trigger: ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
  children: ReactNode;
  placement?: Placement;
  align?: Align;
  offset?: number;
  className?: string;
  panelClassName?: string;
}

/**
 * Reusable anchored popover.
 * - Renders inline (relative to trigger) so no portal math needed.
 * - Closes on outside click and Escape.
 * - Supports 4 placements × 3 alignments.
 */
export function Popover({
  trigger,
  children,
  placement = "right",
  align = "start",
  offset = 8,
  className,
  panelClassName,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click & Escape
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Inject onClick handler into user-provided trigger
  const enhancedTrigger = isValidElement(trigger)
    ? cloneElement(trigger, {
        onClick: (e: React.MouseEvent) => {
          trigger.props.onClick?.(e);
          setOpen((v) => !v);
        },
      })
    : trigger;

  const positionClasses = getPositionClasses(placement, align, offset);

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      {enhancedTrigger}

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-50 min-w-[220px] rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/50",
            "animate-[scaleIn_0.15s_ease-out]",
            positionClasses,
            panelClassName,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <PopoverContext.Provider value={{ close: () => setOpen(false) }}>
            {children}
          </PopoverContext.Provider>
        </div>
      )}
    </div>
  );
}

// ── Context so children can close the popover (e.g. menu item click) ──
import { createContext, useContext } from "react";

const PopoverContext = createContext<{ close: () => void }>({
  close: () => {},
});

export function usePopoverClose() {
  return useContext(PopoverContext).close;
}

// ── Placement calculator ──
function getPositionClasses(
  placement: Placement,
  align: Align,
  offset: number,
): string {
  const offsetStyle = `${offset / 4}` as const; // Tailwind uses 0.25rem = 1 unit

  const base: Record<Placement, string> = {
    right: `left-full ml-${offsetStyle}`,
    left: `right-full mr-${offsetStyle}`,
    top: `bottom-full mb-${offsetStyle}`,
    bottom: `top-full mt-${offsetStyle}`,
  };

  const alignment: Record<Placement, Record<Align, string>> = {
    right: {
      start: "top-0",
      center: "top-1/2 -translate-y-1/2",
      end: "bottom-0",
    },
    left: {
      start: "top-0",
      center: "top-1/2 -translate-y-1/2",
      end: "bottom-0",
    },
    top: {
      start: "left-0",
      center: "left-1/2 -translate-x-1/2",
      end: "right-0",
    },
    bottom: {
      start: "left-0",
      center: "left-1/2 -translate-x-1/2",
      end: "right-0",
    },
  };

  return cn(base[placement], alignment[placement][align]);
}
