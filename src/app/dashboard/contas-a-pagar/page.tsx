'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { createClient } from '@/lib/supabase/client';
import { Transaction, Profile } from '@/types/database';
import { formatCurrency, formatDateBR } from '@/lib/formatters';
import { CalendarClock, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ContasAPagarPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bills, setBills] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

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

  const loadBills = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .neq('status', 'cancelada')
      .order('due_date', { ascending: true, nullsFirst: false });

    if (data) setBills(data);
  }, [user, supabase]);

  useEffect(() => {
    if (user) loadBills();
  }, [user, loadBills]);

  const handleMarkAsPaid = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'paga',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (!error) {
      loadBills();
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const pendingBills = bills.filter((b) => b.status === 'pendente' || b.status === 'prevista');
  const paidBills = bills.filter((b) => b.status === 'paga');

  const overdueBills = pendingBills.filter((b) => b.due_date && b.due_date < todayStr);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} isAdmin={isAdmin} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          userName={profile?.full_name || user?.email}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNewTransaction={() => router.push('/dashboard')}
          periodLabel="Contas a Pagar"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
                <CalendarClock className="w-6 h-6 text-brand-600" />
                <span>Contas a Pagar e Vencimentos</span>
              </h1>
              <p className="text-xs text-slate-500">
                Organize seus vencimentos e evite juros e multas por atraso
              </p>
            </div>
          </div>

          {/* Alerta de Contas Atrasadas se houver */}
          {overdueBills.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold">Você tem {overdueBills.length} conta(s) com vencimento atrasado!</h4>
                <p className="text-xs text-rose-700 mt-1">
                  Confira as contas marcadas em vermelho abaixo para regularizar ou atualizar a data.
                </p>
              </div>
            </div>
          )}

          {/* Seção 1: Contas Pendentes */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Aguardando Pagamento ({pendingBills.length})
              </h3>
              <span className="text-sm font-black text-amber-600">
                Total: {formatCurrency(pendingBills.reduce((acc, b) => acc + Number(b.amount), 0))}
              </span>
            </div>

            {pendingBills.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Parabéns! Nenhuma conta pendente no momento.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingBills.map((bill) => {
                  const isOverdue = bill.due_date && bill.due_date < todayStr;
                  return (
                    <div key={bill.id} className="p-4 flex items-center justify-between flex-wrap gap-3 hover:bg-slate-50 transition">
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{bill.description}</h4>
                          <div className="flex items-center space-x-2 text-xs text-slate-500">
                            <span>Vencimento: <strong>{formatDateBR(bill.due_date || bill.competence_date)}</strong></span>
                            {isOverdue && <span className="text-rose-600 font-bold uppercase text-[10px]">(Vencida)</span>}
                            <span>•</span>
                            <span>{bill.category?.name || 'Geral'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="text-base font-black text-slate-900">
                          {formatCurrency(bill.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleMarkAsPaid(bill.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                        >
                          Marcar como Paga
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seção 2: Contas Já Pagas Recentemente */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Contas Já Quitadas ({paidBills.length})
              </h3>
              <span className="text-sm font-black text-emerald-600">
                Total: {formatCurrency(paidBills.reduce((acc, b) => acc + Number(b.amount), 0))}
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {paidBills.slice(0, 10).map((bill) => (
                <div key={bill.id} className="p-4 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-800 block text-sm">{bill.description}</span>
                      <span className="text-slate-400">Pago em {formatDateBR(bill.paid_at || bill.competence_date)}</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">{formatCurrency(bill.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
