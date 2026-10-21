/**
 * Utilitários de formatação para padrões financeiros e de data brasileiros (BRL e DD/MM/AAAA)
 */

export function formatCurrency(value: number | string | null | undefined): string {
  const numeric = typeof value === 'string' ? parseFloat(value) : (value ?? 0);
  if (isNaN(numeric)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function formatDateBR(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput + (dateInput.length === 10 ? 'T12:00:00' : '')) : dateInput;
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return '-';
  }
}

export function formatDateTimeBR(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '-';
  }
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'Sem base anterior comparável';
  }
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`;
}

export function parseCurrencyInput(val: string): number {
  if (!val) return 0;
  // Remove R$, espaços, pontos de milhar e troca vírgula por ponto
  const clean = val.replace(/[^\d,-]/g, '').replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}
