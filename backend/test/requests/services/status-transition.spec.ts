import DecideRequestService from 'src/requests/services/decision';
import MarkPaidRequestService from 'src/requests/services/markPaid';
import AppError from 'src/shared/AppError';
import { RequestStatus, Role } from '@prisma/client';

describe('Máquina de Estados de Solicitações (Unitário)', () => {
  const financeUser = {
    id: 'user-finance-1',
    name: 'Fernanda Financeiro',
    email: 'financeiro@gex.test',
    role: Role.FINANCE,
  };

  describe('DecideRequestService', () => {
    let decideService: DecideRequestService;
    let mockPrisma: any;

    beforeEach(() => {
      mockPrisma = {
        $transaction: jest.fn(async (cb) => {
          return cb({
            $queryRaw: jest.fn(),
            request: { update: jest.fn() },
            auditEvent: { create: jest.fn() },
          });
        }),
      };
      decideService = new DecideRequestService(mockPrisma);
    });

    it('deve aprovar solicitação com status PENDING', async () => {
      const mockRequest = { id: 'req-1', status: RequestStatus.PENDING };
      mockPrisma.$transaction = jest.fn(async (cb) => {
        return cb({
          $queryRaw: jest.fn().mockResolvedValue([mockRequest]),
          request: {
            update: jest.fn().mockResolvedValue({ ...mockRequest, status: RequestStatus.APPROVED }),
          },
          auditEvent: { create: jest.fn() },
        });
      });

      const result = await decideService.execute(
        'req-1',
        { action: 'APPROVE' },
        financeUser,
      );

      expect(result.status).toBe(RequestStatus.APPROVED);
    });

    it('deve lançar 422 ao rejeitar sem motivo', async () => {
      await expect(
        decideService.execute('req-1', { action: 'REJECT', reason: '' }, financeUser),
      ).rejects.toThrow(new AppError('O motivo da rejeição é obrigatório', 422));
    });

    it('deve rejeitar solicitação com status PENDING informando motivo', async () => {
      const mockRequest = { id: 'req-1', status: RequestStatus.PENDING };
      mockPrisma.$transaction = jest.fn(async (cb) => {
        return cb({
          $queryRaw: jest.fn().mockResolvedValue([mockRequest]),
          request: {
            update: jest.fn().mockResolvedValue({
              ...mockRequest,
              status: RequestStatus.REJECTED,
              rejection_reason: 'Valor divergente',
            }),
          },
          auditEvent: { create: jest.fn() },
        });
      });

      const result = await decideService.execute(
        'req-1',
        { action: 'REJECT', reason: 'Valor divergente' },
        financeUser,
      );

      expect(result.status).toBe(RequestStatus.REJECTED);
    });

    it('deve lançar 409 ao tentar aprovar solicitação já APPROVED', async () => {
      const mockRequest = { id: 'req-1', status: RequestStatus.APPROVED };
      mockPrisma.$transaction = jest.fn(async (cb) => {
        return cb({
          $queryRaw: jest.fn().mockResolvedValue([mockRequest]),
          request: { update: jest.fn() },
          auditEvent: { create: jest.fn() },
        });
      });

      await expect(
        decideService.execute('req-1', { action: 'APPROVE' }, financeUser),
      ).rejects.toThrow(AppError);
    });

    it('deve lançar 409 ao tentar rejeitar solicitação já APPROVED', async () => {
      const mockRequest = { id: 'req-1', status: RequestStatus.APPROVED };
      mockPrisma.$transaction = jest.fn(async (cb) => {
        return cb({
          $queryRaw: jest.fn().mockResolvedValue([mockRequest]),
          request: { update: jest.fn() },
          auditEvent: { create: jest.fn() },
        });
      });

      await expect(
        decideService.execute('req-1', { action: 'REJECT', reason: 'Tentando rejeitar aprovada' }, financeUser),
      ).rejects.toThrow(AppError);
    });

    it('deve lançar 409 ao tentar aprovar solicitação já REJECTED', async () => {
      const mockRequest = { id: 'req-1', status: RequestStatus.REJECTED };
      mockPrisma.$transaction = jest.fn(async (cb) => {
        return cb({
          $queryRaw: jest.fn().mockResolvedValue([mockRequest]),
          request: { update: jest.fn() },
          auditEvent: { create: jest.fn() },
        });
      });

      await expect(
        decideService.execute('req-1', { action: 'APPROVE' }, financeUser),
      ).rejects.toThrow(AppError);
    });

    it('deve lançar 409 ao tentar aprovar ou rejeitar solicitação já PAID', async () => {
      const mockRequest = { id: 'req-1', status: RequestStatus.PAID };
      mockPrisma.$transaction = jest.fn(async (cb) => {
        return cb({
          $queryRaw: jest.fn().mockResolvedValue([mockRequest]),
          request: { update: jest.fn() },
          auditEvent: { create: jest.fn() },
        });
      });

      await expect(
        decideService.execute('req-1', { action: 'APPROVE' }, financeUser),
      ).rejects.toThrow(AppError);

      await expect(
        decideService.execute('req-1', { action: 'REJECT', reason: 'Rejeitar paga' }, financeUser),
      ).rejects.toThrow(AppError);
    });

    it('deve lançar 404 se a solicitação não for encontrada', async () => {
      mockPrisma.$transaction = jest.fn(async (cb) => {
        return cb({
          $queryRaw: jest.fn().mockResolvedValue([]),
        });
      });

      await expect(
        decideService.execute('req-inexistente', { action: 'APPROVE' }, financeUser),
      ).rejects.toThrow(new AppError('Solicitação não encontrada', 404));
    });
  });

  describe('MarkPaidRequestService', () => {
    let markPaidService: MarkPaidRequestService;
    let mockPrisma: any;

    beforeEach(() => {
      mockPrisma = {
        $transaction: jest.fn(async (cb) => {
          return cb({
            $queryRaw: jest.fn(),
            request: { update: jest.fn() },
            auditEvent: { create: jest.fn() },
          });
        }),
      };
      markPaidService = new MarkPaidRequestService(mockPrisma);
    });

    it('deve lançar 400 se payment_reference for vazia', async () => {
      await expect(
        markPaidService.execute(
          'req-1',
          { paid_at: '2026-09-20T10:00:00Z', payment_reference: '' },
          financeUser,
        ),
      ).rejects.toThrow(new AppError('A referência do pagamento é obrigatória', 400));
    });

    it('deve lançar 400 se paid_at for inválida ou vazia', async () => {
      await expect(
        markPaidService.execute(
          'req-1',
          { paid_at: 'data-invalida', payment_reference: 'TED-123' },
          financeUser,
        ),
      ).rejects.toThrow(new AppError('Data de pagamento inválida', 400));
    });

    it('deve marcar solicitação APPROVED como PAID com sucesso', async () => {
      const mockRequest = { id: 'req-1', status: RequestStatus.APPROVED };
      const paidDate = '2026-09-25T14:30:00.000Z';
      mockPrisma.$transaction = jest.fn(async (cb) => {
        return cb({
          $queryRaw: jest.fn().mockResolvedValue([mockRequest]),
          request: {
            update: jest.fn().mockResolvedValue({
              ...mockRequest,
              status: RequestStatus.PAID,
              paid_at: new Date(paidDate),
              payment_reference: 'TED-889900',
            }),
          },
          auditEvent: { create: jest.fn() },
        });
      });

      const result = await markPaidService.execute(
        'req-1',
        { paid_at: paidDate, payment_reference: 'TED-889900' },
        financeUser,
      );

      expect(result.status).toBe(RequestStatus.PAID);
      expect(result.payment_reference).toBe('TED-889900');
    });

    it('deve lançar 409 ao tentar pagar solicitação com status PENDING', async () => {
      const mockRequest = { id: 'req-1', status: RequestStatus.PENDING };
      mockPrisma.$transaction = jest.fn(async (cb) => {
        return cb({
          $queryRaw: jest.fn().mockResolvedValue([mockRequest]),
          request: { update: jest.fn() },
          auditEvent: { create: jest.fn() },
        });
      });

      await expect(
        markPaidService.execute(
          'req-1',
          { paid_at: '2026-09-20T10:00:00Z', payment_reference: 'PIX-123' },
          financeUser,
        ),
      ).rejects.toThrow(AppError);
    });

    it('deve lançar 409 ao tentar pagar solicitação com status REJECTED', async () => {
      const mockRequest = { id: 'req-1', status: RequestStatus.REJECTED };
      mockPrisma.$transaction = jest.fn(async (cb) => {
        return cb({
          $queryRaw: jest.fn().mockResolvedValue([mockRequest]),
          request: { update: jest.fn() },
          auditEvent: { create: jest.fn() },
        });
      });

      await expect(
        markPaidService.execute(
          'req-1',
          { paid_at: '2026-09-20T10:00:00Z', payment_reference: 'PIX-123' },
          financeUser,
        ),
      ).rejects.toThrow(AppError);
    });

    it('deve lançar 409 ao tentar pagar solicitação já PAID', async () => {
      const mockRequest = { id: 'req-1', status: RequestStatus.PAID };
      mockPrisma.$transaction = jest.fn(async (cb) => {
        return cb({
          $queryRaw: jest.fn().mockResolvedValue([mockRequest]),
          request: { update: jest.fn() },
          auditEvent: { create: jest.fn() },
        });
      });

      await expect(
        markPaidService.execute(
          'req-1',
          { paid_at: '2026-09-20T10:00:00Z', payment_reference: 'PIX-123' },
          financeUser,
        ),
      ).rejects.toThrow(AppError);
    });

    it('deve lançar 404 se solicitação não for encontrada', async () => {
      mockPrisma.$transaction = jest.fn(async (cb) => {
        return cb({
          $queryRaw: jest.fn().mockResolvedValue([]),
        });
      });

      await expect(
        markPaidService.execute(
          'req-inexistente',
          { paid_at: '2026-09-20T10:00:00Z', payment_reference: 'PIX-123' },
          financeUser,
        ),
      ).rejects.toThrow(new AppError('Solicitação não encontrada', 404));
    });
  });
});
