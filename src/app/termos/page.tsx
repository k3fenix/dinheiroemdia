import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function TermosPage() {
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
              Contrato de Uso da Plataforma
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Termos de Uso
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              Última atualização: Outubro de 2026
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-6 leading-relaxed">
            <section className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-amber-900 text-xs">
              <strong className="block text-sm mb-1">Aviso Obrigatório sobre a Natureza do Serviço:</strong>
              O <em>Cadê Meu Dinheiro?</em> é exclusivamente uma plataforma de tecnologia voltada à organização financeira pessoal e educação financeira. Não somos instituição financeira, corretora de valores mobiliários, consultoria de investimentos individualizada (CVM), correspondente bancário nem prestamos serviços de concessão de crédito ou intermediação de empréstimos.
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">1. Aceitação dos Termos</h2>
              <p>
                Ao criar uma conta ou utilizar os recursos da plataforma, você concorda expressamente com as condições deste termo e com a nossa Política de Privacidade. Caso não concorde com qualquer cláusula, solicitamos que não utilize o serviço.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">2. Responsabilidade pela Qualidade dos Dados</h2>
              <p>
                A exatidão de todos os relatórios, saldos e cálculos do detector inteligente de economia depende estritamente das informações registradas por você. O sistema nunca inventa despesas, saldos ou preços. Você é o único responsável pela veracidade e exatidão dos valores que cadastrar voluntariamente.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">3. Planos e Assinaturas</h2>
              <p>
                Oferecemos plano gratuito com funcionalidades básicas e planos pagos (como Econômico e Família) com recursos adicionais. As assinaturas pagas são renovadas periodicamente e podem ser canceladas a qualquer momento diretamente pelo usuário em seu painel, sem taxas rescisórias ocultas.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">4. Uso Adequado e Segurança da Conta</h2>
              <p>
                O usuário se compromete a manter suas credenciais de login em sigilo e a não utilizar a plataforma para fins ilícitos, engenharia reversa ou tentativas de sobrecarga de servidores.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">5. Foro e Legislação Aplicável</h2>
              <p>
                Este instrumento é regido pelas leis da República Federativa do Brasil, em especial o Código de Defesa do Consumidor (Lei 8.078/1990) e o Marco Civil da Internet (Lei 12.965/2014).
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
