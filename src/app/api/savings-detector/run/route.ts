import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { detectSavingsOpportunities } from '@/lib/savings-detector';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12

    // Mês anterior
    const prevDate = new Date(today);
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = prevDate.getMonth() + 1;

    // Formata nomes legíveis
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const currentMonthName = `${monthNames[currentMonth - 1]} de ${currentYear}`;
    const previousMonthName = `${monthNames[prevMonth - 1]} de ${prevYear}`;

    // Busca transações dos dois meses
    const startOfPrev = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
    const endOfCurrent = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

    const [transRes, recurringRes, budgetsRes, existingOppsRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .gte('competence_date', startOfPrev)
        .lte('competence_date', endOfCurrent),
      supabase
        .from('recurring_expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true),
      supabase
        .from('budgets')
        .select('*, budget_categories(*, category:categories(*))')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .maybeSingle(),
      supabase
        .from('savings_opportunities')
        .select('id, title, opportunity_type, status')
        .eq('user_id', user.id),
    ]);

    const allTransactions = transRes.data || [];
    const currentTransactions = allTransactions.filter((t) => {
      const parts = t.competence_date.split('-');
      return parseInt(parts[0], 10) === currentYear && parseInt(parts[1], 10) === currentMonth;
    });

    const previousTransactions = allTransactions.filter((t) => {
      const parts = t.competence_date.split('-');
      return parseInt(parts[0], 10) === prevYear && parseInt(parts[1], 10) === prevMonth;
    });

    const detected = detectSavingsOpportunities({
      currentMonthTransactions: currentTransactions,
      previousMonthTransactions: previousTransactions,
      currentMonthName,
      previousMonthName,
      budgets: budgetsRes.data,
      recurringExpenses: recurringRes.data || [],
    });

    const existingTitles = new Set((existingOppsRes.data || []).map((o) => o.title));
    const toInsert = detected.filter((d) => !existingTitles.has(d.title));

    if (toInsert.length > 0) {
      const rows = toInsert.map((item) => ({
        user_id: user.id,
        category_id: item.category_id,
        title: item.title,
        description: item.description,
        opportunity_type: item.opportunity_type,
        reference_period: item.reference_period,
        reference_amount: item.reference_amount,
        target_amount: item.target_amount,
        potential_savings: item.potential_savings,
        confirmed_savings: item.confirmed_savings,
        confidence_level: item.confidence_level,
        status: 'nova',
        calculation_details: item.calculation_details,
      }));

      const { error: insertError } = await supabase.from('savings_opportunities').insert(rows);
      if (insertError) {
        throw insertError;
      }
    }

    return NextResponse.json({
      success: true,
      foundCount: detected.length,
      newInsertedCount: toInsert.length,
    });
  } catch (error: any) {
    console.error('[API Savings Detector] Erro:', error);
    return NextResponse.json({ error: error.message || 'Falha ao executar detector' }, { status: 500 });
  }
}
