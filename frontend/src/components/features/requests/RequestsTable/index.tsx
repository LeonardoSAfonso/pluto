'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { RequestsTableProps } from './types';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatCentsToBRL } from '@/utils/formatMoney';
import { RequestItem } from '@/types/api/request.types';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

export const RequestsTable: React.FC<RequestsTableProps> = ({
  requests,
  loading = false,
  userRole,
  referenceDate = '2026-09-18',
  onRowClick,
  className = '',
}) => {
  const router = useRouter();

  // Regra de Negócio Crítica (REGRAS.md):
  // REQUESTER: não exibe a coluna "Solicitante" (vê apenas as próprias solicitações)
  // FINANCE: exibe a coluna "Solicitante"
  const showRequesterColumn = userRole === 'FINANCE';

  const handleRowClick = (req: RequestItem) => {
    if (onRowClick) {
      onRowClick(req);
    } else {
      router.push(`/requests/${req.id}`);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    // YYYY-MM-DD -> DD/MM/AAAA
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Regra de Vencimento (REGRAS.md):
  // status IN ('PENDING', 'APPROVED') AND due_date < referenceDate
  const isOverdue = (req: RequestItem): boolean => {
    if (req.status !== 'PENDING' && req.status !== 'APPROVED') {
      return false;
    }
    const due = req.due_date.split('T')[0];
    return due < referenceDate;
  };

  return (
    <div
      className={`w-full overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-sm ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="py-4 px-5">Fornecedor</th>
              <th className="py-4 px-4">Nota Fiscal</th>
              <th className="py-4 px-4 text-right">Valor</th>
              <th className="py-4 px-4 text-center">Vencimento</th>
              <th className="py-4 px-4 text-center">Status</th>
              {showRequesterColumn && (
                <th className="py-4 px-4" data-testid="col-requester">
                  Solicitante
                </th>
              )}
              <th className="py-4 px-4 text-center w-12" aria-label="Ações">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              // Loading Skeleton com 5 linhas
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4 px-5">
                    <div className="h-4 w-36 bg-slate-200 rounded-md" />
                    <div className="h-3 w-24 bg-slate-100 rounded-md mt-1.5" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-24 bg-slate-200 rounded-md" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-4 w-20 bg-slate-200 rounded-md ml-auto" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-20 bg-slate-200 rounded-md mx-auto" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-6 w-24 bg-slate-200 rounded-full mx-auto" />
                  </td>
                  {showRequesterColumn && (
                    <td className="py-4 px-4">
                      <div className="h-4 w-28 bg-slate-200 rounded-md" />
                    </td>
                  )}
                  <td className="py-4 px-4 text-center">
                    <div className="h-4 w-4 bg-slate-200 rounded-md mx-auto" />
                  </td>
                </tr>
              ))
            ) : requests.length === 0 ? (
              // Empty State
              <tr>
                <td
                  colSpan={showRequesterColumn ? 7 : 6}
                  className="py-16 text-center text-slate-400"
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-3 rounded-2xl bg-slate-100 text-slate-400">
                      <InboxOutlinedIcon fontSize="large" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-bold text-slate-700">
                        Nenhuma solicitação encontrada
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Não existem solicitações que atendam aos filtros selecionados. Tente
                        ajustar os parâmetros de busca ou limpar os filtros.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              // Linhas de dados
              requests.map((req) => {
                const overdue = isOverdue(req);

                return (
                  <tr
                    key={req.id}
                    onClick={() => handleRowClick(req)}
                    data-testid={`request-row-${req.id}`}
                    className="hover:bg-amber-50/20 cursor-pointer transition-colors group"
                  >
                    {/* Fornecedor */}
                    <td className="py-4 px-5">
                      <span className="font-bold text-slate-900 group-hover:text-amber-800 transition-colors block">
                        {req.supplier_name}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        CNPJ: {req.supplier_cnpj}
                      </span>
                    </td>

                    {/* Nota Fiscal */}
                    <td className="py-4 px-4 font-mono text-xs text-slate-700">
                      {req.invoice_number}
                    </td>

                    {/* Valor em Reais (Regra Centavos -> BRL) */}
                    <td className="py-4 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCentsToBRL(req.amount_cents)}
                    </td>

                    {/* Vencimento */}
                    <td className="py-4 px-4 text-center text-xs font-mono text-slate-700">
                      {formatDate(req.due_date)}
                    </td>

                    {/* Status Badge com indicador Overdue */}
                    <td className="py-4 px-4 text-center">
                      <StatusBadge
                        status={req.status}
                        isOverdue={overdue}
                        size="sm"
                      />
                    </td>

                    {/* Solicitante (Apenas para FINANCE) */}
                    {showRequesterColumn && (
                      <td className="py-4 px-4 text-xs text-slate-700">
                        <span className="font-medium text-slate-900">
                          {req.requester?.name || 'Solicitante'}
                        </span>
                        {req.requester?.email && (
                          <span className="block text-[11px] text-slate-400 truncate max-w-[140px]">
                            {req.requester.email}
                          </span>
                        )}
                      </td>
                    )}

                    {/* Seta de navegação */}
                    <td className="py-4 px-4 text-center text-slate-400 group-hover:text-amber-600 transition-colors">
                      <ChevronRightIcon fontSize="small" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestsTable;
