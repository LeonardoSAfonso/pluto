import { HttpExceptionFilter } from 'src/shared/filters/http-exception.filter';
import { HttpException, HttpStatus } from '@nestjs/common';
import AppError from 'src/shared/AppError';
import { Prisma } from '@prisma/client';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: any;
  let mockArgumentsHost: any;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockArgumentsHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => ({}),
      }),
    };
  });

  it('deve tratar HttpException padrão', () => {
    const exception = new HttpException('Bad Request Custom', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'Bad Request Custom',
      error: 'Internal Server Error',
    });
  });

  it('deve tratar HttpException com array de mensagens de validação', () => {
    const exception = new HttpException(
      { message: ['campo1 inválido', 'campo2 obrigatório'], error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'campo1 inválido; campo2 obrigatório',
      error: 'Bad Request',
    });
  });

  it('deve tratar AppError customizado', () => {
    const exception = new AppError('Solicitação não encontrada', 404);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 404,
      message: 'Solicitação não encontrada',
      error: 'AppError',
    });
  });

  it('deve tratar erro Prisma P2002 como 409 Conflict', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Unique failed', {
      code: 'P2002',
      clientVersion: '6.0.0',
    });

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 409,
      message: 'Registro duplicado: já existe uma solicitação com este CNPJ e número de nota fiscal.',
      error: 'Conflict',
    });
  });

  it('deve tratar erro Prisma P2025 como 404 Not Found', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Not found', {
      code: 'P2025',
      clientVersion: '6.0.0',
    });

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 404,
      message: 'Registro não encontrado.',
      error: 'Not Found',
    });
  });

  it('deve mascarar erro 500 genérico quando em ambiente de produção', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const exception = new Error('Falha catastrófica interna no banco');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });

    process.env.NODE_ENV = originalEnv;
  });
});
