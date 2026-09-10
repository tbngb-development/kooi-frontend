import { X } from "lucide-react";
import { Button } from "../ui/Button";

interface FloatingBottomBarProps {
  onCancel: () => void;
  leftAction?: React.ReactNode;
  rightAction: React.ReactNode;
}

export function FloatingBottomBar({
  onCancel,
  leftAction,
  rightAction,
}: FloatingBottomBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-6 px-6 py-3.5 bg-surface/95 backdrop-blur-md rounded-full shadow-xl border border-surface-border w-[calc(100%-2rem)] max-w-lg md:w-auto md:min-w-[600px]">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          leftIcon={<X size={16} />}
          onClick={onCancel}
          className="rounded-full"
        >
          Cancel
        </Button>
        {leftAction}
      </div>
      <div className="flex items-center">{rightAction}</div>
    </div>
  );
}
