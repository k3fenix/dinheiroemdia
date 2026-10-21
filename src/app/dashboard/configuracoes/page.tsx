'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { createClient } from '@/lib/supabase/client';
import { Profile, NotificationPreferences } from '@/types/database';
import { Settings, Eye, Bell, Download, Trash2, ShieldCheck, Save, AlertCircle } from 'lucide-react';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Acessibilidade: Escala de fonte
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'extra-large'>('normal');

  // Notificações
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [dueReminders, setDueReminders] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);

  // Exclusão LGPD
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const [profRes, notifRes, rolesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('notification_preferences').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin'),
      ]);

      if (profRes.data) {
        setProfile(profRes.data);
        setFontScale(profRes.data.font_scale || 'normal');
      }

      if (notifRes.data) {
        setEmailEnabled(notifRes.data.email_enabled);
        setDueReminders(notifRes.data.due_date_reminders);
        setBudgetAlerts(notifRes.data.budget_alerts);
      }

      setIsAdmin(!!(rolesRes.data && rolesRes.data.length > 0));
      setLoading(false);
    }
    init();
  }, [router, supabase]);

  const handleSavePreferences = async () => {
    if (!user) return;
    setSaveSuccess(false);

    // 1. Atualiza Perfil e Escala de Fonte
    await supabase.from('profiles').update({
      font_scale: fontScale,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);

    // Aplica no DOM imediatamente
    document.documentElement.setAttribute('data-font-scale', fontScale);

    // 2. Atualiza Preferências de Notificação
    await supabase.from('notification_preferences').upsert({
      user_id: user.id,
      email_enabled: emailEnabled,
      due_date_reminders: dueReminders,
      budget_alerts: budgetAlerts,
      updated_at: new Date().toISOString(),
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'EXCLUIR MINHA CONTA DEFINITIVAMENTE') {
      setDeleteError('Digite a frase exata para confirmar a exclusão definitiva.');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationText: deleteConfirmation }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha ao excluir conta');
      }

      await supabase.auth.signOut();
      window.location.href = '/?status=conta_excluida';
    } catch (err: any) {
      setDeleteError(err.message || 'Erro ao processar exclusão');
      setIsDeleting(false);
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
          periodLabel="Configurações e Privacidade"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <Settings className="w-6 h-6 text-brand-600" />
              <span>Configurações da Conta e Privacidade</span>
            </h1>
            <p className="text-xs text-slate-500">
              Ajuste suas preferências visuais, notificações e controle seus dados conforme a LGPD
            </p>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
              ✓ Preferências salvas com sucesso!
            </div>
          )}

          {/* 1. Acessibilidade Visual e Tamanho da Fonte */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center space-x-3 text-slate-900 font-bold text-base">
              <Eye className="w-5 h-5 text-brand-600" />
              <h3>Acessibilidade e Legibilidade</h3>
            </div>
            <p className="text-xs text-slate-600">
              Ideal para idosos ou pessoas com baixa visão. Aumenta os textos em todos os painéis e relatórios.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFontScale('normal')}
                className={`p-3.5 rounded-xl border text-left transition ${
                  fontScale === 'normal' ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="block text-sm">Padrão</span>
                <span className="text-[11px] text-slate-500">Tamanho normal</span>
              </button>

              <button
                type="button"
                onClick={() => setFontScale('large')}
                className={`p-3.5 rounded-xl border text-left transition ${
                  fontScale === 'large' ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="block text-base">Grande (+15%)</span>
                <span className="text-[11px] text-slate-500">Mais legível</span>
              </button>

              <button
                type="button"
                onClick={() => setFontScale('extra-large')}
                className={`p-3.5 rounded-xl border text-left transition ${
                  fontScale === 'extra-large' ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="block text-lg">Extra Grande (+30%)</span>
                <span className="text-[11px] text-slate-500">Máxima visibilidade</span>
              </button>
            </div>
          </div>

          {/* 2. Preferências de Comunicação e Notificações */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center space-x-3 text-slate-900 font-bold text-base">
              <Bell className="w-5 h-5 text-brand-600" />
              <h3>Notificações e Lembretes</h3>
            </div>

            <div className="space-y-3 pt-1">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dueReminders}
                  onChange={(e) => setDueReminders(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600"
                />
                <span className="text-sm text-slate-700">Lembretes de vencimento de contas a pagar</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={budgetAlerts}
                  onChange={(e) => setBudgetAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600"
                />
                <span className="text-sm text-slate-700">Alertas quando um orçamento atingir 80% ou 100%</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600"
                />
                <span className="text-sm text-slate-700">Receber notificações por e-mail</span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 transition"
              >
                Salvar Preferências
              </button>
            </div>
          </div>

          {/* 3. Privacidade e Exportação LGPD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center space-x-3 text-slate-900 font-bold text-base">
              <Download className="w-5 h-5 text-brand-600" />
              <h3>Portabilidade e Exportação de Dados (LGPD)</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Conforme o Artigo 18 da Lei Geral de Proteção de Dados (LGPD), você tem o direito de exportar todos os dados associados à sua conta a qualquer momento em formato aberto.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <a
                href="/api/export?format=json"
                download
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                Exportar Tudo em JSON
              </a>
              <a
                href="/api/export?format=csv"
                download
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                Exportar Transações em CSV
              </a>
            </div>
          </div>

          {/* 4. Zona de Perigo: Exclusão Definitiva */}
          <div className="bg-rose-50/60 p-6 rounded-2xl border border-rose-200 space-y-4">
            <div className="flex items-center space-x-3 text-rose-900 font-bold text-base">
              <Trash2 className="w-5 h-5 text-rose-600" />
              <h3>Excluir Minha Conta Definitivamente</h3>
            </div>
            <p className="text-xs text-rose-700 leading-relaxed">
              Esta ação apagará permanentemente seu perfil, transações, orçamentos, metas e histórico financeiro de forma irreversível.
            </p>

            {deleteError && (
              <p className="text-xs text-rose-800 font-bold">{deleteError}</p>
            )}

            <div>
              <label className="block text-xs font-bold text-rose-900 mb-1">
                Digite exatamente <strong className="select-all">EXCLUIR MINHA CONTA DEFINITIVAMENTE</strong> para confirmar:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="EXCLUIR MINHA CONTA DEFINITIVAMENTE"
                className="w-full px-3 py-2 text-sm rounded-xl border border-rose-300 bg-white"
              />
            </div>

            <button
              type="button"
              disabled={isDeleting || deleteConfirmation !== 'EXCLUIR MINHA CONTA DEFINITIVAMENTE'}
              onClick={handleDeleteAccount}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition"
            >
              {isDeleting ? 'Excluindo dados...' : 'Confirmar Exclusão Total da Conta'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
