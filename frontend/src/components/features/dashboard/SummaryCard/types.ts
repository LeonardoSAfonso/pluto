import React from 'react';

export type SummaryCardVariant = 'pending' | 'approved' | 'paid' | 'overdue';

export interface SummaryCardProps {
  title: string;
  value?: string | number;
  cents?: number;
  subtitle?: string;
  variant: SummaryCardVariant;
  icon: React.ReactNode;
  badge?: string;
  loading?: boolean;
  className?: string;
}
