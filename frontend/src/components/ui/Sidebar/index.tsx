'use client';

import React from 'react';
import { SidebarProps, NavigationItem } from './types';
import SidebarItem from './SidebarItem';
import PlutoLogo from '@/components/ui/PlutoLogo';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  userRole,
  className = '',
}) => {
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: <DashboardIcon fontSize="small" />,
    },
    {
      id: 'requests',
      label: 'Solicitações',
      href: '/requests',
      icon: <ReceiptLongIcon fontSize="small" />,
    },
    {
      id: 'new-request',
      label: 'Nova Solicitação',
      href: '/requests/new',
      icon: <AddCircleIcon fontSize="small" />,
      allowedRoles: ['REQUESTER'],
      isPrimaryAction: true,
    },
  ];

  const visibleItems = navigationItems.filter(
    (item) => !item.allowedRoles || (userRole && item.allowedRoles.includes(userRole))
  );

  return (
    <>
      {/* Backdrop para Mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Container Lateral */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${className}`}
      >
        <div>
          {/* Topo: Logo & Fechar (Mobile) */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
            <PlutoLogo size="sm" />
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Fechar menu"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>

          {/* Links de Navegação */}
          <nav className="p-4 space-y-2">
            {visibleItems.map((item) => (
              <SidebarItem key={item.id} item={item} onItemClick={onClose} />
            ))}
          </nav>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {userRole === 'FINANCE' && (
            <div className="p-3 rounded-xl bg-slate-900 text-white text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <ShieldOutlinedIcon fontSize="inherit" />
                <span>Gestão Financeira</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-tight">
                Acesso global a todas as despesas, aprovações e registros de pagamento.
              </p>
            </div>
          )}

          <div className="text-[11px] text-center text-slate-400 font-medium">
            Pluto • GEX Finance v1.0
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
