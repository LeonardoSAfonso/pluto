import { Injectable } from '@nestjs/common';
import RequestsRepository from '../repository';
import { AuthenticatedUserPayload } from 'src/auth/domain/auth-response.dto';
import { Role } from '@prisma/client';
import AppError from 'src/shared/AppError';

@Injectable()
export default class FindOneRequestService {
  constructor(private readonly repository: RequestsRepository) {}

  public async execute(id: string, currentUser: AuthenticatedUserPayload) {
    const request = await this.repository.findById(id);

    if (!request) {
      throw new AppError('Solicitação não encontrada', 404);
    }

    if (currentUser.role === Role.REQUESTER && request.requester_id !== currentUser.id) {
      throw new AppError('Acesso não autorizado a esta solicitação', 403);
    }

    return request;
  }
}
