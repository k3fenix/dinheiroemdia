import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SavingsSimulator from '@/components/home/SavingsSimulator';
import InteractiveShowcase from '@/components/home/InteractiveShowcase';
import ComparisonSection from '@/components/home/ComparisonSection';
import FaqAccordion from '@/components/home/FaqAccordion';
import {
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  Lock,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  PiggyBank,
  Smartphone,
  EyeOff,
  BarChart,
  CalendarCheck,
  Check,
  Zap,
  HeartHandshake,
  Users,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-brand-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* ===================================================================
            HERO SECTION — ULTRA MODERNA COM GLOW, BADGES E ALTO IMPACTO
        =================================================================== */}
        <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 glow-emerald bg-grid-pattern border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge de Segurança Pulsante */}
              <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-white/90 border border-emerald-300 shadow-sm shadow-emerald-500/10 text-emerald-900 text-xs font-extrabold uppercase tracking-wider mb-8 hover:scale-105 transition-transform duration-200 backdrop-blur-md">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Livre de senhas de banco e Open Finance</span>
              </div>

              {/* Título Principal com Destaque Tipográfico */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Descubra para onde seu{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-500">
                  dinheiro está indo.
                </span>
              </h1>

              {/* Subtítulo Conforme Requisitos */}
              <p className="mt-6 text-lg sm:text-2xl text-slate-600 leading-relaxed font-normal max-w-3xl mx-auto">
                Organize suas contas, encontre oportunidades para economizar e acompanhe seus resultados <strong>sem conectar sua conta bancária</strong>.
              </p>

              {/* Botões de Ação Principais */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
                <Link
                  href="/cadastro"
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-extrabold text-white bg-gradient-to-r from-brand-600 via-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 shadow-xl shadow-brand-600/25 hover:shadow-2xl hover:shadow-brand-600/35 transition-all duration-200 touch-target group"
                >
                  <span>Começar gratuitamente</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform" />
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-2xl text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm hover:shadow transition-all duration-200 touch-target"
                >
                  Entrar na minha conta
                </Link>

                <a
                  href="#simulador"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 rounded-2xl text-sm font-bold text-slate-600 hover:text-brand-700 hover:bg-slate-100/60 transition touch-target"
                >
                  Testar Simulador &darr;
                </a>
              </div>

              {/* Badges de Confiança */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-600 font-semibold">
                <span className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />
                  Sem cartão de crédito para começar
                </span>
                <span className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />
                  100% em conformidade com a LGPD
                </span>
                <span className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />
                  Ideal para jovens, adultos e idosos
                </span>
              </div>
            </div>

            {/* SIMULADOR INTERATIVO AO VIVO NO TOPO */}
            <div className="mt-16 max-w-5xl mx-auto">
              <SavingsSimulator />
            </div>
          </div>
        </section>

        {/* ===================================================================
            DEMONSTRATIVO VISUAL EM ABAS INTERATIVAS
        =================================================================== */}
        <section className="py-20 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block mb-2">
                Simplicidade na Prática
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Veja o aplicativo por dentro antes de se cadastrar
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600">
                Alterne entre as abas abaixo para explorar como o sistema organiza seus meses e detecta oportunidades de economia.
              </p>
            </div>

            <InteractiveShowcase />
          </div>
        </section>

        {/* ===================================================================
            SEÇÃO COMPARATIVA: CADÊ MEU DINHEIRO VS OUTROS APPS
        =================================================================== */}
        <ComparisonSection />

        {/* ===================================================================
            COMO FUNCIONA (3 PASSOS RÁPIDOS)
        =================================================================== */}
        <section id="como-funciona" className="py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block mb-2">
                Método Simples e Seguro
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Como o Cadê Meu Dinheiro funciona?
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600">
                Você gasta apenas 2 minutos para colocar suas finanças em ordem total.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 border border-brand-200 flex items-center justify-center font-black text-2xl mb-6 shadow-inner">
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Cadastre suas receitas e contas
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Informe suas contas do mês (água, luz, aluguel), assinaturas recorrentes e os gastos do seu dia a dia sem expor sua conta bancária.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black text-2xl mb-6 shadow-inner">
                  2
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  O detector aponta os vazamentos
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  O sistema calcula automaticamente variações entre períodos, assinaturas duplicadas e categorias que ultrapassaram seu orçamento planejado.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-black text-2xl mb-6 shadow-inner">
                  3
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Comprove quanto economizou
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Registre as economias que você conquistou na prática e acompanhe seu dinheiro crescendo mês a mês com relatórios que qualquer pessoa entende.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            ACESSIBILIDADE: IDEAL PARA IDOSOS E QUEM QUER SIMPLICIDADE
        =================================================================== */}
        <section className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block mb-2">
                  Inclusão e Acessibilidade
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  Desenvolvido para qualquer adulto ou pessoa idosa usar sem medo.
                </h2>
                <p className="mt-4 text-base text-slate-600 leading-relaxed">
                  Muitos aplicativos financeiros usam letras miúdas, termos complicados em inglês e interfaces confusas. Nós acreditamos que organizar o dinheiro deve ser tão simples quanto anotar num caderninho:
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm text-slate-900 block">Opção de Letras Grandes e Extra Grandes:</strong>
                      <span className="text-xs text-slate-600">Aumente o tamanho de todo o texto com apenas 1 clique nas configurações.</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm text-slate-900 block">Botões Grandes e Teclado Numérico Fácil:</strong>
                      <span className="text-xs text-slate-600">Áreas de toque amplas para não errar no celular.</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm text-slate-900 block">Linguagem Respeitosa e Direta:</strong>
                      <span className="text-xs text-slate-600">Sem termos como spread, yield ou cashflow. Apenas o que interessa: quanto entrou, quanto saiu e onde poupar.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/cadastro"
                    className="inline-flex items-center text-sm font-extrabold text-brand-700 hover:text-brand-800"
                  >
                    Criar conta agora mesmo &rarr;
                  </Link>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Exemplo com Escala Grande</span>
                  <p className="text-xl font-black text-slate-900 mt-1">Conta de Luz: R$ 184,50</p>
                  <span className="text-xs text-emerald-700 font-semibold block mt-0.5">Vencimento em 28/10 • Situação: Paga</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Saldo Restante</span>
                  <p className="text-2xl font-black text-emerald-600 mt-1">+ R$ 1.250,00</p>
                  <span className="text-xs text-slate-500 font-medium block mt-0.5">Disponível para suas despesas</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            PLANOS E PREÇOS
        =================================================================== */}
        <section id="planos" className="py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block mb-2">
                Transparência nos Valores
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Planos simples que cabem no seu orçamento
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600">
                Você pode começar gratuitamente e fazer upgrade apenas se desejar o detector completo e compartilhamento familiar.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
              {/* Plano Gratuito */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Gratuito</h3>
                  <p className="text-xs text-slate-500 mt-1">Para dar os primeiros passos</p>
                  <div className="my-6">
                    <span className="text-4xl font-black text-slate-900">R$ 0</span>
                    <span className="text-xs text-slate-500 ml-1">/mês</span>
                  </div>
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>Até 50 lançamentos por mês</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>Categorias essenciais completas</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>Resumo mensal básico</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>Contas a pagar do mês</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>Exportação dos seus dados (LGPD)</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8">
                  <Link
                    href="/cadastro"
                    className="block w-full py-3.5 text-center text-xs sm:text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    Criar conta grátis
                  </Link>
                </div>
              </div>

              {/* Plano Econômico (Destaque) */}
              <div className="bg-slate-900 text-white rounded-3xl p-8 border-2 border-brand-500 shadow-xl relative flex flex-col justify-between">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                  Mais Popular
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Econômico</h3>
                  <p className="text-xs text-slate-400 mt-1">Para quem quer economizar de verdade</p>
                  <div className="my-6">
                    <span className="text-4xl font-black text-white">R$ 14,90</span>
                    <span className="text-xs text-slate-400 ml-1">/mês</span>
                  </div>
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-brand-400 shrink-0" />
                      <span><strong>Lançamentos ilimitados</strong></span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-brand-400 shrink-0" />
                      <span><strong>Detector inteligente de economias</strong></span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-brand-400 shrink-0" />
                      <span>Registro de economia comprovada</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-brand-400 shrink-0" />
                      <span>Metas financeiras com histórico</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-brand-400 shrink-0" />
                      <span>Lembretes de vencimento por e-mail</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-brand-400 shrink-0" />
                      <span>Histórico ampliado de 24 meses</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8">
                  <Link
                    href="/cadastro"
                    className="block w-full py-3.5 text-center text-xs sm:text-sm font-extrabold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition shadow-lg shadow-brand-600/30"
                  >
                    Começar teste no Econômico
                  </Link>
                </div>
              </div>

              {/* Plano Família */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Família</h3>
                  <p className="text-xs text-slate-500 mt-1">Para organizar a casa com até 5 pessoas</p>
                  <div className="my-6">
                    <span className="text-4xl font-black text-slate-900">R$ 24,90</span>
                    <span className="text-xs text-slate-500 ml-1">/mês</span>
                  </div>
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>Tudo do Plano Econômico</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>Compartilhamento com até 5 membros</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>Orçamentos e metas familiares</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>Controle mútuo de privacidade</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8">
                  <Link
                    href="/cadastro"
                    className="block w-full py-3.5 text-center text-xs sm:text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    Escolher Plano Família
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            PERGUNTAS FREQUENTES (FAQ COM ACCORDION INTERATIVO)
        =================================================================== */}
        <section id="faq" className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block mb-2">
                Tire suas dúvidas
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Perguntas Frequentes
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Clique nas perguntas para ver as respostas detalhadas
              </p>
            </div>

            <FaqAccordion />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
