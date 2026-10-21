'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  CreditCard,
  FileText,
  History,
  LifeBuoy,
  Settings,
  ArrowLeft,
  LayoutDashboard,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menu = [
    { label: 'Visão Geral', href: '/admin', icon: LayoutDashboard },
    { label: 'Gestão de Usuários', href: '/admin/usuarios', icon: Users },
    { label: 'Planos e Preços', href: '/admin/planos', icon: CreditCard },
    { label: 'Conteúdo & Termos', href: '/admin/conteudo', icon: FileText },
    { label: 'Auditoria e Logs', href: '/admin/auditoria', icon: History },
    { label: 'Chamados de Suporte', href: '/admin/suporte', icon: LifeBuoy },
    { label: 'Diagnóstico & Sistema', href: '/admin/configuracoes', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 min-h-screen">
      {/* Topo com Aviso de Segurança */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800 space-x-3 bg-slate-900/40">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <span className="font-black text-white text-base tracking-tight block">
            Painel Admin
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
            Acesso Restrito
          </span>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 py-6 px-3 space-y-1.5">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Voltar para a área do cliente */}
      <div className="p-4 border-t border-slate-850 bg-slate-900/30">
        <Link
          href="/dashboard"
          className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition px-3 py-2 rounded-lg hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Meu Dinheiro</span>
        </Link>
      </div>
    </aside>
  );
}
