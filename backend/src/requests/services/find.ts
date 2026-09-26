import { Injectable } from '@nestjs/common';
import RequestsRepository from '../repository';
import { QueryRequestsDTO } from '../domain/query-requests.dto';
import { AuthenticatedUserPayload } from 'src/auth/domain/auth-response.dto';
import { Role } from '@prisma/client';

@Injectable()
export default class FindRequestsService {
  constructor(private readonly repository: RequestsRepository) {}

  public async execute(params: QueryRequestsDTO, currentUser: AuthenticatedUserPayload) {
    const requesterIdScope =
      currentUser.role === Role.REQUESTER ? currentUser.id : undefined;

    return this.repository.find(params, requesterIdScope);
  }
}
