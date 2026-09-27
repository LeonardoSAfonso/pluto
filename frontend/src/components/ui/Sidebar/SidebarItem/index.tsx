'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavigationItem } from '@/types/components/sidebar.types';

interface SidebarItemProps {
  item: NavigationItem;
  onItemClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ item, onItemClick }) => {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

  if (item.isPrimaryAction) {
    return (
      <Link
        href={item.href}
        onClick={onItemClick}
        data-testid={`sidebar-nav-${item.id}`}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition-all active:scale-[0.98]"
      >
        <span className="shrink-0">{item.icon}</span>
        <span className="truncate">{item.label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onItemClick}
      data-testid={`sidebar-nav-${item.id}`}
      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
        isActive
          ? 'bg-slate-900 text-white shadow-xs'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      <div className="flex items-center gap-3 truncate">
        <span className={`shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>
          {item.icon}
        </span>
        <span className="truncate">{item.label}</span>
      </div>

      {item.badge && (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300">
          {item.badge}
        </span>
      )}
    </Link>
  );
};

export default SidebarItem;
