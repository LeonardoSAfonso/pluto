'use client';

import React from 'react';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { RequestDetailItem } from '@/types/api/request.types';
import { formatCentsToBRL } from '@/utils/formatMoney';
import { applyCnpjMask } from '@/utils/formatCnpj';
import { formatDateSP, formatDateTimeSP, formatCompetence } from '@/utils/formatDate';

interface RequestInfoGridProps {
  request: RequestDetailItem;
}

export const RequestInfoGrid: React.FC<RequestInfoGridProps> = ({ request }) => {
  return (
    <div className="space-y-6">
      {/* Alerta de Rejeição (se aplicável) */}
      {request.status === 'REJECTED' && request.rejection_reason && (
        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex items-start gap-3.5 text-rose-900 dark:text-rose-200">
          <CancelOutlinedIcon className="text-rose-600 dark:text-rose-400 text-xl shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
              Solicitação Rejeitada pelo Financeiro
            </h4>
            <p className="text-sm leading-relaxed">{request.rejection_reason}</p>
          </div>
        </div>
      )}

      {/* Alerta de Pagamento (se aplicável) */}
      {request.status === 'PAID' && (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-start gap-3.5 text-emerald-900 dark:text-emerald-200">
          <CheckCircleOutlinedIcon className="text-emerald-600 dark:text-emerald-400 text-xl shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Pagamento Liquidado com Sucesso
            </h4>
            <div className="text-sm flex flex-wrap gap-x-6 gap-y-1 text-emerald-800 dark:text-emerald-200">
              <span>
                <strong>Data de Pagamento:</strong> {formatDateTimeSP(request.paid_at)}
              </span>
              <span>
                <strong>Comprovante / Referência:</strong>{' '}
                <span className="font-mono">{request.payment_reference || 'N/A'}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Atributos */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Informações da Despesa
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Valor */}
          <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              <AttachMoneyIcon fontSize="inherit" className="text-sm" />
              Valor da Despesa
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {formatCentsToBRL(request.amount_cents)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              ({request.amount_cents} centavos)
            </div>
          </div>

          {/* Fornecedor & CNPJ */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <BusinessIcon fontSize="inherit" className="text-sm" />
              Fornecedor / CNPJ
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white truncate">
              {request.supplier_name}
            </div>
            <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
              {applyCnpjMask(request.supplier_cnpj)}
            </div>
          </div>

          {/* Vencimento */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <CalendarTodayIcon fontSize="inherit" className="text-sm" />
              Vencimento
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">
              {formatDateSP(request.due_date)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Competência: <strong className="font-mono">{formatCompetence(request.competence)}</strong>
            </div>
          </div>

          {/* Categoria */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <CategoryIcon fontSize="inherit" className="text-sm" />
              Categoria
            </div>
            <div className="inline-block">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-200/70 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                {request.category}
              </span>
            </div>
          </div>

          {/* Solicitante */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <PersonIcon fontSize="inherit" className="text-sm" />
              Solicitante
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {request.requester?.name || 'Solicitante'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {request.requester?.email || '—'}
            </div>
          </div>

          {/* Número da Nota Fiscal */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <DescriptionIcon fontSize="inherit" className="text-sm" />
              Número da Nota Fiscal
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white font-mono">
              {request.invoice_number}
            </div>
            <div className="text-xs text-slate-400">
              Chave única no sistema
            </div>
          </div>
        </div>

        {/* Descrição / Justificativa */}
        {request.description && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Descrição / Justificativa da Despesa
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              {request.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestInfoGrid;
