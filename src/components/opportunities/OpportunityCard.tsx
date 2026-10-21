'use client';

import React, { useState } from 'react';
import { Sparkles, Check, Trash2, ArrowUpRight, Award, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { SavingsOpportunity } from '@/types/database';
import { formatCurrency } from '@/lib/formatters';

interface OpportunityCardProps {
  opportunity: SavingsOpportunity;
  onUpdateStatus: (id: string, status: SavingsOpportunity['status']) => Promise<void>;
  onRegisterSavings: (id: string, confirmedAmount: number, notes: string) => Promise<void>;
}

export default function OpportunityCard({
  opportunity,
  onUpdateStatus,
  onRegisterSavings,
}: OpportunityCardProps) {
  const [showFormula, setShowFormula] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [realizedAmount, setRealizedAmount] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(realizedAmount.replace(',', '.'));
    if (isNaN(val) || val < 0) return;

    setLoading(true);
    try {
      await onRegisterSavings(opportunity.id, val, userNotes);
      setIsRegistering(false);
    } finally {
      setLoading(false);
    }
  };

  const badgeColors: Record<string, string> = {
    nova: 'bg-amber-100 text-amber-800 border-amber-200',
    em_analise: 'bg-blue-100 text-blue-800 border-blue-200',
    meta_definida: 'bg-purple-100 text-purple-800 border-purple-200',
    resultado_informado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    confirmada: 'bg-brand-100 text-brand-900 border-brand-300 font-bold',
    descartada: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  const confidenceBadge: Record<string, { label: string; bg: string }> = {
    alta: { label: 'Confiança Alta', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    media: { label: 'Confiança Média', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    baixa: { label: 'Suspeita (Verificar)', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition p-5 flex flex-col justify-between">
      <div>
        {/* Badges superiores */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-center space-x-2">
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeColors[opportunity.status] || 'bg-slate-100'}`}>
              {opportunity.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${confidenceBadge[opportunity.confidence_level]?.bg}`}>
              {confidenceBadge[opportunity.confidence_level]?.label}
            </span>
          </div>

          <span className="text-xs text-slate-600 font-medium">
            Período: {opportunity.reference_period}
          </span>
        </div>

        {/* Título e Descrição */}
        <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-start space-x-2">
          <Sparkles className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <span>{opportunity.title}</span>
        </h3>

        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          {opportunity.description}
        </p>

        {/* Bloco de Economia Potencial */}
        <div className="mt-4 bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Economia Potencial Estimada
            </span>
            <span className="text-lg font-black text-brand-700">
              {formatCurrency(opportunity.potential_savings)}
            </span>
          </div>

          {opportunity.confirmed_savings > 0 && (
            <div className="text-right">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                Economia Real Confirmada
              </span>
              <span className="text-lg font-black text-emerald-800">
                {formatCurrency(opportunity.confirmed_savings)}
              </span>
            </div>
          )}
        </div>

        {/* Detalhes do Cálculo Reproduzível */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowFormula(!showFormula)}
            className="text-xs text-slate-600 hover:text-slate-800 font-semibold inline-flex items-center space-x-1"
          >
            <span>Como este valor foi calculado?</span>
            {showFormula ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showFormula && (
            <div className="mt-2 p-3 bg-slate-100/80 rounded-xl text-xs text-slate-700 space-y-1 font-mono">
              <p><strong>Fórmula:</strong> {opportunity.calculation_details.formula || 'Base comparativa'}</p>
              {opportunity.calculation_details.previous_value !== undefined && (
                <p>Valor anterior: {formatCurrency(opportunity.calculation_details.previous_value)}</p>
              )}
              {opportunity.calculation_details.current_value !== undefined && (
                <p>Valor atual: {formatCurrency(opportunity.calculation_details.current_value)}</p>
              )}
              {opportunity.calculation_details.difference_pct !== undefined && (
                <p>Variação percentual: {opportunity.calculation_details.difference_pct}%</p>
              )}
              <p className="text-[11px] text-slate-600 font-sans mt-1">
                * Nenhum valor é presumido de terceiros ou instituições externas.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Formulário para registrar economia real comprovada */}
      {isRegistering ? (
        <form onSubmit={handleSaveResult} className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Quanto você economizou de fato? (R$)
            </label>
            <input
              type="text"
              required
              inputMode="decimal"
              value={realizedAmount}
              onChange={(e) => setRealizedAmount(e.target.value)}
              placeholder="Ex: 75,00"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Observação / Comprovante (Opcional)
            </label>
            <input
              type="text"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="Ex: Renegociei o plano da internet"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
            />
          </div>
          <div className="flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsRegistering(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
            >
              {loading ? 'Salvando...' : 'Confirmar Economia'}
            </button>
          </div>
        </form>
      ) : (
        /* Barra de Ações */
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsRegistering(true)}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition touch-target"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Registrar Resultado Real</span>
            </button>

            {opportunity.status === 'nova' && (
              <button
                type="button"
                onClick={() => onUpdateStatus(opportunity.id, 'em_analise')}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              >
                Analisar
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => onUpdateStatus(opportunity.id, 'descartada')}
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
            title="Descartar oportunidade"
            aria-label="Descartar oportunidade"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
