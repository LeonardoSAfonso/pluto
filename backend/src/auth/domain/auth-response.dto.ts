import { Role } from '@prisma/client';

export interface AuthenticatedUserPayload {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponseDTO {
  accessToken: string;
  user: AuthenticatedUserPayload;
}
