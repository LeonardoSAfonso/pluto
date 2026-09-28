import '@testing-library/jest-dom';

// Mock do next/navigation para testes de componentes
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useParams() {
    return { id: '20000000-0000-4000-8000-000000000001' };
  },
  usePathname() {
    return '/requests';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock do react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));
