import React from 'react';
import { SummaryCardsProps } from './types';
import SummaryCard from '../SummaryCard';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  loading = false,
  className = '',
}) => {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 ${className}`}
    >
      {/* 1. Total Pendente */}
      <SummaryCard
        title="Total Pendente"
        cents={summary?.pending_amount_cents}
        variant="pending"
        icon={<HourglassEmptyIcon />}
        subtitle="Aguardando aprovação"
        loading={loading}
      />

      {/* 2. Total Aprovado */}
      <SummaryCard
        title="Total Aprovado"
        cents={summary?.approved_amount_cents}
        variant="approved"
        icon={<CheckCircleOutlinedIcon />}
        subtitle="Pronto para liquidação"
        loading={loading}
      />

      {/* 3. Pago no Mês */}
      <SummaryCard
        title="Pago no Mês"
        cents={summary?.paid_this_month_amount_cents}
        variant="paid"
        icon={<AccountBalanceWalletOutlinedIcon />}
        subtitle="Mês da data de referência"
        loading={loading}
      />

      {/* 4. Solicitações Vencidas */}
      <SummaryCard
        title="Vencidas"
        value={summary?.overdue_count ?? 0}
        variant="overdue"
        icon={<WarningAmberOutlinedIcon />}
        subtitle="Exigem atenção imediata"
        badge={summary?.overdue_count ? `${summary.overdue_count} críticas` : undefined}
        loading={loading}
      />
    </div>
  );
};

export default SummaryCards;
