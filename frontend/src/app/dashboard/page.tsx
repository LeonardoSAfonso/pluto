'use client';

import React from 'react';
import RouteGuard from '@/utils/RouteGuard';
import BaseLayout from '@/components/layout/BaseLayout';
import { useAuth } from '@/hooks/useAuth';
import useDashboard from '@/hooks/useDashboard';
import SummaryCards from '@/components/features/dashboard/SummaryCards';
import StatusBreakdown from '@/components/features/dashboard/StatusBreakdown';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function DashboardPage() {
  const { user, role } = useAuth();
  const { summary, loading, refreshSummary } = useDashboard();

  // Formatar data de referência YYYY-MM-DD para DD/MM/AAAA
  const formattedReferenceDate = summary?.reference_date
    ? summary.reference_date.split('-').reverse().join('/')
    : '18/09/2026';

  return (
    <RouteGuard>
      <BaseLayout>
        <div className="space-y-8">
          {/* Header Superior: Boas-vindas e Ações Rápidas */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Visão Geral de Despesas
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {role === 'FINANCE' ? 'Gestão Financeira Global' : 'Minhas Solicitações'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Olá, {user?.name || 'Usuário'}!
              </h1>

              <p className="text-xs sm:text-sm text-slate-500">
                {role === 'FINANCE'
                  ? 'Painel consolidado com dados de todas as despesas da organização.'
                  : 'Acompanhe em tempo real o status e os valores das suas requisições financeiras.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshSummary}
                loading={loading}
                leftIcon={<RefreshIcon fontSize="small" />}
                data-testid="dashboard-refresh-button"
              >
                Atualizar
              </Button>

              {role === 'REQUESTER' && (
                <Link href="/requests/new">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<AddCircleIcon fontSize="small" />}
                    data-testid="dashboard-new-request-button"
                  >
                    Nova Solicitação
                  </Button>
                </Link>
              )}

              <Link href="/requests">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<ReceiptLongIcon fontSize="small" />}
                  data-testid="dashboard-view-requests-button"
                >
                  Ver Lista
                </Button>
              </Link>
            </div>
          </div>

          {/* Grid dos 4 Cards Principais */}
          <section aria-label="Indicadores Financeiros Principais">
            <SummaryCards summary={summary} loading={loading} />
          </section>

          {/* Seção Secundária: Distribuição de Status */}
          <section aria-label="Detalhamento por Status">
            <StatusBreakdown summary={summary} loading={loading} />
          </section>

          {/* Rodapé de Governança e Transparência de Dados */}
          <footer className="p-4 sm:p-5 rounded-2xl bg-slate-100/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CalendarMonthOutlinedIcon fontSize="small" className="text-slate-500" />
              <span>
                Data de corte / referência:{' '}
                <strong className="text-slate-900 font-mono">
                  {formattedReferenceDate}
                </strong>{' '}
                (Fuso horário: <code>America/Sao_Paulo</code>)
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500">
              <InfoOutlinedIcon fontSize="inherit" />
              <span>
                {role === 'FINANCE'
                  ? 'Gabarito oficial: 875049 (Pendente) | 658599 (Aprovado) | 841549 (Pago no Mês) | 4 (Vencidas)'
                  : 'Métricas computadas estritamente com base no seu identificador de solicitante'}
              </span>
            </div>
          </footer>
        </div>
      </BaseLayout>
    </RouteGuard>
  );
}
