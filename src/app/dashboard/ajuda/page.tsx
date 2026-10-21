'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { createClient } from '@/lib/supabase/client';
import { SupportTicket, SupportMessage, Profile } from '@/types/database';
import { formatDateBR } from '@/lib/formatters';
import { HelpCircle, Plus, Send, MessageSquare, CheckCircle } from 'lucide-react';

export default function AjudaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Novo Ticket Form
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Dúvida sobre uso');
  const [priority, setPriority] = useState<'baixa' | 'media' | 'alta'>('media');
  const [initialMessage, setInitialMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState('');

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

  const loadTickets = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setTickets(data);
  }, [user, supabase]);

  const loadMessages = useCallback(async (ticketId: string) => {
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  }, [supabase]);

  useEffect(() => {
    if (user) loadTickets();
  }, [user, loadTickets]);

  useEffect(() => {
    if (selectedTicket) loadMessages(selectedTicket.id);
  }, [selectedTicket, loadMessages]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !initialMessage.trim()) return;

    const { data: t, error } = await supabase
      .from('support_tickets')
      .insert([
        {
          user_id: user.id,
          subject: subject.trim(),
          category,
          priority,
          status: 'aberto',
        },
      ])
      .select()
      .single();

    if (t) {
      await supabase.from('support_messages').insert([
        {
          ticket_id: t.id,
          sender_user_id: user.id,
          message: initialMessage.trim(),
          is_admin_reply: false,
        },
      ]);

      setSubject('');
      setInitialMessage('');
      setShowNewTicket(false);
      loadTickets();
      setSelectedTicket(t);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    await supabase.from('support_messages').insert([
      {
        ticket_id: selectedTicket.id,
        sender_user_id: user.id,
        message: replyMessage.trim(),
        is_admin_reply: false,
      },
    ]);

    setReplyMessage('');
    loadMessages(selectedTicket.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} isAdmin={isAdmin} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <DashboardHeader
          userName={profile?.full_name || user?.email}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNewTransaction={() => router.push('/dashboard')}
          periodLabel="Ajuda e Suporte"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
                <HelpCircle className="w-6 h-6 text-brand-600" />
                <span>Central de Ajuda e Suporte</span>
              </h1>
              <p className="text-xs text-slate-500">
                Tire dúvidas, envie sugestões ou solicite assistência técnica
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowNewTicket(!showNewTicket)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs transition touch-target"
            >
              <Plus className="w-4 h-4" />
              <span>{showNewTicket ? 'Cancelar' : '+ Novo Chamado'}</span>
            </button>
          </div>

          {showNewTicket && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
              <h3 className="text-base font-bold text-slate-900 mb-4">Abrir Solicitação de Suporte</h3>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Assunto</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Dúvida sobre categorização de contas"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="Dúvida sobre uso">Dúvida sobre uso</option>
                      <option value="Problema técnico / Erro">Problema técnico / Erro</option>
                      <option value="Assinatura e Pagamentos">Assinatura e Pagamentos</option>
                      <option value="Sugestão de funcionalidade">Sugestão de funcionalidade</option>
                      <option value="Privacidade / LGPD">Privacidade / LGPD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Descrição do Problema ou Dúvida</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Explique com detalhes como podemos te ajudar..."
                    value={initialMessage}
                    onChange={(e) => setInitialMessage(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewTicket(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
                  >
                    Enviar Chamado
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Grade: Lista de Chamados e Mensagens */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500">
                Seus Chamados ({tickets.length})
              </div>

              {tickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Nenhum chamado aberto.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                  {tickets.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTicket(t)}
                      className={`w-full text-left p-4 hover:bg-slate-50 transition block ${
                        selectedTicket?.id === t.id ? 'bg-brand-50/60 border-l-4 border-brand-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className={`font-bold px-2 py-0.5 rounded ${
                          t.status === 'respondido' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {t.status.toUpperCase()}
                        </span>
                        <span className="text-slate-400">{formatDateBR(t.created_at)}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">{t.subject}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{t.category}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Painel da Mensagem */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col h-[500px]">
              {selectedTicket ? (
                <>
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{selectedTicket.subject}</h3>
                      <p className="text-xs text-slate-500">{selectedTicket.category} • Aberto em {formatDateBR(selectedTicket.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col max-w-md ${
                          m.is_admin_reply ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 mb-0.5">
                          {m.is_admin_reply ? 'Equipe de Suporte' : 'Você'}
                        </span>
                        <div
                          className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            m.is_admin_reply
                              ? 'bg-brand-600 text-white rounded-tr-none'
                              : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none shadow-2xs'
                          }`}
                        >
                          {m.message}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Digite sua resposta..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <MessageSquare className="w-10 h-10 mb-2 stroke-1" />
                  <p className="text-sm font-medium">Selecione um chamado ao lado para ver as mensagens</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
