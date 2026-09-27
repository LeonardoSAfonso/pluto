import React from 'react';
import { SummaryCardProps, SummaryCardVariant } from './types';
import { formatCentsToBRL } from '@/utils/formatMoney';

const variantConfig: Record<
  SummaryCardVariant,
  {
    border: string;
    bg: string;
    text: string;
    iconBg: string;
    accentDot: string;
  }
> = {
  pending: {
    border: 'border-amber-200/90 hover:border-amber-400',
    bg: 'bg-white hover:bg-amber-50/30',
    text: 'text-amber-950',
    iconBg: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
    accentDot: 'bg-amber-500',
  },
  approved: {
    border: 'border-emerald-200/90 hover:border-emerald-400',
    bg: 'bg-white hover:bg-emerald-50/30',
    text: 'text-emerald-950',
    iconBg: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
    accentDot: 'bg-emerald-500',
  },
  paid: {
    border: 'border-blue-200/90 hover:border-blue-400',
    bg: 'bg-white hover:bg-blue-50/30',
    text: 'text-blue-950',
    iconBg: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
    accentDot: 'bg-blue-500',
  },
  overdue: {
    border: 'border-rose-200/90 hover:border-rose-400',
    bg: 'bg-white hover:bg-rose-50/30',
    text: 'text-rose-950',
    iconBg: 'bg-rose-500/10 text-rose-600 border border-rose-500/20',
    accentDot: 'bg-rose-500',
  },
};

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  cents,
  subtitle,
  variant,
  icon,
  badge,
  loading = false,
  className = '',
}) => {
  const config = variantConfig[variant];
  const displayValue = cents !== undefined ? formatCentsToBRL(cents) : value;

  if (loading) {
    return (
      <div
        className={`p-6 rounded-3xl border border-slate-200 bg-white shadow-xs animate-pulse space-y-4 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-slate-200 rounded-md" />
          <div className="h-10 w-10 bg-slate-200 rounded-2xl" />
        </div>
        <div className="h-8 w-36 bg-slate-200 rounded-md" />
        <div className="h-3 w-28 bg-slate-100 rounded-md" />
      </div>
    );
  }

  return (
    <div
      data-testid={`summary-card-${variant}`}
      className={`p-6 rounded-3xl border shadow-xs transition-all duration-200 flex flex-col justify-between ${config.border} ${config.bg} ${className}`}
    >
      <div>
        {/* Topo do Card: Título & Ícone */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${config.accentDot}`} />
            {title}
          </span>
          <div
            className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${config.iconBg}`}
          >
            {icon}
          </div>
        </div>

        {/* Valor Principal Formatado */}
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${config.text}`}
          >
            {displayValue}
          </span>
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs uppercase select-none animate-pulse">
              {badge}
            </span>
          )}
        </div>
      </div>

      {/* Rodapé / Subtítulo */}
      {subtitle && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtitle}</span>
          {cents !== undefined && (
            <span className="text-[10px] font-mono text-slate-400">
              {cents} centavos
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
