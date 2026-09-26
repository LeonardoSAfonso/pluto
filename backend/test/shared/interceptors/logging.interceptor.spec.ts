import { LoggingInterceptor, sanitizePayload } from 'src/shared/interceptors/logging.interceptor';
import { of, throwError } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
  });

  describe('sanitizePayload', () => {
    it('deve mascarar campos sensíveis como password, token, secret', () => {
      const payload = {
        email: 'user@test.com',
        password: 'SecretPassword123!',
        token: 'jwt-token-xyz',
        accessToken: 'bearer-token-123',
        authorization: 'Bearer abc',
        nested: {
          secret: 'nested-secret',
          safeField: 'safeValue',
        },
        list: [{ password: '123' }, { name: 'safe' }],
      };

      const result = sanitizePayload(payload);

      expect(result.email).toBe('user@test.com');
      expect(result.password).toBe('***REDACTED***');
      expect(result.token).toBe('***REDACTED***');
      expect(result.accessToken).toBe('***REDACTED***');
      expect(result.authorization).toBe('***REDACTED***');
      expect(result.nested.secret).toBe('***REDACTED***');
      expect(result.nested.safeField).toBe('safeValue');
      expect(result.list[0].password).toBe('***REDACTED***');
      expect(result.list[1].name).toBe('safe');
    });

    it('deve retornar tipos primitivos sem alteração', () => {
      expect(sanitizePayload(null)).toBeNull();
      expect(sanitizePayload(undefined)).toBeUndefined();
      expect(sanitizePayload('texto')).toBe('texto');
      expect(sanitizePayload(123)).toBe(123);
    });
  });

  describe('intercept', () => {
    it('deve ignorar requisições GET sem emitir log de auditoria', (done) => {
      const mockContext: any = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'GET',
            url: '/requests',
          }),
          getResponse: () => ({ statusCode: 200 }),
        }),
      };

      const mockCallHandler: any = {
        handle: () => of({ data: 'ok' }),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: (val) => {
          expect(val).toEqual({ data: 'ok' });
          done();
        },
      });
    });

    it('deve interceptar requisições POST e auditar com sucesso', (done) => {
      const mockContext: any = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            url: '/requests',
            body: { amount_cents: 1000, password: 'secret' },
            user: { id: 'user-1', role: 'FINANCE' },
            ip: '127.0.0.1',
          }),
          getResponse: () => ({ statusCode: 201 }),
        }),
      };

      const mockCallHandler: any = {
        handle: () => of({ id: 'req-1' }),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: (val) => {
          expect(val).toEqual({ id: 'req-1' });
          done();
        },
      });
    });

    it('deve capturar erro em requisições de escrita e registrar warning', (done) => {
      const mockContext: any = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            url: '/requests/123/decision',
            body: { action: 'APPROVE' },
            ip: '127.0.0.1',
          }),
          getResponse: () => ({ statusCode: 409 }),
        }),
      };

      const error = new Error('Conflito de estado');
      const mockCallHandler: any = {
        handle: () => throwError(() => error),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        error: (err) => {
          expect(err.message).toBe('Conflito de estado');
          done();
        },
      });
    });
  });
});
