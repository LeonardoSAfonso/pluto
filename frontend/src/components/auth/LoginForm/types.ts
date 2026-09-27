import { UserSession } from '@/types/api/auth.types';

export interface LoginFormProps {
  onSuccess?: (session: UserSession) => void;
  className?: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}
