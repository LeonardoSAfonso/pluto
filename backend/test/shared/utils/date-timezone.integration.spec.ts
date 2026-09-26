/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as supertest from 'supertest';
const request = (supertest as any).default || supertest;
import { AppModule } from 'src/app.module';
import { HttpExceptionFilter } from 'src/shared/filters/http-exception.filter';
import { PrismaService } from 'src/orm/prisma.service';

describe('Date & Timezone (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let requesterToken: string;
  let financeToken: string;

  beforeAll(async () => {
    process.env.APP_TODAY = '2026-09-18';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);

    // Login com solicitante
    const reqRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'solicitante@gex.test', password: 'GexRequester123!' });
    requesterToken = reqRes.body.accessToken;

    // Login com financeiro
    const finRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'financeiro@gex.test', password: 'GexFinance123!' });
    financeToken = finRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /requests - deve rejeitar formato inválido de competência com 400', async () => {
    await request(app.getHttpServer())
      .post('/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        supplier_name: 'Fornecedor Data Test',
        supplier_cnpj: '11.222.333/0001-81',
        invoice_number: `NF-DATE-COMP-${Date.now()}`,
        amount_cents: 10000,
        competence: '09/2026', // Formato inválido (esperado YYYY-MM)
        due_date: '2026-09-20',
        category: 'Geral',
      })
      .expect(400);
  });

  it('POST /requests - deve rejeitar formato inválido de due_date com 400', async () => {
    await request(app.getHttpServer())
      .post('/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        supplier_name: 'Fornecedor Data Test',
        supplier_cnpj: '11.222.333/0001-81',
        invoice_number: `NF-DATE-DUE-${Date.now()}`,
        amount_cents: 10000,
        competence: '2026-09',
        due_date: '20/09/2026', // Formato inválido (esperado YYYY-MM-DD)
        category: 'Geral',
      })
      .expect(400);
  });

  it('POST /requests/:id/mark-paid - deve persistir TIMESTAMPTZ preservando fuso horário de São Paulo', async () => {
    // 1. Cria e aprova uma nova solicitação
    const uniqueInvoice = `NF-TZ-TEST-${Date.now()}`;
    const createRes = await request(app.getHttpServer())
      .post('/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        supplier_name: 'Fornecedor Timezone',
        supplier_cnpj: '11.222.333/0001-81',
        invoice_number: uniqueInvoice,
        amount_cents: 30000,
        competence: '2026-08',
        due_date: '2026-08-30',
        category: 'Geral',
      })
      .expect(201);

    const reqId = createRes.body.id;

    await request(app.getHttpServer())
      .post(`/requests/${reqId}/decision`)
      .set('Authorization', `Bearer ${financeToken}`)
      .send({ action: 'APPROVE' })
      .expect(200);

    // 2. Registra pagamento às 22:30 de 31/08 em São Paulo (que em UTC seria 01/09 01:30)
    // "2026-08-31T22:30:00-03:00" = "2026-09-01T01:30:00.000Z"
    const paidAtSaoPauloNight = '2026-08-31T22:30:00-03:00';

    await request(app.getHttpServer())
      .post(`/requests/${reqId}/mark-paid`)
      .set('Authorization', `Bearer ${financeToken}`)
      .send({
        paid_at: paidAtSaoPauloNight,
        payment_reference: 'REF-TZ-31AGO',
      })
      .expect(200);

    // 3. Consulta no PostgreSQL usando a conversão AT TIME ZONE 'America/Sao_Paulo'
    const rows = await prisma.$queryRaw<Array<{ local_date: string; local_month: number }>>`
      SELECT 
        (paid_at AT TIME ZONE 'America/Sao_Paulo')::date::text AS local_date,
        EXTRACT(MONTH FROM (paid_at AT TIME ZONE 'America/Sao_Paulo'))::int AS local_month
      FROM requests
      WHERE id = ${reqId};
    `;

    expect(rows[0].local_date).toBe('2026-08-31');
    expect(rows[0].local_month).toBe(8); // Agosto, e não setembro!
  });
});
