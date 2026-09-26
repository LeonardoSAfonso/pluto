import CreateRequestService from 'src/requests/services/create';
import RequestsRepository from 'src/requests/repository';
import { PrismaService } from 'src/orm/prisma.service';
import AppError from 'src/shared/AppError';
import { Prisma, RequestStatus } from '@prisma/client';

describe('CreateRequestService (Unitário)', () => {
  let service: CreateRequestService;
  let mockRepository: jest.Mocked<RequestsRepository>;
  let mockPrisma: any;

  beforeEach(() => {
    mockRepository = {
      findByCnpjAndInvoice: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    } as any;

    mockPrisma = {
      $transaction: jest.fn(async (cb) => {
        return cb({
          request: {
            create: jest.fn().mockImplementation(({ data }) =>
              Promise.resolve({
                id: 'req-uuid-1',
                ...data,
                created_at: new Date(),
                updated_at: new Date(),
              }),
            ),
          },
          auditEvent: {
            create: jest.fn().mockResolvedValue({ id: 'audit-uuid-1' }),
          },
        });
      }),
    };

    service = new CreateRequestService(mockRepository, mockPrisma);
  });

  const validPayload = {
    supplier_name: 'Fornecedor Exemplo LTDA',
    supplier_cnpj: '11.222.333/0001-81',
    invoice_number: 'NF-12345',
    amount_cents: 155313,
    competence: '2026-09',
    due_date: '2026-10-15',
    category: 'TI',
    description: 'Serviços de consultoria',
  };

  const requesterId = 'user-requester-1';

  it('deve criar solicitação com sucesso, sanitizando CNPJ e gravando evento de auditoria inicial', async () => {
    mockRepository.findByCnpjAndInvoice.mockResolvedValue(null);

    const result = await service.execute(validPayload, requesterId);

    expect(result.id).toBe('req-uuid-1');
    expect(result.supplier_cnpj).toBe('11222333000181'); // CNPJ limpo sem máscara
    expect(result.status).toBe(RequestStatus.PENDING);
    expect(result.requester_id).toBe(requesterId);
    expect(mockRepository.findByCnpjAndInvoice).toHaveBeenCalledWith(
      '11222333000181',
      'NF-12345',
    );
  });

  it('deve lançar 409 quando já existir solicitação com mesmo CNPJ e NF (via repositório)', async () => {
    mockRepository.findByCnpjAndInvoice.mockResolvedValue({ id: 'existing-id' } as any);

    await expect(service.execute(validPayload, requesterId)).rejects.toThrow(
      new AppError(
        'Já existe uma solicitação cadastrada com este CNPJ e número de nota fiscal',
        409,
      ),
    );
  });

  it('deve lançar 409 quando o banco disparar violação de unique constraint P2002', async () => {
    mockRepository.findByCnpjAndInvoice.mockResolvedValue(null);
    mockPrisma.$transaction = jest.fn().mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '6.0.0',
      }),
    );

    await expect(service.execute(validPayload, requesterId)).rejects.toThrow(
      new AppError(
        'Já existe uma solicitação cadastrada com este CNPJ e número de nota fiscal',
        409,
      ),
    );
  });

  it('deve lançar 400 quando o CNPJ for inválido', async () => {
    const invalidPayload = {
      ...validPayload,
      supplier_cnpj: '00.000.000/0000-00', // CNPJ inválido
    };

    await expect(service.execute(invalidPayload, requesterId)).rejects.toThrow(AppError);
  });
});
