'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { createClient } from '@/lib/supabase/client';
import { Category, Profile } from '@/types/database';
import { Tags, Plus, Archive, Shield, Check } from 'lucide-react';

export default function CategoriasPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');

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

  const loadCategories = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('categories')
      .select('*')
      .or(`is_system.eq.true,user_id.eq.${user.id}`)
      .order('name');

    if (data) setCategories(data);
  }, [user, supabase]);

  useEffect(() => {
    if (user) loadCategories();
  }, [user, loadCategories]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await supabase.from('categories').insert([
      {
        user_id: user.id,
        name: name.trim(),
        type,
        is_system: false,
      },
    ]);

    setName('');
    setShowAddForm(false);
    loadCategories();
  };

  const handleToggleArchive = async (cat: Category) => {
    if (cat.is_system) {
      alert('Categorias padrão do sistema não podem ser arquivadas para manter a integridade dos relatórios.');
      return;
    }

    const newArchivedAt = cat.archived_at ? null : new Date().toISOString();
    await supabase.from('categories').update({ archived_at: newArchivedAt }).eq('id', cat.id);
    loadCategories();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} isAdmin={isAdmin} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          userName={profile?.full_name || user?.email}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNewTransaction={() => router.push('/dashboard')}
          periodLabel="Categorias Financeiras"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
                <Tags className="w-6 h-6 text-brand-600" />
                <span>Categorias Financeiras</span>
              </h1>
              <p className="text-xs text-slate-500">
                Personalize suas categorias ou use as categorias padrão brasileiras já disponíveis
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs transition touch-target"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Cancelar' : '+ Nova Categoria'}</span>
            </button>
          </div>

          {showAddForm && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
              <h3 className="text-base font-bold text-slate-900 mb-4">Criar Categoria Própria</h3>
              <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  placeholder="Nome da categoria (ex: Cursos Online)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
                >
                  Salvar
                </button>
              </form>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>{categories.length} categorias cadastradas</span>
              <span>Proteção: histórico mantido íntegro</span>
            </div>

            <div className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="flex items-center space-x-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                        <span>{cat.name}</span>
                        {cat.is_system && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-normal flex items-center space-x-1">
                            <Shield className="w-3 h-3 text-slate-400" />
                            <span>Sistema</span>
                          </span>
                        )}
                        {cat.archived_at && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                            Arquivada
                          </span>
                        )}
                      </h4>
                      <span className="text-xs text-slate-400">
                        {cat.type === 'income' ? 'Receita' : 'Despesa'}
                      </span>
                    </div>
                  </div>

                  {!cat.is_system && (
                    <button
                      type="button"
                      onClick={() => handleToggleArchive(cat)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
                    >
                      {cat.archived_at ? 'Desarquivar' : 'Arquivar'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
