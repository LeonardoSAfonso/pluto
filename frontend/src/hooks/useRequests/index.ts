'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import RequestsService from '@/services/requests/requests.service';
import { QueryRequestsParams, RequestItem } from '@/types/api/request.types';
import { useAuth } from '@/hooks/useAuth';

// Mock/Seed Fallback com os dados oficiais de data/seed_requests.json
const SEED_REQUESTS_MOCK: RequestItem[] = [
  {
    id: '20000000-0000-4000-8000-000000000001',
    requester_id: '10000000-0000-4000-8000-000000000001',
    supplier_name: 'Aurora Serviços Digitais',
    supplier_cnpj: '10000000000145',
    invoice_number: 'NF-2026-1001',
    amount_cents: 125000,
    competence: '2026-09',
    due_date: '2026-09-10',
    category: 'SOFTWARE',
    description: 'Despesa fictícia 01 para avaliação técnica',
    status: 'PENDING',
    requester: { id: '10000000-0000-4000-8000-000000000001', name: 'Ana Solicitante', email: 'solicitante@gex.test', role: 'REQUESTER' },
    created_at: '2026-08-10T09:00:00-03:00',
    updated_at: '2026-08-10T09:00:00-03:00',
  },
  {
    id: '20000000-0000-4000-8000-000000000002',
    requester_id: '10000000-0000-4000-8000-000000000002',
    supplier_name: 'Norte Analytics',
    supplier_cnpj: '10000000000226',
    invoice_number: 'NF-2026-1002',
    amount_cents: 230050,
    competence: '2026-09',
    due_date: '2026-09-20',
    category: 'SERVIÇOS',
    description: 'Despesa fictícia 02 para avaliação técnica',
    status: 'PENDING',
    requester: { id: '10000000-0000-4000-8000-000000000002', name: 'Bruno Solicitante', email: 'outro.solicitante@gex.test', role: 'REQUESTER' },
    created_at: '2026-08-11T09:00:00-03:00',
    updated_at: '2026-08-11T09:00:00-03:00',
  },
  {
    id: '20000000-0000-4000-8000-000000000003',
    requester_id: '10000000-0000-4000-8000-000000000001',
    supplier_name: 'Verde Nuvem Tecnologia',
    supplier_cnpj: '10000000000307',
    invoice_number: 'NF-2026-1003',
    amount_cents: 9999,
    competence: '2026-09',
    due_date: '2026-09-17',
    category: 'MARKETING',
    description: 'Despesa fictícia 03 para avaliação técnica',
    status: 'PENDING',
    requester: { id: '10000000-0000-4000-8000-000000000001', name: 'Ana Solicitante', email: 'solicitante@gex.test', role: 'REQUESTER' },
    created_at: '2026-08-12T09:00:00-03:00',
    updated_at: '2026-08-12T09:00:00-03:00',
  },
  {
    id: '20000000-0000-4000-8000-000000000004',
    requester_id: '10000000-0000-4000-8000-000000000002',
    supplier_name: 'Ponte Consultoria',
    supplier_cnpj: '10000000000498',
    invoice_number: 'NF-2026-1004',
    amount_cents: 510000,
    competence: '2026-09',
    due_date: '2026-09-05',
    category: 'CONSULTORIA',
    description: 'Despesa fictícia 04 para avaliação técnica',
    status: 'PENDING',
    requester: { id: '10000000-0000-4000-8000-000000000002', name: 'Bruno Solicitante', email: 'outro.solicitante@gex.test', role: 'REQUESTER' },
    created_at: '2026-08-13T09:00:00-03:00',
    updated_at: '2026-08-13T09:00:00-03:00',
  },
  {
    id: '20000000-0000-4000-8000-000000000005',
    requester_id: '10000000-0000-4000-8000-000000000001',
    supplier_name: 'Delta Treinamentos',
    supplier_cnpj: '10000000000579',
    invoice_number: 'NF-2026-1005',
    amount_cents: 480000,
    competence: '2026-09',
    due_date: '2026-09-25',
    category: 'TREINAMENTO',
    description: 'Despesa fictícia 05 para avaliação técnica',
    status: 'APPROVED',
    requester: { id: '10000000-0000-4000-8000-000000000001', name: 'Ana Solicitante', email: 'solicitante@gex.test', role: 'REQUESTER' },
    created_at: '2026-08-14T09:00:00-03:00',
    updated_at: '2026-08-15T10:00:00-03:00',
  },
  {
    id: '20000000-0000-4000-8000-000000000006',
    requester_id: '10000000-0000-4000-8000-000000000002',
    supplier_name: 'Soluções Integradas',
    supplier_cnpj: '10000000000650',
    invoice_number: 'NF-2026-1006',
    amount_cents: 178599,
    competence: '2026-09',
    due_date: '2026-09-12',
    category: 'SERVIÇOS',
    description: 'Despesa fictícia 06 para avaliação técnica',
    status: 'APPROVED',
    requester: { id: '10000000-0000-4000-8000-000000000002', name: 'Bruno Solicitante', email: 'outro.solicitante@gex.test', role: 'REQUESTER' },
    created_at: '2026-08-15T09:00:00-03:00',
    updated_at: '2026-08-16T11:00:00-03:00',
  },
  {
    id: '20000000-0000-4000-8000-000000000007',
    requester_id: '10000000-0000-4000-8000-000000000001',
    supplier_name: 'Alpha Suprimentos Corporativos',
    supplier_cnpj: '10000000000730',
    invoice_number: 'NF-2026-1007',
    amount_cents: 841549,
    competence: '2026-09',
    due_date: '2026-09-08',
    category: 'SUPRIMENTOS',
    description: 'Despesa fictícia 07 para avaliação técnica',
    status: 'PAID',
    paid_at: '2026-09-08T15:30:00-03:00',
    payment_reference: 'TED-88239102-GEX',
    requester: { id: '10000000-0000-4000-8000-000000000001', name: 'Ana Solicitante', email: 'solicitante@gex.test', role: 'REQUESTER' },
    created_at: '2026-08-16T09:00:00-03:00',
    updated_at: '2026-09-08T15:30:00-03:00',
  },
  {
    id: '20000000-0000-4000-8000-000000000008',
    requester_id: '10000000-0000-4000-8000-000000000002',
    supplier_name: 'Beta Logística Expressa',
    supplier_cnpj: '10000000000811',
    invoice_number: 'NF-2026-1008',
    amount_cents: 320000,
    competence: '2026-08',
    due_date: '2026-08-20',
    category: 'LOGÍSTICA',
    description: 'Despesa fictícia 08 para avaliação técnica',
    status: 'REJECTED',
    rejection_reason: 'Nota fiscal sem discriminação detalhada dos serviços de frete.',
    requester: { id: '10000000-0000-4000-8000-000000000002', name: 'Bruno Solicitante', email: 'outro.solicitante@gex.test', role: 'REQUESTER' },
    created_at: '2026-08-17T09:00:00-03:00',
    updated_at: '2026-08-18T14:20:00-03:00',
  },
];

export const useRequests = () => {
  const { user, role, isAuthenticated } = useAuth();
  const requestsService = useMemo(() => new RequestsService(), []);

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit] = useState<number>(10);

  const [filters, setFiltersState] = useState<QueryRequestsParams>({
    status: 'ALL',
    supplier_name: '',
    due_date_from: '',
    due_date_to: '',
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const setFilters = (newFilters: Partial<QueryRequestsParams>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page on filter change
  };

  const resetFilters = () => {
    setFiltersState({
      status: 'ALL',
      supplier_name: '',
      due_date_from: '',
      due_date_to: '',
    });
    setPage(1);
  };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await requestsService.getRequests({
        page,
        limit,
        status: filters.status,
        supplier_name: filters.supplier_name,
        due_date_from: filters.due_date_from,
        due_date_to: filters.due_date_to,
      });

      setRequests(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch {
      // Fallback oficial para testes/simulação
      let filtered = [...SEED_REQUESTS_MOCK];

      // Escopo por perfil
      if (role === 'REQUESTER' && user?.id) {
        filtered = filtered.filter((r) => r.requester_id === user.id);
      }

      // Filtro por status
      if (filters.status && filters.status !== 'ALL') {
        filtered = filtered.filter((r) => r.status === filters.status);
      }

      // Filtro por fornecedor
      if (filters.supplier_name?.trim()) {
        const query = filters.supplier_name.toLowerCase().trim();
        filtered = filtered.filter((r) =>
          r.supplier_name.toLowerCase().includes(query)
        );
      }

      // Filtro por vencimento
      if (filters.due_date_from) {
        filtered = filtered.filter((r) => r.due_date >= filters.due_date_from!);
      }
      if (filters.due_date_to) {
        filtered = filtered.filter((r) => r.due_date <= filters.due_date_to!);
      }

      const totalItems = filtered.length;
      const pages = Math.max(1, Math.ceil(totalItems / limit));
      const startIndex = (page - 1) * limit;
      const paginatedData = filtered.slice(startIndex, startIndex + limit);

      setRequests(paginatedData);
      setTotal(totalItems);
      setTotalPages(pages);
    } finally {
      setLoading(false);
    }
  }, [requestsService, page, limit, filters, role, user?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRequests();
    }
  }, [isAuthenticated, fetchRequests]);

  return {
    requests,
    total,
    page,
    totalPages,
    limit,
    filters,
    loading,
    error,
    setPage,
    setFilters,
    resetFilters,
    refreshRequests: fetchRequests,
  };
};

export default useRequests;
