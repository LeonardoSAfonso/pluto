import { Injectable } from '@nestjs/common';
import DashboardRepository from '../repository';
import { AuthenticatedUserPayload } from 'src/auth/domain/auth-response.dto';
import { DashboardSummaryDTO } from '../domain/dashboard-summary.dto';
import { Role } from '@prisma/client';
import { getReferenceDate, getMonthBoundaries } from 'src/shared/utils/date.utils';

@Injectable()
export default class GetDashboardSummaryService {
  constructor(private readonly repository: DashboardRepository) {}

  public async execute(currentUser: AuthenticatedUserPayload): Promise<DashboardSummaryDTO> {
    const referenceDate = getReferenceDate();
    const { startOfMonthDate, endOfMonthDate } = getMonthBoundaries(referenceDate);

    const requesterIdScope =
      currentUser.role === Role.REQUESTER ? currentUser.id : undefined;

    const raw = await this.repository.getSummary(
      referenceDate,
      startOfMonthDate,
      endOfMonthDate,
      requesterIdScope,
    );

    return {
      pending_amount_cents: raw.pending_amount_cents,
      approved_amount_cents: raw.approved_amount_cents,
      paid_this_month_amount_cents: raw.paid_this_month_amount_cents,
      overdue_count: raw.overdue_count,
      request_count: raw.request_count,
      status_counts: {
        PENDING: raw.pending_count,
        APPROVED: raw.approved_count,
        REJECTED: raw.rejected_count,
        PAID: raw.paid_count,
      },
      reference_date: referenceDate,
    };
  }
}
