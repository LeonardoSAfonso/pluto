/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as supertest from 'supertest';
const request = (supertest as any).default || supertest;
import { AppModule } from 'src/app.module';
import { HttpExceptionFilter } from 'src/shared/filters/http-exception.filter';

describe('AuthController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login - deve autenticar usuário REQUESTER (Ana)', async () => {
    const response = await (request as any)(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'solicitante@gex.test',
        password: 'GexRequester123!',
      })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user.email).toBe('solicitante@gex.test');
    expect(response.body.user.role).toBe('REQUESTER');
  });

  it('POST /auth/login - deve autenticar usuário FINANCE (Fernanda)', async () => {
    const response = await (request as any)(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'financeiro@gex.test',
        password: 'GexFinance123!',
      })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user.email).toBe('financeiro@gex.test');
    expect(response.body.user.role).toBe('FINANCE');
  });

  it('POST /auth/login - deve retornar 401 para senha inválida', async () => {
    const response = await (request as any)(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'solicitante@gex.test',
        password: 'SenhaIncorreta!',
      })
      .expect(401);

    expect(response.body.message).toBe('E-mail ou senha inválidos');
  });

  it('POST /auth/login - deve retornar 400 para e-mail inválido', async () => {
    await (request as any)(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'nao-e-um-email',
        password: '123',
      })
      .expect(400);
  });

  it('GET /auth/me - deve retornar perfil do usuário com token válido', async () => {
    const loginRes = await (request as any)(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'solicitante@gex.test',
        password: 'GexRequester123!',
      });

    const token = loginRes.body.accessToken;

    const meRes = await (request as any)(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(meRes.body.email).toBe('solicitante@gex.test');
    expect(meRes.body.role).toBe('REQUESTER');
  });

  it('GET /auth/me - deve retornar 401 sem token Bearer', async () => {
    await (request as any)(app.getHttpServer()).get('/auth/me').expect(401);
  });
});
