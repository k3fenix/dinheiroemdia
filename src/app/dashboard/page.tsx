'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PeriodSelector, { MONTH_NAMES } from '@/components/dashboard/PeriodSelector';
import SummaryCards from '@/components/dashboard/SummaryCards';
import TransactionFormModal from '@/components/transactions/TransactionFormModal';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import { createClient } from '@/lib/supabase/client';
import { Category, Transaction, SavingsOpportunity, SavingsGoal, Profile } from '@/types/database';
import { formatCurrency, formatDateBR } from '@/lib/formatters';
import { Sparkles, ArrowRight, Plus, RefreshCw, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  // Estados de Sessão e Usuário
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados de Interface
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Período Selecionado (Mês 1-12 e Ano)
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());

  // Dados Financeiros
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [opportunities, setOpportunities] = useState<SavingsOpportunity[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [recurringTotal, setRecurringTotal] = useState(0);

  // Carrega Sessão Inicial
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Busca Perfil
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (prof) {
        setProfile(prof);
        // Aplica escala de fonte se houver
        if (prof.font_scale && prof.font_scale !== 'normal') {
          document.documentElement.setAttribute('data-font-scale', prof.font_scale);
        }
      }

      // Verifica papel de admin no servidor
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');
      setIsAdmin(!!(roles && roles.length > 0));

      // Busca categorias (do sistema ou do usuário)
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .or(`is_system.eq.true,user_id.eq.${user.id}`)
        .order('name');
      if (cats) setCategories(cats);

      setLoading(false);
    }
    checkAuth();
  }, [router, supabase]);

  // Carrega Dados Financeiros do Período Selecionado
  const loadPeriodData = useCallback(async () => {
    if (!user) return;

    const startOfMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
    const endOfMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // 1. Transações do Mês
    const { data: trans } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .gte('competence_date', startOfMonth)
      .lte('competence_date', endOfMonth)
      .order('competence_date', { ascending: false });

    if (trans) setTransactions(trans);

    // 2. Gastos Recorrentes Ativos
    const { data: recurring } = await supabase
      .from('recurring_expenses')
      .select('amount')
      .eq('user_id', user.id)
      .eq('active', true);

    const recTotal = (recurring || []).reduce((acc, curr) => acc + Number(curr.amount), 0);
    setRecurringTotal(recTotal);

    // 3. Oportunidades de Economia
    const { data: opps } = await supabase
      .from('savings_opportunities')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .neq('status', 'descartada')
      .order('created_at', { ascending: false });

    if (opps) setOpportunities(opps);

    // 4. Metas Financeiras
    const { data: goalsData } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (goalsData) setGoals(goalsData);
  }, [user, selectedMonth, selectedYear, supabase]);

  useEffect(() => {
    if (user) {
      loadPeriodData();
    }
  }, [user, loadPeriodData]);

  // Executa Detector de Economias
  const [runningDetector, setRunningDetector] = useState(false);
  const handleRunDetector = async () => {
    setRunningDetector(true);
    try {
      const res = await fetch('/api/savings-detector/run', { method: 'POST' });
      if (res.ok) {
        await loadPeriodData();
      }
    } finally {
      setRunningDetector(false);
    }
  };

  // Exclusão de Transação com Confirmação
  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Tem certeza de que deseja excluir este lançamento? Esta ação é definitiva.')) {
      return;
    }
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) {
      loadPeriodData();
    }
  };

  // Atualização de Status da Oportunidade
  const handleUpdateOpportunityStatus = async (id: string, newStatus: SavingsOpportunity['status']) => {
    const { error } = await supabase
      .from('savings_opportunities')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      loadPeriodData();
    }
  };

  // Registro de Economia Real Confirmada
  const handleRegisterSavings = async (id: string, confirmedAmount: number, notes: string) => {
    const { error } = await supabase
      .from('savings_opportunities')
      .update({
        confirmed_savings: confirmedAmount,
        status: 'confirmada',
        confirmed_at: new Date().toISOString(),
        user_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (!error) {
      loadPeriodData();
    }
  };

  // Cálculos do Painel
  const totalIncome = transactions
    .filter((t) => t.type === 'income' && t.status !== 'cancelada')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense' && t.status !== 'cancelada')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  const paidBillsTotal = transactions
    .filter((t) => t.type === 'expense' && t.status === 'paga')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const pendingBills = transactions.filter(
    (t) => t.type === 'expense' && (t.status === 'pendente' || t.status === 'prevista')
  );
  const pendingBillsTotal = pendingBills.reduce((acc, t) => acc + Number(t.amount), 0);

  const confirmedSavings = opportunities.reduce(
    (acc, o) => acc + Number(o.confirmed_savings || 0),
    0
  );

  const potentialSavings = opportunities
    .filter((o) => o.status !== 'confirmada')
    .reduce((acc, o) => acc + Number(o.potential_savings || 0), 0);

  const goalsProgressAverage = goals.length > 0
    ? Math.round(
        goals.reduce((acc, g) => acc + (g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0), 0) /
          goals.length
      )
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Carregando suas finanças com segurança...</p>
        </div>
      </div>
    );
  }

  const periodLabel = `${MONTH_NAMES[selectedMonth - 1]} de ${selectedYear}`;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar de Navegação */}
      <DashboardSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isAdmin={isAdmin}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          userName={profile?.full_name || user?.email}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNewTransaction={(type) => {
            setEditingTransaction(null);
            setModalType(type);
            setIsModalOpen(true);
          }}
          periodLabel={periodLabel}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Barra de Filtro de Período e Ações */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <PeriodSelector
              currentMonth={selectedMonth}
              currentYear={selectedYear}
              onChange={(m, y) => {
                setSelectedMonth(m);
                setSelectedYear(y);
              }}
            />

            <button
              type="button"
              onClick={handleRunDetector}
              disabled={runningDetector}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-amber-900 bg-amber-100/80 hover:bg-amber-200/80 border border-amber-300/80 transition touch-target"
            >
              <Sparkles className={`w-4 h-4 text-amber-600 ${runningDetector ? 'animate-spin' : ''}`} />
              <span>{runningDetector ? 'Analisando gastos...' : 'Buscar Oportunidades de Economia'}</span>
            </button>
          </div>

          {/* Cards com os 9 Indicadores Financeiros Obrigatórios */}
          <SummaryCards
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            balance={balance}
            paidBillsTotal={paidBillsTotal}
            pendingBillsTotal={pendingBillsTotal}
            pendingBillsCount={pendingBills.length}
            recurringTotal={recurringTotal}
            confirmedSavings={confirmedSavings}
            opportunitiesCount={opportunities.length}
            potentialSavings={potentialSavings}
            goalsProgressAverage={goalsProgressAverage}
            activeGoalsCount={goals.length}
          />

          {/* Oportunidades Recentes em Destaque */}
          {opportunities.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>Onde você pode economizar este mês</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Oportunidades calculadas exclusivamente a partir de seus registros
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opportunities.slice(0, 2).map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    onUpdateStatus={handleUpdateOpportunityStatus}
                    onRegisterSavings={handleRegisterSavings}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Lista de Transações do Mês */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Lançamentos de {periodLabel}
                </h3>
                <p className="text-xs text-slate-500">
                  {transactions.length} {transactions.length === 1 ? 'movimentação registrada' : 'movimentações registradas'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingTransaction(null);
                  setModalType('expense');
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Lançamento</span>
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Plus className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Nenhum lançamento cadastrado em {periodLabel}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Comece adicionando suas receitas ou despesas para visualizar o resumo financeiro deste mês.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTransaction(null);
                      setModalType('expense');
                      setIsModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition"
                  >
                    Adicionar primeira despesa
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Data</th>
                      <th className="py-3 px-4">Descrição</th>
                      <th className="py-3 px-4">Categoria</th>
                      <th className="py-3 px-4">Situação</th>
                      <th className="py-3 px-4 text-right">Valor</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {transactions.map((t) => {
                      const isIncome = t.type === 'income';
                      return (
                        <tr key={t.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4 text-xs text-slate-600 font-medium whitespace-nowrap">
                            {formatDateBR(t.competence_date)}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {t.description}
                            {t.notes && (
                              <span className="block text-[11px] text-slate-400 font-normal">
                                {t.notes}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600">
                            <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 font-medium">
                              {t.category?.name || 'Sem Categoria'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                t.status === 'paga'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : t.status === 'pendente'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : t.status === 'prevista'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {t.status.toUpperCase()}
                            </span>
                          </td>
                          <td className={`py-3.5 px-4 text-right font-black whitespace-nowrap ${
                            isIncome ? 'text-emerald-600' : 'text-slate-900'
                          }`}>
                            {isIncome ? '+' : '-'} {formatCurrency(t.amount)}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTransaction(t);
                                setIsModalOpen(true);
                              }}
                              className="text-xs font-semibold text-slate-600 hover:text-brand-600 transition"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTransaction(t.id)}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
                            >
                              Excluir
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal de Cadastro/Edição de Lançamento */}
      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => loadPeriodData()}
        initialType={modalType}
        categories={categories}
        editingTransaction={editingTransaction}
      />
    </div>
  );
}
