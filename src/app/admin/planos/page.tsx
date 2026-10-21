'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { createClient } from '@/lib/supabase/client';
import { Plan } from '@/types/database';
import { formatCurrency } from '@/lib/formatters';
import { CreditCard, Plus, Edit, CheckCircle2 } from 'lucide-react';

export default function AdminPlanosPage() {
  const supabase = createClient();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [annualPrice, setAnnualPrice] = useState('');
  const [status, setStatus] = useState<Plan['status']>('published');
  const [saving, setSaving] = useState(false);

  const loadPlans = useCallback(async () => {
    const { data } = await supabase.from('plans').select('*').order('display_order');
    if (data) setPlans(data);
  }, [supabase]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const handleEdit = (p: Plan) => {
    setEditingPlan(p);
    setName(p.name);
    setSlug(p.slug);
    setDescription(p.description);
    setMonthlyPrice(p.monthly_price.toString());
    setAnnualPrice(p.annual_price ? p.annual_price.toString() : '');
    setStatus(p.status);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const mPrice = parseFloat(monthlyPrice.replace(',', '.')) || 0;
    const aPrice = annualPrice ? parseFloat(annualPrice.replace(',', '.')) : null;

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        monthly_price: mPrice,
        annual_price: aPrice,
        status,
        updated_at: new Date().toISOString(),
      };

      if (editingPlan) {
        await supabase.from('plans').update(payload).eq('id', editingPlan.id);
      } else {
        await supabase.from('plans').insert([{ ...payload, features: [], limits: {} }]);
      }

      setEditingPlan(null);
      loadPlans();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-slate-900/60 border-b border-slate-800 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Gestão de Planos e Preços</h1>
            <p className="text-xs text-slate-400">Configure os planos disponíveis para contratação</p>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Formulário de Edição */}
          {editingPlan && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">Editar Plano: {editingPlan.name}</h3>
              <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Nome</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Preço Mensal (R$)</label>
                  <input
                    type="text"
                    required
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Preço Anual (R$)</label>
                  <input
                    type="text"
                    value={annualPrice}
                    onChange={(e) => setAnnualPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 mb-1">Descrição</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="published">Publicado</option>
                    <option value="draft">Rascunho</option>
                    <option value="archived">Arquivado</option>
                  </select>
                </div>
                <div className="sm:col-span-3 flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingPlan(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl"
                  >
                    {saving ? 'Gravando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de Planos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div key={p.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-black text-white">{p.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      p.status === 'published' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{p.description}</p>
                  <div className="text-2xl font-black text-amber-400 mb-4">
                    {formatCurrency(p.monthly_price)}/mês
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleEdit(p)}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition"
                  >
                    Editar Valores e Limites
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
