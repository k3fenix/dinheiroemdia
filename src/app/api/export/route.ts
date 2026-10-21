import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Busca todos os dados do usuário respeitando RLS
    const [profileRes, transactionsRes, categoriesRes, budgetsRes, goalsRes, opportunitiesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('transactions').select('*').eq('user_id', user.id).order('competence_date', { ascending: false }),
      supabase.from('categories').select('*').eq('user_id', user.id),
      supabase.from('budgets').select('*, budget_categories(*)').eq('user_id', user.id),
      supabase.from('savings_goals').select('*, goal_contributions(*)').eq('user_id', user.id),
      supabase.from('savings_opportunities').select('*').eq('user_id', user.id),
    ]);

    const exportBundle = {
      export_date: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
      profile: profileRes.data,
      categories: categoriesRes.data || [],
      transactions: transactionsRes.data || [],
      budgets: budgetsRes.data || [],
      savings_goals: goalsRes.data || [],
      savings_opportunities: opportunitiesRes.data || [],
    };

    const format = req.nextUrl.searchParams.get('format');
    if (format === 'csv') {
      // Exportação em formato CSV simplificado de transações
      const headers = ['Data de Competencia', 'Descricao', 'Tipo', 'Valor', 'Status', 'Tipo de Gasto', 'Notas'];
      const rows = (transactionsRes.data || []).map((t) => [
        t.competence_date,
        `"${t.description.replace(/"/g, '""')}"`,
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.amount,
        t.status,
        t.expense_type,
        `"${(t.notes || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="cade-meu-dinheiro-transacoes-${user.id.slice(0, 8)}.csv"`,
        },
      });
    }

    return new NextResponse(JSON.stringify(exportBundle, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="cade-meu-dinheiro-dados-${user.id.slice(0, 8)}.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro na exportação de dados' }, { status: 500 });
  }
}
