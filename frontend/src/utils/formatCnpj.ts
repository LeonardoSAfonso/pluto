import { cnpj } from 'cpf-cnpj-validator';

/**
 * Utilitários de CNPJ do Pluto (GEX Finance Portal)
 * Integrado diretamente com a biblioteca 'cpf-cnpj-validator', a mesma utilizada no backend NestJS.
 */

/**
 * Remove formatação e caracteres não numéricos do CNPJ utilizando a lib oficial.
 * Exemplo: "10.000.000/0001-45" -> "10000000000145"
 */
export function stripCnpjMask(value: string | null | undefined): string {
  if (!value) return '';
  return cnpj.strip(value);
}

/**
 * Aplica máscara dinâmica de CNPJ: XX.XXX.XXX/XXXX-XX
 * Conforme o usuário digita até 14 caracteres no input.
 */
export function applyCnpjMask(value: string | null | undefined): string {
  if (!value) return '';

  const clean = stripCnpjMask(value).slice(0, 14);

  if (clean.length <= 2) {
    return clean;
  }
  if (clean.length <= 5) {
    return `${clean.slice(0, 2)}.${clean.slice(2)}`;
  }
  if (clean.length <= 8) {
    return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
  }
  if (clean.length <= 12) {
    return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8)}`;
  }
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12, 14)}`;
}

/**
 * Valida o CNPJ utilizando a biblioteca 'cpf-cnpj-validator' (mesma validação do backend).
 * Retorna true se o CNPJ possuir 14 dígitos e dígitos verificadores válidos.
 */
export function isValidCnpj(value: string | null | undefined): boolean {
  if (!value) return false;
  return cnpj.isValid(value);
}

/**
 * Formata um CNPJ completo de 14 dígitos diretamente via lib cpf-cnpj-validator.
 */
export function formatCnpj(value: string | null | undefined): string {
  if (!value) return '';
  return cnpj.format(value);
}

export { cnpj };
