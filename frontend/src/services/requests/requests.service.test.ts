import RequestsService from './requests.service';
import { CreateRequestInput, DecisionInput, MarkPaidInput } from '@/types/api/request.types';

describe('RequestsService', () => {
  let service: RequestsService;
  let getSpy: jest.SpyInstance;
  let postSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new RequestsService();
    // Spies no Axios client embutido no BaseService
    getSpy = jest.spyOn((service as any).api, 'get').mockResolvedValue({ data: {} });
    postSpy = jest.spyOn((service as any).api, 'post').mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve chamar GET /requests com os query parameters corretos', async () => {
    await service.getRequests({
      page: 2,
      limit: 10,
      status: 'APPROVED',
      supplier_name: 'Aurora',
      due_date_from: '2026-09-01',
      due_date_to: '2026-09-30',
    });

    expect(getSpy).toHaveBeenCalledWith('/requests', {
      params: {
        page: 2,
        limit: 10,
        status: 'APPROVED',
        supplier_name: 'Aurora',
        due_date_from: '2026-09-01',
        due_date_to: '2026-09-30',
      },
    });
  });

  it('deve chamar GET /requests/:id para carregar detalhe da solicitação', async () => {
    const id = '20000000-0000-4000-8000-000000000001';
    await service.getRequest(id);

    expect(getSpy).toHaveBeenCalledWith(`/requests/${id}`);
  });

  it('deve chamar POST /requests com o payload de criação', async () => {
    const payload: CreateRequestInput = {
      supplier_name: 'Fornecedor Teste',
      supplier_cnpj: '10000000000145',
      invoice_number: 'NF-2026-9001',
      amount_cents: 350000,
      competence: '2026-09',
      due_date: '2026-09-25',
      category: 'SOFTWARE',
    };

    await service.createRequest(payload);

    expect(postSpy).toHaveBeenCalledWith('/requests', payload);
  });

  it('deve chamar POST /requests/:id/decision com a decisão financeira', async () => {
    const id = '20000000-0000-4000-8000-000000000001';
    const decision: DecisionInput = { action: 'APPROVE' };

    await service.decideRequest(id, decision);

    expect(postSpy).toHaveBeenCalledWith(`/requests/${id}/decision`, decision);
  });

  it('deve chamar POST /requests/:id/mark-paid com data e comprovante', async () => {
    const id = '20000000-0000-4000-8000-000000000001';
    const markPaidData: MarkPaidInput = {
      paid_at: '2026-09-18',
      payment_reference: 'TED-88239102-GEX',
    };

    await service.markPaid(id, markPaidData);

    expect(postSpy).toHaveBeenCalledWith(`/requests/${id}/mark-paid`, markPaidData);
  });
});
