/**
 * Converte valor monetário brasileiro (string ou número) para centavos (Int).
 * Formatos aceitos: "1.553,13", "0,01", "10", "R$ 2.000,00", 1553.13
 * @throws Error se o valor resultante for zero ou negativo
 */
export function parseBrlToCents(value: string | number): number {
  if (typeof value === 'number') {
    const cents = Math.round(value * 100);
    if (cents <= 0) throw new Error('Valor monetário deve ser maior que zero');
    return cents;
  }

  const cleaned = value.replace(/R\$\s*/g, '').trim();
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  const float = parseFloat(normalized);

  if (isNaN(float)) throw new Error(`Valor monetário inválido: "${value}"`);

  const cents = Math.round(float * 100);
  if (cents <= 0) throw new Error('Valor monetário deve ser maior que zero');

  return cents;
}

/**
 * Formata centavos para string no formato BRL.
 * Ex: 155313 → "R$ 1.553,13"
 */
export function formatCentsToDisplay(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
