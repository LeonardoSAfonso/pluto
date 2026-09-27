import { RequestItem } from '@/types/api/request.types';
import { UserRole } from '@/types/api/auth.types';

export interface RequestsTableProps {
  requests: RequestItem[];
  loading?: boolean;
  userRole?: UserRole;
  referenceDate?: string;
  onRowClick?: (request: RequestItem) => void;
  className?: string;
}
