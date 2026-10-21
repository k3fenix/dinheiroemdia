'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { createClient } from '@/lib/supabase/client';
import { FileText, Save } from 'lucide-react';

export default function AdminConteudoPage() {
  const supabase = createClient();
  const [slogan, setSlogan] = useState('Descubra para onde seu dinheiro vai. Encontre oportunidades para economizar.');
  const [announcement, setAnnouncement] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('app_settings').select('*').eq('key', 'cms_content').maybeSingle();
      if (data && data.public_value) {
        if (data.public_value.slogan) setSlogan(data.public_value.slogan);
        if (data.public_value.announcement) setAnnouncement(data.public_value.announcement);
      }
    }
    load();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('app_settings').upsert({
      key: 'cms_content',
      public_value: { slogan, announcement },
      updated_at: new Date().toISOString(),
      updated_by: user?.id,
    });

    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-slate-900/60 border-b border-slate-800 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Gestão de Conteúdo (CMS)</h1>
            <p className="text-xs text-slate-400">Edite textos públicos, avisos institucionais e termos</p>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-6">
          {savedSuccess && (
            <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold">
              ✓ Conteúdo publicado com sucesso!
            </div>
          )}

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Slogan do Cabeçalho Público
                </label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Aviso de Manutenção / Notificação no Topo (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Atualização programada de segurança..."
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Publicando...' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
