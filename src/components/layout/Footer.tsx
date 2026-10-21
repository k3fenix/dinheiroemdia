import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-850">
          {/* Coluna 1 - Apresentação */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-lg">
                R$
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Cadê Meu Dinheiro?
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Descubra para onde seu dinheiro vai. Encontre oportunidades reais para economizar sem nunca fornecer senhas bancárias.
            </p>
            <div className="flex items-center space-x-2 text-xs text-brand-400 bg-brand-950/60 border border-brand-800/40 px-3 py-1.5 rounded-md inline-flex">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>100% Livre de senhas de banco</span>
            </div>
          </div>

          {/* Coluna 2 - Recursos */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Recursos
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="#como-funciona" className="hover:text-white transition">
                  Como funciona
                </Link>
              </li>
              <li>
                <Link href="#economias" className="hover:text-white transition">
                  Detector de economias
                </Link>
              </li>
              <li>
                <Link href="/planos" className="hover:text-white transition">
                  Planos e Preços
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Painel do Cliente
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3 - Privacidade e LGPD */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Legal e Privacidade
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/privacidade" className="hover:text-white transition">
                  Política de Privacidade (LGPD)
                </Link>
              </li>
              <li>
                <Link href="/termos" className="hover:text-white transition">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/seguranca" className="hover:text-white transition">
                  Práticas de Segurança
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4 - Suporte */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Atendimento e Ajuda
            </h4>
            <p className="text-sm text-slate-400 mb-3">
              Precisa de ajuda ou tem sugestões para a plataforma?
            </p>
            <Link
              href="/contato"
              className="inline-block text-sm font-medium text-brand-400 hover:text-brand-300 transition"
            >
              Falar com o suporte &rarr;
            </Link>
          </div>
        </div>

        {/* Aviso Legal Obrigatório do Produto */}
        <div className="mt-8 pt-6 text-xs text-slate-400 leading-relaxed border-t border-slate-800/80">
          <p className="mb-2">
            <strong>Aviso importante:</strong> O <em>Cadê Meu Dinheiro?</em> é uma ferramenta tecnológica para organização financeira pessoal e educação financeira. Não somos instituição financeira, corretora de investimentos, consultoria financeira individualizada nem concedemos empréstimos ou cartões de crédito.
          </p>
          <p>
            A exatidão dos relatórios e diagnósticos de economia depende exclusivamente dos dados inseridos de forma voluntária e consciente pelo usuário. Todos os dados são protegidos conforme as diretrizes da Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Cadê Meu Dinheiro? — Todos os direitos reservados.</p>
          <p className="mt-2 sm:mt-0 flex items-center">
            Feito para famílias e pessoas brasileiras
          </p>
        </div>
      </div>
    </footer>
  );
}
