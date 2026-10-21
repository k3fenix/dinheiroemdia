'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { createClient } from '@/lib/supabase/client';
import { AdminAuditLog } from '@/types/database';
import { formatDateBR } from '@/lib/formatters';
import { History, Shield, Lock } from 'lucide-react';

export default function AdminAuditoriaPage() {
  const supabase = createClient();
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    const { data } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setLogs(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-slate-900/60 border-b border-slate-800 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Logs de Auditoria Administrativa</h1>
            <p className="text-xs text-slate-400">Trilha imutável de eventos sensíveis e intervenções</p>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Data/Hora</th>
                  <th className="py-3 px-4">Ação</th>
                  <th className="py-3 px-4">Alvo</th>
                  <th className="py-3 px-4">Justificativa / Motivo</th>
                  <th className="py-3 px-4 font-mono">Operador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-sans">
                      Nenhum registro de auditoria no histórico.
                    </td>
                  </tr>
                ) : (
                  logs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-850 transition">
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">{formatDateBR(l.created_at)}</td>
                      <td className="py-3.5 px-4 font-bold text-amber-400">{l.action}</td>
                      <td className="py-3.5 px-4 text-slate-300">{l.target_type} ({l.target_id || '-'})</td>
                      <td className="py-3.5 px-4 font-sans text-slate-200">{l.reason || 'Sem justificativa informada'}</td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] truncate max-w-xs">{l.actor_user_id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
