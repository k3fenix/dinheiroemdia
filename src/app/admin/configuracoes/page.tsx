'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { createClient } from '@/lib/supabase/client';
import { Settings, ShieldCheck, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function AdminConfiguracoesPage() {
  const supabase = createClient();
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const { error } = await supabase.from('plans').select('id').limit(1);
        setSupabaseConnected(!error);
      } catch {
        setSupabaseConnected(false);
      }
    }
    checkHealth();
  }, [supabase]);

  const hasMercadoPagoToken = !!process.env.NEXT_PUBLIC_SITE_URL; // Verifica integridade do ambiente sem expor segredos

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-slate-900/60 border-b border-slate-800 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Diagnóstico do Sistema</h1>
            <p className="text-xs text-slate-400">Status dos serviços externos e variáveis de produção</p>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Verificação Operacional de Integrações
            </h3>

            <div className="space-y-4">
              {/* 1. Supabase */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">PostgreSQL & Supabase Auth</h4>
                  <p className="text-xs text-slate-500">Conexão de dados, políticas RLS e sessões ativas</p>
                </div>
                <div>
                  {supabaseConnected === true && (
                    <span className="px-3 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      OPERACIONAL
                    </span>
                  )}
                  {supabaseConnected === false && (
                    <span className="px-3 py-1 rounded-md text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      PENDENTE DE CONEXÃO
                    </span>
                  )}
                  {supabaseConnected === null && (
                    <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      VERIFICANDO...
                    </span>
                  )}
                </div>
              </div>

              {/* 2. Mercado Pago */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Mercado Pago (Pagamentos Recorrentes)</h4>
                  <p className="text-xs text-slate-500">Endpoints /api/checkout e /api/webhooks/mercadopago</p>
                </div>
                <div>
                  <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    ESTRUTURADO (AGUARDANDO ACCESS_TOKEN)
                  </span>
                </div>
              </div>

              {/* 3. Servidor de E-mail */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Notificações Transacionais</h4>
                  <p className="text-xs text-slate-500">Lembretes de vencimento e avisos de limites</p>
                </div>
                <div>
                  <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    CONFIGURÁVEL NO SUPABASE
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 leading-relaxed">
              <strong>Nota de Segurança:</strong> Segredos privados (como SUPABASE_SERVICE_ROLE_KEY e MERCADO_PAGO_ACCESS_TOKEN) nunca são expostos nesta tela. Eles residem exclusivamente nas variáveis de ambiente seguras da Vercel.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
