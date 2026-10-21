'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { formatDateBR } from '@/lib/formatters';
import { Users, Search, Ban, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AdminUsuariosPage() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal de Bloqueio/Desbloqueio
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadUsers = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setProfiles(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !reason.trim()) return;

    setProcessing(true);
    const { data: { user } } = await supabase.auth.getUser();
    const newBlockedState = !selectedUser.is_blocked;

    try {
      // 1. Atualiza Perfil
      await supabase
        .from('profiles')
        .update({
          is_blocked: newBlockedState,
          blocked_reason: newBlockedState ? reason.trim() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedUser.id);

      // 2. Grava log de auditoria obrigatório
      if (user) {
        await supabase.from('admin_audit_logs').insert({
          actor_user_id: user.id,
          action: newBlockedState ? 'USER_BLOCK' : 'USER_UNBLOCK',
          target_type: 'profiles',
          target_id: selectedUser.id,
          reason: reason.trim(),
        });
      }

      setSelectedUser(null);
      setReason('');
      loadUsers();
    } finally {
      setProcessing(false);
    }
  };

  const filtered = profiles.filter((p) => {
    if (!search) return true;
    return (
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-slate-900/60 border-b border-slate-800 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Gestão de Usuários</h1>
            <p className="text-xs text-slate-400">Controle de acessos e moderação auditável</p>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Pesquisar por nome ou ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Total: {profiles.length} usuários
            </span>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Nome / ID</th>
                  <th className="py-3 px-4">Cadastrado em</th>
                  <th className="py-3 px-4">Moeda / Fuso</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-850 transition">
                    <td className="py-3 px-4">
                      <strong className="text-white block text-sm">{p.full_name || 'Sem Nome'}</strong>
                      <span className="font-mono text-[10px] text-slate-500">{p.id}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{formatDateBR(p.created_at)}</td>
                    <td className="py-3 px-4 text-slate-400">{p.preferred_currency} • {p.timezone}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        p.is_blocked ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {p.is_blocked ? 'BLOQUEADO' : 'ATIVO'}
                      </span>
                      {p.blocked_reason && (
                        <span className="block text-[10px] text-slate-400 mt-1 italic">
                          Motivo: {p.blocked_reason}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(p)}
                        className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${
                          p.is_blocked
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-rose-600 hover:bg-rose-500 text-white'
                        }`}
                      >
                        {p.is_blocked ? 'Desbloquear' : 'Bloquear'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal com Justificativa Obrigatória */}
          {selectedUser && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white space-y-4">
                <div className="flex items-center space-x-2 text-amber-400 font-bold">
                  <ShieldAlert className="w-5 h-5" />
                  <h3>{selectedUser.is_blocked ? 'Desbloquear Conta' : 'Bloquear Conta do Usuário'}</h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Usuário: <strong>{selectedUser.full_name}</strong> ({selectedUser.id}).
                  Toda alteração de status exige justificativa e é registrada em logs de auditoria imutáveis.
                </p>

                <form onSubmit={handleToggleBlock} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Justificativa Operacional <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Informe o motivo formal do bloqueio/desbloqueio..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl"
                    >
                      {processing ? 'Processando...' : 'Confirmar e Gravar Auditoria'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
