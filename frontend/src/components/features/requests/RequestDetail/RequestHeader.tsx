'use client';

import React from 'react';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import StatusBadge from '@/components/ui/StatusBadge';
import { RequestDetailItem } from '@/types/api/request.types';
import { formatDateTimeSP, isOverdue } from '@/utils/formatDate';

interface RequestHeaderProps {
  request: RequestDetailItem;
  referenceDate?: string;
}

export const RequestHeader: React.FC<RequestHeaderProps> = ({
  request,
  referenceDate = '2026-09-18',
}) => {
  const overdue = isOverdue(request.due_date, request.status, referenceDate);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
      {/* Botão de retorno e badges de topo */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/requests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
        >
          <ArrowBackIcon fontSize="inherit" className="text-sm" />
          Voltar para Solicitações
        </Link>

        <div className="flex items-center gap-2">
          {overdue && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse"
              title={`Vencimento expirado em relação à data de referência (${referenceDate})`}
            >
              <WarningAmberIcon fontSize="inherit" className="text-xs" />
              Vencida
            </span>
          )}
          <StatusBadge status={request.status} size="md" />
        </div>
      </div>

      {/* Título Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase">
              Nota Fiscal {request.invoice_number}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-400 font-mono">
              ID: {request.id.slice(0, 8)}...
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ReceiptLongIcon fontSize="medium" />
            </div>
            {request.supplier_name}
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cadastrado por{' '}
            <strong className="text-slate-700 dark:text-slate-300 font-semibold">
              {request.requester?.name || 'Solicitante'}
            </strong>{' '}
            em {formatDateTimeSP(request.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RequestHeader;
