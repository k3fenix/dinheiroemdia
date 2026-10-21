'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { createClient } from '@/lib/supabase/client';
import { SupportTicket, SupportMessage } from '@/types/database';
import { formatDateBR } from '@/lib/formatters';
import { LifeBuoy, Send, CheckCircle2 } from 'lucide-react';

export default function AdminSuportePage() {
  const supabase = createClient();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [replyText, setReplyText] = useState('');

  const loadTickets = useCallback(async () => {
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setTickets(data);
  }, [supabase]);

  const loadMessages = useCallback(async (ticketId: string) => {
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  }, [supabase]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (selectedTicket) loadMessages(selectedTicket.id);
  }, [selectedTicket, loadMessages]);

  const handleAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Grava mensagem do suporte
    await supabase.from('support_messages').insert([
      {
        ticket_id: selectedTicket.id,
        sender_user_id: user.id,
        message: replyText.trim(),
        is_admin_reply: true,
      },
    ]);

    // 2. Atualiza status do ticket para respondido
    await supabase
      .from('support_tickets')
      .update({ status: 'respondido', updated_at: new Date().toISOString() })
      .eq('id', selectedTicket.id);

    setReplyText('');
    loadMessages(selectedTicket.id);
    loadTickets();
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    await supabase
      .from('support_tickets')
      .update({ status: 'fechado', updated_at: new Date().toISOString() })
      .eq('id', selectedTicket.id);
    setSelectedTicket({ ...selectedTicket, status: 'fechado' });
    loadTickets();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-slate-900/60 border-b border-slate-800 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Atendimento e Chamados</h1>
            <p className="text-xs text-slate-400">Responda dúvidas e solicitações dos clientes</p>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Lista de Chamados */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-400">
                Chamados de Clientes ({tickets.length})
              </div>
              <div className="divide-y divide-slate-800 overflow-y-auto flex-1">
                {tickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`w-full text-left p-4 hover:bg-slate-850 transition block ${
                      selectedTicket?.id === t.id ? 'bg-slate-800 border-l-4 border-amber-400' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                        t.status === 'aberto' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {t.status}
                      </span>
                      <span className="text-slate-500">{formatDateBR(t.created_at)}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white truncate">{t.subject}</h4>
                    <p className="text-xs text-slate-400">{t.category} • Prioridade {t.priority}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Conversa e Resposta */}
            <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
              {selectedTicket ? (
                <>
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm">{selectedTicket.subject}</h3>
                      <p className="text-xs text-slate-400">Cliente ID: {selectedTicket.user_id}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCloseTicket}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      Encerrar Chamado
                    </button>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/60">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col max-w-lg ${
                          m.is_admin_reply ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <span className="text-[10px] text-slate-500 mb-0.5">
                          {m.is_admin_reply ? 'Você (Suporte)' : 'Cliente'}
                        </span>
                        <div
                          className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            m.is_admin_reply
                              ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                              : 'bg-slate-850 text-white rounded-tl-none border border-slate-800'
                          }`}
                        >
                          {m.message}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAdminReply} className="p-3 border-t border-slate-800 flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Escreva uma resposta oficial ao cliente..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-400 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-300 transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                  Selecione um chamado para atender.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
