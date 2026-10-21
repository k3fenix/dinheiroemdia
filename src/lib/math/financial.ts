/**
 * Módulo de Cálculos Financeiros Determinísticos
 * Todas as fórmulas seguem regras matemáticas explícitas, sem valores inventados.
 */

export interface VarianceResult {
  absolute: number;
  percentage: number | null;
  explanation: string;
}

/**
 * Calcula variação absoluta e percentual entre dois períodos
 * Se previousValue <= 0, percentage é null com explicação explícita para evitar falsas métricas.
 */
export function calculateVariance(currentValue: number, previousValue: number): VarianceResult {
  const current = Number(currentValue) || 0;
  const previous = Number(previousValue) || 0;
  const absolute = Math.round((current - previous) * 100) / 100;

  if (previous <= 0) {
    return {
      absolute,
      percentage: null,
      explanation: previous === 0 
        ? 'Sem base anterior positiva para cálculo percentual (gasto anterior foi R$ 0,00).'
        : 'Base anterior inválida ou negativa.',
    };
  }

  const rawPct = ((current - previous) / previous) * 100;
  const percentage = Math.round(rawPct * 100) / 100;

  return {
    absolute,
    percentage,
    explanation: `Variação de ${absolute >= 0 ? '+' : ''}${absolute} (${percentage >= 0 ? '+' : ''}${percentage}%) em relação à base de referência de ${previous}.`,
  };
}

/**
 * Economia Potencial Estimada:
 * Gasto de referência menos o gasto-meta estabelecido, limitado a zero quando não há economia.
 */
export function calculatePotentialSavings(referenceAmount: number, targetAmount: number): number {
  const ref = Number(referenceAmount) || 0;
  const target = Number(targetAmount) || 0;
  const potential = ref - target;
  return potential > 0 ? Math.round(potential * 100) / 100 : 0;
}

/**
 * Economia Efetiva Confirmada:
 * Gasto de referência comprovado menos o gasto real atingido no período apurado.
 */
export function calculateEffectiveSavings(referenceAmount: number, actualRealizedAmount: number): number {
  const ref = Number(referenceAmount) || 0;
  const actual = Number(actualRealizedAmount) || 0;
  const savings = ref - actual;
  return savings > 0 ? Math.round(savings * 100) / 100 : 0;
}

/**
 * Progresso de Metas Financeiras
 */
export function calculateGoalProgress(currentAmount: number, targetAmount: number): {
  percentage: number;
  remainingAmount: number;
  isCompleted: boolean;
} {
  const current = Number(currentAmount) || 0;
  const target = Number(targetAmount) || 0;

  if (target <= 0) {
    return { percentage: 0, remainingAmount: 0, isCompleted: false };
  }

  const percentage = Math.min(100, Math.round((current / target) * 1000) / 10);
  const remaining = Math.max(0, Math.round((target - current) * 100) / 100);

  return {
    percentage,
    remainingAmount: remaining,
    isCompleted: current >= target,
  };
}

/**
 * Análise de Limite de Orçamento
 * Classifica o consumo: normal (<50%), atenção (50%-79%), alerta (80%-99%), estourado (>=100%)
 */
export function evaluateBudgetThreshold(spentAmount: number, limitAmount: number): {
  percentage: number;
  status: 'normal' | 'alerta_50' | 'alerta_80' | 'estourado';
  remaining: number;
} {
  const spent = Number(spentAmount) || 0;
  const limit = Number(limitAmount) || 0;

  if (limit <= 0) {
    return { percentage: 0, status: 'normal', remaining: 0 };
  }

  const rawPct = (spent / limit) * 100;
  const percentage = Math.round(rawPct * 10) / 10;
  const remaining = Math.round((limit - spent) * 100) / 100;

  let status: 'normal' | 'alerta_50' | 'alerta_80' | 'estourado' = 'normal';
  if (percentage >= 100) {
    status = 'estourado';
  } else if (percentage >= 80) {
    status = 'alerta_80';
  } else if (percentage >= 50) {
    status = 'alerta_50';
  }

  return { percentage, status, remaining };
}
