import { RequestsController } from 'src/requests/requests.controller';
import CreateRequestService from 'src/requests/services/create';
import FindRequestsService from 'src/requests/services/find';
import FindOneRequestService from 'src/requests/services/findOne';
import DecideRequestService from 'src/requests/services/decision';
import MarkPaidRequestService from 'src/requests/services/markPaid';
import { Role, RequestStatus } from '@prisma/client';

describe('RequestsController (Unitário)', () => {
  let controller: RequestsController;
  let mockCreateService: jest.Mocked<CreateRequestService>;
  let mockFindService: jest.Mocked<FindRequestsService>;
  let mockFindOneService: jest.Mocked<FindOneRequestService>;
  let mockDecideService: jest.Mocked<DecideRequestService>;
  let mockMarkPaidService: jest.Mocked<MarkPaidRequestService>;

  const requesterUser = {
    id: 'user-requester-1',
    name: 'Ana Solicitante',
    email: 'solicitante@gex.test',
    role: Role.REQUESTER,
  };

  const financeUser = {
    id: 'user-finance-1',
    name: 'Fernanda Financeiro',
    email: 'financeiro@gex.test',
    role: Role.FINANCE,
  };

  beforeEach(() => {
    mockCreateService = { execute: jest.fn() } as any;
    mockFindService = { execute: jest.fn() } as any;
    mockFindOneService = { execute: jest.fn() } as any;
    mockDecideService = { execute: jest.fn() } as any;
    mockMarkPaidService = { execute: jest.fn() } as any;

    controller = new RequestsController(
      mockCreateService,
      mockFindService,
      mockFindOneService,
      mockDecideService,
      mockMarkPaidService,
    );
  });

  describe('create', () => {
    it('deve delegar a criação para CreateRequestService com DTO e id do solicitante', async () => {
      const dto = {
        supplier_name: 'Fornecedor A',
        supplier_cnpj: '11.222.333/0001-81',
        invoice_number: 'NF-100',
        amount_cents: 155313,
        competence: '2026-09',
        due_date: '2026-10-15',
        category: 'TI',
      };

      const expectedResponse = { id: 'req-1', status: RequestStatus.PENDING, ...dto };
      mockCreateService.execute.mockResolvedValue(expectedResponse as any);

      const result = await controller.create(dto as any, requesterUser);

      expect(mockCreateService.execute).toHaveBeenCalledWith(dto, requesterUser.id);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('find', () => {
    it('deve delegar a listagem para FindRequestsService com query params e usuário', async () => {
      const query = { page: 1, limit: 10, status: RequestStatus.PENDING };
      const expectedResponse = {
        data: [{ id: 'req-1' }],
        total: 1,
        page: 1,
        totalPages: 1,
      };

      mockFindService.execute.mockResolvedValue(expectedResponse as any);

      const result = await controller.find(query as any, requesterUser);

      expect(mockFindService.execute).toHaveBeenCalledWith(query, requesterUser);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findOne', () => {
    it('deve delegar a busca por ID para FindOneRequestService', async () => {
      const expectedRequest = { id: 'req-1', supplier_name: 'Fornecedor A' };
      mockFindOneService.execute.mockResolvedValue(expectedRequest as any);

      const result = await controller.findOne('req-1', requesterUser);

      expect(mockFindOneService.execute).toHaveBeenCalledWith('req-1', requesterUser);
      expect(result).toEqual(expectedRequest);
    });
  });

  describe('decide', () => {
    it('deve delegar a decisão de aprovação/rejeição para DecideRequestService', async () => {
      const dto = { action: 'APPROVE' as const };
      const expectedResponse = { id: 'req-1', status: RequestStatus.APPROVED };
      mockDecideService.execute.mockResolvedValue(expectedResponse as any);

      const result = await controller.decide('req-1', dto, financeUser);

      expect(mockDecideService.execute).toHaveBeenCalledWith('req-1', dto, financeUser);
      expect(result.status).toBe(RequestStatus.APPROVED);
    });
  });

  describe('markPaid', () => {
    it('deve delegar a marcação de pagamento para MarkPaidRequestService', async () => {
      const dto = {
        paid_at: '2026-09-25T14:30:00.000Z',
        payment_reference: 'TED-12345',
      };
      const expectedResponse = { id: 'req-1', status: RequestStatus.PAID, payment_reference: 'TED-12345' };
      mockMarkPaidService.execute.mockResolvedValue(expectedResponse as any);

      const result = await controller.markPaid('req-1', dto, financeUser);

      expect(mockMarkPaidService.execute).toHaveBeenCalledWith('req-1', dto, financeUser);
      expect(result.status).toBe(RequestStatus.PAID);
      expect(result.payment_reference).toBe('TED-12345');
    });
  });
});
