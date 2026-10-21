'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PeriodSelector, { MONTH_NAMES } from '@/components/dashboard/PeriodSelector';
import BudgetProgressBar from '@/components/budgets/BudgetProgressBar';
import { createClient } from '@/lib/supabase/client';
import { Category, Budget, BudgetCategory, Transaction, Profile } from '@/types/database';
import { formatCurrency } from '@/lib/formatters';
import { PiggyBank, Copy, Save, AlertCircle } from 'lucide-react';

export default function OrcamentoPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [categories, setCategories] = useState<Category[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [budgetCategories, setBudgetCategories] = useState<Record<string, number>>({});
  const [categoryExpenses, setCategoryExpenses] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (prof) setProfile(prof);

      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin');
      setIsAdmin(!!(roles && roles.length > 0));

      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .or(`is_system.eq.true,user_id.eq.${user.id}`)
        .in('type', ['expense', 'both'])
        .order('name');
      if (cats) setCategories(cats);

      setLoading(false);
    }
    init();
  }, [router, supabase]);

  const loadBudgetData = useCallback(async () => {
    if (!user) return;
    setSavedSuccess(false);

    // 1. Busca orçamento cadastrado do mês
    const { data: b } = await supabase
      .from('budgets')
      .select('*, budget_categories(*)')
      .eq('user_id', user.id)
      .eq('month', selectedMonth)
      .eq('year', selectedYear)
      .maybeSingle();

    setBudget(b || null);

    const limitsMap: Record<string, number> = {};
    if (b && b.budget_categories) {
      for (const bc of b.budget_categories) {
        limitsMap[bc.category_id] = Number(bc.limit_amount);
      }
    }
    setBudgetCategories(limitsMap);

    // 2. Busca gastos reais realizados no mês por categoria
    const start = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
    const end = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const { data: trans } = await supabase
      .from('transactions')
      .select('category_id, amount')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .neq('status', 'cancelada')
      .gte('competence_date', start)
      .lte('competence_date', end);

    const spentMap: Record<string, number> = {};
    for (const t of trans || []) {
      const cId = t.category_id || 'sem_categoria';
      spentMap[cId] = (spentMap[cId] || 0) + Number(t.amount);
    }
    setCategoryExpenses(spentMap);
  }, [user, selectedMonth, selectedYear, supabase]);

  useEffect(() => {
    if (user) loadBudgetData();
  }, [user, loadBudgetData]);

  const handleLimitChange = (catId: string, val: string) => {
    const num = parseFloat(val.replace(',', '.')) || 0;
    setBudgetCategories((prev) => ({ ...prev, [catId]: num }));
  };

  const handleSaveBudget = async () => {
    if (!user) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      const totalLimit = Object.values(budgetCategories).reduce((acc, curr) => acc + curr, 0);

      // Upsert do Orçamento principal
      const { data: bData, error: bError } = await supabase
        .from('budgets')
        .upsert(
          {
            user_id: user.id,
            month: selectedMonth,
            year: selectedYear,
            total_limit: totalLimit,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,month,year' }
        )
        .select()
        .single();

      if (bError) throw bError;

      // Limpa e reinsere os limites por categoria
      await supabase.from('budget_categories').delete().eq('budget_id', bData.id);

      const items = Object.entries(budgetCategories)
        .filter(([_, limit]) => limit > 0)
        .map(([catId, limit]) => ({
          budget_id: bData.id,
          category_id: catId,
          limit_amount: limit,
        }));

      if (items.length > 0) {
        await supabase.from('budget_categories').insert(items);
      }

      setSavedSuccess(true);
      loadBudgetData();
    } finally {
      setSaving(false);
    }
  };

  // Copiar do mês anterior
  const handleCopyPreviousMonth = async () => {
    if (!user) return;
    const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

    const { data: prevBudget } = await supabase
      .from('budgets')
      .select('*, budget_categories(*)')
      .eq('user_id', user.id)
      .eq('month', prevMonth)
      .eq('year', prevYear)
      .maybeSingle();

    if (!prevBudget || !prevBudget.budget_categories || prevBudget.budget_categories.length === 0) {
      alert(`Nenhum orçamento encontrado em ${MONTH_NAMES[prevMonth - 1]} de ${prevYear} para copiar.`);
      return;
    }

    const copiedLimits: Record<string, number> = {};
    for (const bc of prevBudget.budget_categories) {
      copiedLimits[bc.category_id] = Number(bc.limit_amount);
    }
    setBudgetCategories(copiedLimits);
    alert(`Limites de ${MONTH_NAMES[prevMonth - 1]} copiados com sucesso! Clique em "Salvar Orçamento" para confirmar.`);
  };

  const totalPlanned = Object.values(budgetCategories).reduce((acc, curr) => acc + curr, 0);
  const totalActual = Object.values(categoryExpenses).reduce((acc, curr) => acc + curr, 0);
  const periodLabel = `${MONTH_NAMES[selectedMonth - 1]} de ${selectedYear}`;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} isAdmin={isAdmin} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          userName={profile?.full_name || user?.email}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNewTransaction={() => router.push('/dashboard')}
          periodLabel={periodLabel}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
                <PiggyBank className="w-6 h-6 text-brand-600" />
                <span>Planejamento de Orçamento Mensal</span>
              </h1>
              <p className="text-xs text-slate-500">
                Defina tetos por categoria e receba alertas automáticos aos 50%, 80% e 100%
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <PeriodSelector currentMonth={selectedMonth} currentYear={selectedYear} onChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }} />
              <button
                type="button"
                onClick={handleCopyPreviousMonth}
                className="inline-flex items-center space-x-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Mês Anterior</span>
              </button>
              <button
                type="button"
                onClick={handleSaveBudget}
                disabled={saving}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Gravando...' : 'Salvar Orçamento'}</span>
              </button>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-2">
              <span>✓ Orçamento do mês atualizado com sucesso no banco de dados!</span>
            </div>
          )}

          {/* Cards Comparativos do Mês */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Orçamento Total Planejado</span>
              <p className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(totalPlanned)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Realizado (Gastos Reais)</span>
              <p className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(totalActual)}</p>
            </div>
            <div className={`p-5 rounded-2xl border shadow-2xs ${
              totalActual > totalPlanned && totalPlanned > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
            }`}>
              <span className="text-xs font-bold uppercase tracking-wider block text-slate-700">Saldo do Orçamento</span>
              <p className={`text-2xl font-black mt-2 ${totalActual > totalPlanned && totalPlanned > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                {formatCurrency(totalPlanned - totalActual)}
              </p>
            </div>
          </div>

          {/* Barras de Progresso e Edição de Limites */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Limites e Consumo por Categoria em {periodLabel}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => {
                const limit = budgetCategories[cat.id] || 0;
                const spent = categoryExpenses[cat.id] || 0;
                return (
                  <div key={cat.id} className="space-y-2">
                    <BudgetProgressBar
                      categoryName={cat.name}
                      limitAmount={limit}
                      spentAmount={spent}
                    />
                    <div className="flex items-center space-x-2 text-xs">
                      <label className="text-slate-500 font-medium">Ajustar limite (R$):</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={limit === 0 ? '' : limit.toString()}
                        onChange={(e) => handleLimitChange(cat.id, e.target.value)}
                        placeholder="0,00"
                        className="w-24 px-2 py-1 text-xs font-bold rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
