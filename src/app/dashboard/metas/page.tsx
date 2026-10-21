'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { createClient } from '@/lib/supabase/client';
import { SavingsGoal, GoalContribution, Profile } from '@/types/database';
import { formatCurrency, formatDateBR } from '@/lib/formatters';
import { calculateGoalProgress } from '@/lib/math/financial';
import { Target, Plus, PiggyBank, Calendar, CheckCircle2, Trash2 } from 'lucide-react';

export default function MetasPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form Nova Meta
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  // Aporte Modal
  const [contributingGoal, setContributingGoal] = useState<SavingsGoal | null>(null);
  const [contribAmount, setContribAmount] = useState('');
  const [contribNotes, setContribNotes] = useState('');

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

  const loadGoals = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setGoals(data);
  }, [user, supabase]);

  useEffect(() => {
    if (user) loadGoals();
  }, [user, loadGoals]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount.replace(',', '.'));
    const initial = parseFloat(initialAmount.replace(',', '.')) || 0;
    if (!name.trim() || isNaN(target) || target <= 0) return;

    await supabase.from('savings_goals').insert([
      {
        user_id: user.id,
        name: name.trim(),
        target_amount: target,
        current_amount: initial,
        target_date: targetDate || null,
        status: 'active',
      },
    ]);

    setName('');
    setTargetAmount('');
    setInitialAmount('');
    setTargetDate('');
    setShowAddGoal(false);
    loadGoals();
  };

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributingGoal) return;
    const amount = parseFloat(contribAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;

    // 1. Registra contribuição
    await supabase.from('goal_contributions').insert([
      {
        goal_id: contributingGoal.id,
        user_id: user.id,
        amount,
        contribution_date: new Date().toISOString().split('T')[0],
        notes: contribNotes.trim() || null,
      },
    ]);

    // 2. Atualiza valor acumulado da meta
    const newCurrent = Number(contributingGoal.current_amount) + amount;
    const isCompleted = newCurrent >= contributingGoal.target_amount;

    await supabase
      .from('savings_goals')
      .update({
        current_amount: newCurrent,
        status: isCompleted ? 'completed' : 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', contributingGoal.id);

    setContributingGoal(null);
    setContribAmount('');
    setContribNotes('');
    loadGoals();
  };

  const handleDeleteGoal = async (id: string) => {
    if (!window.confirm('Deseja excluir esta meta e seu histórico de contribuições?')) return;
    await supabase.from('savings_goals').delete().eq('id', id);
    loadGoals();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} isAdmin={isAdmin} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          userName={profile?.full_name || user?.email}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNewTransaction={() => router.push('/dashboard')}
          periodLabel="Metas Financeiras"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
                <Target className="w-6 h-6 text-brand-600" />
                <span>Metas de Economia</span>
              </h1>
              <p className="text-xs text-slate-500">
                Poupe para sua reserva de emergência, viagens ou aquisição de bens
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddGoal(!showAddGoal)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs transition touch-target"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddGoal ? 'Cancelar' : '+ Nova Meta'}</span>
            </button>
          </div>

          {/* Formulário Nova Meta */}
          {showAddGoal && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
              <h3 className="text-base font-bold text-slate-900 mb-4">Criar Nova Meta Financeira</h3>
              <form onSubmit={handleCreateGoal} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Meta</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Reserva de Emergência"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Valor Alvo (R$)</label>
                  <input
                    type="text"
                    required
                    inputMode="decimal"
                    placeholder="Ex: 5000,00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Já Guardado (R$)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data Desejada (Opcional)</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div className="sm:col-span-4 flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddGoal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
                  >
                    Criar Meta
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Cards de Metas com Barra de Progresso */}
          {goals.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/90 text-slate-500 text-sm">
              Você ainda não tem metas cadastradas. Crie sua primeira meta para acompanhar seus objetivos!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {goals.map((goal) => {
                const { percentage, remainingAmount, isCompleted } = calculateGoalProgress(
                  goal.current_amount,
                  goal.target_amount
                );
                return (
                  <div key={goal.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isCompleted ? 'META ATINGIDA! 🎉' : 'EM ANDAMENTO'}
                        </span>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          aria-label="Excluir meta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{goal.name}</h3>

                      <div className="mt-3 flex items-baseline justify-between text-xs text-slate-500">
                        <span>Acumulado: <strong className="text-slate-900">{formatCurrency(goal.current_amount)}</strong></span>
                        <span>Objetivo: <strong className="text-slate-900">{formatCurrency(goal.target_amount)}</strong></span>
                      </div>

                      {/* Barra de Progresso */}
                      <div className="w-full bg-slate-100 rounded-full h-3 mt-2 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-brand-600'}`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span>{percentage}% concluído</span>
                        <span>Faltam {formatCurrency(remainingAmount)}</span>
                      </div>

                      {goal.target_date && (
                        <p className="mt-2 text-[11px] text-slate-400 flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Previsão: {formatDateBR(goal.target_date)}</span>
                        </p>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setContributingGoal(goal)}
                        className="w-full py-2 px-3 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-xl transition"
                      >
                        + Registrar Novo Aporte
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal de Aporte */}
          {contributingGoal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
                <h3 className="text-base font-bold text-slate-900 mb-1">Adicionar Aporte</h3>
                <p className="text-xs text-slate-500 mb-4">Meta: {contributingGoal.name}</p>

                <form onSubmit={handleAddContribution} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Valor do Aporte (R$)</label>
                    <input
                      type="text"
                      required
                      inputMode="decimal"
                      placeholder="0,00"
                      value={contribAmount}
                      onChange={(e) => setContribAmount(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Observação (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ex: Sobra do salário, 13º"
                      value={contribNotes}
                      onChange={(e) => setContribNotes(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setContributingGoal(null)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-xs"
                    >
                      Salvar Aporte
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
