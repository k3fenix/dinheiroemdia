'use client';

import React from 'react';
import { Menu, Plus, ArrowDown, ArrowUp } from 'lucide-react';

interface DashboardHeaderProps {
  userName?: string;
  onOpenMobileMenu: () => void;
  onOpenNewTransaction: (type: 'income' | 'expense') => void;
  periodLabel: string;
}

export default function DashboardHeader({
  userName = 'Amigo(a)',
  onOpenMobileMenu,
  onOpenNewTransaction,
  periodLabel,
}: DashboardHeaderProps) {
  const firstName = userName.split(' ')[0] || 'Usuário';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Lado Esquerdo: Toggle mobile e Saudação */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 touch-target"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Olá, {firstName}! 👋
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Período ativo: <span className="font-semibold text-slate-700">{periodLabel}</span>
            </p>
          </div>
        </div>

        {/* Lado Direito: Ações Rápidas */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            type="button"
            onClick={() => onOpenNewTransaction('income')}
            className="inline-flex items-center space-x-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition touch-target"
          >
            <ArrowUp className="w-4 h-4 text-brand-600" />
            <span className="hidden xs:inline">+ Receita</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenNewTransaction('expense')}
            className="inline-flex items-center space-x-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition touch-target"
          >
            <ArrowDown className="w-4 h-4 text-white" />
            <span>+ Despesa</span>
          </button>
        </div>
      </div>
    </header>
  );
}
