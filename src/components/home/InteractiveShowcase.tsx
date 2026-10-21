'use client';

import React, { useState } from 'react';
import { Sparkles, TrendingDown, Wallet, Target, CalendarClock, CheckCircle2, Award, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

export default function InteractiveShowcase() {
  const [activeTab, setActiveTab] = useState<'detector' | 'resumo' | 'orcamento' | 'metas'>('detector');

  return (
    <div id="demonstrativo" className="max-w-5xl mx-auto">
      {/* Botões de Abas Interativas */}
      <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl max-w-xl mx-auto mb-8 border border-slate-300/80 shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab('detector')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'detector'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Detector</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('resumo')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'resumo'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wallet className="w-4 h-4 text-brand-600" />
          <span>Resumo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orcamento')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'orcamento'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingDown className="w-4 h-4 text-blue-600" />
          <span>Orçamento</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('metas')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'metas'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Target className="w-4 h-4 text-purple-600" />
          <span>Metas</span>
        </button>
      </div>

      {/* Frame do Produto */}
      <div className="bg-slate-900 rounded-3xl p-3 sm:p-5 shadow-2xl border border-slate-800">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-[11px] text-slate-400">app.cademeudinheiro.com.br</span>
          </div>
          <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Demonstração Interativa</span>
          </span>
        </div>

        <div className="p-4 sm:p-8 bg-slate-950 rounded-2xl min-h-[380px] flex flex-col justify-center">
          {/* Aba 1: Detector de Economias */}
          {activeTab === 'detector' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 text-white">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Aumento Inesperado Detectado
                  </span>
                  <span className="text-xs text-slate-400">Outubro vs Setembro</span>
                </div>
                <h4 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Aumento de 31,25% em Restaurantes e Delivery</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Seu gasto foi de <strong>R$ 320,00 em setembro</strong> e subiu para <strong>R$ 420,00 em outubro</strong> (+R$ 100,00). Se você definir uma meta mensal de R$ 350,00, poderá economizar R$ 70,00 todo mês.
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Economia Potencial Estimada</span>
                    <span className="text-xl font-black text-emerald-400">R$ 70,00/mês</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-xl">
                      Cálculo 100% transparente
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    TV
                  </div>
                  <div>
                    <h5 className="text-sm font-bold">Streaming de Esportes em Dobro</h5>
                    <p className="text-xs text-slate-400">Você tem 2 assinaturas que transmitem os mesmos campeonatos.</p>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-400">Economia: R$ 59,90/mês</span>
              </div>
            </div>
          )}

          {/* Aba 2: Resumo do Mês */}
          {activeTab === 'resumo' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-white">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Entradas Recebidas</span>
                  <span className="text-2xl font-black text-emerald-400 mt-1 block">R$ 5.800,00</span>
                  <span className="text-[11px] text-slate-500">Salário + Trabalho Extra</span>
                </div>

                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-white">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Despesas Pagas</span>
                  <span className="text-2xl font-black text-rose-400 mt-1 block">R$ 3.920,00</span>
                  <span className="text-[11px] text-slate-500">Fixas, Variáveis e Boletos</span>
                </div>

                <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/40 text-white">
                  <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider block">Saldo Livre Atual</span>
                  <span className="text-2xl font-black text-emerald-300 mt-1 block">+ R$ 1.880,00</span>
                  <span className="text-[11px] text-emerald-400">Superávit comprovado</span>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>3 contas já foram quitadas este mês e nenhuma está atrasada.</span>
                </div>
                <span className="font-bold text-white">Sem dor de cabeça</span>
              </div>
            </div>
          )}

          {/* Aba 3: Orçamento por Categoria */}
          {activeTab === 'orcamento' && (
            <div className="space-y-4 animate-fadeIn text-white">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white">Supermercado e Feira</span>
                  <span className="text-emerald-400 font-bold">R$ 950 de R$ 1.200 (79% consumido)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '79%' }} />
                </div>
                <span className="text-[11px] text-slate-400 block">Resta R$ 250,00 dentro do teto planejado.</span>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-rose-500/40 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white">Compras e Lazer</span>
                  <span className="text-rose-400 font-bold">R$ 680 de R$ 500 (136% - Limite ultrapassado)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: '100%' }} />
                </div>
                <span className="text-[11px] text-rose-300 block">Alerta: Excesso de R$ 180,00 em relação ao planejado.</span>
              </div>
            </div>
          )}

          {/* Aba 4: Metas Financeiras */}
          {activeTab === 'metas' && (
            <div className="space-y-4 animate-fadeIn text-white">
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-bold text-white text-base">Reserva de Emergência (6 meses)</h5>
                    <p className="text-xs text-slate-400">Objetivo: R$ 15.000,00</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                    68% CONCLUÍDO
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 mt-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-3 rounded-full" style={{ width: '68%' }} />
                </div>
                <div className="flex justify-between text-xs text-slate-300 mt-2">
                  <span>Já acumulado: <strong>R$ 10.200,00</strong></span>
                  <span>Faltam: <strong>R$ 4.800,00</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
