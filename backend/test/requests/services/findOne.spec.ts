import FindOneRequestService from 'src/requests/services/findOne';
import RequestsRepository from 'src/requests/repository';
import { Role } from '@prisma/client';
import AppError from 'src/shared/AppError';

describe('FindOneRequestService (Unitário)', () => {
  let service: FindOneRequestService;
  let mockRepository: jest.Mocked<RequestsRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      find: jest.fn(),
      findByCnpjAndInvoice: jest.fn(),
    } as any;

    service = new FindOneRequestService(mockRepository);
  });

  const anaUser = {
    id: 'user-ana',
    name: 'Ana Solicitante',
    email: 'solicitante@gex.test',
    role: Role.REQUESTER,
  };

  const brunoUser = {
    id: 'user-bruno',
    name: 'Bruno Solicitante',
    email: 'outro.solicitante@gex.test',
    role: Role.REQUESTER,
  };

  const financeUser = {
    id: 'user-fernanda',
    name: 'Fernanda Financeiro',
    email: 'financeiro@gex.test',
    role: Role.FINANCE,
  };

  it('deve lançar 404 quando a solicitação não existir', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(service.execute('id-inexistente', anaUser)).rejects.toThrow(
      new AppError('Solicitação não encontrada', 404),
    );
  });

  it('deve lançar 403 quando um REQUESTER tentar acessar solicitação de outro usuário', async () => {
    const mockRequest = {
      id: 'req-bruno',
      requester_id: brunoUser.id,
      supplier_name: 'Fornecedor Bruno',
    };

    mockRepository.findById.mockResolvedValue(mockRequest as any);

    // Ana tenta acessar solicitação do Bruno
    await expect(service.execute('req-bruno', anaUser)).rejects.toThrow(
      new AppError('Acesso não autorizado a esta solicitação', 403),
    );
  });

  it('deve retornar a solicitação quando o REQUESTER for o criador da mesma', async () => {
    const mockRequest = {
      id: 'req-ana',
      requester_id: anaUser.id,
      supplier_name: 'Fornecedor Ana',
      auditEvents: [],
    };

    mockRepository.findById.mockResolvedValue(mockRequest as any);

    const result = await service.execute('req-ana', anaUser);

    expect(result).toEqual(mockRequest);
    expect(result.id).toBe('req-ana');
  });

  it('deve permitir que usuário FINANCE acerte qualquer solicitação', async () => {
    const mockRequest = {
      id: 'req-bruno',
      requester_id: brunoUser.id,
      supplier_name: 'Fornecedor Bruno',
      auditEvents: [],
    };

    mockRepository.findById.mockResolvedValue(mockRequest as any);

    const result = await service.execute('req-bruno', financeUser);

    expect(result).toEqual(mockRequest);
    expect(result.id).toBe('req-bruno');
  });
});
