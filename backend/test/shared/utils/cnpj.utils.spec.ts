import { validateAndCleanCnpj } from 'src/shared/utils/cnpj.utils';
import AppError from 'src/shared/AppError';

describe('validateAndCleanCnpj', () => {
  // CNPJ numérico tradicional
  const validNumericMasked = '11.222.333/0001-81';
  const validNumericClean = '11222333000181';

  // CNPJ alfanumérico (Nota Técnica RFB 49/2024)
  const validAlphaMasked = '12.ABC.345/01DE-35';
  const validAlphaClean = '12ABC34501DE35';

  describe('Formato Numérico Tradicional', () => {
    it('deve aceitar CNPJ numérico válido com máscara e retornar 14 dígitos', () => {
      expect(validateAndCleanCnpj(validNumericMasked)).toBe(validNumericClean);
    });

    it('deve aceitar CNPJ numérico válido sem máscara e retornar 14 dígitos', () => {
      expect(validateAndCleanCnpj(validNumericClean)).toBe(validNumericClean);
    });
  });

  describe('Novo Formato Alfanumérico da RFB (Nota Técnica 49/2024)', () => {
    it('deve aceitar CNPJ alfanumérico válido com máscara e retornar 14 caracteres', () => {
      expect(validateAndCleanCnpj(validAlphaMasked)).toBe(validAlphaClean);
    });

    it('deve aceitar CNPJ alfanumérico válido sem máscara e retornar 14 caracteres', () => {
      expect(validateAndCleanCnpj(validAlphaClean)).toBe(validAlphaClean);
    });

    it('deve normalizar letras minúsculas para maiúsculas', () => {
      expect(validateAndCleanCnpj('12.abc.345/01de-35')).toBe(validAlphaClean);
    });
  });

  describe('Validações de Erro', () => {
    it('deve lançar erro 400 para CNPJ numérico com dígitos verificadores inválidos', () => {
      expect(() => validateAndCleanCnpj('11.222.333/0001-99')).toThrow(AppError);
    });

    it('deve lançar erro 400 para CNPJ alfanumérico com dígitos verificadores inválidos', () => {
      expect(() => validateAndCleanCnpj('12.ABC.345/01DE-99')).toThrow(AppError);
    });

    it('deve lançar erro 400 para tamanho incorreto', () => {
      expect(() => validateAndCleanCnpj('123456')).toThrow(AppError);
    });

    it('deve lançar erro 400 para valor vazio', () => {
      expect(() => validateAndCleanCnpj('')).toThrow(AppError);
    });

    it('deve lançar erro 400 para valor nulo ou indefinido', () => {
      expect(() => validateAndCleanCnpj(null as any)).toThrow(AppError);
      expect(() => validateAndCleanCnpj(undefined as any)).toThrow(AppError);
    });
  });
});
