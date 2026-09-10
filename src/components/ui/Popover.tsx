"use client";

import { cn } from "@/lib/utils/cn";
import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

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

interface Coords {
  top: number;
  left: number;
}

/**
 * Reusable anchored popover.
 * - Portals to document.body to escape parent stacking contexts & overflow clipping.
 * - Auto-positions relative to trigger element using fixed coordinates.
 * - Closes on outside click and Escape key.
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
  const [coords, setCoords] = useState<Coords>({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const triggerEl = triggerRef.current;
    const panelEl = panelRef.current;
    if (!triggerEl || !panelEl) return;

    const t = triggerEl.getBoundingClientRect();
    const p = panelEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = 0;
    let left = 0;

    // Primary placement axis
    switch (placement) {
      case "right":
        left = t.right + offset;
        break;
      case "left":
        left = t.left - p.width - offset;
        break;
      case "top":
        top = t.top - p.height - offset;
        break;
      case "bottom":
        top = t.bottom + offset;
        break;
    }

    // Secondary alignment axis
    if (placement === "right" || placement === "left") {
      if (align === "start") top = t.top;
      if (align === "center") top = t.top + t.height / 2 - p.height / 2;
      if (align === "end") top = t.bottom - p.height;
    } else {
      if (align === "start") left = t.left;
      if (align === "center") left = t.left + t.width / 2 - p.width / 2;
      if (align === "end") left = t.right - p.width;
    }

    // Viewport edge collision safety (8px padding)
    const pad = 8;
    left = Math.min(Math.max(pad, left), vw - p.width - pad);
    top = Math.min(Math.max(pad, top), vh - p.height - pad);

    setCoords({ top, left });
  }, [placement, align, offset]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();

    const handleScrollOrResize = () => updatePosition();
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);

    return () => {
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [open, updatePosition]);

  // Outside click & Escape handler
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
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

  // Inject ref and click handler into trigger element
  const enhancedTrigger = isValidElement(trigger)
    // eslint-disable-next-line react-hooks/refs
    ? cloneElement(trigger, {
        // @ts-expect-error attaching ref for position anchoring
        ref: (node: HTMLElement | null) => {
          triggerRef.current = node;
          const originalRef = (trigger as ReactElement & { ref?: unknown }).ref;
          if (typeof originalRef === "function") originalRef(node);
          else if (originalRef && typeof originalRef === "object") {
            // eslint-disable-next-line react-hooks/immutability
            (originalRef as { current: HTMLElement | null }).current = node;
          }
        },
        onClick: (e: React.MouseEvent) => {
          trigger.props.onClick?.(e);
          setOpen((v) => !v);
        },
      })
    : trigger;

  const panelStyle: CSSProperties = {
    position: "fixed",
    top: `${coords.top}px`,
    left: `${coords.left}px`,
    zIndex: 9999,
  };

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      {enhancedTrigger}

      {mounted &&
        open &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            style={panelStyle}
            className={cn(
              "min-w-[220px] rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/50",
              "animate-[scaleIn_0.15s_ease-out]",
              panelClassName,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <PopoverContext.Provider value={{ close: () => setOpen(false) }}>
              {children}
            </PopoverContext.Provider>
          </div>,
          document.body,
        )}
    </div>
  );
}

// ── Context for child actions ──
const PopoverContext = createContext<{ close: () => void }>({
  close: () => {},
});

export function usePopoverClose() {
  return useContext(PopoverContext).close;
}
