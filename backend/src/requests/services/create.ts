import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/orm/prisma.service';
import RequestsRepository from '../repository';
import { CreateRequestDTO } from '../domain/create-request.dto';
import { validateAndCleanCnpj } from 'src/shared/utils/cnpj.utils';
import AppError from 'src/shared/AppError';
import { Prisma, RequestStatus } from '@prisma/client';

@Injectable()
export default class CreateRequestService {
  constructor(
    private readonly repository: RequestsRepository,
    private readonly prisma: PrismaService,
  ) {}

  public async execute(data: CreateRequestDTO, requesterId: string) {
    const cleanedCnpj = validateAndCleanCnpj(data.supplier_cnpj);

    const existing = await this.repository.findByCnpjAndInvoice(
      cleanedCnpj,
      data.invoice_number,
    );

    if (existing) {
      throw new AppError(
        'Já existe uma solicitação cadastrada com este CNPJ e número de nota fiscal',
        409,
      );
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const createdRequest = await tx.request.create({
          data: {
            supplier_name: data.supplier_name.trim(),
            supplier_cnpj: cleanedCnpj,
            invoice_number: data.invoice_number.trim(),
            amount_cents: data.amount_cents,
            competence: data.competence.trim(),
            due_date: new Date(data.due_date),
            category: data.category.trim(),
            description: data.description ? data.description.trim() : null,
            status: RequestStatus.PENDING,
            requester_id: requesterId,
          },
        });

        await tx.auditEvent.create({
          data: {
            request_id: createdRequest.id,
            actor_id: requesterId,
            previous_status: null,
            new_status: RequestStatus.PENDING,
            reason: null,
          },
        });

        return createdRequest;
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError(
          'Já existe uma solicitação cadastrada com este CNPJ e número de nota fiscal',
          409,
        );
      }
      throw error;
    }
  }
}
