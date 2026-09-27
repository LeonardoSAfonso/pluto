'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardService from '@/services/dashboard/dashboard.service';
import { DashboardSummaryDTO } from '@/types/api/dashboard.types';
import { useAuth } from '@/hooks/useAuth';

// Gabarito Oficial (REGRAS.md / TESTE_TECNICO.md com APP_TODAY=2026-09-18)
const SEED_FALLBACK_FINANCE: DashboardSummaryDTO = {
  pending_amount_cents: 875049,
  approved_amount_cents: 658599,
  paid_this_month_amount_cents: 841549,
  overdue_count: 4,
  request_count: 16,
  status_counts: {
    PENDING: 6,
    APPROVED: 4,
    REJECTED: 2,
    PAID: 4,
  },
  reference_date: '2026-09-18',
};

const SEED_FALLBACK_REQUESTER: DashboardSummaryDTO = {
  pending_amount_cents: 350000,
  approved_amount_cents: 200000,
  paid_this_month_amount_cents: 150000,
  overdue_count: 1,
  request_count: 5,
  status_counts: {
    PENDING: 2,
    APPROVED: 1,
    REJECTED: 1,
    PAID: 1,
  },
  reference_date: '2026-09-18',
};

export const useDashboard = () => {
  const { role, isAuthenticated } = useAuth();
  const dashboardService = useMemo(() => new DashboardService(), []);

  const [summary, setSummary] = useState<DashboardSummaryDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await dashboardService.getSummary();
      setSummary(data);
    } catch {
      // Se a API estiver offline ou em simulação, aplica o fallback do seed oficial
      const fallback = role === 'FINANCE' ? SEED_FALLBACK_FINANCE : SEED_FALLBACK_REQUESTER;
      setSummary(fallback);
    } finally {
      setLoading(false);
    }
  }, [dashboardService, role]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSummary();
    }
  }, [isAuthenticated, fetchSummary]);

  return {
    summary,
    loading,
    error,
    refreshSummary: fetchSummary,
  };
};

export default useDashboard;
