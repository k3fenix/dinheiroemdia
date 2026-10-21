import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <Link href="/" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a página inicial</span>
        </Link>

        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-2xs space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block mb-1">
              Conformidade LGPD (Lei 13.709/2018)
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Política de Privacidade
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              Última atualização: Outubro de 2026
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-6 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">1. Princípio Fundamental de Privacidade</h2>
              <p>
                O <strong>Cadê Meu Dinheiro?</strong> foi projetado com uma premissa clara: <strong>você não precisa conectar sua conta bancária</strong>, fornecer senhas de instituições financeiras ou permitir acessos automáticos ao seu extrato para organizar suas finanças. Todo o funcionamento da plataforma depende única e exclusivamente das informações inseridas voluntariamente por você.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">2. Dados Pessoais Coletados</h2>
              <p>Coletamos apenas os dados estritamente necessários para viabilizar o serviço:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Dados de identificação:</strong> Nome completo e endereço de e-mail.</li>
                <li><strong>Dados de autenticação:</strong> Senha criptografada via Supabase Auth (nunca armazenamos senhas em texto puro).</li>
                <li><strong>Registros financeiros voluntários:</strong> Descrições de receitas, despesas, valores, categorias e metas cadastradas por você.</li>
                <li><strong>Preferências de navegação:</strong> Moeda preferencial, fuso horário e escala de acessibilidade visual.</li>
              </ul>
              <p className="mt-2 text-xs text-slate-500">
                Não solicitamos CPF, dados bancários de cartão de crédito no cadastro, nem informações confidenciais desnecessárias.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">3. Não Comercialização de Dados</h2>
              <p>
                <strong>Seus dados nunca serão vendidos</strong> a bancos, corretoras, financeiras, birôs de crédito ou anunciantes. Não utilizamos seus lançamentos financeiros individuais para publicidade direcionada.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">4. Seus Direitos Conforme o Artigo 18 da LGPD</h2>
              <p>Você é o titular soberano de suas informações e pode a qualquer momento:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Confirmar a existência de tratamento e consultar seus dados.</li>
                <li><strong>Exportar seus dados:</strong> disponibilizamos ferramenta de exportação completa em formato JSON e CSV diretamente nas configurações da conta.</li>
                <li><strong>Excluir definitivamente sua conta:</strong> você pode acionar a exclusão definitiva a qualquer momento, o que remove irreversivelmente seu cadastro e todos os registros associados.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">5. Segurança da Informação</h2>
              <p>
                Utilizamos criptografia em trânsito (HTTPS/TLS) e criptografia em repouso. O banco de dados PostgreSQL conta com políticas ativas de <strong>Row Level Security (RLS)</strong>, garantindo no nível de banco de dados que nenhum usuário possa consultar, alterar ou excluir dados de outra pessoa.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">6. Encarregado de Proteção de Dados (DPO) e Contato</h2>
              <p>
                Para exercer seus direitos de titular ou esclarecer qualquer dúvida sobre o tratamento de dados, envie uma solicitação através da nossa Central de Ajuda ou para o e-mail: <code>privacidade@cademeudinheiro.com.br</code>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
