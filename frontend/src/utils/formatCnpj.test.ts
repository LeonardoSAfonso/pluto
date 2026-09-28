import {
  isValidCnpj,
  stripCnpjMask,
  applyCnpjMask,
  formatCnpj,
} from './formatCnpj';

describe('formatCnpj (Validações e Máscaras de CNPJ)', () => {
  describe('isValidCnpj', () => {
    it('deve retornar true para CNPJs válidos com ou sem máscara', () => {
      expect(isValidCnpj('10.000.000/0001-45')).toBe(true);
      expect(isValidCnpj('10000000000145')).toBe(true);
      expect(isValidCnpj('10000000000226')).toBe(true);
      expect(isValidCnpj('10.000.000/0003-07')).toBe(true);
    });

    it('deve retornar false para CNPJs com dígitos verificadores incorretos', () => {
      expect(isValidCnpj('10.000.000/0001-99')).toBe(false);
      expect(isValidCnpj('10000000000199')).toBe(false);
    });

    it('deve retornar false para sequências de dígitos repetidos conhecidas', () => {
      expect(isValidCnpj('11.111.111/1111-11')).toBe(false);
      expect(isValidCnpj('00000000000000')).toBe(false);
      expect(isValidCnpj('22222222222222')).toBe(false);
    });

    it('deve retornar false para valores vazios, incompletos ou nulos', () => {
      expect(isValidCnpj('')).toBe(false);
      expect(isValidCnpj('12345')).toBe(false);
      expect(isValidCnpj(null as any)).toBe(false);
      expect(isValidCnpj(undefined as any)).toBe(false);
    });
  });

  describe('stripCnpjMask', () => {
    it('deve remover toda a pontuação mantendo apenas os caracteres alfanuméricos', () => {
      expect(stripCnpjMask('10.000.000/0001-45')).toBe('10000000000145');
      expect(stripCnpjMask('10.000.000/0002-26')).toBe('10000000000226');
      expect(stripCnpjMask('')).toBe('');
      expect(stripCnpjMask(null)).toBe('');
    });
  });

  describe('applyCnpjMask', () => {
    it('deve formatar progressivamente conforme o usuário digita', () => {
      expect(applyCnpjMask('10')).toBe('10');
      expect(applyCnpjMask('10000')).toBe('10.000');
      expect(applyCnpjMask('10000000')).toBe('10.000.000');
      expect(applyCnpjMask('100000000001')).toBe('10.000.000/0001');
      expect(applyCnpjMask('10000000000145')).toBe('10.000.000/0001-45');
    });

    it('deve retornar vazio se a entrada for vazia ou nula', () => {
      expect(applyCnpjMask('')).toBe('');
      expect(applyCnpjMask(null)).toBe('');
    });
  });

  describe('formatCnpj', () => {
    it('deve formatar CNPJ completo de 14 dígitos', () => {
      expect(formatCnpj('10000000000145')).toBe('10.000.000/0001-45');
    });
  });
});
