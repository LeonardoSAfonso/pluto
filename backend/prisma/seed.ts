import { PrismaClient, Role, RequestStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import * as fs from 'fs';

function resolveDataDir(): string {
  if (process.env.DATA_DIR && fs.existsSync(process.env.DATA_DIR)) {
    return process.env.DATA_DIR;
  }
  const candidate1 = path.join(__dirname, '..', 'data');
  if (fs.existsSync(candidate1)) return candidate1;
  const candidate2 = path.join(__dirname, '..', '..', 'data');
  if (fs.existsSync(candidate2)) return candidate2;
  const candidate3 = path.join(process.cwd(), 'data');
  if (fs.existsSync(candidate3)) return candidate3;
  return candidate1;
}

const DATA_DIR = resolveDataDir();

function readJson<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo de dados não encontrado: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

interface SeedUser {
  id: string;
  name: string;
  email: string;
  role: 'REQUESTER' | 'FINANCE';
  seed_password: string;
}

interface SeedRequest {
  id: string;
  requester_id: string;
  supplier_name: string;
  supplier_cnpj: string;
  invoice_number: string;
  amount_cents: number;
  competence: string;
  due_date: string;
  category: string;
  description: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  rejection_reason: string | null;
  paid_at: string | null;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
}

interface SeedAuditEvent {
  id: string;
  request_id: string;
  actor_id: string;
  previous_status: string | null;
  new_status: string;
  reason: string | null;
  created_at: string;
}

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 10;

async function seedUsers(users: SeedUser[]): Promise<void> {
  console.log(`Inserindo ${users.length} usuários...`);
  for (const user of users) {
    const password_hash = await bcrypt.hash(user.seed_password, BCRYPT_ROUNDS);
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        password_hash,
        role: user.role as Role,
      },
      update: {
        name: user.name,
        email: user.email,
        role: user.role as Role,
      },
    });
  }
  console.log(`${users.length} usuários OK.`);
}

async function seedRequests(requests: SeedRequest[]): Promise<void> {
  console.log(`Inserindo ${requests.length} solicitações...`);
  for (const req of requests) {
    const data = {
      ...req,
      status: req.status as RequestStatus,
      due_date: new Date(req.due_date),
      paid_at: req.paid_at ? new Date(req.paid_at) : null,
      created_at: new Date(req.created_at),
      updated_at: new Date(req.updated_at),
    };
    await prisma.request.upsert({
      where: { id: req.id },
      create: data,
      update: data,
    });
  }
  console.log(`${requests.length} solicitações OK.`);
}

async function seedAuditEvents(events: SeedAuditEvent[]): Promise<void> {
  console.log(`Inserindo ${events.length} eventos de auditoria...`);
  for (const event of events) {
    await prisma.auditEvent.upsert({
      where: { id: event.id },
      create: {
        id: event.id,
        request_id: event.request_id,
        actor_id: event.actor_id,
        previous_status: event.previous_status as RequestStatus | null,
        new_status: event.new_status as RequestStatus,
        reason: event.reason,
        created_at: new Date(event.created_at),
      },
      update: {}, // Imutáveis — sem sobrescrita
    });
  }
  console.log(`${events.length} eventos de auditoria OK.`);
}

async function main(): Promise<void> {
  console.log('=== Seed GEX Finance Portal ===');
  const users = readJson<SeedUser[]>('seed_users.json');
  const requests = readJson<SeedRequest[]>('seed_requests.json');
  const auditEvents = readJson<SeedAuditEvent[]>('seed_audit_events.json');

  await seedUsers(users);
  await seedRequests(requests);
  await seedAuditEvents(auditEvents);
}

main()
  .catch((e) => {
    console.error('Seed falhou:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
