'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PeriodSelector, { MONTH_NAMES } from '@/components/dashboard/PeriodSelector';
import TransactionFormModal from '@/components/transactions/TransactionFormModal';
import { createClient } from '@/lib/supabase/client';
import { Category, Transaction, Profile } from '@/types/database';
import { formatCurrency, formatDateBR } from '@/lib/formatters';
import { Plus, Search, TrendingDown, Trash2, Edit, AlertCircle } from 'lucide-react';

export default function DespesasPage() {
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

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

  const loadDespesas = useCallback(async () => {
    if (!user) return;
    const start = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
    const end = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const { data } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('competence_date', start)
      .lte('competence_date', end)
      .order('competence_date', { ascending: false });

    if (data) setTransactions(data);
  }, [user, selectedMonth, selectedYear, supabase]);

  useEffect(() => {
    if (user) loadDespesas();
  }, [user, loadDespesas]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir esta despesa?')) return;
    await supabase.from('transactions').delete().eq('id', id);
    loadDespesas();
  };

  const filtered = transactions.filter((t) => {
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && t.category_id !== categoryFilter) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    if (typeFilter && t.expense_type !== typeFilter) return false;
    return true;
  });

  const totalPaid = filtered
    .filter((t) => t.status === 'paga')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalPending = filtered
    .filter((t) => t.status === 'pendente' || t.status === 'prevista')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const periodLabel = `${MONTH_NAMES[selectedMonth - 1]} de ${selectedYear}`;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} isAdmin={isAdmin} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          userName={profile?.full_name || user?.email}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNewTransaction={() => {
            setEditingTransaction(null);
            setIsModalOpen(true);
          }}
          periodLabel={periodLabel}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
                <TrendingDown className="w-6 h-6 text-rose-600" />
                <span>Despesas e Gastos</span>
              </h1>
              <p className="text-xs text-slate-500">
                Gerencie contas fixas, variáveis e assinaturas com precisão
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <PeriodSelector currentMonth={selectedMonth} currentYear={selectedYear} onChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }} />
              <button
                type="button"
                onClick={() => {
                  setEditingTransaction(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition touch-target"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nova Despesa</span>
              </button>
            </div>
          </div>

          {/* Cards de Resumo de Despesas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Despesas Pagas (Realizadas)</span>
              <p className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Despesas Pendentes / A Pagar</span>
              <p className="text-2xl font-black text-amber-600 mt-2">{formatCurrency(totalPending)}</p>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 px-3 text-sm rounded-xl border border-slate-200 bg-white"
            >
              <option value="">Todas as categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="py-2 px-3 text-sm rounded-xl border border-slate-200 bg-white"
            >
              <option value="">Todos os tipos</option>
              <option value="fixa">Fixa</option>
              <option value="variavel">Variável</option>
              <option value="recorrente">Recorrente</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 text-sm rounded-xl border border-slate-200 bg-white"
            >
              <option value="">Todas as situações</option>
              <option value="paga">Paga</option>
              <option value="pendente">Pendente</option>
              <option value="prevista">Prevista</option>
            </select>
          </div>

          {/* Tabela de Despesas */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                Nenhuma despesa encontrada com os filtros selecionados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Data</th>
                      <th className="py-3 px-4">Descrição</th>
                      <th className="py-3 px-4">Categoria</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Situação</th>
                      <th className="py-3 px-4 text-right">Valor</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filtered.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">{formatDateBR(t.competence_date)}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{t.description}</td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          <span className="px-2 py-0.5 rounded bg-slate-100">{t.category?.name || 'Geral'}</span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 uppercase font-semibold">
                          {t.expense_type}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            t.status === 'paga' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {t.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-slate-900 whitespace-nowrap">
                          - {formatCurrency(t.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => { setEditingTransaction(t); setIsModalOpen(true); }}
                            className="text-xs font-semibold text-slate-600 hover:text-brand-600"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => loadDespesas()}
        initialType="expense"
        categories={categories}
        editingTransaction={editingTransaction}
      />
    </div>
  );
}
