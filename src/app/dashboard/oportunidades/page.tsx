'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import { createClient } from '@/lib/supabase/client';
import { SavingsOpportunity, Profile } from '@/types/database';
import { formatCurrency } from '@/lib/formatters';
import { Sparkles, Award, TrendingDown, RefreshCw, Filter, Info } from 'lucide-react';

export default function OpportunitiesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [opportunities, setOpportunities] = useState<SavingsOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ativas');

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

  const loadOpportunities = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('savings_opportunities')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setOpportunities(data);
  }, [user, supabase]);

  useEffect(() => {
    if (user) loadOpportunities();
  }, [user, loadOpportunities]);

  const handleRunDetector = async () => {
    setRunning(true);
    try {
      await fetch('/api/savings-detector/run', { method: 'POST' });
      await loadOpportunities();
    } finally {
      setRunning(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: SavingsOpportunity['status']) => {
    await supabase.from('savings_opportunities').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
    await loadOpportunities();
  };

  const handleRegisterSavings = async (id: string, confirmedAmount: number, notes: string) => {
    await supabase
      .from('savings_opportunities')
      .update({
        confirmed_savings: confirmedAmount,
        status: 'confirmada',
        confirmed_at: new Date().toISOString(),
        user_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    await loadOpportunities();
  };

  const totalConfirmed = opportunities.reduce((acc, o) => acc + Number(o.confirmed_savings || 0), 0);
  const totalPotential = opportunities
    .filter((o) => o.status !== 'confirmada' && o.status !== 'descartada')
    .reduce((acc, o) => acc + Number(o.potential_savings || 0), 0);

  const filtered = opportunities.filter((o) => {
    if (statusFilter === 'ativas') return o.status !== 'descartada' && o.status !== 'confirmada';
    if (statusFilter === 'confirmadas') return o.status === 'confirmada';
    if (statusFilter === 'descartadas') return o.status === 'descartada';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} isAdmin={isAdmin} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          userName={profile?.full_name || user?.email}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNewTransaction={() => router.push('/dashboard')}
          periodLabel="Detector de Economias"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Banner de Apresentação com Totais Separados */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
            <div className="max-w-2xl">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                Motor Analítico Transparente
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Onde Posso Economizar?
              </h1>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Analisamos exclusivamente as receitas, despesas e orçamentos cadastrados por você. Distinguimos rigorosamente o que é potencial estimado do que é economia real confirmada no seu bolso.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block">
                  Economia Potencial Estimada
                </span>
                <span className="text-2xl font-black text-amber-400 mt-1 block">
                  {formatCurrency(totalPotential)}
                </span>
                <span className="text-[11px] text-slate-400">
                  Oportunidades em aberto aguardando sua ação
                </span>
              </div>

              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/40">
                <span className="text-xs text-emerald-300 uppercase font-bold tracking-wider block">
                  Economia Real Comprovada
                </span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">
                  {formatCurrency(totalConfirmed)}
                </span>
                <span className="text-[11px] text-emerald-300/80">
                  Valores que você já confirmou ter poupado
                </span>
              </div>
            </div>
          </div>

          {/* Barra de Filtros e Disparo do Motor */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setStatusFilter('ativas')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  statusFilter === 'ativas' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Oportunidades Ativas
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('confirmadas')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  statusFilter === 'confirmadas' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Confirmadas ({opportunities.filter((o) => o.status === 'confirmada').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('todas')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  statusFilter === 'todas' ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Todas
              </button>
            </div>

            <button
              type="button"
              onClick={handleRunDetector}
              disabled={running}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs transition"
            >
              <Sparkles className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
              <span>{running ? 'Varrendo dados...' : 'Executar Análise Agora'}</span>
            </button>
          </div>

          {/* Grade de Oportunidades */}
          {filtered.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/90 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Nenhuma oportunidade encontrada nesta categoria
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Continue lançando suas despesas mensalmente. O detector compara variações entre períodos para sugerir cortes realistas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  onUpdateStatus={handleUpdateStatus}
                  onRegisterSavings={handleRegisterSavings}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
