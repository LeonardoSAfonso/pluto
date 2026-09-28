/**
 * Utilitários de Data e Horário no fuso horário oficial (America/Sao_Paulo)
 * Regra Crítica: Datas e logs de auditoria devem sempre respeitar America/Sao_Paulo.
 */

const TIMEZONE_SP = 'America/Sao_Paulo';

/**
 * Formata data e horário para exibição no padrão brasileiro com fuso de São Paulo.
 * Exemplo: 2026-08-15T10:00:00-03:00 -> "15/08/2026 às 10:00"
 */
export function formatDateTimeSP(value: string | Date | null | undefined): string {
  if (!value) return '—';

  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '—';

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIMEZONE_SP,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);

  const formattedTime = new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIMEZONE_SP,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);

  return `${formattedDate} às ${formattedTime}`;
}

/**
 * Formata apenas a data para exibição no padrão brasileiro com fuso de São Paulo.
 * Exemplo: 2026-09-10 -> "10/09/2026"
 */
export function formatDateSP(value: string | Date | null | undefined): string {
  if (!value) return '—';

  // Se já for uma string YYYY-MM-DD simples, tratar timezone para não regredir dia
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIMEZONE_SP,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Formata competência do formato de armazenamento (AAAA-MM) para visualização (MM/AAAA).
 * Exemplo: "2026-09" -> "09/2026"
 */
export function formatCompetence(competence: string | null | undefined): string {
  if (!competence) return '—';
  if (/^\d{4}-\d{2}$/.test(competence)) {
    const [year, month] = competence.split('-');
    return `${month}/${year}`;
  }
  return competence;
}

/**
 * Verifica se uma solicitação está vencida com base na data de referência do sistema.
 */
export function isOverdue(
  dueDate: string | Date | null | undefined,
  status: string,
  referenceDate: string = '2026-09-18'
): boolean {
  if (!dueDate || status === 'PAID') return false;

  let dueStr = '';
  if (typeof dueDate === 'string') {
    dueStr = dueDate.slice(0, 10);
  } else if (dueDate instanceof Date) {
    dueStr = dueDate.toISOString().slice(0, 10);
  }

  return dueStr < referenceDate;
}
