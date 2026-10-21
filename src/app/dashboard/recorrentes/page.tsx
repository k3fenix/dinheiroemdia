'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { createClient } from '@/lib/supabase/client';
import { RecurringExpense, Category, Profile } from '@/types/database';
import { formatCurrency, formatDateBR } from '@/lib/formatters';
import { Repeat, Plus, Trash2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function RecorrentesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [recurringList, setRecurringList] = useState<RecurringExpense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulário de Nova Assinatura
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('mensal');
  const [categoryId, setCategoryId] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

      const { data: cats } = await supabase.from('categories').select('*').or(`is_system.eq.true,user_id.eq.${user.id}`);
      if (cats) setCategories(cats);

      setLoading(false);
    }
    init();
  }, [router, supabase]);

  const loadRecurring = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('recurring_expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (data) setRecurringList(data);
  }, [user, supabase]);

  useEffect(() => {
    if (user) loadRecurring();
  }, [user, loadRecurring]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount.replace(',', '.'));
    if (!name.trim() || isNaN(num) || num <= 0) return;

    setSubmitting(true);
    try {
      await supabase.from('recurring_expenses').insert([
        {
          user_id: user.id,
          name: name.trim(),
          amount: num,
          frequency,
          category_id: categoryId || null,
          next_due_date: nextDueDate || null,
          active: true,
          marked_for_review: false,
          notes: notes.trim() || null,
        },
      ]);
      setName('');
      setAmount('');
      setNextDueDate('');
      setNotes('');
      setShowAddForm(false);
      loadRecurring();
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleReview = async (item: RecurringExpense) => {
    await supabase
      .from('recurring_expenses')
      .update({ marked_for_review: !item.marked_for_review })
      .eq('id', item.id);
    loadRecurring();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja excluir esta assinatura recorrente?')) return;
    await supabase.from('recurring_expenses').delete().eq('id', id);
    loadRecurring();
  };

  const totalMonthly = recurringList
    .filter((r) => r.active)
    .reduce((acc, r) => acc + Number(r.amount), 0);

  const totalAnnual = totalMonthly * 12;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} isAdmin={isAdmin} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          userName={profile?.full_name || user?.email}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNewTransaction={() => router.push('/dashboard')}
          periodLabel="Gastos Recorrentes"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
                <Repeat className="w-6 h-6 text-brand-600" />
                <span>Gastos Recorrentes e Assinaturas</span>
              </h1>
              <p className="text-xs text-slate-500">
                Monitore streamings, assinaturas digitais, mensalidades e planos fixos
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs transition touch-target"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Cancelar' : '+ Nova Assinatura'}</span>
            </button>
          </div>

          {/* Totais: Mensal e Impacto Anual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Custo Mensal em Recorrências</span>
              <p className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(totalMonthly)}/mês</p>
            </div>
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-2xs">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Impacto no seu Ano (12 meses)</span>
              <p className="text-2xl font-black text-white mt-2">{formatCurrency(totalAnnual)}/ano</p>
            </div>
          </div>

          {/* Formulário de Cadastro */}
          {showAddForm && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
              <h3 className="text-base font-bold text-slate-900 mb-4">Adicionar Serviço Recorrente</h3>
              <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Serviço</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Netflix, Academia, Spotify"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Valor Mensal (R$)</label>
                  <input
                    type="text"
                    required
                    inputMode="decimal"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Próxima Cobrança (Opcional)</label>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
                  >
                    {submitting ? 'Salvando...' : 'Salvar Assinatura'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de Assinaturas */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {recurringList.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                Nenhuma assinatura ou gasto recorrente cadastrado.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recurringList.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between flex-wrap gap-3 hover:bg-slate-50 transition">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                      <p className="text-xs text-slate-500">
                        Frequência: {item.frequency} • {item.next_due_date ? `Próximo débito: ${formatDateBR(item.next_due_date)}` : 'Sem data fixa'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="text-base font-black text-slate-900">
                        {formatCurrency(item.amount)}/mês
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggleReview(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          item.marked_for_review
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {item.marked_for_review ? 'Marcado para Revisão' : 'Revisar Uso'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        aria-label="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
