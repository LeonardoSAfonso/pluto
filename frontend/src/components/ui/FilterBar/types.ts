import { QueryRequestsParams } from '@/types/api/request.types';

export interface FilterBarProps {
  filters: QueryRequestsParams;
  onFilterChange: (filters: Partial<QueryRequestsParams>) => void;
  onReset: () => void;
  totalResults?: number;
  loading?: boolean;
  className?: string;
}
