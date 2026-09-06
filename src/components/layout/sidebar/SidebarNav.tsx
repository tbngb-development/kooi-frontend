"use client";

import { cn } from "@/lib/utils/cn";
import Link from "next/link";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

interface SidebarNavProps {
  items: SidebarNavItem[];
  pathname: string;
  onNavigate?: () => void;
}

export function SidebarNav({ items, pathname, onNavigate }: SidebarNavProps) {
  return (
    <nav className="flex-1 overflow-y-auto py-3 px-2 thin-scrollbar">
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-all duration-150",
                  isActive
                    ? "bg-zinc-800 text-brand-400 shadow-sm"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100",
                )}
              >
                <Icon
                  size={16}
                  className={isActive ? "text-brand-400" : "text-zinc-400"}
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
