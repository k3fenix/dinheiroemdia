import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PlanosPublicPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block mb-2">
            Planos e Preços
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Escolha o plano ideal para suas finanças
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Comece no plano gratuito ou turbine sua economia com recursos inteligentes e compartilhamento familiar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {/* Gratuito */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Gratuito</h3>
              <p className="text-xs text-slate-500 mt-1">Organização básica individual</p>
              <div className="my-6">
                <span className="text-4xl font-black text-slate-900">R$ 0</span>
                <span className="text-xs text-slate-500 ml-1">/mês</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Até 50 lançamentos mensais</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Categorias padrão essenciais</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Resumo mensal básico</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Contas a pagar do mês</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <Link
                href="/cadastro"
                className="block w-full py-3.5 text-center text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Cadastrar Grátis
              </Link>
            </div>
          </div>

          {/* Econômico */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 border-2 border-brand-500 shadow-xl relative flex flex-col justify-between">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full">
              Mais Recomendado
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Econômico</h3>
              <p className="text-xs text-slate-400 mt-1">Com detector de economia ativo</p>
              <div className="my-6">
                <span className="text-4xl font-black text-white">R$ 14,90</span>
                <span className="text-xs text-slate-400 ml-1">/mês</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span><strong>Lançamentos ilimitados</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span><strong>Detector inteligente de economia</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Registro de economia comprovada</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Metas de economia com aportes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Lembretes de vencimento por e-mail</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <Link
                href="/cadastro"
                className="block w-full py-3.5 text-center text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition shadow-md shadow-brand-600/30"
              >
                Assinar Plano Econômico
              </Link>
            </div>
          </div>

          {/* Família */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Família</h3>
              <p className="text-xs text-slate-500 mt-1">Compartilhado para até 5 pessoas</p>
              <div className="my-6">
                <span className="text-4xl font-black text-slate-900">R$ 24,90</span>
                <span className="text-xs text-slate-500 ml-1">/mês</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Todos os recursos do Econômico</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Até 5 membros com convites seguros</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Orçamentos e metas familiares</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Controle mútuo de privacidade</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <Link
                href="/cadastro"
                className="block w-full py-3.5 text-center text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Assinar Plano Família
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
