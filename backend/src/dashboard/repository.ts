import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/orm/prisma.service';
import { DashboardSummaryRaw } from './domain/dashboard-summary.dto';
import { APP_TIMEZONE } from 'src/shared/utils/date.utils';

@Injectable()
export default class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async getSummary(
    referenceDate: string,
    startOfMonthDate: string,
    endOfMonthDate: string,
    requesterIdScope?: string,
  ): Promise<DashboardSummaryRaw> {
    const scopeParam = requesterIdScope || null;

    const rows = await this.prisma.$queryRaw<DashboardSummaryRaw[]>`
      SELECT
        COUNT(*)::int AS request_count,
        COALESCE(SUM(CASE WHEN status::text = 'PENDING' THEN amount_cents ELSE 0 END), 0)::int AS pending_amount_cents,
        COALESCE(SUM(CASE WHEN status::text = 'APPROVED' THEN amount_cents ELSE 0 END), 0)::int AS approved_amount_cents,
        COALESCE(SUM(CASE
          WHEN status::text = 'PAID'
           AND (paid_at AT TIME ZONE ${APP_TIMEZONE})::date >= ${startOfMonthDate}::date
           AND (paid_at AT TIME ZONE ${APP_TIMEZONE})::date <= ${endOfMonthDate}::date
          THEN amount_cents ELSE 0 END), 0)::int AS paid_this_month_amount_cents,
        COUNT(CASE
          WHEN status::text IN ('PENDING', 'APPROVED') AND due_date < ${referenceDate}::date
          THEN 1 END)::int AS overdue_count,
        COUNT(CASE WHEN status::text = 'PENDING' THEN 1 END)::int AS pending_count,
        COUNT(CASE WHEN status::text = 'APPROVED' THEN 1 END)::int AS approved_count,
        COUNT(CASE WHEN status::text = 'REJECTED' THEN 1 END)::int AS rejected_count,
        COUNT(CASE WHEN status::text = 'PAID' THEN 1 END)::int AS paid_count
      FROM requests
      WHERE (${scopeParam}::text IS NULL OR requester_id = ${scopeParam}::text)
    `;

    return (
      rows[0] || {
        request_count: 0,
        pending_amount_cents: 0,
        approved_amount_cents: 0,
        paid_this_month_amount_cents: 0,
        overdue_count: 0,
        pending_count: 0,
        approved_count: 0,
        rejected_count: 0,
        paid_count: 0,
      }
    );
  }
}
