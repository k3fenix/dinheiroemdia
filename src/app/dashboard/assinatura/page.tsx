'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { createClient } from '@/lib/supabase/client';
import { Plan, Subscription, Profile } from '@/types/database';
import { formatCurrency, formatDateBR } from '@/lib/formatters';
import { CreditCard, CheckCircle2, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';

function AssinaturaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSub, setCurrentSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const statusParam = searchParams.get('status');

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const [profRes, subRes, plansRes, rolesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('subscriptions').select('*, plan:plans(*)').eq('user_id', user.id).maybeSingle(),
        supabase.from('plans').select('*').eq('status', 'published').order('display_order'),
        supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin'),
      ]);

      if (profRes.data) setProfile(profRes.data);
      if (subRes.data) setCurrentSub(subRes.data);
      if (plansRes.data) setPlans(plansRes.data);
      setIsAdmin(!!(rolesRes.data && rolesRes.data.length > 0));

      setLoading(false);
    }
    init();
  }, [router, supabase]);

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle: 'monthly' }),
      });

      const data = await res.json();
      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else if (data.sandboxInitPoint) {
        window.location.href = data.sandboxInitPoint;
      } else {
        alert(data.error || 'Não foi possível iniciar o checkout.');
      }
    } catch {
      alert('Erro na conexão com o provedor de pagamento.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} isAdmin={isAdmin} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          userName={profile?.full_name || user?.email}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNewTransaction={() => router.push('/dashboard')}
          periodLabel="Plano e Assinatura"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <CreditCard className="w-6 h-6 text-brand-600" />
              <span>Meu Plano e Assinatura</span>
            </h1>
            <p className="text-xs text-slate-500">
              Gerencie sua contratação e desbloqueie recursos com total transparência
            </p>
          </div>

          {/* Avisos de Retorno do Checkout */}
          {statusParam === 'sucesso' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-sm font-semibold">
                Pagamento enviado com sucesso! Seus recursos serão liberados automaticamente assim que o Mercado Pago confirmar o processamento.
              </p>
            </div>
          )}

          {statusParam === 'pendente' && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-sm font-semibold">
                Seu pagamento está em análise pelo provedor. Assim que compensado (ex: boleto ou PIX), a confirmação será atualizada aqui.
              </p>
            </div>
          )}

          {/* Card de Situação Atual */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Seu Plano Ativo
            </span>
            <div className="mt-2 flex items-baseline space-x-3">
              <h2 className="text-3xl font-black text-slate-900">
                {currentSub?.plan?.name || 'Plano Gratuito'}
              </h2>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                currentSub?.status === 'active'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {currentSub?.status === 'active' ? 'ASSINATURA ATIVA' : 'GRATUITO'}
              </span>
            </div>

            {currentSub?.current_period_end && (
              <p className="mt-2 text-xs text-slate-500">
                Próxima renovação em {formatDateBR(currentSub.current_period_end)}
              </p>
            )}
          </div>

          {/* Comparativo de Planos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrent = currentSub?.plan_id === plan.id || (!currentSub && plan.slug === 'gratuito');
              const isPopular = plan.slug === 'economico';

              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 flex flex-col justify-between transition ${
                    isPopular
                      ? 'bg-slate-900 text-white shadow-xl border-2 border-brand-500 relative'
                      : 'bg-white text-slate-900 border border-slate-200 shadow-2xs'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full">
                      Recomendado
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <p className={`text-xs mt-1 ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                      {plan.description}
                    </p>

                    <div className="my-6">
                      <span className="text-3xl font-black">
                        {plan.monthly_price === 0 ? 'R$ 0' : formatCurrency(plan.monthly_price)}
                      </span>
                      <span className={`text-xs ml-1 ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                        /mês
                      </span>
                    </div>

                    <ul className={`space-y-2.5 text-xs ${isPopular ? 'text-slate-300' : 'text-slate-600'}`}>
                      {(plan.features || []).map((feat, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isPopular ? 'text-brand-400' : 'text-brand-600'}`} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100/10">
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-3 rounded-xl text-xs font-bold bg-slate-200 text-slate-600 cursor-default"
                      >
                        Seu Plano Atual
                      </button>
                    ) : plan.monthly_price === 0 ? (
                      <button
                        disabled
                        className="w-full py-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-500"
                      >
                        Plano Padrão
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCheckout(plan.id)}
                        disabled={checkoutLoading === plan.id}
                        className={`w-full py-3 rounded-xl text-xs font-bold transition shadow-xs ${
                          isPopular
                            ? 'bg-brand-600 hover:bg-brand-500 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {checkoutLoading === plan.id ? 'Iniciando checkout...' : `Assinar por ${formatCurrency(plan.monthly_price)}/mês`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center text-xs text-slate-500 flex items-center justify-center space-x-1.5 pt-4">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Cobranças processadas com criptografia de ponta a ponta pelo Mercado Pago.</span>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AssinaturaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 text-sm font-semibold">
          Carregando informações da assinatura...
        </div>
      }
    >
      <AssinaturaContent />
    </Suspense>
  );
}
