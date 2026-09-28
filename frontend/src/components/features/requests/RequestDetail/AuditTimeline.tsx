'use client';

import React from 'react';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PaymentIcon from '@mui/icons-material/Payment';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import StatusBadge from '@/components/ui/StatusBadge';
import { AuditEventItem } from '@/types/api/request.types';
import { formatDateTimeSP } from '@/utils/formatDate';

interface AuditTimelineProps {
  events: AuditEventItem[];
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ events }) => {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const getEventIcon = (event: AuditEventItem) => {
    if (event.new_status === 'APPROVED') {
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center border-2 border-emerald-500 shadow-xs">
          <CheckCircleOutlinedIcon fontSize="small" />
        </div>
      );
    }
    if (event.new_status === 'REJECTED') {
      return (
        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center border-2 border-rose-500 shadow-xs">
          <CancelOutlinedIcon fontSize="small" />
        </div>
      );
    }
    if (event.new_status === 'PAID') {
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center border-2 border-blue-500 shadow-xs">
          <PaymentIcon fontSize="small" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center border-2 border-amber-500 shadow-xs">
        <AddCircleIcon fontSize="small" />
      </div>
    );
  };

  const getEventTitle = (event: AuditEventItem) => {
    if (!event.previous_status) {
      return 'Solicitação Cadastrada no Sistema';
    }
    if (event.new_status === 'APPROVED') {
      return 'Solicitação Aprovada pelo Financeiro';
    }
    if (event.new_status === 'REJECTED') {
      return 'Solicitação Rejeitada pelo Financeiro';
    }
    if (event.new_status === 'PAID') {
      return 'Pagamento Liquidado e Confirmado';
    }
    return `Transição de Status: ${event.new_status}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <HistoryIcon fontSize="small" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Trilha de Auditoria & Histórico de Decisões
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registros imutáveis ordenados cronologicamente (Fuso horário: America/Sao_Paulo).
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {events.length} {events.length === 1 ? 'evento' : 'eventos'}
        </span>
      </div>

      <div className="relative pl-4 sm:pl-6 space-y-8 before:absolute before:left-8 sm:before:left-10 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {sortedEvents.map((event, idx) => (
          <div key={event.id || idx} className="relative flex items-start gap-4 sm:gap-6 group">
            {/* Ícone com indicador de linha do tempo */}
            <div className="relative z-10 shrink-0 bg-white dark:bg-slate-900">
              {getEventIcon(event)}
            </div>

            {/* Conteúdo do Evento */}
            <div className="flex-1 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {getEventTitle(event)}
                </span>
                <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
                  {formatDateTimeSP(event.created_at)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                <span>
                  Responsável:{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {event.actor?.name || 'Sistema'}
                  </strong>
                </span>
                {event.actor?.role && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {event.actor.role}
                  </span>
                )}
              </div>

              {/* Transição de Status */}
              <div className="flex items-center gap-2 text-xs pt-1">
                {event.previous_status && (
                  <>
                    <StatusBadge status={event.previous_status} size="sm" />
                    <span className="text-slate-400 font-bold">→</span>
                  </>
                )}
                <StatusBadge status={event.new_status} size="sm" />
              </div>

              {/* Justificativa / Motivo ou Referência */}
              {event.reason && (
                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {event.new_status === 'REJECTED'
                      ? 'Motivo da Rejeição: '
                      : event.new_status === 'PAID'
                      ? 'Referência do Pagamento: '
                      : 'Observação: '}
                  </span>
                  <span className="italic text-slate-600 dark:text-slate-400">{event.reason}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditTimeline;
