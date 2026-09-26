import {
  getReferenceDate,
  getMonthBoundaries,
  isDueDateOverdue,
  formatDateToBrl,
  formatCompetenceToDisplay,
} from 'src/shared/utils/date.utils';

describe('date.utils', () => {
  const originalEnv = process.env.APP_TODAY;

  afterEach(() => {
    process.env.APP_TODAY = originalEnv;
  });

  describe('getReferenceDate', () => {
    it('deve retornar APP_TODAY quando definida', () => {
      process.env.APP_TODAY = '2026-09-18';
      expect(getReferenceDate()).toBe('2026-09-18');
    });

    it('deve retornar data no formato YYYY-MM-DD quando APP_TODAY não estiver definida', () => {
      delete process.env.APP_TODAY;
      const refDate = getReferenceDate();
      expect(refDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getMonthBoundaries', () => {
    it('deve retornar primeiro e último dia do mês para setembro/2026', () => {
      const { startOfMonthDate, endOfMonthDate } = getMonthBoundaries('2026-09-18');
      expect(startOfMonthDate).toBe('2026-09-01');
      expect(endOfMonthDate).toBe('2026-09-30');
    });

    it('deve retornar primeiro e último dia do mês para fevereiro em ano bissexto (2024)', () => {
      const { startOfMonthDate, endOfMonthDate } = getMonthBoundaries('2024-02-10');
      expect(startOfMonthDate).toBe('2024-02-01');
      expect(endOfMonthDate).toBe('2024-02-29');
    });
  });

  describe('isDueDateOverdue', () => {
    const reference = '2026-09-18';

    it('deve retornar true para data anterior à data de referência', () => {
      expect(isDueDateOverdue('2026-09-17', reference)).toBe(true);
      expect(isDueDateOverdue('2026-08-31', reference)).toBe(true);
    });

    it('deve retornar false para data igual à data de referência (ainda no prazo)', () => {
      expect(isDueDateOverdue('2026-09-18', reference)).toBe(false);
    });

    it('deve retornar false para data posterior à data de referência', () => {
      expect(isDueDateOverdue('2026-09-19', reference)).toBe(false);
      expect(isDueDateOverdue('2026-10-01', reference)).toBe(false);
    });

    it('deve aceitar objeto Date', () => {
      const pastDate = new Date(2026, 8, 10); // 10 de setembro de 2026
      expect(isDueDateOverdue(pastDate, reference)).toBe(true);
    });
  });

  describe('formatDateToBrl', () => {
    it('deve formatar data ISO para o padrão DD/MM/YYYY', () => {
      expect(formatDateToBrl('2026-09-18T10:00:00.000Z')).toBe('18/09/2026');
    });

    it('deve retornar string vazia para data inválida ou vazia', () => {
      expect(formatDateToBrl('')).toBe('');
      expect(formatDateToBrl(null as any)).toBe('');
    });
  });

  describe('formatCompetenceToDisplay', () => {
    it('deve formatar "YYYY-MM" para "MM/YYYY"', () => {
      expect(formatCompetenceToDisplay('2026-09')).toBe('09/2026');
      expect(formatCompetenceToDisplay('2026-12')).toBe('12/2026');
    });

    it('deve retornar o próprio valor se não casar com formato YYYY-MM', () => {
      expect(formatCompetenceToDisplay('invalido')).toBe('invalido');
      expect(formatCompetenceToDisplay('')).toBe('');
    });
  });
});
