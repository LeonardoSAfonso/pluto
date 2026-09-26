/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as supertest from 'supertest';
const request = (supertest as any).default || supertest;
import { AppModule } from 'src/app.module';
import { HttpExceptionFilter } from 'src/shared/filters/http-exception.filter';

describe('RequestsController (Integration)', () => {
  let app: INestApplication;
  let requesterToken: string;
  let otherRequesterToken: string;
  let financeToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    // Login com Ana (REQUESTER)
    const anaLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'solicitante@gex.test', password: 'GexRequester123!' });
    requesterToken = anaLogin.body.accessToken;

    // Login com Bruno (REQUESTER - outro usuário)
    const brunoLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'outro.solicitante@gex.test', password: 'GexRequester456!' });
    otherRequesterToken = brunoLogin.body.accessToken;

    // Login com Fernanda (FINANCE)
    const fernandaLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'financeiro@gex.test', password: 'GexFinance123!' });
    financeToken = fernandaLogin.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  // 1. Criação com sucesso
  it('POST /requests - deve criar solicitação com sucesso e status PENDING', async () => {
    const uniqueInvoice = `NF-TEST-${Date.now()}`;
    const response = await request(app.getHttpServer())
      .post('/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        supplier_name: 'Fornecedor de Testes',
        supplier_cnpj: '11.222.333/0001-81',
        invoice_number: uniqueInvoice,
        amount_cents: 155313,
        competence: '2026-09',
        due_date: '2026-10-15',
        category: 'Serviços de TI',
        description: 'Desenvolvimento de software',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe('PENDING');
    expect(response.body.amount_cents).toBe(155313);
    expect(response.body.supplier_cnpj).toBe('11222333000181'); // 14 dígitos sem máscara
  });

  // 2. Bloqueio de duplicidade
  it('POST /requests - deve retornar 409 Conflict para nota fiscal duplicada do mesmo CNPJ', async () => {
    const duplicateInvoice = `NF-DUP-${Date.now()}`;
    const payload = {
      supplier_name: 'Fornecedor Duplicado',
      supplier_cnpj: '11.222.333/0001-81',
      invoice_number: duplicateInvoice,
      amount_cents: 50000,
      competence: '2026-09',
      due_date: '2026-10-20',
      category: 'Consultoria',
    };

    // Primeira criação -> 201
    await request(app.getHttpServer())
      .post('/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send(payload)
      .expect(201);

    // Segunda criação idêntica -> 409
    const secondResponse = await request(app.getHttpServer())
      .post('/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send(payload)
      .expect(409);

    expect(secondResponse.body.message).toContain('Já existe uma solicitação cadastrada');
  });

  // 3. Concorrência simultânea (race condition com Promise.all)
  it('POST /requests - duas requisições simultâneas duplicadas devem resultar em 1 sucesso e 1 conflito 409', async () => {
    const raceInvoice = `NF-RACE-${Date.now()}`;
    const payload = {
      supplier_name: 'Fornecedor Race Condition',
      supplier_cnpj: '11.222.333/0001-81',
      invoice_number: raceInvoice,
      amount_cents: 75000,
      competence: '2026-09',
      due_date: '2026-10-25',
      category: 'Licenciamento',
    };

    const results = await Promise.all([
      request(app.getHttpServer())
        .post('/requests')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(payload),
      request(app.getHttpServer())
        .post('/requests')
        .set('Authorization', `Bearer ${requesterToken}`)
        .send(payload),
    ]);

    const statuses = results.map((r) => r.status).sort();
    expect(statuses).toEqual([201, 409]);
  });

  // 4. REQUESTER tentando aprovar/rejeitar -> 403 Forbidden
  it('POST /requests/:id/decision - REQUESTER tentando decidir deve receber 403 Forbidden', async () => {
    const list = await request(app.getHttpServer())
      .get('/requests?limit=1')
      .set('Authorization', `Bearer ${requesterToken}`);

    const requestId = list.body.data[0].id;

    await request(app.getHttpServer())
      .post(`/requests/${requestId}/decision`)
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ action: 'APPROVE' })
      .expect(403);
  });

  // 5. Transições de status: PENDING -> APPROVED
  it('POST /requests/:id/decision - FINANCE aprovando solicitação PENDING', async () => {
    const created = await request(app.getHttpServer())
      .post('/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        supplier_name: 'Fornecedor Aprovação',
        supplier_cnpj: '11.222.333/0001-81',
        invoice_number: `NF-APROV-${Date.now()}`,
        amount_cents: 99000,
        competence: '2026-09',
        due_date: '2026-10-30',
        category: 'TI',
      })
      .expect(201);

    const approveRes = await request(app.getHttpServer())
      .post(`/requests/${created.body.id}/decision`)
      .set('Authorization', `Bearer ${financeToken}`)
      .send({ action: 'APPROVE' })
      .expect(200);

    expect(approveRes.body.status).toBe('APPROVED');

    // 6. Transição inválida: tentar rejeitar uma solicitação já APPROVED -> 409
    await request(app.getHttpServer())
      .post(`/requests/${created.body.id}/decision`)
      .set('Authorization', `Bearer ${financeToken}`)
      .send({ action: 'REJECT', reason: 'Tentando rejeitar aprovada' })
      .expect(409);
  });

  // 7. Rejeição sem motivo -> 422
  it('POST /requests/:id/decision - FINANCE rejeitando sem motivo deve retornar 422', async () => {
    const created = await request(app.getHttpServer())
      .post('/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        supplier_name: 'Fornecedor Sem Motivo',
        supplier_cnpj: '11.222.333/0001-81',
        invoice_number: `NF-SEM-MOTIVO-${Date.now()}`,
        amount_cents: 12000,
        competence: '2026-09',
        due_date: '2026-10-31',
        category: 'Geral',
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post(`/requests/${created.body.id}/decision`)
      .set('Authorization', `Bearer ${financeToken}`)
      .send({ action: 'REJECT', reason: '' })
      .expect(422);

    expect(res.body.message).toContain('motivo da rejeição é obrigatório');
  });

  // 8. Rejeição com motivo válido
  it('POST /requests/:id/decision - FINANCE rejeitando com motivo válido', async () => {
    const created = await request(app.getHttpServer())
      .post('/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        supplier_name: 'Fornecedor Rejeição',
        supplier_cnpj: '11.222.333/0001-81',
        invoice_number: `NF-REJ-${Date.now()}`,
        amount_cents: 34000,
        competence: '2026-09',
        due_date: '2026-11-05',
        category: 'Logística',
      })
      .expect(201);

    const rejRes = await request(app.getHttpServer())
      .post(`/requests/${created.body.id}/decision`)
      .set('Authorization', `Bearer ${financeToken}`)
      .send({ action: 'REJECT', reason: 'Valor acima do orçado' })
      .expect(200);

    expect(rejRes.body.status).toBe('REJECTED');
    expect(rejRes.body.rejection_reason).toBe('Valor acima do orçado');
  });

  // 9. Pagamento de solicitação APPROVED para PAID
  it('POST /requests/:id/mark-paid - deve marcar solicitação APPROVED como PAID', async () => {
    const created = await request(app.getHttpServer())
      .post('/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        supplier_name: 'Fornecedor Pagamento',
        supplier_cnpj: '11.222.333/0001-81',
        invoice_number: `NF-PAGTO-${Date.now()}`,
        amount_cents: 250000,
        competence: '2026-09',
        due_date: '2026-11-10',
        category: 'Infraestrutura',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/requests/${created.body.id}/decision`)
      .set('Authorization', `Bearer ${financeToken}`)
      .send({ action: 'APPROVE' })
      .expect(200);

    const paidRes = await request(app.getHttpServer())
      .post(`/requests/${created.body.id}/mark-paid`)
      .set('Authorization', `Bearer ${financeToken}`)
      .send({
        paid_at: '2026-09-25T14:30:00.000Z',
        payment_reference: 'TED-889900',
      })
      .expect(200);

    expect(paidRes.body.status).toBe('PAID');
    expect(paidRes.body.payment_reference).toBe('TED-889900');
    expect(paidRes.body.paid_at).toBeDefined();

    // 10. Tentar pagar novamente deve falhar com 409
    await request(app.getHttpServer())
      .post(`/requests/${created.body.id}/mark-paid`)
      .set('Authorization', `Bearer ${financeToken}`)
      .send({
        paid_at: '2026-09-25T14:30:00.000Z',
        payment_reference: 'TED-RETRY',
      })
      .expect(409);
  });

  // 11. Pagamento de solicitação PENDING deve falhar com 409
  it('POST /requests/:id/mark-paid - tentar pagar solicitação PENDING deve retornar 409', async () => {
    const created = await request(app.getHttpServer())
      .post('/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        supplier_name: 'Fornecedor Direto',
        supplier_cnpj: '11.222.333/0001-81',
        invoice_number: `NF-PEND-PAG-${Date.now()}`,
        amount_cents: 10000,
        competence: '2026-09',
        due_date: '2026-11-15',
        category: 'Material',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/requests/${created.body.id}/mark-paid`)
      .set('Authorization', `Bearer ${financeToken}`)
      .send({
        paid_at: '2026-09-25T10:00:00.000Z',
        payment_reference: 'PIX-INVALID',
      })
      .expect(409);
  });

  // 12. Listagem e escopo de perfis
  it('GET /requests - REQUESTER vê apenas próprias solicitações; FINANCE vê todas', async () => {
    const reqRes = await request(app.getHttpServer())
      .get('/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .expect(200);

    const finRes = await request(app.getHttpServer())
      .get('/requests')
      .set('Authorization', `Bearer ${financeToken}`)
      .expect(200);

    expect(reqRes.body).toHaveProperty('data');
    expect(reqRes.body).toHaveProperty('total');
    expect(finRes.body.total).toBeGreaterThanOrEqual(reqRes.body.total);
  });

  // 13. REQUESTER tentando ver detalhe de outro solicitante -> 403
  it('GET /requests/:id - REQUESTER tentando acessar solicitação de outro usuário deve receber 403', async () => {
    const brunoReq = await request(app.getHttpServer())
      .post('/requests')
      .set('Authorization', `Bearer ${otherRequesterToken}`)
      .send({
        supplier_name: 'Solicitação do Bruno',
        supplier_cnpj: '11.222.333/0001-81',
        invoice_number: `NF-BRUNO-${Date.now()}`,
        amount_cents: 50000,
        competence: '2026-09',
        due_date: '2026-11-20',
        category: 'Operacional',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/requests/${brunoReq.body.id}`)
      .set('Authorization', `Bearer ${requesterToken}`)
      .expect(403);

    const detailBruno = await request(app.getHttpServer())
      .get(`/requests/${brunoReq.body.id}`)
      .set('Authorization', `Bearer ${otherRequesterToken}`)
      .expect(200);

    expect(detailBruno.body.id).toBe(brunoReq.body.id);
    expect(detailBruno.body.auditEvents.length).toBeGreaterThanOrEqual(1);

    await request(app.getHttpServer())
      .get(`/requests/${brunoReq.body.id}`)
      .set('Authorization', `Bearer ${financeToken}`)
      .expect(200);
  });

  // 14. Paginação no banco: page, limit, totalPages
  it('GET /requests - deve aplicar paginação no banco corretamente', async () => {
    const pageRes = await request(app.getHttpServer())
      .get('/requests?page=1&limit=2')
      .set('Authorization', `Bearer ${financeToken}`)
      .expect(200);

    expect(pageRes.body.data.length).toBeLessThanOrEqual(2);
    expect(pageRes.body.page).toBe(1);
    expect(pageRes.body.totalPages).toBeGreaterThanOrEqual(1);
    expect(pageRes.body.total).toBeGreaterThanOrEqual(2);
  });

  // 15. Filtro por status
  it('GET /requests - deve filtrar solicitações por status', async () => {
    const filterRes = await request(app.getHttpServer())
      .get('/requests?status=PENDING')
      .set('Authorization', `Bearer ${financeToken}`)
      .expect(200);

    expect(filterRes.body.data.length).toBeGreaterThan(0);
    filterRes.body.data.forEach((r: any) => {
      expect(r.status).toBe('PENDING');
    });
  });

  // 16. Filtro por supplier_name (busca case-insensitive)
  it('GET /requests - deve buscar fornecedor por ILIKE / case-insensitive', async () => {
    const searchRes = await request(app.getHttpServer())
      .get('/requests?supplier_name=bruno')
      .set('Authorization', `Bearer ${financeToken}`)
      .expect(200);

    expect(searchRes.body.data.length).toBeGreaterThan(0);
    searchRes.body.data.forEach((r: any) => {
      expect(r.supplier_name.toLowerCase()).toContain('bruno');
    });
  });

  // 17. Filtro por período de vencimento (due_date_from e due_date_to)
  it('GET /requests - deve filtrar por período de vencimento', async () => {
    const dateRes = await request(app.getHttpServer())
      .get('/requests?due_date_from=2026-09-01&due_date_to=2026-12-31')
      .set('Authorization', `Bearer ${financeToken}`)
      .expect(200);

    expect(dateRes.body).toHaveProperty('data');
    dateRes.body.data.forEach((r: any) => {
      const dueDate = new Date(r.due_date);
      expect(dueDate >= new Date('2026-09-01')).toBe(true);
      expect(dueDate <= new Date('2026-12-31T23:59:59.999Z')).toBe(true);
    });
  });

  // 18. Histórico de auditoria ordenado por created_at ASC
  it('GET /requests/:id - deve retornar auditEvents ordenados por created_at ASC', async () => {
    const listRes = await request(app.getHttpServer())
      .get('/requests?status=PAID&limit=1')
      .set('Authorization', `Bearer ${financeToken}`)
      .expect(200);

    const paidReqId = listRes.body.data[0].id;
    const detailRes = await request(app.getHttpServer())
      .get(`/requests/${paidReqId}`)
      .set('Authorization', `Bearer ${financeToken}`)
      .expect(200);

    const events = detailRes.body.auditEvents;
    expect(events.length).toBeGreaterThanOrEqual(2);

    for (let i = 1; i < events.length; i++) {
      const prevDate = new Date(events[i - 1].created_at).getTime();
      const currDate = new Date(events[i].created_at).getTime();
      expect(currDate).toBeGreaterThanOrEqual(prevDate);
    }
  });

  // 19. Consulta por ID inexistente -> 404
  it('GET /requests/:id - deve retornar 404 para ID inexistente', async () => {
    await request(app.getHttpServer())
      .get('/requests/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${financeToken}`)
      .expect(404);
  });

  // 20. Decisão em ID inexistente -> 404
  it('POST /requests/:id/decision - deve retornar 404 para solicitação inexistente', async () => {
    await request(app.getHttpServer())
      .post('/requests/00000000-0000-0000-0000-000000000000/decision')
      .set('Authorization', `Bearer ${financeToken}`)
      .send({ action: 'APPROVE' })
      .expect(404);
  });

  // 21. Marcação de pagamento em ID inexistente -> 404
  it('POST /requests/:id/mark-paid - deve retornar 404 para solicitação inexistente', async () => {
    await request(app.getHttpServer())
      .post('/requests/00000000-0000-0000-0000-000000000000/mark-paid')
      .set('Authorization', `Bearer ${financeToken}`)
      .send({
        paid_at: '2026-09-25T14:30:00.000Z',
        payment_reference: 'TED-404',
      })
      .expect(404);
  });

  // 22. REQUESTER tentando marcar como pago -> 403 Forbidden
  it('POST /requests/:id/mark-paid - REQUESTER tentando pagar deve receber 403 Forbidden', async () => {
    await request(app.getHttpServer())
      .post('/requests/20000000-0000-4000-8000-000000000001/mark-paid')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        paid_at: '2026-09-25T14:30:00.000Z',
        payment_reference: 'TED-FORBIDDEN',
      })
      .expect(403);
  });

  // 23. Criação com amount_cents zero ou negativo -> 400
  it('POST /requests - deve retornar 400 para amount_cents menor ou igual a zero', async () => {
    await request(app.getHttpServer())
      .post('/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        supplier_name: 'Fornecedor Zero',
        supplier_cnpj: '11.222.333/0001-81',
        invoice_number: `NF-ZERO-${Date.now()}`,
        amount_cents: 0,
        competence: '2026-09',
        due_date: '2026-10-15',
        category: 'Geral',
      })
      .expect(400);
  });

  // 24. Criação com campos extras desconhecidos (forbidNonWhitelisted) -> 400
  it('POST /requests - deve retornar 400 ao enviar campo não previsto no DTO', async () => {
    await request(app.getHttpServer())
      .post('/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        supplier_name: 'Fornecedor Injeção',
        supplier_cnpj: '11.222.333/0001-81',
        invoice_number: `NF-EXTRA-${Date.now()}`,
        amount_cents: 5000,
        competence: '2026-09',
        due_date: '2026-10-15',
        category: 'Geral',
        campo_inexistente_injetado: true,
      })
      .expect(400);
  });

  // 25. Decisão com action inválida -> 400
  it('POST /requests/:id/decision - deve retornar 400 para ação inválida', async () => {
    await request(app.getHttpServer())
      .post('/requests/20000000-0000-4000-8000-000000000001/decision')
      .set('Authorization', `Bearer ${financeToken}`)
      .send({ action: 'CANCEL' })
      .expect(400);
  });
});
