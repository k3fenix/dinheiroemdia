import { describe, it, expect } from 'vitest';
import { detectSavingsOpportunities } from '../lib/savings-detector';
import { Transaction } from '../types/database';

describe('Motor Determinístico de Economias — savings-detector', () => {
  it('deve identificar aumento expressivo em categoria comparando mês atual e anterior', () => {
    const prevTransactions: Transaction[] = [
      {
        id: 't-1',
        user_id: 'user-1',
        category_id: 'cat-delivery',
        type: 'expense',
        description: 'iFood Setembro',
        amount: 320,
        competence_date: '2026-09-15',
        status: 'paga',
        expense_type: 'variavel',
        created_at: '2026-09-15',
        updated_at: '2026-09-15',
        category: { id: 'cat-delivery', name: 'Restaurantes e Delivery', type: 'expense', icon: 'Coffee', color: '#f59e0b', is_system: true, created_at: '' },
      },
    ];

    const currentTransactions: Transaction[] = [
      {
        id: 't-2',
        user_id: 'user-1',
        category_id: 'cat-delivery',
        type: 'expense',
        description: 'iFood Outubro',
        amount: 420,
        competence_date: '2026-10-15',
        status: 'paga',
        expense_type: 'variavel',
        created_at: '2026-10-15',
        updated_at: '2026-10-15',
        category: { id: 'cat-delivery', name: 'Restaurantes e Delivery', type: 'expense', icon: 'Coffee', color: '#f59e0b', is_system: true, created_at: '' },
      },
    ];

    const opps = detectSavingsOpportunities({
      currentMonthTransactions: currentTransactions,
      previousMonthTransactions: prevTransactions,
      currentMonthName: 'Outubro de 2026',
      previousMonthName: 'Setembro de 2026',
    });

    expect(opps.length).toBe(1);
    expect(opps[0].opportunity_type).toBe('aumento_mensal');
    expect(opps[0].potential_savings).toBe(100);
    expect(opps[0].calculation_details.difference_pct).toBe(31.25);
  });

  it('deve sinalizar assinaturas marcadas para revisão', () => {
    const opps = detectSavingsOpportunities({
      currentMonthTransactions: [],
      previousMonthTransactions: [],
      currentMonthName: 'Outubro de 2026',
      previousMonthName: 'Setembro de 2026',
      recurringExpenses: [
        {
          id: 'rec-1',
          user_id: 'user-1',
          name: 'Streaming Antigo',
          amount: 55.90,
          frequency: 'mensal',
          active: true,
          marked_for_review: true,
          created_at: '',
        },
      ],
    });

    expect(opps.length).toBe(1);
    expect(opps[0].opportunity_type).toBe('assinatura_recorrente');
    expect(opps[0].potential_savings).toBe(55.90);
  });

  it('deve identificar suspeita de gastos duplicados em datas próximas para confirmação', () => {
    const currentTransactions: Transaction[] = [
      {
        id: 'dup-1',
        user_id: 'user-1',
        category_id: 'cat-farmacia',
        type: 'expense',
        description: 'Farmácia São Paulo',
        amount: 68.50,
        competence_date: '2026-10-10',
        status: 'paga',
        expense_type: 'variavel',
        created_at: '',
        updated_at: '',
      },
      {
        id: 'dup-2',
        user_id: 'user-1',
        category_id: 'cat-farmacia',
        type: 'expense',
        description: 'Farmácia São Paulo',
        amount: 68.50,
        competence_date: '2026-10-11',
        status: 'paga',
        expense_type: 'variavel',
        created_at: '',
        updated_at: '',
      },
    ];

    const opps = detectSavingsOpportunities({
      currentMonthTransactions: currentTransactions,
      previousMonthTransactions: [],
      currentMonthName: 'Outubro de 2026',
      previousMonthName: 'Setembro de 2026',
    });

    const dup = opps.find((o) => o.opportunity_type === 'despesa_duplicada');
    expect(dup).toBeDefined();
    expect(dup?.confidence_level).toBe('baixa'); // Baixa para pedir confirmação do usuário
  });
});
