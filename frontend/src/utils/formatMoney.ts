/**
 * Utilitários Financeiros do Pluto (GEX Finance Portal)
 * Regra Crítica: A API e o Banco operam estritamente com amount_cents em número inteiro.
 */

/**
 * Converte valor em centavos inteiros para string BRL formatada.
 * Exemplo: 155313 -> "R$ 1.553,13" | 875049 -> "R$ 8.750,49"
 */
export function formatCentsToBRL(cents: number | null | undefined): string {
  if (cents === null || cents === undefined || isNaN(cents)) {
    return 'R$ 0,00';
  }

  const reais = cents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(reais);
}

/**
 * Converte valor em centavos inteiros para formato numérico brasileiro sem prefixo 'R$'.
 * Exemplo: 155313 -> "1.553,13"
 */
export function formatCentsToBRLWithoutPrefix(cents: number | null | undefined): string {
  if (cents === null || cents === undefined || isNaN(cents)) {
    return '0,00';
  }

  const reais = cents / 100;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(reais);
}

/**
 * Converte string no formato brasileiro (com ou sem 'R$') para número inteiro em centavos.
 * Exemplos obrigatórios testados:
 * - "1.553,13" -> 155313
 * - "0,01"     -> 1
 * - "10"       -> 1000
 * - "R$ 2.000,00" -> 200000
 */
export function parseBRLtoCents(value: string | number): number {
  if (typeof value === 'number') {
    return Math.round(value);
  }

  if (!value || typeof value !== 'string') {
    return 0;
  }

  const clean = value.trim().replace(/^R\$\s?/, '');

  if (!clean) return 0;

  // Se tiver vírgula, tratamos a vírgula como separador decimal
  if (clean.includes(',')) {
    const parts = clean.split(',');
    const integerPart = parts[0].replace(/\./g, '');
    let decimalPart = parts[1] || '';
    if (decimalPart.length > 2) {
      decimalPart = decimalPart.slice(0, 2);
    } else if (decimalPart.length === 1) {
      decimalPart = decimalPart + '0';
    } else if (decimalPart.length === 0) {
      decimalPart = '00';
    }
    const combined = `${integerPart}${decimalPart}`;
    const parsed = parseInt(combined, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Se não tiver vírgula, verificar se tem ponto decimal ou se é inteiro simples
  // Ex: "10" -> 1000 centavos
  const cleanNumber = clean.replace(/\./g, '');
  const parsed = parseInt(cleanNumber, 10);
  return isNaN(parsed) ? 0 : parsed * 100;
}
