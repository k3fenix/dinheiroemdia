'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CheckCircle2,
  Clock,
  Repeat,
  Sparkles,
  Award,
  Target,
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  paidBillsTotal: number;
  pendingBillsTotal: number;
  pendingBillsCount: number;
  recurringTotal: number;
  confirmedSavings: number;
  opportunitiesCount: number;
  potentialSavings: number;
  goalsProgressAverage: number;
  activeGoalsCount: number;
}

export default function SummaryCards({
  totalIncome,
  totalExpense,
  balance,
  paidBillsTotal,
  pendingBillsTotal,
  pendingBillsCount,
  recurringTotal,
  confirmedSavings,
  opportunitiesCount,
  potentialSavings,
  goalsProgressAverage,
  activeGoalsCount,
}: SummaryCardsProps) {
  const isBalancePositive = balance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
      {/* 1. Receitas do Mês */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total de Receitas
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <p className="mt-3 text-2xl font-black text-slate-900 tracking-tight">
          {formatCurrency(totalIncome)}
        </p>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Entradas confirmadas e previstas no mês
        </p>
      </div>

      {/* 2. Despesas do Mês */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total de Despesas
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <p className="mt-3 text-2xl font-black text-slate-900 tracking-tight">
          {formatCurrency(totalExpense)}
        </p>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Total de gastos realizados e previstos
        </p>
      </div>

      {/* 3. Saldo do Período */}
      <div className={`p-5 rounded-2xl border transition shadow-2xs hover:shadow-xs ${
        isBalancePositive
          ? 'bg-emerald-950/5 border-emerald-200/80'
          : 'bg-rose-950/5 border-rose-200/80'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Saldo do Período
          </span>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            isBalancePositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}>
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <p className={`mt-3 text-2xl font-black tracking-tight ${
          isBalancePositive ? 'text-emerald-700' : 'text-rose-700'
        }`}>
          {formatCurrency(balance)}
        </p>
        <p className="mt-1 text-xs text-slate-600 font-medium">
          {isBalancePositive ? 'Superávit no período selecionado' : 'Atenção: despesas superam receitas'}
        </p>
      </div>

      {/* 4. Contas Pagas */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Contas Já Pagas
          </span>
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
        <p className="mt-3 text-2xl font-black text-slate-900 tracking-tight">
          {formatCurrency(paidBillsTotal)}
        </p>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Compromissos quitados este mês
        </p>
      </div>

      {/* 5. Contas Pendentes */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Contas Pendentes
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <p className="mt-3 text-2xl font-black text-amber-600 tracking-tight">
          {formatCurrency(pendingBillsTotal)}
        </p>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          {pendingBillsCount} {pendingBillsCount === 1 ? 'conta aguardando' : 'contas aguardando'} pagamento
        </p>
      </div>

      {/* 6. Despesas Recorrentes */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Gastos Recorrentes
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Repeat className="w-5 h-5" />
          </div>
        </div>
        <p className="mt-3 text-2xl font-black text-slate-900 tracking-tight">
          {formatCurrency(recurringTotal)}
        </p>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Assinaturas e contas fixas cadastradas
        </p>
      </div>

      {/* 7. Economia Confirmada (Diferencial Crítico) */}
      <div className="bg-gradient-to-br from-brand-50 to-emerald-100/50 p-5 rounded-2xl border border-emerald-300/80 shadow-2xs hover:shadow-xs transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-brand-900 uppercase tracking-wider">
            Economia Real Comprovada
          </span>
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-2xs">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <p className="mt-3 text-2xl font-black text-brand-900 tracking-tight">
          {formatCurrency(confirmedSavings)}
        </p>
        <p className="mt-1 text-xs text-brand-700 font-semibold">
          Resultado real verificado e confirmado por você
        </p>
      </div>

      {/* 8. Oportunidades Identificadas */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Oportunidades de Economia
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {opportunitiesCount}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            detectadas ({formatCurrency(potentialSavings)} potenciais)
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400 font-medium">
          Valores estimados com base em seus dados
        </p>
      </div>

      {/* 9. Metas Financeiras */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Metas Financeiras
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {goalsProgressAverage}%
          </span>
          <span className="text-xs font-semibold text-slate-500">
            progresso médio ({activeGoalsCount} ativas)
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, goalsProgressAverage))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
