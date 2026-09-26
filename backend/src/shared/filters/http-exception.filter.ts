import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import AppError from '../AppError';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        const body = exceptionResponse as Record<string, unknown>;
        message = Array.isArray(body.message)
          ? (body.message as string[]).join('; ')
          : (body.message as string) || message;
        error = (body.error as string) || error;
      }
    } else if (exception instanceof AppError) {
      status = exception.statusCode;
      message = exception.message;
      error = exception.name;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = 'Registro duplicado: já existe uma solicitação com este CNPJ e número de nota fiscal.';
        error = 'Conflict';
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Registro não encontrado.';
        error = 'Not Found';
      } else {
        status = HttpStatus.BAD_REQUEST;
        message = `Erro de banco de dados: ${exception.code}`;
        error = 'Bad Request';
      }
    } else if (exception instanceof Error) {
      if (process.env.NODE_ENV === 'production') {
        message = 'Internal server error';
      } else {
        message = exception.message;
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
    });
  }
}
