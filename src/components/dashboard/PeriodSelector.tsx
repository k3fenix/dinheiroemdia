'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface PeriodSelectorProps {
  currentMonth: number; // 1-12
  currentYear: number;
  onChange: (month: number, year: number) => void;
}

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function PeriodSelector({
  currentMonth,
  currentYear,
  onChange,
}: PeriodSelectorProps) {
  const handlePrev = () => {
    if (currentMonth === 1) {
      onChange(12, currentYear - 1);
    } else {
      onChange(currentMonth - 1, currentYear);
    }
  };

  const handleNext = () => {
    if (currentMonth === 12) {
      onChange(1, currentYear + 1);
    } else {
      onChange(currentMonth + 1, currentYear);
    }
  };

  const handleCurrent = () => {
    const now = new Date();
    onChange(now.getMonth() + 1, now.getFullYear());
  };

  return (
    <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
      <button
        type="button"
        onClick={handlePrev}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition touch-target"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center space-x-1.5 px-2">
        <Calendar className="w-4 h-4 text-brand-600 hidden sm:block" />
        <span className="text-sm font-bold text-slate-800 tracking-tight">
          {MONTH_NAMES[currentMonth - 1]} de {currentYear}
        </span>
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition touch-target"
        aria-label="Próximo mês"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={handleCurrent}
        className="hidden xs:inline-block ml-1 text-xs font-semibold text-slate-500 hover:text-brand-600 px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
      >
        Mês atual
      </button>
    </div>
  );
}
