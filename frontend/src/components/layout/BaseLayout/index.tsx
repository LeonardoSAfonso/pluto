'use client';

import React, { useState } from 'react';
import Header from '@/components/ui/Header';
import Sidebar from '@/components/ui/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useMediaQuery } from '@mui/material';
import { BaseLayoutProps } from './types';

export const BaseLayout: React.FC<BaseLayoutProps> = ({ children, className = '' }) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)', { noSsr: true });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { role } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const sidebarVisible = isDesktop ? true : isSidebarOpen;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Sidebar
        isOpen={sidebarVisible}
        onClose={closeSidebar}
        userRole={role ?? undefined}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isDesktop ? 'lg:ml-64' : ''}`}>
        <Header onMenuClick={toggleSidebar} />
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto ${className}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default BaseLayout;
