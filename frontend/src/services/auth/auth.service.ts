import BaseService from '../base.service';
import { AuthResponseDTO, AuthenticatedUser, LoginCredentials } from '@/types/api/auth.types';

export class AuthService extends BaseService {
  public async login(credentials: LoginCredentials): Promise<AuthResponseDTO> {
    const { data } = await this.api.post<AuthResponseDTO>('/auth/login', credentials);
    return data;
  }

  public async getProfile(): Promise<AuthenticatedUser> {
    const { data } = await this.api.get<AuthenticatedUser>('/auth/me');
    return data;
  }
}

export default AuthService;
