'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/formatters';
import { Calculator, Sparkles, ArrowRight, TrendingDown, PiggyBank, ShieldCheck } from 'lucide-react';

export default function SavingsSimulator() {
  const [deliverySpent, setDeliverySpent] = useState(400);
  const [subscriptionsSpent, setSubscriptionsSpent] = useState(180);
  const [utilitiesSpent, setUtilitiesSpent] = useState(350);

  // Estimativa conservadora e realista baseada em renegociação e metas (15% em delivery, 30% em assinaturas esquecidas, 12% em contas fixas)
  const potentialDeliverySavings = Math.round(deliverySpent * 0.20);
  const potentialSubSavings = Math.round(subscriptionsSpent * 0.35);
  const potentialUtilSavings = Math.round(utilitiesSpent * 0.15);

  const monthlyPotential = potentialDeliverySavings + potentialSubSavings + potentialUtilSavings;
  const annualPotential = monthlyPotential * 12;

  return (
    <div id="simulador" className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-10 text-white shadow-2xl border border-slate-800 overflow-hidden">
      {/* Luz ambiente de fundo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Calculator className="w-4 h-4" />
              <span>Simulador Interativo em Tempo Real</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Quanto dinheiro você pode descobrir este mês?
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Mova as barrinhas abaixo com base nos seus gastos aproximados e veja quanto pode voltar para o seu bolso sem cortar o que é essencial.
            </p>
          </div>

          <div className="text-xs text-slate-400 flex items-center space-x-1.5 shrink-0 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Simulação anônima • Sem dados bancários</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders de Gastos */}
          <div className="lg:col-span-7 space-y-6 bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
            {/* Slider 1: Delivery / Restaurantes */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-200">Delivery, iFood e Restaurantes</span>
                <span className="font-black text-amber-400">{formatCurrency(deliverySpent)}/mês</span>
              </div>
              <input
                type="range"
                min="100"
                max="1500"
                step="50"
                value={deliverySpent}
                onChange={(e) => setDeliverySpent(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>R$ 100</span>
                <span>R$ 1.500</span>
              </div>
            </div>

            {/* Slider 2: Assinaturas Digitais */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-200">Assinaturas e Mensalidades (Streaming, Academia)</span>
                <span className="font-black text-amber-400">{formatCurrency(subscriptionsSpent)}/mês</span>
              </div>
              <input
                type="range"
                min="50"
                max="800"
                step="25"
                value={subscriptionsSpent}
                onChange={(e) => setSubscriptionsSpent(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>R$ 50</span>
                <span>R$ 800</span>
              </div>
            </div>

            {/* Slider 3: Contas Fixas / Internet */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-200">Contas Fixas Renegociáveis (Internet, Celular, Tarifas)</span>
                <span className="font-black text-amber-400">{formatCurrency(utilitiesSpent)}/mês</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={utilitiesSpent}
                onChange={(e) => setUtilitiesSpent(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>R$ 100</span>
                <span>R$ 1.000</span>
              </div>
            </div>
          </div>

          {/* Resultado Impactante em Destaque */}
          <div className="lg:col-span-5 bg-gradient-to-b from-brand-950/90 to-emerald-950/70 p-6 sm:p-8 rounded-3xl border border-emerald-500/40 shadow-xl flex flex-col justify-between space-y-6 text-center lg:text-left">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block mb-1">
                Economia Potencial Descoberta
              </span>
              <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight my-2">
                {formatCurrency(monthlyPotential)}
                <span className="text-base text-slate-300 font-semibold ml-1">/mês</span>
              </div>
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                Ajustando pequenos excessos em delivery e cancelando assinaturas que você quase não usa.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 text-left space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Em 1 ano você pode acumular:
              </span>
              <div className="text-2xl font-black text-white flex items-center space-x-2">
                <PiggyBank className="w-6 h-6 text-emerald-400 shrink-0" />
                <span>{formatCurrency(annualPotential)}</span>
              </div>
              <span className="text-[11px] text-slate-400 block">
                Suficiente para criar sua reserva de emergência ou realizar uma viagem em família.
              </span>
            </div>

            <Link
              href="/cadastro"
              className="w-full inline-flex items-center justify-center px-6 py-4 rounded-2xl text-sm font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 to-brand-300 hover:from-emerald-300 hover:to-brand-200 shadow-lg shadow-emerald-500/20 transition-all duration-200 group"
            >
              <span>Organizar minhas contas de graça</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
