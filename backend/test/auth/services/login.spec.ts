import LoginService from 'src/auth/services/login';
import UserRepository from 'src/users/repository';
import { JwtService } from '@nestjs/jwt';
import AppError from 'src/shared/AppError';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

describe('LoginService', () => {
  let service: LoginService;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
    } as any;

    jwtService = {
      signAsync: jest.fn(),
    } as any;

    service = new LoginService(userRepository, jwtService);
  });

  it('deve autenticar usuário com credenciais corretas', async () => {
    const passwordHash = await bcrypt.hash('Senha123!', 10);
    const mockUser = {
      id: 'uuid-1',
      name: 'Ana Solicitante',
      email: 'solicitante@gex.test',
      password_hash: passwordHash,
      role: Role.REQUESTER,
      created_at: new Date(),
    };

    userRepository.findByEmail.mockResolvedValue(mockUser);
    jwtService.signAsync.mockResolvedValue('jwt-mock-token');

    const result = await service.execute({
      email: 'solicitante@gex.test',
      password: 'Senha123!',
    });

    expect(result.accessToken).toBe('jwt-mock-token');
    expect(result.user).toEqual({
      id: 'uuid-1',
      name: 'Ana Solicitante',
      email: 'solicitante@gex.test',
      role: Role.REQUESTER,
    });
    expect((result.user as any).password_hash).toBeUndefined();
  });

  it('deve lançar 401 para e-mail não encontrado', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      service.execute({
        email: 'inexistente@gex.test',
        password: 'Senha123!',
      }),
    ).rejects.toThrow(new AppError('E-mail ou senha inválidos', 401));
  });

  it('deve lançar 401 para senha incorreta', async () => {
    const passwordHash = await bcrypt.hash('SenhaCorreta123!', 10);
    userRepository.findByEmail.mockResolvedValue({
      id: 'uuid-1',
      name: 'Ana Solicitante',
      email: 'solicitante@gex.test',
      password_hash: passwordHash,
      role: Role.REQUESTER,
      created_at: new Date(),
    });

    await expect(
      service.execute({
        email: 'solicitante@gex.test',
        password: 'SenhaErrada!',
      }),
    ).rejects.toThrow(new AppError('E-mail ou senha inválidos', 401));
  });
});
