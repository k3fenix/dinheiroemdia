import React from 'react';
import { Check, X, ShieldCheck } from 'lucide-react';

export default function ComparisonSection() {
  const comparisonItems = [
    {
      feature: 'Privacidade de Senhas e Contas',
      other: 'Exigem senhas bancárias ou tokens Open Finance',
      us: '100% livre de senhas e acessos ao seu banco',
    },
    {
      feature: 'Conexão e Estabilidade',
      other: 'Desconecta constantemente e dá erro de sincronização',
      us: 'Sempre disponível, leve e sem depender de APIs de bancos',
    },
    {
      feature: 'Uso dos seus Dados Pessoais',
      other: 'Podem monetizar seu perfil com propagandas e crédito',
      us: 'Sigilo absoluto sob a LGPD: seus dados são seus',
    },
    {
      feature: 'Descoberta Real de Economia',
      other: 'Apenas gráficos coloridos sem indicar onde cortar',
      us: 'Detector matemático com valores reais e ações sugeridas',
    },
    {
      feature: 'Foco no seu Bolso',
      other: 'Oferecem limites de empréstimo e cartões parceiros',
      us: 'Zero oferta de crédito. O objetivo é você poupar',
    },
    {
      feature: 'Acessibilidade para Todas as Idades',
      other: 'Telas cheias de termos em inglês e letras miúdas',
      us: 'Opção de letras grandes, botões nítidos e português claro',
    },
  ];

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">
            Por que somos diferentes
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Cadê Meu Dinheiro? vs Aplicativos Tradicionais
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300">
            Entenda por que milhares de pessoas preferem organizar suas finanças sem expor suas contas de banco.
          </p>
        </div>

        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 bg-slate-900/90 p-4 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
            <div className="col-span-5 sm:col-span-4">Critério de Avaliação</div>
            <div className="col-span-3 sm:col-span-4 text-center text-rose-400">Outros Aplicativos</div>
            <div className="col-span-4 text-center text-emerald-400 font-black">Cadê Meu Dinheiro?</div>
          </div>

          <div className="divide-y divide-slate-800/80 text-xs sm:text-sm">
            {comparisonItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 p-4 items-center hover:bg-slate-900/40 transition">
                <div className="col-span-5 sm:col-span-4 font-bold text-slate-200">
                  {item.feature}
                </div>
                <div className="col-span-3 sm:col-span-4 text-center text-rose-400/90 flex flex-col sm:flex-row items-center justify-center space-x-1">
                  <X className="w-4 h-4 shrink-0 text-rose-500 mb-1 sm:mb-0" />
                  <span className="text-[11px] sm:text-xs text-slate-400 hidden sm:inline">{item.other}</span>
                </div>
                <div className="col-span-4 text-center text-emerald-400 font-bold flex flex-col sm:flex-row items-center justify-center space-x-1.5 bg-emerald-950/40 py-2 rounded-xl border border-emerald-500/30">
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span className="text-[11px] sm:text-xs text-emerald-300 font-semibold">{item.us}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
