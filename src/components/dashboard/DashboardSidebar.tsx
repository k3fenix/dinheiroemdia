'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarClock,
  Repeat,
  Tags,
  PiggyBank,
  TrendingDown,
  Target,
  BarChart3,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  Shield,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isAdmin?: boolean;
}

export default function DashboardSidebar({ isOpen, onClose, isAdmin }: DashboardSidebarProps) {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const navItems = [
    { label: 'Visão Geral', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Receitas', href: '/dashboard/receitas', icon: ArrowUpCircle },
    { label: 'Despesas', href: '/dashboard/despesas', icon: ArrowDownCircle },
    { label: 'Contas a Pagar', href: '/dashboard/contas-a-pagar', icon: CalendarClock },
    { label: 'Gastos Recorrentes', href: '/dashboard/recorrentes', icon: Repeat },
    { label: 'Categorias', href: '/dashboard/categorias', icon: Tags },
    { label: 'Orçamento Mensal', href: '/dashboard/orcamento', icon: PiggyBank },
    { label: 'Onde Economizar?', href: '/dashboard/oportunidades', icon: TrendingDown, highlight: true },
    { label: 'Metas Financeiras', href: '/dashboard/metas', icon: Target },
    { label: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3 },
    { label: 'Meu Plano', href: '/dashboard/assinatura', icon: CreditCard },
    { label: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
    { label: 'Ajuda e Suporte', href: '/dashboard/ajuda', icon: HelpCircle },
  ];

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden backdrop-blur-xs"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header da Sidebar */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
              R$
            </div>
            <span className="font-bold text-white text-base tracking-tight">
              Cadê Meu Dinheiro?
            </span>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-white p-1"
              aria-label="Fechar menu"
            >
              ✕
            </button>
          )}
        </div>

        {/* Links de Navegação */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-xs'
                    : item.highlight
                    ? 'text-amber-400 hover:bg-slate-800/80 hover:text-amber-300 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                    Novo
                  </span>
                )}
              </Link>
            );
          })}

          {/* Atalho para Administração se tiver permissão */}
          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-slate-800">
              <span className="px-3 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Administração
              </span>
              <Link
                href="/admin"
                className="mt-1 flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-300 hover:bg-amber-950/40 border border-amber-900/30 transition"
              >
                <Shield className="w-5 h-5 text-amber-400" />
                <span>Painel Admin</span>
              </Link>
            </div>
          )}
        </div>

        {/* Footer do Menu com Botão de Sair */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>
    </>
  );
}
