// src/app/(admin-auth)/layout.tsx

import type { ReactNode } from 'react';
import { Shield } from 'lucide-react';

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-text-primary">Admin Portal</p>
            <p className="text-base text-text-muted leading-tight">
              Super Admin Access Only
            </p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}