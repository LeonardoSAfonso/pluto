'use client';

import React, { useState, useEffect } from 'react';
import BaseLayout from '@/components/layout/BaseLayout';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { UserRole, UserSession } from '@/types/api/auth.types';

export default function TestLayoutPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>('REQUESTER');

  const setSimulatedUser = (role: UserRole) => {
    setCurrentRole(role);
    const mockUser: UserSession = {
      id: role === 'REQUESTER' ? '10000000-0000-0000-0000-000000000001' : '10000000-0000-0000-0000-000000000003',
      name: role === 'REQUESTER' ? 'Ana Solicitante' : 'Fernanda Financeiro',
      email: role === 'REQUESTER' ? 'solicitante@gex.test' : 'financeiro@gex.test',
      role,
      token: 'mock-jwt-token-for-layout-validation',
    };
    localStorage.setItem('gex-user', JSON.stringify(mockUser));
    // Trigger storage event for reactivity
    window.dispatchEvent(new Event('storage'));
  };

  useEffect(() => {
    setSimulatedUser('REQUESTER');
  }, []);

  return (
    <BaseLayout>
      <div className="space-y-8">
        {/* Banner de Controle do Teste de Layout */}
        <section className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Auditoria de Layout &amp; Infraestrutura de Auth
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Etapa 2 — Simulação de perfis (REQUESTER vs FINANCE), Sidebar dinâmica e Header.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={currentRole === 'REQUESTER' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSimulatedUser('REQUESTER')}
              >
                Perfil Solicitante (Ana)
              </Button>
              <Button
                variant={currentRole === 'FINANCE' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setSimulatedUser('FINANCE')}
              >
                Perfil Financeiro (Fernanda)
              </Button>
            </div>
          </div>
        </section>

        {/* Informações do Perfil Selecionado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Estado Ativo na Sessão
            </span>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-slate-900">
                {currentRole === 'REQUESTER' ? 'Ana Solicitante' : 'Fernanda Financeiro'}
              </span>
              <StatusBadge
                status={currentRole === 'REQUESTER' ? 'PENDING' : 'APPROVED'}
              />
            </div>
            <p className="text-xs text-slate-600">
              {currentRole === 'REQUESTER'
                ? 'Permissões: Criação de solicitações (botão Nova Solicitação na Sidebar visível), consulta às próprias despesas.'
                : 'Permissões: Visão global, aprovação de despesas, registro de pagamento e auditoria completa.'}
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Verificação dos Requisitos da Etapa 2
            </span>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li><strong>BaseService + ApiService</strong> configurados com singleton e JWT.</li>
              <li><strong>useAuth Hook</strong> sincronizando o estado com localStorage (`gex-user`).</li>
              <li><strong>RouteGuard</strong> ativo para controle de rotas protegidas.</li>
              <li><strong>Sidebar</strong> adaptada responsivamente para desktop e mobile.</li>
            </ul>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
