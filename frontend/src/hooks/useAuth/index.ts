'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/services/auth/auth.service';
import { LoginCredentials, UserRole, UserSession } from '@/types/api/auth.types';
import { toast } from 'react-toastify';

const STORAGE_KEY_USER = 'gex-user';

const getStoredSession = (): UserSession | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.id && (parsed.token || parsed.accessToken)) {
      return {
        id: parsed.id,
        name: parsed.name,
        email: parsed.email,
        role: parsed.role,
        token: parsed.token || parsed.accessToken,
      };
    }
    return null;
  } catch {
    localStorage.removeItem(STORAGE_KEY_USER);
    return null;
  }
};

export const useAuth = () => {
  const router = useRouter();
  const authService = useMemo(() => new AuthService(), []);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [session, setSession] = useState<UserSession | null>(() => getStoredSession());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getStoredSession());

  const user = session;
  const role: UserRole | null = session?.role || null;

  const login = async (credentials: LoginCredentials): Promise<UserSession> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);

      if (!response || !response.accessToken || !response.user) {
        throw new Error('Resposta de autenticação inválida.');
      }

      const newSession: UserSession = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        token: response.accessToken,
      };

      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newSession));
      setSession(newSession);
      setIsAuthenticated(true);

      toast.success(`Bem-vindo(a), ${newSession.name}!`);
      return newSession;
    } catch (err: unknown) {
      let message = 'E-mail ou senha incorretos.';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        if (axiosErr.response?.data?.message) {
          message = axiosErr.response.data.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
    setSession(null);
    setIsAuthenticated(false);
    setError(null);
    router.push('/auth/login');
  }, [router]);

  const getUserSession = useCallback((): UserSession | null => {
    return getStoredSession();
  }, []);

  // Multi-tab sync and storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_USER) {
        const updated = getStoredSession();
        setSession(updated);
        setIsAuthenticated(!!updated);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);

  return {
    login,
    logout,
    getUserSession,
    user,
    role,
    isAuthenticated,
    loading,
    error,
  };
};

export default useAuth;
