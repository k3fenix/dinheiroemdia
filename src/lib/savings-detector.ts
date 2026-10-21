import { Transaction, Budget, BudgetCategory, RecurringExpense, SavingsGoal } from '@/types/database';
import { calculateVariance, calculatePotentialSavings } from './math/financial';
import { formatCurrency } from './formatters';

export interface DetectedOpportunityDraft {
  category_id?: string | null;
  title: string;
  description: string;
  opportunity_type: string;
  reference_period: string;
  reference_amount: number;
  target_amount: number;
  potential_savings: number;
  confirmed_savings: number;
  confidence_level: 'alta' | 'media' | 'baixa';
  calculation_details: Record<string, any>;
  action_suggested: string;
}

/**
 * Motor Analítico Determinístico de Economias
 * Analisa exclusivamente os dados cadastrados pelo usuário.
 */
export function detectSavingsOpportunities(params: {
  currentMonthTransactions: Transaction[];
  previousMonthTransactions: Transaction[];
  currentMonthName: string;
  previousMonthName: string;
  budgets?: (Budget & { budget_categories?: BudgetCategory[] }) | null;
  recurringExpenses?: RecurringExpense[];
  savingsGoals?: SavingsGoal[];
}): DetectedOpportunityDraft[] {
  const {
    currentMonthTransactions,
    previousMonthTransactions,
    currentMonthName,
    previousMonthName,
    budgets,
    recurringExpenses = [],
    savingsGoals = [],
  } = params;

  const opportunities: DetectedOpportunityDraft[] = [];

  // =========================================================================
  // 1. ANÁLISE DE AUMENTO DE GASTOS POR CATEGORIA (MÊS ATUAL VS MÊS ANTERIOR)
  // =========================================================================
  const currentCategoryTotals: Record<string, { name: string; id: string; total: number }> = {};
  const previousCategoryTotals: Record<string, { name: string; id: string; total: number }> = {};

  for (const t of currentMonthTransactions) {
    if (t.type === 'expense' && t.status !== 'cancelada') {
      const catId = t.category_id || 'sem_categoria';
      const catName = t.category?.name || 'Sem Categoria';
      if (!currentCategoryTotals[catId]) {
        currentCategoryTotals[catId] = { name: catName, id: catId, total: 0 };
      }
      currentCategoryTotals[catId].total += Number(t.amount);
    }
  }

  for (const t of previousMonthTransactions) {
    if (t.type === 'expense' && t.status !== 'cancelada') {
      const catId = t.category_id || 'sem_categoria';
      const catName = t.category?.name || 'Sem Categoria';
      if (!previousCategoryTotals[catId]) {
        previousCategoryTotals[catId] = { name: catName, id: catId, total: 0 };
      }
      previousCategoryTotals[catId].total += Number(t.amount);
    }
  }

  // Verifica categorias com aumento significativo (acima de R$ 50 e aumento > 15%)
  for (const [catId, currentData] of Object.entries(currentCategoryTotals)) {
    const prevData = previousCategoryTotals[catId];
    if (prevData && prevData.total > 0) {
      const variance = calculateVariance(currentData.total, prevData.total);
      
      if (variance.absolute > 50 && (variance.percentage ?? 0) >= 15) {
        // Meta sugerida realista: retornar ao patamar do mês anterior ou intermediário
        const suggestedTarget = prevData.total;
        const potential = calculatePotentialSavings(currentData.total, suggestedTarget);

        opportunities.push({
          category_id: catId === 'sem_categoria' ? null : catId,
          title: `Aumento de ${variance.percentage}% em ${currentData.name}`,
          description: `Seus gastos com ${currentData.name} foram de ${formatCurrency(prevData.total)} em ${previousMonthName} e subiram para ${formatCurrency(currentData.total)} em ${currentMonthName}. O aumento foi de ${formatCurrency(variance.absolute)}. Se você voltar ao valor do mês anterior, poderá economizar até ${formatCurrency(potential)}.`,
          opportunity_type: 'aumento_mensal',
          reference_period: `${currentMonthName} vs ${previousMonthName}`,
          reference_amount: currentData.total,
          target_amount: suggestedTarget,
          potential_savings: potential,
          confirmed_savings: 0,
          confidence_level: 'alta',
          action_suggested: `Definir um limite mensal de ${formatCurrency(suggestedTarget)} para ${currentData.name}.`,
          calculation_details: {
            formula: 'Gasto Atual - Gasto Mês Anterior',
            previous_value: prevData.total,
            current_value: currentData.total,
            difference_abs: variance.absolute,
            difference_pct: variance.percentage,
            target_reduction: potential,
          },
        });
      }
    }
  }

  // =========================================================================
  // 2. ASSINATURAS E GASTOS RECORRENTES MARCADOS PARA REVISÃO OU ATIVOS
  // =========================================================================
  for (const item of recurringExpenses) {
    if (item.active) {
      if (item.marked_for_review) {
        opportunities.push({
          category_id: item.category_id,
          title: `Revisão pendente: ${item.name}`,
          description: `Você marcou a assinatura recorrente "${item.name}" no valor de ${formatCurrency(item.amount)}/mês para revisão. Avalie se o serviço ainda é utilizado regularmente.`,
          opportunity_type: 'assinatura_recorrente',
          reference_period: 'Recorrência Ativa',
          reference_amount: item.amount,
          target_amount: 0,
          potential_savings: item.amount,
          confirmed_savings: 0,
          confidence_level: 'alta',
          action_suggested: 'Cancelar ou renegociar plano caso não esteja utilizando com frequência.',
          calculation_details: {
            service_name: item.name,
            monthly_cost: item.amount,
            annual_impact: Math.round(item.amount * 12 * 100) / 100,
          },
        });
      }
    }
  }

  // =========================================================================
  // 3. ESTOURO DE ORÇAMENTO PLANEJADO POR CATEGORIA
  // =========================================================================
  if (budgets && budgets.budget_categories) {
    for (const bCat of budgets.budget_categories) {
      const catId = bCat.category_id;
      const spent = currentCategoryTotals[catId]?.total || 0;
      const limit = Number(bCat.limit_amount);

      if (limit > 0 && spent > limit) {
        const excess = Math.round((spent - limit) * 100) / 100;
        const catName = bCat.category?.name || 'Categoria';

        opportunities.push({
          category_id: catId,
          title: `Orçamento ultrapassado em ${catName}`,
          description: `O limite planejado para ${catName} em ${currentMonthName} era ${formatCurrency(limit)}, mas os gastos realizados já atingiram ${formatCurrency(spent)} (excesso de ${formatCurrency(excess)}).`,
          opportunity_type: 'estouro_orcamento',
          reference_period: currentMonthName,
          reference_amount: spent,
          target_amount: limit,
          potential_savings: excess,
          confirmed_savings: 0,
          confidence_level: 'alta',
          action_suggested: `Conter novos gastos em ${catName} até o fechamento do mês para não ampliar o déficit.`,
          calculation_details: {
            limit_planned: limit,
            spent_realized: spent,
            overage: excess,
          },
        });
      }
    }
  }

  // =========================================================================
  // 4. SUSPEITA DE LANÇAMENTOS DUPLICADOS (REQUER CONFIRMAÇÃO DO USUÁRIO)
  // =========================================================================
  const expenseList = currentMonthTransactions.filter(
    (t) => t.type === 'expense' && t.status !== 'cancelada'
  );

  for (let i = 0; i < expenseList.length; i++) {
    for (let j = i + 1; j < expenseList.length; j++) {
      const a = expenseList[i];
      const b = expenseList[j];

      // Mesmo valor exato, mesma categoria e datas com até 2 dias de diferença
      if (a.amount === b.amount && a.category_id && a.category_id === b.category_id) {
        const dateA = new Date(a.competence_date).getTime();
        const dateB = new Date(b.competence_date).getTime();
        const diffDays = Math.abs(dateA - dateB) / (1000 * 60 * 60 * 24);

        if (diffDays <= 2 && a.description.toLowerCase().trim() === b.description.toLowerCase().trim()) {
          opportunities.push({
            category_id: a.category_id,
            title: `Possível despesa duplicada: "${a.description}"`,
            description: `Identificamos dois lançamentos idênticos de ${formatCurrency(a.amount)} na mesma categoria em datas muito próximas. Verifique se foram duas compras reais ou uma duplicidade acidental.`,
            opportunity_type: 'despesa_duplicada',
            reference_period: currentMonthName,
            reference_amount: a.amount,
            target_amount: 0,
            potential_savings: a.amount,
            confirmed_savings: 0,
            confidence_level: 'baixa',
            action_suggested: 'Confirmar os comprovantes e excluir o registro duplicado se for o caso.',
            calculation_details: {
              transaction_1_id: a.id,
              transaction_2_id: b.id,
              amount: a.amount,
              date_1: a.competence_date,
              date_2: b.competence_date,
            },
          });
        }
      }
    }
  }

  return opportunities;
}
