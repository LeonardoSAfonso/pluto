import GetDashboardSummaryService from 'src/dashboard/services/getSummary';
import DashboardRepository from 'src/dashboard/repository';
import { Role } from '@prisma/client';

describe('GetDashboardSummaryService (Unitário)', () => {
  let service: GetDashboardSummaryService;
  let mockRepository: jest.Mocked<DashboardRepository>;

  beforeEach(() => {
    mockRepository = {
      getSummary: jest.fn(),
    } as any;
    service = new GetDashboardSummaryService(mockRepository);
  });

  it('deve orquestrar resumo para usuário FINANCE sem escopo de requesterId', async () => {
    const mockRaw = {
      request_count: 16,
      pending_amount_cents: 875049,
      approved_amount_cents: 658599,
      paid_this_month_amount_cents: 841549,
      overdue_count: 4,
      pending_count: 5,
      approved_count: 4,
      rejected_count: 2,
      paid_count: 5,
    };
    mockRepository.getSummary.mockResolvedValue(mockRaw);

    const user = {
      id: 'uuid-finance',
      name: 'Fernanda Financeiro',
      email: 'financeiro@gex.test',
      role: Role.FINANCE,
    };

    const result = await service.execute(user);

    expect(mockRepository.getSummary).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.any(String),
      undefined, // Sem escopo para FINANCE
    );

    expect(result.pending_amount_cents).toBe(875049);
    expect(result.approved_amount_cents).toBe(658599);
    expect(result.paid_this_month_amount_cents).toBe(841549);
    expect(result.overdue_count).toBe(4);
    expect(result.status_counts.PENDING).toBe(5);
  });

  it('deve passar requesterIdScope para usuário REQUESTER', async () => {
    mockRepository.getSummary.mockResolvedValue({
      request_count: 8,
      pending_amount_cents: 194999,
      approved_amount_cents: 228500,
      paid_this_month_amount_cents: 273549,
      overdue_count: 2,
      pending_count: 3,
      approved_count: 2,
      rejected_count: 1,
      paid_count: 2,
    });

    const user = {
      id: '10000000-0000-4000-8000-000000000001',
      name: 'Ana Solicitante',
      email: 'solicitante@gex.test',
      role: Role.REQUESTER,
    };

    const result = await service.execute(user);

    expect(mockRepository.getSummary).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.any(String),
      '10000000-0000-4000-8000-000000000001',
    );

    expect(result.pending_amount_cents).toBe(194999);
    expect(result.overdue_count).toBe(2);
  });
});
