import { RequestItem } from '@/types/api/request.types';

export interface CreateRequestFormData {
  supplier_name: string;
  supplier_cnpj: string;
  invoice_number: string;
  amount: string; // exibido como "1.553,13"
  competence: string; // exibido como "09/2026"
  due_date: string; // "2026-09-30"
  category: string;
  description: string;
}

export interface FormErrors {
  supplier_name?: string;
  supplier_cnpj?: string;
  invoice_number?: string;
  amount?: string;
  competence?: string;
  due_date?: string;
  category?: string;
  general?: string;
}

export interface CreateRequestFormProps {
  onSuccess?: (created: RequestItem) => void;
  onCancel?: () => void;
}
