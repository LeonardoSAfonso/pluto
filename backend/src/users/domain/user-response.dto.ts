import { Role } from '@prisma/client';

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: Date;
}
