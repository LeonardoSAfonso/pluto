import { renderHook, act } from '@testing-library/react';
import { useAuth } from './index';
import AuthService from '@/services/auth/auth.service';

jest.mock('@/services/auth/auth.service');

describe('useAuth Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('deve iniciar desautenticado quando localStorage estiver vazio', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
  });

  it('deve realizar login, armazenar sessão no localStorage e atualizar estado', async () => {
    const mockAuthResponse = {
      accessToken: 'fake-jwt-token',
      user: {
        id: '10000000-0000-4000-8000-000000000001',
        name: 'Ana Solicitante',
        email: 'solicitante@gex.test',
        role: 'REQUESTER' as const,
      },
    };

    (AuthService as jest.MockedClass<typeof AuthService>).prototype.login = jest
      .fn()
      .mockResolvedValue(mockAuthResponse);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({
        email: 'solicitante@gex.test',
        password: 'Password123!',
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.role).toBe('REQUESTER');
    expect(result.current.user?.name).toBe('Ana Solicitante');

    const stored = JSON.parse(localStorage.getItem('gex-user') || '{}');
    expect(stored.token).toBe('fake-jwt-token');
    expect(stored.email).toBe('solicitante@gex.test');
  });

  it('deve realizar logout, limpar estado e remover do localStorage', async () => {
    // Simular sessão existente
    localStorage.setItem(
      'gex-user',
      JSON.stringify({
        id: '10000000-0000-4000-8000-000000000001',
        name: 'Ana Solicitante',
        email: 'solicitante@gex.test',
        role: 'REQUESTER',
        token: 'fake-jwt-token',
      })
    );

    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('gex-user')).toBeNull();
  });
});
