import { parseBrlToCents, formatCentsToDisplay } from 'src/shared/utils/money.utils';

describe('parseBrlToCents', () => {
  it('deve converter "1.553,13" para 155313', () => {
    expect(parseBrlToCents('1.553,13')).toBe(155313);
  });

  it('deve converter "0,01" para 1', () => {
    expect(parseBrlToCents('0,01')).toBe(1);
  });

  it('deve converter "10" para 1000', () => {
    expect(parseBrlToCents('10')).toBe(1000);
  });

  it('deve converter "R$ 2.000,00" para 200000', () => {
    expect(parseBrlToCents('R$ 2.000,00')).toBe(200000);
  });

  it('deve converter número float para centavos', () => {
    expect(parseBrlToCents(1553.13)).toBe(155313);
  });

  it('deve lançar erro para valor zero', () => {
    expect(() => parseBrlToCents('0,00')).toThrow();
  });

  it('deve lançar erro para valor negativo', () => {
    expect(() => parseBrlToCents('-10,00')).toThrow();
  });

  it('deve lançar erro para string inválida', () => {
    expect(() => parseBrlToCents('abc')).toThrow();
  });
});

describe('formatCentsToDisplay', () => {
  it('deve formatar 155313 contendo "1.553,13"', () => {
    expect(formatCentsToDisplay(155313)).toContain('1.553,13');
  });

  it('deve formatar 1 centavo corretamente', () => {
    expect(formatCentsToDisplay(1)).toContain('0,01');
  });
});
