import { AuthenticatedUser } from '@/types/api/auth.types';
import {
  RequestItem,
  RequestDetailItem,
  AuditEventItem,
} from '@/types/api/request.types';

export function createMockUser(
  overrides?: Partial<AuthenticatedUser>
): AuthenticatedUser {
  return {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'Ana Solicitante',
    email: 'solicitante@gex.test',
    role: 'REQUESTER',
    ...overrides,
  };
}

export function createMockRequest(
  overrides?: Partial<RequestItem>
): RequestItem {
  return {
    id: '20000000-0000-4000-8000-000000000001',
    requester_id: '10000000-0000-4000-8000-000000000001',
    supplier_name: 'Aurora Serviços Digitais',
    supplier_cnpj: '10000000000145',
    invoice_number: 'NF-2026-1001',
    amount_cents: 125000,
    competence: '2026-09',
    due_date: '2026-09-10',
    category: 'SOFTWARE',
    description: 'Serviços de consultoria em infraestrutura e nuvem.',
    status: 'PENDING',
    requester: createMockUser(),
    rejection_reason: null,
    paid_at: null,
    payment_reference: null,
    created_at: '2026-08-10T09:00:00-03:00',
    updated_at: '2026-08-10T09:00:00-03:00',
    ...overrides,
  };
}

export function createMockAuditEvent(
  overrides?: Partial<AuditEventItem>
): AuditEventItem {
  return {
    id: '30000000-0000-4000-8000-000000000001',
    request_id: '20000000-0000-4000-8000-000000000001',
    actor_id: '10000000-0000-4000-8000-000000000001',
    previous_status: null,
    new_status: 'PENDING',
    reason: null,
    created_at: '2026-08-10T09:00:00-03:00',
    actor: createMockUser(),
    ...overrides,
  };
}

export function createMockRequestDetail(
  overrides?: Partial<RequestDetailItem>
): RequestDetailItem {
  const base = createMockRequest(overrides);
  return {
    ...base,
    auditEvents: [createMockAuditEvent({ request_id: base.id })],
    ...overrides,
  };
}
