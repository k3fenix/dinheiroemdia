import React from 'react';
import { formatCurrency } from '@/lib/formatters';
import { evaluateBudgetThreshold } from '@/lib/math/financial';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface BudgetProgressBarProps {
  categoryName: string;
  limitAmount: number;
  spentAmount: number;
}

export default function BudgetProgressBar({
  categoryName,
  limitAmount,
  spentAmount,
}: BudgetProgressBarProps) {
  const { percentage, status, remaining } = evaluateBudgetThreshold(spentAmount, limitAmount);

  const statusConfigs = {
    normal: {
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      badge: 'Dentro da meta',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle,
    },
    alerta_50: {
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      badge: '50% atingido',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: CheckCircle,
    },
    alerta_80: {
      color: 'bg-amber-500',
      textColor: 'text-amber-800',
      badge: 'Atenção (>80%)',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: AlertTriangle,
    },
    estourado: {
      color: 'bg-rose-500',
      textColor: 'text-rose-700',
      badge: 'Limite ultrapassado!',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
      icon: ShieldAlert,
    },
  };

  const currentConfig = statusConfigs[status];
  const Icon = currentConfig.icon;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-slate-800 text-sm">{categoryName}</span>
        <div className={`flex items-center space-x-1 text-xs px-2 py-0.5 rounded-md border ${currentConfig.badgeClass}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{currentConfig.badge}</span>
        </div>
      </div>

      <div className="flex items-baseline justify-between text-xs text-slate-500 mb-1.5">
        <span>Gasto: <strong className="text-slate-800">{formatCurrency(spentAmount)}</strong></span>
        <span>Limite: <strong className="text-slate-800">{formatCurrency(limitAmount)}</strong></span>
      </div>

      {/* Barra de Progresso com Transição Suave */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${currentConfig.color}`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="font-semibold text-slate-600">
          {percentage}% consumido
        </span>
        <span className={status === 'estourado' ? 'text-rose-600 font-bold' : 'text-slate-500 font-medium'}>
          {status === 'estourado'
            ? `Excesso de ${formatCurrency(Math.abs(remaining))}`
            : `Resta: ${formatCurrency(remaining)}`}
        </span>
      </div>
    </div>
  );
}
