'use client';

import React from 'react';
import RouteGuard from '@/utils/RouteGuard';
import BaseLayout from '@/components/layout/BaseLayout';
import { useAuth } from '@/hooks/useAuth';
import useRequests from '@/hooks/useRequests';
import FilterBar from '@/components/ui/FilterBar';
import RequestsTable from '@/components/features/requests/RequestsTable';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function RequestsPage() {
  const { role } = useAuth();
  const {
    requests,
    total,
    page,
    totalPages,
    limit,
    filters,
    loading,
    setPage,
    setFilters,
    resetFilters,
    refreshRequests,
  } = useRequests();

  return (
    <RouteGuard>
      <BaseLayout>
        <div className="space-y-6">
          {/* Cabeçalho da Página */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Despesas e Pagamentos
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {role === 'FINANCE' ? 'Gestão Financeira Global' : 'Minhas Despesas'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Solicitações Financeiras
              </h1>

              <p className="text-xs sm:text-sm text-slate-500">
                {role === 'FINANCE'
                  ? 'Consulte, filtre e audite todas as despesas cadastradas na organização.'
                  : 'Acompanhe o andamento de análise e pagamento das suas requisições.'}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshRequests}
                loading={loading}
                leftIcon={<RefreshIcon fontSize="small" />}
                data-testid="requests-refresh-button"
              >
                Atualizar
              </Button>

              {role === 'REQUESTER' && (
                <Link href="/requests/new">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<AddCircleIcon fontSize="small" />}
                    data-testid="requests-new-button"
                  >
                    Nova Solicitação
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Barra de Filtros e Busca */}
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            onReset={resetFilters}
            totalResults={total}
            loading={loading}
          />

          {/* Tabela de Solicitações */}
          <RequestsTable
            requests={requests}
            loading={loading}
            userRole={role ?? undefined}
            referenceDate="2026-09-18"
          />

          {/* Paginação Server-Side */}
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            limit={limit}
            onPageChange={setPage}
            loading={loading}
          />
        </div>
      </BaseLayout>
    </RouteGuard>
  );
}
