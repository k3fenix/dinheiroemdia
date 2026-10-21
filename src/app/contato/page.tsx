import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Mail, MessageSquare, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        <Link href="/" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a página inicial</span>
        </Link>

        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Fale Conosco
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Atendimento e suporte humanizado para suas dúvidas
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <Mail className="w-6 h-6 text-brand-600 mb-2" />
              <h3 className="text-sm font-bold text-slate-900">E-mail de Suporte</h3>
              <p className="text-xs text-slate-500 mt-1">Respondemos em até 1 dia útil:</p>
              <a href="mailto:suporte@cademeudinheiro.com.br" className="text-xs font-bold text-brand-700 hover:underline block mt-2">
                suporte@cademeudinheiro.com.br
              </a>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <MessageSquare className="w-6 h-6 text-brand-600 mb-2" />
              <h3 className="text-sm font-bold text-slate-900">Central de Chamados</h3>
              <p className="text-xs text-slate-500 mt-1">Já possui uma conta ativa?</p>
              <Link href="/dashboard/ajuda" className="text-xs font-bold text-brand-700 hover:underline block mt-2">
                Abrir chamado no painel &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
