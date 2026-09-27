import { DashboardSummaryDTO } from '@/types/api/dashboard.types';

export interface SummaryCardsProps {
  summary: DashboardSummaryDTO | null;
  loading?: boolean;
  className?: string;
}
