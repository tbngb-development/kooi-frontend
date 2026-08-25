/* eslint-disable react-hooks/static-components */
// src/components/layout/Sidebar.tsx

'use client';

import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';
import {
  BarChart3,
  Bot,
  LogOut,
  Menu,
  Phone,
  Settings,
  Target,
  Users,
  X,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { label: 'Campaigns', href: '/campaigns', icon: Target },
  { label: 'Assistants', href: '/assistants', icon: Bot },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Calls', href: '/calls', icon: Phone },
  { label: 'Team', href: '/users', icon: Users, adminOnly: true },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, tenant } = useAuthStore();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || user?.role === 'ADMIN'
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-surface-border shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
          <Zap size={16} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-text-primary truncate">
            {tenant?.name ?? 'LeadAI'}
          </p>
          <p className="text-sm text-text-muted">AI Lead System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto thin-scrollbar py-3 px-2">
        <ul className="flex flex-col gap-0.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  )}
                >
                  <Icon
                    size={16}
                    className={isActive ? 'text-brand-500' : 'text-text-muted'}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User + Logout */}
      <div className="border-t border-surface-border p-3 shrink-0">
        <div className="flex items-center gap-2.5 px-2 mb-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-sm font-semibold shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-base font-medium text-text-primary truncate">
              {user?.name}
            </p>
            <p className="text-sm text-text-muted capitalize">
              {user?.role?.toLowerCase()}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-base text-text-muted hover:bg-surface-hover hover:text-error-600 transition-colors duration-150"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-surface border-r border-surface-border h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Header Button */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 flex h-9 w-9 items-center justify-center rounded-md bg-surface border border-surface-border shadow-sm"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={18} className="text-text-secondary" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex flex-col w-56 bg-surface h-full shadow-lg">
            <button
              className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-hover"
              onClick={() => setMobileOpen(false)}
            >
              <X size={16} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}