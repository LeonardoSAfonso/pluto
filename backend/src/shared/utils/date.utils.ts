import { toZonedTime, format } from 'date-fns-tz';
import { startOfMonth, endOfMonth, parseISO, startOfDay } from 'date-fns';

export const APP_TIMEZONE = 'America/Sao_Paulo';

/**
 * Retorna a data de referência no formato "YYYY-MM-DD".
 * Usa process.env.APP_TODAY se definida; caso contrário, calcula a data atual em America/Sao_Paulo.
 */
export function getReferenceDate(): string {
  const envDate = process.env.APP_TODAY;
  if (envDate && /^\d{4}-\d{2}-\d{2}$/.test(envDate)) {
    return envDate;
  }

  const now = new Date();
  const zonedNow = toZonedTime(now, APP_TIMEZONE);
  return format(zonedNow, 'yyyy-MM-dd', { timeZone: APP_TIMEZONE });
}

/**
 * Retorna as datas de início e fim do mês correspondente à data de referência ("YYYY-MM-DD").
 * Ex: "2026-09-18" -> { startOfMonthDate: "2026-09-01", endOfMonthDate: "2026-09-30" }
 */
export function getMonthBoundaries(referenceDateString: string): {
  startOfMonthDate: string;
  endOfMonthDate: string;
} {
  const [year, month, day] = referenceDateString.split('-').map(Number);
  const baseDate = new Date(year, month - 1, day);

  const start = startOfMonth(baseDate);
  const end = endOfMonth(baseDate);

  return {
    startOfMonthDate: format(start, 'yyyy-MM-dd'),
    endOfMonthDate: format(end, 'yyyy-MM-dd'),
  };
}

/**
 * Verifica se uma solicitação está vencida com base em sua data de vencimento e na data de referência.
 * Uma solicitação está vencida quando due_date < referenceDate (comparação pura de datas, sem hora).
 */
export function isDueDateOverdue(
  dueDate: string | Date,
  referenceDateString?: string,
): boolean {
  const refDateStr = referenceDateString || getReferenceDate();
  const [refYear, refMonth, refDay] = refDateStr.split('-').map(Number);
  const refDateStart = new Date(refYear, refMonth - 1, refDay);

  let targetDate: Date;
  if (typeof dueDate === 'string') {
    const [dYear, dMonth, dDay] = dueDate.split('T')[0].split('-').map(Number);
    targetDate = new Date(dYear, dMonth - 1, dDay);
  } else {
    targetDate = startOfDay(dueDate);
  }

  return targetDate.getTime() < refDateStart.getTime();
}

/**
 * Formata uma data para o padrão brasileiro "DD/MM/YYYY".
 */
export function formatDateToBrl(date: string | Date): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  const zoned = toZonedTime(d, APP_TIMEZONE);
  return format(zoned, 'dd/MM/yyyy', { timeZone: APP_TIMEZONE });
}

/**
 * Formata competência "YYYY-MM" para o padrão exibível "MM/YYYY".
 * Exemplo: "2026-09" -> "09/2026"
 */
export function formatCompetenceToDisplay(competence: string): string {
  if (!competence || !/^\d{4}-\d{2}$/.test(competence)) {
    return competence;
  }
  const [year, month] = competence.split('-');
  return `${month}/${year}`;
}
