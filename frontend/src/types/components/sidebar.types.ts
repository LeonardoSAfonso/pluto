import React from 'react';
import { UserRole } from '../api/auth.types';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  allowedRoles?: UserRole[];
  badge?: string;
  isPrimaryAction?: boolean;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: UserRole;
  className?: string;
}
