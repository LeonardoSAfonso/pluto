import { AuthController } from 'src/auth/auth.controller';
import LoginService from 'src/auth/services/login';
import { Role } from '@prisma/client';
import AppError from 'src/shared/AppError';

describe('AuthController (Unitário)', () => {
  let controller: AuthController;
  let mockLoginService: jest.Mocked<LoginService>;

  beforeEach(() => {
    mockLoginService = {
      execute: jest.fn(),
    } as any;

    controller = new AuthController(mockLoginService);
  });

  describe('login', () => {
    it('deve autenticar com sucesso e retornar token e usuário', async () => {
      const loginDto = {
        email: 'solicitante@gex.test',
        password: 'GexRequester123!',
      };

      const expectedResponse = {
        accessToken: 'mock-jwt-token',
        user: {
          id: '10000000-0000-4000-8000-000000000001',
          name: 'Ana Solicitante',
          email: 'solicitante@gex.test',
          role: Role.REQUESTER,
        },
      };

      mockLoginService.execute.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(mockLoginService.execute).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResponse);
    });

    it('deve propagar AppError quando o serviço de login rejeitar credenciais', async () => {
      const loginDto = {
        email: 'inexistente@gex.test',
        password: 'WrongPassword!',
      };

      mockLoginService.execute.mockRejectedValue(
        new AppError('E-mail ou senha inválidos', 401),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(AppError);
      expect(mockLoginService.execute).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('getProfile', () => {
    it('deve retornar o usuário autenticado recebido via CurrentUser', async () => {
      const currentUser = {
        id: '10000000-0000-4000-8000-000000000001',
        name: 'Ana Solicitante',
        email: 'solicitante@gex.test',
        role: Role.REQUESTER,
      };

      const result = await controller.getProfile(currentUser);

      expect(result).toEqual(currentUser);
      expect(result.role).toBe(Role.REQUESTER);
    });
  });
});
