export type UserRole = 'REQUESTER' | 'FINANCE';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  accessToken: string;
  user: AuthenticatedUser;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}
