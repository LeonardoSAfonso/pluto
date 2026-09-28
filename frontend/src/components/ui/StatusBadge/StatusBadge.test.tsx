import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusBadge from './index';

describe('StatusBadge Component', () => {
  it('deve renderizar status PENDING com label Pendente e classes amber', () => {
    render(<StatusBadge status="PENDING" />);
    const badge = screen.getByTestId('status-badge-pending');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Pendente');
    expect(badge).toHaveClass('bg-amber-50', 'text-amber-800');
  });

  it('deve renderizar status APPROVED com label Aprovado e classes emerald', () => {
    render(<StatusBadge status="APPROVED" />);
    const badge = screen.getByTestId('status-badge-approved');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Aprovado');
    expect(badge).toHaveClass('bg-emerald-50', 'text-emerald-800');
  });

  it('deve renderizar status PAID com label Pago e classes blue', () => {
    render(<StatusBadge status="PAID" />);
    const badge = screen.getByTestId('status-badge-paid');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Pago');
    expect(badge).toHaveClass('bg-blue-50', 'text-blue-800');
  });

  it('deve renderizar status REJECTED com label Rejeitado e classes rose', () => {
    render(<StatusBadge status="REJECTED" />);
    const badge = screen.getByTestId('status-badge-rejected');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Rejeitado');
    expect(badge).toHaveClass('bg-rose-50', 'text-rose-800');
  });

  it('deve exibir indicador de Vencida quando isOverdue for true', () => {
    render(<StatusBadge status="PENDING" isOverdue={true} />);
    const overdueBadge = screen.getByTestId('status-badge-overdue');
    expect(overdueBadge).toBeInTheDocument();
    expect(overdueBadge).toHaveTextContent('Vencida');
  });

  it('não deve exibir indicador de Vencida quando isOverdue for false', () => {
    render(<StatusBadge status="PENDING" isOverdue={false} />);
    expect(screen.queryByTestId('status-badge-overdue')).not.toBeInTheDocument();
  });
});
