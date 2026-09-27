import React from 'react';
import { RequestStatus, StatusBadgeProps } from './types';

const statusConfig: Record<
  RequestStatus,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  PENDING: {
    label: 'Pendente',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
  },
  APPROVED: {
    label: 'Aprovado',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200',
  },
  PAID: {
    label: 'Pago',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    dot: 'bg-blue-500',
    border: 'border-blue-200',
  },
  REJECTED: {
    label: 'Rejeitado',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    dot: 'bg-rose-500',
    border: 'border-rose-200',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  isOverdue = false,
  size = 'md',
  className = '',
}) => {
  const config = statusConfig[status] || statusConfig.PENDING;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }[size];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        data-testid={`status-badge-${status.toLowerCase()}`}
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} shadow-xs select-none`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>

      {isOverdue && (
        <span
          data-testid="status-badge-overdue"
          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide bg-red-600 text-white shadow-xs uppercase select-none animate-pulse"
        >
          Vencida
        </span>
      )}
    </div>
  );
};

export default StatusBadge;
