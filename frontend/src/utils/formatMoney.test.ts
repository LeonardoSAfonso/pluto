import {
  formatCentsToBRL,
  formatCentsToBRLWithoutPrefix,
  parseBRLtoCents,
  maskCurrencyInput,
} from './formatMoney';

describe('formatMoney (Utilitários Financeiros)', () => {
  describe('formatCentsToBRL', () => {
    it('deve formatar centavos inteiros para moeda BRL corretamente', () => {
      // Usar normalize('NFKC') ou replace para lidar com non-breaking space do Intl no Node/Jest
      expect(formatCentsToBRL(155313).replace(/\u00a0/g, ' ')).toBe('R$ 1.553,13');
      expect(formatCentsToBRL(875049).replace(/\u00a0/g, ' ')).toBe('R$ 8.750,49');
      expect(formatCentsToBRL(100).replace(/\u00a0/g, ' ')).toBe('R$ 1,00');
      expect(formatCentsToBRL(1).replace(/\u00a0/g, ' ')).toBe('R$ 0,01');
    });

    it('deve retornar R$ 0,00 para valores nulos, indefinidos ou zero', () => {
      expect(formatCentsToBRL(0).replace(/\u00a0/g, ' ')).toBe('R$ 0,00');
      expect(formatCentsToBRL(null).replace(/\u00a0/g, ' ')).toBe('R$ 0,00');
      expect(formatCentsToBRL(undefined).replace(/\u00a0/g, ' ')).toBe('R$ 0,00');
      expect(formatCentsToBRL(NaN).replace(/\u00a0/g, ' ')).toBe('R$ 0,00');
    });
  });

  describe('formatCentsToBRLWithoutPrefix', () => {
    it('deve formatar centavos inteiros sem o prefixo R$', () => {
      expect(formatCentsToBRLWithoutPrefix(155313).replace(/\u00a0/g, ' ')).toBe('1.553,13');
      expect(formatCentsToBRLWithoutPrefix(1).replace(/\u00a0/g, ' ')).toBe('0,01');
      expect(formatCentsToBRLWithoutPrefix(0).replace(/\u00a0/g, ' ')).toBe('0,00');
    });
  });

  describe('parseBRLtoCents', () => {
    it('deve converter strings brasileiras para centavos inteiros', () => {
      expect(parseBRLtoCents('1.553,13')).toBe(155313);
      expect(parseBRLtoCents('0,01')).toBe(1);
      expect(parseBRLtoCents('10')).toBe(1000);
      expect(parseBRLtoCents('R$ 2.000,00')).toBe(200000);
      expect(parseBRLtoCents('R$ 0,50')).toBe(50);
      expect(parseBRLtoCents(125000)).toBe(125000);
    });

    it('deve retornar 0 para valores vazios ou inválidos', () => {
      expect(parseBRLtoCents('')).toBe(0);
      expect(parseBRLtoCents('   ')).toBe(0);
      expect(parseBRLtoCents(null as any)).toBe(0);
      expect(parseBRLtoCents(undefined as any)).toBe(0);
    });
  });

  describe('maskCurrencyInput', () => {
    it('deve aplicar máscara de moeda conforme o usuário digita', () => {
      expect(maskCurrencyInput('1').replace(/\u00a0/g, ' ')).toBe('0,01');
      expect(maskCurrencyInput('15').replace(/\u00a0/g, ' ')).toBe('0,15');
      expect(maskCurrencyInput('155').replace(/\u00a0/g, ' ')).toBe('1,55');
      expect(maskCurrencyInput('155313').replace(/\u00a0/g, ' ')).toBe('1.553,13');
    });

    it('deve retornar vazio se não houver dígitos', () => {
      expect(maskCurrencyInput('')).toBe('');
      expect(maskCurrencyInput('abc')).toBe('');
      expect(maskCurrencyInput(null)).toBe('');
    });
  });
});
