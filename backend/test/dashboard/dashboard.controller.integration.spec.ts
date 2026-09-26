/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as supertest from 'supertest';
const request = (supertest as any).default || supertest;
import { AppModule } from 'src/app.module';
import { HttpExceptionFilter } from 'src/shared/filters/http-exception.filter';
import { PrismaService } from 'src/orm/prisma.service';

describe('DashboardController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let financeToken: string;
  let anaToken: string;
  let brunoToken: string;

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

    // Garante isolamento: limpa registros criados dinamicamente por outros testes
    await prisma.$executeRawUnsafe(
      "DELETE FROM audit_events WHERE NOT (id LIKE '30000000-%');",
    );
    await prisma.$executeRawUnsafe(
      "DELETE FROM requests WHERE NOT (id LIKE '20000000-%');",
    );

    // Login com Financeiro (Fernanda)
    const finRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'financeiro@gex.test', password: 'GexFinance123!' });
    financeToken = finRes.body.accessToken;

    // Login com Ana Solicitante (id 10000000-0000-4000-8000-000000000001)
    const anaRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'solicitante@gex.test', password: 'GexRequester123!' });
    anaToken = anaRes.body.accessToken;

    // Login com Bruno Solicitante (id 10000000-0000-4000-8000-000000000002)
    const brunoRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'outro.solicitante@gex.test', password: 'GexRequester456!' });
    brunoToken = brunoRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /dashboard/summary - deve retornar os valores exatos do gabarito para FINANCE', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboard/summary')
      .set('Authorization', `Bearer ${financeToken}`)
      .expect(200);

    expect(res.body.reference_date).toBe('2026-09-18');
    expect(res.body.pending_amount_cents).toBe(875049);
    expect(res.body.approved_amount_cents).toBe(658599);
    expect(res.body.paid_this_month_amount_cents).toBe(841549);
    expect(res.body.overdue_count).toBe(4);
    expect(res.body.request_count).toBe(16);
    expect(res.body.status_counts).toEqual({
      PENDING: 5,
      APPROVED: 4,
      REJECTED: 2,
      PAID: 5,
    });
  });

  it('GET /dashboard/summary - deve retornar os valores exatos do gabarito para Ana Solicitante', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboard/summary')
      .set('Authorization', `Bearer ${anaToken}`)
      .expect(200);

    expect(res.body.reference_date).toBe('2026-09-18');
    expect(res.body.pending_amount_cents).toBe(194999);
    expect(res.body.approved_amount_cents).toBe(228500);
    expect(res.body.paid_this_month_amount_cents).toBe(273549);
    expect(res.body.overdue_count).toBe(2);
    expect(res.body.request_count).toBe(8);
    expect(res.body.status_counts).toEqual({
      PENDING: 3,
      APPROVED: 2,
      REJECTED: 1,
      PAID: 2,
    });
  });

  it('GET /dashboard/summary - deve retornar os valores exatos do gabarito para Bruno Solicitante', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboard/summary')
      .set('Authorization', `Bearer ${brunoToken}`)
      .expect(200);

    expect(res.body.reference_date).toBe('2026-09-18');
    expect(res.body.pending_amount_cents).toBe(680050);
    expect(res.body.approved_amount_cents).toBe(430099);
    expect(res.body.paid_this_month_amount_cents).toBe(568000);
    expect(res.body.overdue_count).toBe(2);
    expect(res.body.request_count).toBe(8);
    expect(res.body.status_counts).toEqual({
      PENDING: 2,
      APPROVED: 2,
      REJECTED: 1,
      PAID: 3,
    });
  });

  it('GET /dashboard/summary - deve retornar 401 sem autenticação', async () => {
    await request(app.getHttpServer()).get('/dashboard/summary').expect(401);
  });
});
