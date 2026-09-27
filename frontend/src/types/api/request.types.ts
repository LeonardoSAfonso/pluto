import { RequestStatus } from '@/components/ui/StatusBadge/types';
import { AuthenticatedUser } from './auth.types';

export interface RequestItem {
  id: string;
  supplier_name: string;
  supplier_cnpj: string;
  invoice_number: string;
  amount_cents: number;
  competence: string;
  due_date: string;
  category: string;
  description: string | null;
  status: RequestStatus;
  requester_id: string;
  requester?: AuthenticatedUser;
  rejection_reason?: string | null;
  paid_at?: string | null;
  payment_reference?: string | null;
  created_at: string;
  updated_at: string;
}

export interface QueryRequestsParams {
  page?: number;
  limit?: number;
  status?: RequestStatus | 'ALL';
  supplier_name?: string;
  due_date_from?: string;
  due_date_to?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
