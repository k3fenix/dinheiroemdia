'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDateBR } from '@/lib/formatters';
import {
  Users,
  CreditCard,
  LifeBuoy,
  ShieldCheck,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    estimatedMRR: 0,
    openTickets: 0,
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    async function verifyAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Verificação de papel de admin no banco
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');

      if (!roles || roles.length === 0) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      setAuthorized(true);

      // Carrega indicadores reais agregados
      const [usersRes, subsRes, ticketsRes, logsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('subscriptions').select('*, plan:plans(*)').eq('status', 'active'),
        supabase.from('support_tickets').select('id', { count: 'exact' }).eq('status', 'aberto'),
        supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      const activeSubs = subsRes.data || [];
      const mrr = activeSubs.reduce((acc, s) => acc + Number(s.plan?.monthly_price || 0), 0);

      setStats({
        totalUsers: usersRes.count || 0,
        activeSubscriptions: activeSubs.length,
        estimatedMRR: mrr,
        openTickets: ticketsRes.count || 0,
      });

      if (logsRes.data) setRecentLogs(logsRes.data);

      setLoading(false);
    }
    verifyAdmin();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400">Verificando autorização de segurança...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/30">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white">Acesso Não Autorizado</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Esta área é restrita a operadores administrativos autorizados. O papel de administrador deve ser atribuído via banco de dados conforme o procedimento de segurança.
          </p>
          <div className="pt-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
            >
              Retornar à Área do Cliente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-slate-900/60 border-b border-slate-800 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Painel Geral de Controle
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Ambiente de monitoramento e auditoria da plataforma
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Sessão Administrativa Conectada</span>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Métricas Agregadas Reais */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Usuários Registrados</span>
                <Users className="w-4 h-4 text-brand-400" />
              </div>
              <p className="text-3xl font-black text-white">{stats.totalUsers}</p>
              <p className="text-[11px] text-slate-500 mt-1">Total de contas no sistema</p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Assinaturas Ativas</span>
                <CreditCard className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-emerald-400">{stats.activeSubscriptions}</p>
              <p className="text-[11px] text-slate-500 mt-1">Planos Econômico e Família</p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Receita Recorrente (MRR)</span>
                <Activity className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-white">{formatCurrency(stats.estimatedMRR)}</p>
              <p className="text-[11px] text-slate-500 mt-1">Previsão mensal estimada</p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Chamados Abertos</span>
                <LifeBuoy className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-3xl font-black text-blue-400">{stats.openTickets}</p>
              <p className="text-[11px] text-slate-500 mt-1">Aguardando atendimento</p>
            </div>
          </div>

          {/* Painel de Diagnóstico de Serviços Externos */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Diagnóstico de Conectividade e Serviços
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Banco Supabase (PostgreSQL)</h4>
                  <p className="text-xs text-slate-500">RLS e Auth integrados</p>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  OPERACIONAL
                </span>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Mercado Pago (Pagamentos)</h4>
                  <p className="text-xs text-slate-500">Webhooks e Checkout</p>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  ESTRUTURADO
                </span>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Servidor de E-mails</h4>
                  <p className="text-xs text-slate-500">Modelos de notificação</p>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  CONFIGURÁVEL
                </span>
              </div>
            </div>
          </div>

          {/* Auditoria Administrativa Recente */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Registros Recentes de Auditoria (Logs Imutáveis)
            </h3>

            {recentLogs.length === 0 ? (
              <p className="text-xs text-slate-500">Nenhum evento registrado ainda.</p>
            ) : (
              <div className="divide-y divide-slate-800 text-xs">
                {recentLogs.map((log) => (
                  <div key={log.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-amber-400 font-bold block">{log.action}</span>
                      <span className="text-slate-400">{log.reason || 'Ação operacional do sistema'}</span>
                    </div>
                    <span className="text-slate-500 font-mono">{formatDateBR(log.created_at)}</span>
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
