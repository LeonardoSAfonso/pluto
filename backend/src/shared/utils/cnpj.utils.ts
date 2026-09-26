import { cnpj } from 'cpf-cnpj-validator';
import AppError from '../AppError';

/**
 * Valida os dígitos verificadores do CNPJ e retorna os 14 caracteres limpos em maiúsculo.
 * Suporta o formato numérico tradicional e o novo formato alfanumérico da Receita Federal (Nota Técnica 49/2024).
 * Aceita com ou sem máscara: "11.222.333/0001-81", "11222333000181", "12.ABC.345/01DE-35" ou "12ABC34501DE35".
 * @throws AppError 400 se o CNPJ for inválido
 */
export function validateAndCleanCnpj(value: string): string {
  if (!value || typeof value !== 'string') {
    throw new AppError('CNPJ é obrigatório', 400);
  }

  const cleaned = cnpj.strip(value);

  if (cleaned.length !== 14 || !cnpj.isValid(cleaned)) {
    throw new AppError('CNPJ inválido (dígitos verificadores incorretos)', 400);
  }

  return cleaned;
}
