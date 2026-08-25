// src/app/(auth)/layout.tsx

import type { ReactNode } from 'react';
import { Zap } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-text-primary">LeadAI</p>
            <p className="text-sm text-text-muted leading-tight">
              AI Lead Qualification
            </p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}