'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { createClient } from '@/lib/supabase/client';
import { CreditCard, ShieldCheck, CheckCircle2, AlertCircle, Save, Key, ExternalLink } from 'lucide-react';

export default function AdminConfiguracoesPage() {
  const supabase = createClient();
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);

  // Estados do Mercado Pago
  const [accessToken, setAccessToken] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [isSandbox, setIsSandbox] = useState(false);
  const [hasConfiguredToken, setHasConfiguredToken] = useState(false);
  const [loadingGateway, setLoadingGateway] = useState(true);
  const [savingGateway, setSavingGateway] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function init() {
      // 1. Checa status Supabase
      try {
        const { error } = await supabase.from('plans').select('id').limit(1);
        setSupabaseConnected(!error);
      } catch {
        setSupabaseConnected(false);
      }

      // 2. Carrega credenciais do Mercado Pago salvas
      try {
        const res = await fetch('/api/admin/gateway-settings');
        const data = await res.json();
        if (data.success) {
          setHasConfiguredToken(data.hasAccessToken);
          if (data.accessTokenMasked) setAccessToken(data.accessTokenMasked);
          if (data.publicKey) setPublicKey(data.publicKey);
          if (data.webhookSecret) setWebhookSecret(data.webhookSecret);
          if (data.isSandbox !== undefined) setIsSandbox(data.isSandbox);
        }
      } catch (e) {
        console.error('Erro ao carregar configurações de pagamento:', e);
      } finally {
        setLoadingGateway(false);
      }
    }
    init();
  }, [supabase]);

  const handleSaveGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGateway(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/gateway-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          publicKey,
          webhookSecret,
          isSandbox,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Erro ao salvar credenciais.' });
      } else {
        setFeedback({ type: 'success', message: data.message });
        setHasConfiguredToken(true);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro de rede ao salvar.' });
    } finally {
      setSavingGateway(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-slate-900/60 border-b border-slate-800 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Configurações & Gateway de Pagamentos</h1>
            <p className="text-xs text-slate-400">Gerencie suas credenciais do Mercado Pago e o status dos serviços</p>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-8">
          {/* Card: Mercado Pago Gateway de Pagamento */}
          <div className="bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-black">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Mercado Pago — Recebimento de Assinaturas
                  </h2>
                  <p className="text-xs text-slate-400">
                    Quando um cliente assinar um plano, o pagamento cairá diretamente na sua conta do Mercado Pago
                  </p>
                </div>
              </div>

              <div>
                {hasConfiguredToken ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    GATEWAY ATIVO
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <AlertCircle className="w-3.5 h-3.5" />
                    AGUARDANDO ACCESS TOKEN
                  </span>
                )}
              </div>
            </div>

            {feedback && (
              <div
                className={`p-4 rounded-xl border text-sm flex items-start gap-2.5 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveGateway} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Access Token (Produção ou Teste) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="APP_USR-0000000000000000-..."
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Encontrado em <strong>Mercado Pago Developers</strong> &gt; Suas Aplicações &gt; Credenciais de Produção.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Public Key (Chave Pública)
                </label>
                <input
                  type="text"
                  placeholder="APP_USR-..."
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Webhook Secret (Opcional - para validação de notificações automáticas)
                </label>
                <input
                  type="password"
                  placeholder="Secret de assinatura do webhook"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={isSandbox}
                    onChange={(e) => setIsSandbox(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-0"
                  />
                  <span>Ativar Modo Sandbox (Ambiente de Testes do Mercado Pago)</span>
                </label>

                <button
                  type="submit"
                  disabled={savingGateway || loadingGateway}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingGateway ? 'Salvando...' : 'Salvar Credenciais'}
                </button>
              </div>
            </form>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span>Como obter suas credenciais:</span>
                <a
                  href="https://www.mercadopago.com.br/developers/panel"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-sky-400 hover:underline"
                >
                  Painel de Desenvolvedores MP <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
              <p>
                1. Entre no Painel do Mercado Pago Developers com sua conta Mercado Pago.
              </p>
              <p>
                2. Crie uma aplicação (ex: &quot;Cadê Meu Dinheiro&quot;) e copie o <strong>Access Token</strong> de Produção.
              </p>
              <p>
                3. Cole acima e clique em <strong>Salvar Credenciais</strong>. Todos os checkouts usarão sua conta imediatamente!
              </p>
            </div>
          </div>

          {/* Card: Diagnóstico de Banco & Infraestrutura */}
          <div className="bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Diagnóstico de Infraestrutura
            </h3>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Banco de Dados PostgreSQL (Supabase)</h4>
                <p className="text-xs text-slate-500">Tabelas, RLS, Perfis e Autenticação</p>
              </div>
              <div>
                {supabaseConnected === true && (
                  <span className="px-3 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    OPERACIONAL
                  </span>
                )}
                {supabaseConnected === false && (
                  <span className="px-3 py-1 rounded-md text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    PENDENTE
                  </span>
                )}
                {supabaseConnected === null && (
                  <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    VERIFICANDO...
                  </span>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
