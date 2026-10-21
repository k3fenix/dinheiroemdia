'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { createClient } from '@/lib/supabase/client';
import { Transaction, SavingsOpportunity, Profile } from '@/types/database';
import { formatCurrency, formatDateBR } from '@/lib/formatters';
import { BarChart3, Download, Calendar, TrendingUp, TrendingDown, Award } from 'lucide-react';

export default function RelatoriosPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [opportunities, setOpportunities] = useState<SavingsOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterPeriod, setFilterPeriod] = useState<'30d' | '90d' | 'year' | 'all'>('90d');

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

      setLoading(false);
    }
    init();
  }, [router, supabase]);

  const loadData = useCallback(async () => {
    if (!user) return;

    let startDate = new Date();
    if (filterPeriod === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (filterPeriod === '90d') startDate.setDate(startDate.getDate() - 90);
    else if (filterPeriod === 'year') startDate.setFullYear(startDate.getFullYear() - 1);
    else startDate = new Date(2020, 0, 1);

    const startStr = startDate.toISOString().split('T')[0];

    const [transRes, oppsRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .gte('competence_date', startStr)
        .order('competence_date', { ascending: false }),
      supabase
        .from('savings_opportunities')
        .select('*')
        .eq('user_id', user.id),
    ]);

    if (transRes.data) setTransactions(transRes.data);
    if (oppsRes.data) setOpportunities(oppsRes.data);
  }, [user, filterPeriod, supabase]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  // Cálculos do Relatório
  const totalIncome = transactions
    .filter((t) => t.type === 'income' && t.status !== 'cancelada')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense' && t.status !== 'cancelada')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalConfirmedSavings = opportunities.reduce(
    (acc, o) => acc + Number(o.confirmed_savings || 0),
    0
  );

  const totalPotentialSavings = opportunities
    .filter((o) => o.status !== 'confirmada')
    .reduce((acc, o) => acc + Number(o.potential_savings || 0), 0);

  // Distribuição por Categoria
  const categoryMap: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type === 'expense' && t.status !== 'cancelada') {
      const name = t.category?.name || 'Sem Categoria';
      categoryMap[name] = (categoryMap[name] || 0) + Number(t.amount);
    }
  }

  const categorySorted = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} isAdmin={isAdmin} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          userName={profile?.full_name || user?.email}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNewTransaction={() => router.push('/dashboard')}
          periodLabel="Relatórios Financeiros"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-brand-600" />
                <span>Relatórios e Evolução Financeira</span>
              </h1>
              <p className="text-xs text-slate-500">
                Visualize seus fluxos consolidados e exporte relatórios para seu controle
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setFilterPeriod('30d')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    filterPeriod === '30d' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  30 dias
                </button>
                <button
                  type="button"
                  onClick={() => setFilterPeriod('90d')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    filterPeriod === '90d' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  3 meses
                </button>
                <button
                  type="button"
                  onClick={() => setFilterPeriod('year')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    filterPeriod === 'year' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  1 ano
                </button>
              </div>

              <a
                href="/api/export?format=csv"
                download
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 shadow-2xs transition"
              >
                <Download className="w-4 h-4 text-brand-600" />
                <span>Exportar CSV</span>
              </a>
            </div>
          </div>

          {/* Cards de Resumo Consolidado */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Entradas Totais</span>
              <p className="text-xl font-black text-emerald-600 mt-2">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Saídas Totais</span>
              <p className="text-xl font-black text-slate-900 mt-2">{formatCurrency(totalExpense)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Saldo do Período</span>
              <p className={`text-xl font-black mt-2 ${totalIncome >= totalExpense ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatCurrency(totalIncome - totalExpense)}
              </p>
            </div>
            <div className="bg-emerald-950/20 p-5 rounded-2xl border border-emerald-400/50 shadow-2xs">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Economia Comprovada</span>
              <p className="text-xl font-black text-emerald-700 mt-2">{formatCurrency(totalConfirmedSavings)}</p>
            </div>
          </div>

          {/* Maiores Gastos por Categoria (Gráfico / Barras de Distribuição) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Onde Você Mais Gastou no Período Selecionado
            </h3>

            {categorySorted.length === 0 ? (
              <p className="text-xs text-slate-500">Nenhum gasto registrado no período.</p>
            ) : (
              <div className="space-y-3">
                {categorySorted.slice(0, 8).map(([catName, amount]) => {
                  const pct = totalExpense > 0 ? Math.round((amount / totalExpense) * 1000) / 10 : 0;
                  return (
                    <div key={catName} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span>{catName}</span>
                        <span>{formatCurrency(amount)} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-brand-600 h-2 rounded-full"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
