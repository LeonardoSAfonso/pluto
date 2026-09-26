import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/orm/prisma.service';
import { DecisionDTO } from '../domain/decision.dto';
import { AuthenticatedUserPayload } from 'src/auth/domain/auth-response.dto';
import AppError from 'src/shared/AppError';
import { Request, RequestStatus } from '@prisma/client';

@Injectable()
export default class DecideRequestService {
  constructor(private readonly prisma: PrismaService) {}

  public async execute(
    requestId: string,
    data: DecisionDTO,
    actor: AuthenticatedUserPayload,
  ) {
    if (data.action === 'REJECT') {
      if (!data.reason || data.reason.trim() === '') {
        throw new AppError('O motivo da rejeição é obrigatório', 422);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Lock de linha atômico contra race conditions
      const lockedRows = await tx.$queryRaw<Request[]>`
        SELECT * FROM requests WHERE id = ${requestId} FOR UPDATE
      `;

      const request = lockedRows[0];
      if (!request) {
        throw new AppError('Solicitação não encontrada', 404);
      }

      // Máquina de estados: apenas PENDING pode ser aprovada ou rejeitada
      if (request.status !== RequestStatus.PENDING) {
        throw new AppError(
          `Transição de status inválida. Solicitação já se encontra em status ${request.status}`,
          409,
        );
      }

      const newStatus =
        data.action === 'APPROVE' ? RequestStatus.APPROVED : RequestStatus.REJECTED;

      const updated = await tx.request.update({
        where: { id: requestId },
        data: {
          status: newStatus,
          rejection_reason: data.action === 'REJECT' ? data.reason!.trim() : null,
          updated_at: new Date(),
        },
      });

      await tx.auditEvent.create({
        data: {
          request_id: requestId,
          actor_id: actor.id,
          previous_status: request.status,
          new_status: newStatus,
          reason: data.reason ? data.reason.trim() : null,
        },
      });

      return updated;
    });
  }
}
