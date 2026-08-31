import type { ReactNode } from "react";
import { Shield } from "lucide-react";

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className=" bg-surface-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
