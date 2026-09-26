import { DashboardController } from 'src/dashboard/dashboard.controller';
import GetDashboardSummaryService from 'src/dashboard/services/getSummary';
import { Role } from '@prisma/client';

describe('DashboardController (Unitário)', () => {
  let controller: DashboardController;
  let mockSummaryService: jest.Mocked<GetDashboardSummaryService>;

  beforeEach(() => {
    mockSummaryService = {
      execute: jest.fn(),
    } as any;

    controller = new DashboardController(mockSummaryService);
  });

  describe('getSummary', () => {
    it('deve delegar a busca de resumo para GetDashboardSummaryService com o usuário autenticado', async () => {
      const currentUser = {
        id: '10000000-0000-4000-8000-000000000003',
        name: 'Fernanda Financeiro',
        email: 'financeiro@gex.test',
        role: Role.FINANCE,
      };

      const expectedSummary = {
        reference_date: '2026-09-18',
        pending_amount_cents: 875049,
        approved_amount_cents: 658599,
        paid_this_month_amount_cents: 841549,
        overdue_count: 4,
        request_count: 16,
        status_counts: {
          PENDING: 5,
          APPROVED: 4,
          REJECTED: 2,
          PAID: 5,
        },
      };

      mockSummaryService.execute.mockResolvedValue(expectedSummary as any);

      const result = await controller.getSummary(currentUser);

      expect(mockSummaryService.execute).toHaveBeenCalledWith(currentUser);
      expect(result).toEqual(expectedSummary);
      expect(result.pending_amount_cents).toBe(875049);
    });

    it('deve propagar erro quando o serviço falhar', async () => {
      const currentUser = {
        id: 'user-1',
        name: 'Ana Solicitante',
        email: 'solicitante@gex.test',
        role: Role.REQUESTER,
      };

      mockSummaryService.execute.mockRejectedValue(new Error('Erro de cálculo'));

      await expect(controller.getSummary(currentUser)).rejects.toThrow('Erro de cálculo');
      expect(mockSummaryService.execute).toHaveBeenCalledWith(currentUser);
    });
  });
});
