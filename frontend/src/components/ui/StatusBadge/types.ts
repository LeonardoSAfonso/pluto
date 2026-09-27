export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';

export interface StatusBadgeProps {
  status: RequestStatus;
  isOverdue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
