import React from 'react';
import { DashboardSummaryDTO } from '@/types/api/dashboard.types';
import StatusBadge from '@/components/ui/StatusBadge';

interface StatusBreakdownProps {
  summary: DashboardSummaryDTO | null;
  loading?: boolean;
  className?: string;
}

export const StatusBreakdown: React.FC<StatusBreakdownProps> = ({
  summary,
  loading = false,
  className = '',
}) => {
  if (loading) {
    return (
      <div
        className={`p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm animate-pulse space-y-4 ${className}`}
      >
        <div className="h-5 w-48 bg-slate-200 rounded-md" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-16 bg-slate-100 rounded-2xl" />
          <div className="h-16 bg-slate-100 rounded-2xl" />
          <div className="h-16 bg-slate-100 rounded-2xl" />
          <div className="h-16 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const counts = summary?.status_counts || {
    PENDING: 0,
    APPROVED: 0,
    PAID: 0,
    REJECTED: 0,
  };

  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Distribuição por Status Operacional
          </h3>
          <p className="text-xs text-slate-500">
            Total de {summary?.request_count ?? 0} solicitações processadas no sistema.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
          <span>{summary?.request_count ?? 0} registradas</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Pendentes */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col justify-between">
          <StatusBadge status="PENDING" size="sm" />
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-950 font-mono">
              {counts.PENDING}
            </span>
            <span className="block text-[11px] text-amber-700">aguardando análise</span>
          </div>
        </div>

        {/* Aprovadas */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col justify-between">
          <StatusBadge status="APPROVED" size="sm" />
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-950 font-mono">
              {counts.APPROVED}
            </span>
            <span className="block text-[11px] text-emerald-700">aguardando pagamento</span>
          </div>
        </div>

        {/* Pagas */}
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex flex-col justify-between">
          <StatusBadge status="PAID" size="sm" />
          <div className="mt-3">
            <span className="text-2xl font-black text-blue-950 font-mono">
              {counts.PAID}
            </span>
            <span className="block text-[11px] text-blue-700">liquidadas</span>
          </div>
        </div>

        {/* Rejeitadas */}
        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 flex flex-col justify-between">
          <StatusBadge status="REJECTED" size="sm" />
          <div className="mt-3">
            <span className="text-2xl font-black text-rose-950 font-mono">
              {counts.REJECTED}
            </span>
            <span className="block text-[11px] text-rose-700">recusadas com motivo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBreakdown;
