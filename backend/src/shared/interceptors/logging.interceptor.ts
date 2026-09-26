import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

const SENSITIVE_KEYS = new Set([
  'password',
  'seed_password',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'secret',
  'credit_card',
  'bank_account',
]);

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function sanitizePayload(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizePayload);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '***REDACTED***';
    } else {
      sanitized[key] = sanitizePayload(value);
    }
  }

  return sanitized;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditLogger');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const method = req.method;
    const url = req.originalUrl || req.url;

    // Apenas ações de escrita são auditadas; consultas e listagens (GET) são ignoradas
    if (!WRITE_METHODS.has(method.toUpperCase())) {
      return next.handle();
    }

    const startTime = Date.now();
    const user = (req as any).user;
    const actorInfo = user
      ? `actorId=${user.id || user.sub} role=${user.role}`
      : 'anonymous';

    const ip = req.ip || req.socket.remoteAddress;
    const sanitizedBody = sanitizePayload(req.body);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = res.statusCode;
          this.logger.log(
            `[AUDIT] ${method} ${url} status=${statusCode} duration=${duration}ms ${actorInfo} ip=${ip} payload=${JSON.stringify(sanitizedBody)}`,
          );
        },
        error: (err) => {
          const duration = Date.now() - startTime;
          const status = err.status || err.statusCode || 500;
          this.logger.warn(
            `[AUDIT-ERROR] ${method} ${url} status=${status} duration=${duration}ms ${actorInfo} ip=${ip} error=${err.message}`,
          );
        },
      }),
    );
  }
}
