import React from 'react';
import { render, screen } from '@testing-library/react';
import SummaryCards from './index';
import { DashboardSummaryDTO } from '@/types/api/dashboard.types';

describe('SummaryCards Component', () => {
  const mockSummary: DashboardSummaryDTO = {
    request_count: 9,
    pending_amount_cents: 194999,
    approved_amount_cents: 228500,
    paid_this_month_amount_cents: 273549,
    overdue_count: 5,
    status_counts: {
      PENDING: 4,
      APPROVED: 2,
      PAID: 2,
      REJECTED: 1,
    },
    reference_date: '2026-09-18',
  };


  it('deve renderizar os 4 cards de métricas financeiras', () => {
    render(<SummaryCards summary={mockSummary} />);

    expect(screen.getByText('Total Pendente')).toBeInTheDocument();
    expect(screen.getByText('Total Aprovado')).toBeInTheDocument();
    expect(screen.getByText('Pago no Mês')).toBeInTheDocument();
    expect(screen.getByText('Vencidas')).toBeInTheDocument();
  });

  it('deve converter centavos para valores formatados em moeda BRL', () => {
    render(<SummaryCards summary={mockSummary} />);

    // Verificar se os valores formatados aparecem na tela (normalizando espaços unicode)
    const containerText = document.body.textContent?.replace(/\u00a0/g, ' ');
    expect(containerText).toContain('R$ 1.949,99');
    expect(containerText).toContain('R$ 2.285,00');
    expect(containerText).toContain('R$ 2.735,49');
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('deve exibir skeletons quando loading for true', () => {
    const { container } = render(<SummaryCards summary={null} loading={true} />);
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });
});
