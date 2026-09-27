import axios, { AxiosInstance } from 'axios';

const STORAGE_KEY_USER = 'gex-user';

export class ApiService {
  private static axiosInstance: AxiosInstance | null = null;

  private constructor() {
    // Private constructor prevents direct instantiation
  }

  private static initializeInstance(token?: string): AxiosInstance {
    const instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request Interceptor: injects JWT Bearer token
    instance.interceptors.request.use(
      (config) => {
        let activeToken = token;

        if (!activeToken && typeof window !== 'undefined') {
          try {
            const rawUser = localStorage.getItem(STORAGE_KEY_USER);
            if (rawUser) {
              const parsed = JSON.parse(rawUser);
              activeToken = parsed?.token || parsed?.accessToken;
            }
          } catch {
            // ignore JSON parse errors
          }
        }

        if (activeToken) {
          config.headers.Authorization = `Bearer ${activeToken}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: handles 401 Unauthorized
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY_USER);
            if (!window.location.pathname.startsWith('/auth')) {
              window.location.href = '/auth/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );

    ApiService.axiosInstance = instance;
    return instance;
  }

  public static getInstance(token?: string): AxiosInstance {
    if (!ApiService.axiosInstance || token) {
      return ApiService.initializeInstance(token);
    }
    return ApiService.axiosInstance as AxiosInstance;
  }

  public static resetInstance(): void {
    ApiService.axiosInstance = null;
  }
}

export default ApiService;
