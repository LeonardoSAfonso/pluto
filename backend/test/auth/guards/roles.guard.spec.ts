import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';
import AppError from 'src/shared/AppError';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    guard = new RolesGuard(reflector);
  });

  function createMockContext(userRole?: Role): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: userRole ? { id: 'uuid-1', role: userRole } : null,
        }),
      }),
    } as any;
  }

  it('deve permitir quando nenhuma role for exigida', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createMockContext(Role.REQUESTER);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('deve permitir quando usuário tem a role exigida', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.FINANCE]);
    const context = createMockContext(Role.FINANCE);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('deve lançar 403 quando usuário não tem a role exigida', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.FINANCE]);
    const context = createMockContext(Role.REQUESTER);

    expect(() => guard.canActivate(context)).toThrow(AppError);
    try {
      guard.canActivate(context);
    } catch (e: any) {
      expect(e.statusCode).toBe(403);
    }
  });
});
