// src/components/layout/Header.tsx

'use client';

import { useAuthStore } from '@/store/authStore';
import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/campaigns': 'Campaigns',
  '/assistants': 'Assistants',
  '/leads': 'Leads',
  '/calls': 'Calls',
  '/users': 'Team',
  '/settings': 'Settings',
};

function getPageTitle(pathname: string): string {
  // Exact match
  if (routeLabels[pathname]) return routeLabels[pathname];
  // Prefix match
  const matched = Object.keys(routeLabels).find(
    (key) => key !== '/dashboard' && pathname.startsWith(key)
  );
  return matched ? routeLabels[matched] : 'Overview';
}

export function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const title = getPageTitle(pathname);

  return (
    <header className="h-14 border-b border-surface-border bg-surface flex items-center justify-between px-5 shrink-0 sticky top-0 z-30">
      <h1 className="text-base font-semibold text-text-primary">{title}</h1>

      <div className="flex items-center gap-3">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-surface-hover transition-colors"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-sm font-semibold">
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <span className="hidden sm:block text-base font-medium text-text-secondary">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
}