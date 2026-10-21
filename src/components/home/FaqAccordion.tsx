'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: 'Eu preciso informar minha senha bancária, agência ou token?',
    answer: 'Não. Nunca! O grande diferencial do Cadê Meu Dinheiro? é que você tem privacidade absoluta. Não usamos Open Finance e não pedimos nenhuma senha bancária. Você anota suas contas voluntariamente em segundos, mantendo total controle do que registra.',
  },
  {
    question: 'Como o detector de economias descobre onde posso poupar?',
    answer: 'Nosso motor analítico compara os dados que você mesmo insere mês a mês. Ele identifica se sua conta de energia ou internet subiu em relação ao histórico, avisa se você tem assinaturas digitais ativas que merecem revisão e aponta quando uma categoria ultrapassou o teto que você planejou.',
  },
  {
    question: 'É fácil de usar para quem não entende de tecnologia ou para idosos?',
    answer: 'Sim! Toda a interface foi pensada para ser limpa e direta, com botões grandes, números em destaque e um seletor especial de tamanho de fonte (Grande e Extra Grande) nas configurações para facilitar a leitura.',
  },
  {
    question: 'Vocês vendem meus dados ou empurram empréstimos?',
    answer: 'Nunca. Não somos banco nem financeira e não vendemos nenhum dado para anunciantes. Seus dados são protegidos pela Lei Geral de Proteção de Dados (LGPD). Você pode exportar tudo ou apagar sua conta a qualquer momento com 1 clique.',
  },
  {
    question: 'Posso usar no celular?',
    answer: 'Com certeza. O aplicativo é 100% responsivo para qualquer celular Android ou iPhone e pode ser instalado na tela inicial do seu celular como um app rápido e leve (PWA).',
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3.5 max-w-3xl mx-auto">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? 'bg-white border-brand-300 shadow-md'
                : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(i)}
              className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base focus:outline-none"
            >
              <span>{faq.question}</span>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                  isOpen ? 'bg-brand-50 text-brand-700 rotate-180' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            {isOpen && (
              <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
