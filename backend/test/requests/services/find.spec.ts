import FindRequestsService from 'src/requests/services/find';
import RequestsRepository from 'src/requests/repository';
import { Role, RequestStatus } from '@prisma/client';

describe('FindRequestsService (Unitário)', () => {
  let service: FindRequestsService;
  let mockRepository: jest.Mocked<RequestsRepository>;

  beforeEach(() => {
    mockRepository = {
      find: jest.fn(),
      findById: jest.fn(),
      findByCnpjAndInvoice: jest.fn(),
    } as any;

    service = new FindRequestsService(mockRepository);
  });

  const queryParams = {
    page: 1,
    limit: 10,
    status: RequestStatus.PENDING,
    supplier_name: 'Fornecedor',
  };

  it('deve aplicar escopo de requesterId quando o usuário for REQUESTER', async () => {
    const requesterUser = {
      id: '10000000-0000-4000-8000-000000000001',
      name: 'Ana Solicitante',
      email: 'solicitante@gex.test',
      role: Role.REQUESTER,
    };

    const mockResult = {
      data: [{ id: 'req-1', requester_id: requesterUser.id }],
      total: 1,
      page: 1,
      totalPages: 1,
    };

    mockRepository.find.mockResolvedValue(mockResult as any);

    const result = await service.execute(queryParams as any, requesterUser);

    expect(mockRepository.find).toHaveBeenCalledWith(queryParams, requesterUser.id);
    expect(result).toEqual(mockResult);
  });

  it('deve passar requesterIdScope como undefined quando o usuário for FINANCE (visão ampla)', async () => {
    const financeUser = {
      id: '10000000-0000-4000-8000-000000000003',
      name: 'Fernanda Financeiro',
      email: 'financeiro@gex.test',
      role: Role.FINANCE,
    };

    const mockResult = {
      data: [
        { id: 'req-1', requester_id: 'user-1' },
        { id: 'req-2', requester_id: 'user-2' },
      ],
      total: 2,
      page: 1,
      totalPages: 1,
    };

    mockRepository.find.mockResolvedValue(mockResult as any);

    const result = await service.execute(queryParams as any, financeUser);

    expect(mockRepository.find).toHaveBeenCalledWith(queryParams, undefined);
    expect(result.data.length).toBe(2);
  });
});
