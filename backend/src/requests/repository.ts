import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/orm/prisma.service';
import { Prisma, Request } from '@prisma/client';
import { QueryRequestsDTO } from './domain/query-requests.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable()
export default class RequestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async findByCnpjAndInvoice(
    supplier_cnpj: string,
    invoice_number: string,
  ): Promise<Request | null> {
    return this.prisma.request.findUnique({
      where: {
        supplier_cnpj_invoice_number: {
          supplier_cnpj,
          invoice_number,
        },
      },
    });
  }

  public async findById(id: string) {
    return this.prisma.request.findUnique({
      where: { id },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        auditEvents: {
          orderBy: { created_at: 'asc' },
          include: {
            actor: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  public async find(
    params: QueryRequestsDTO,
    requesterIdScope?: string,
  ): Promise<PaginatedResult<any>> {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.RequestWhereInput = {};

    if (requesterIdScope) {
      where.requester_id = requesterIdScope;
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.supplier_name) {
      where.supplier_name = {
        contains: params.supplier_name,
        mode: 'insensitive',
      };
    }

    if (params.due_date_from || params.due_date_to) {
      where.due_date = {};
      if (params.due_date_from) {
        where.due_date.gte = new Date(params.due_date_from);
      }
      if (params.due_date_to) {
        where.due_date.lte = new Date(params.due_date_to);
      }
    }

    const [total, data] = await Promise.all([
      this.prisma.request.count({ where }),
      this.prisma.request.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
