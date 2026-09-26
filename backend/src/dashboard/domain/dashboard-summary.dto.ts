export interface StatusCountsDTO {
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
  PAID: number;
}

export interface DashboardSummaryDTO {
  pending_amount_cents: number;
  approved_amount_cents: number;
  paid_this_month_amount_cents: number;
  overdue_count: number;
  request_count: number;
  status_counts: StatusCountsDTO;
  reference_date: string;
}

export interface DashboardSummaryRaw {
  request_count: number;
  pending_amount_cents: number;
  approved_amount_cents: number;
  paid_this_month_amount_cents: number;
  overdue_count: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  paid_count: number;
}
