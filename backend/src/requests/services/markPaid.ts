import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/orm/prisma.service';
import { MarkPaidDTO } from '../domain/mark-paid.dto';
import { AuthenticatedUserPayload } from 'src/auth/domain/auth-response.dto';
import AppError from 'src/shared/AppError';
import { Request, RequestStatus } from '@prisma/client';

@Injectable()
export default class MarkPaidRequestService {
  constructor(private readonly prisma: PrismaService) {}

  public async execute(
    requestId: string,
    data: MarkPaidDTO,
    actor: AuthenticatedUserPayload,
  ) {
    if (!data.payment_reference || data.payment_reference.trim() === '') {
      throw new AppError('A referência do pagamento é obrigatória', 400);
    }

    if (!data.paid_at || isNaN(Date.parse(data.paid_at))) {
      throw new AppError('Data de pagamento inválida', 400);
    }

    return this.prisma.$transaction(async (tx) => {
      const lockedRows = await tx.$queryRaw<Request[]>`
        SELECT * FROM requests WHERE id = ${requestId} FOR UPDATE
      `;

      const request = lockedRows[0];
      if (!request) {
        throw new AppError('Solicitação não encontrada', 404);
      }

      if (request.status !== RequestStatus.APPROVED) {
        throw new AppError(
          `Apenas solicitações com status APPROVED podem ser marcadas como pagas. Status atual: ${request.status}`,
          409,
        );
      }

      const updated = await tx.request.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.PAID,
          paid_at: new Date(data.paid_at),
          payment_reference: data.payment_reference.trim(),
          updated_at: new Date(),
        },
      });

      await tx.auditEvent.create({
        data: {
          request_id: requestId,
          actor_id: actor.id,
          previous_status: RequestStatus.APPROVED,
          new_status: RequestStatus.PAID,
          reason: data.payment_reference.trim(),
        },
      });

      return updated;
    });
  }
}
