'use client';

import React from 'react';
import { HeaderProps } from './types';
import PlutoLogo from '@/components/ui/PlutoLogo';
import { useAuth } from '@/hooks/useAuth';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export const Header: React.FC<HeaderProps> = ({ onMenuClick, className = '' }) => {
  const { user, role, logout } = useAuth();

  const roleLabels = {
    REQUESTER: { label: 'Solicitante', bg: 'bg-amber-100/80', text: 'text-amber-900', border: 'border-amber-300' },
    FINANCE: { label: 'Financeiro', bg: 'bg-blue-100/80', text: 'text-blue-900', border: 'border-blue-300' },
  };

  const activeRoleBadge = role ? roleLabels[role] : null;

  return (
    <header
      className={`sticky top-0 z-30 h-16 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs ${className}`}
    >
      {/* Lado Esquerdo: Menu Mobile & Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menu de navegação"
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <MenuIcon />
        </button>

        <PlutoLogo size="sm" showSubtitle={false} className="lg:hidden" />
      </div>

      {/* Lado Direito: Perfil do Usuário e Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {user ? (
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-900 leading-tight">
                {user.name}
              </span>
              <span className="text-xs text-slate-500 leading-tight">
                {user.email}
              </span>
            </div>

            {activeRoleBadge && (
              <span
                data-testid="user-role-badge"
                className={`hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${activeRoleBadge.bg} ${activeRoleBadge.text} ${activeRoleBadge.border}`}
              >
                {activeRoleBadge.label}
              </span>
            )}

            <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <AccountCircleIcon className="text-slate-500" />
            </div>
          </div>
        ) : (
          <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-md" />
        )}

        <div className="h-6 w-px bg-slate-200" />

        <button
          type="button"
          onClick={logout}
          title="Encerrar sessão"
          data-testid="header-logout-button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <LogoutIcon fontSize="small" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
