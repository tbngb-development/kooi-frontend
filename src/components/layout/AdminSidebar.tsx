/* eslint-disable react-hooks/static-components */
// src/components/layout/AdminSidebar.tsx

'use client';

import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/store/authStore';
import { useAdminLogout } from '@/hooks/useAuth';
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Tenants', href: '/admin/tenants', icon: Building2 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const logout = useAdminLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-surface-border shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
          <Shield size={16} className="text-white" />
        </div>
        <div>
          <p className="text-base font-semibold text-text-primary">Super Admin</p>
          <p className="text-sm text-text-muted">Control Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin/dashboard' &&
                pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors',
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

      {/* User */}
      <div className="border-t border-surface-border p-3">
        <div className="flex items-center gap-2.5 px-2 mb-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-sm font-semibold shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-base font-medium text-text-primary truncate">
              {user?.name}
            </p>
            <p className="text-sm text-text-muted">Super Admin</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-base text-text-muted hover:bg-surface-hover hover:text-error-600 transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-56 bg-surface border-r border-surface-border h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>

      <button
        className="lg:hidden fixed top-3 left-3 z-50 flex h-9 w-9 items-center justify-center rounded-md bg-surface border border-surface-border shadow-sm"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={18} className="text-text-secondary" />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
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