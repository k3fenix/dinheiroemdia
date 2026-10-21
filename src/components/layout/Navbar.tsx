'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Menu, X, ArrowRight, Sparkles } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all duration-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo com badge elegante */}
          <Link href="/" className="flex items-center space-x-3.5 group">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-600/20 group-hover:scale-105 transition-transform duration-200">
                <span className="font-extrabold text-xl tracking-tighter">R$</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight block">
                Cadê Meu Dinheiro?
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% sem conectar ao banco</span>
              </span>
            </div>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/60">
            <Link
              href="#simulador"
              className="text-xs font-bold text-slate-700 hover:text-brand-700 hover:bg-white px-3.5 py-1.5 rounded-full transition shadow-2xs"
            >
              Simulador
            </Link>
            <Link
              href="#como-funciona"
              className="text-xs font-bold text-slate-700 hover:text-brand-700 hover:bg-white px-3.5 py-1.5 rounded-full transition"
            >
              Como funciona
            </Link>
            <Link
              href="#demonstrativo"
              className="text-xs font-bold text-slate-700 hover:text-brand-700 hover:bg-white px-3.5 py-1.5 rounded-full transition flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Ver por dentro</span>
            </Link>
            <Link
              href="/planos"
              className="text-xs font-bold text-slate-700 hover:text-brand-700 hover:bg-white px-3.5 py-1.5 rounded-full transition"
            >
              Planos e Preços
            </Link>
            <Link
              href="#faq"
              className="text-xs font-bold text-slate-700 hover:text-brand-700 hover:bg-white px-3.5 py-1.5 rounded-full transition"
            >
              Dúvidas
            </Link>
          </nav>

          {/* Botões de Acesso */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-700 hover:text-slate-900 px-4 py-2.5 rounded-xl hover:bg-slate-100/80 transition"
            >
              Entrar na minha conta
            </Link>
            <Link
              href="/cadastro"
              className="inline-flex items-center justify-center text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 px-5 py-2.5 rounded-xl shadow-md shadow-brand-600/20 hover:shadow-lg hover:shadow-brand-600/30 transition-all duration-200 group"
            >
              <span>Começar gratuitamente</span>
              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Botão Mobile */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 touch-target focus:outline-none"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <Link
            href="#simulador"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            Simulador de Economia
          </Link>
          <Link
            href="#como-funciona"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            Como funciona
          </Link>
          <Link
            href="#demonstrativo"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            Ver o aplicativo por dentro
          </Link>
          <Link
            href="/planos"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            Planos e Preços
          </Link>
          <Link
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            Dúvidas frequentes
          </Link>
          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2.5">
            <Link
              href="/login"
              className="w-full text-center py-3 text-sm font-bold text-slate-800 bg-slate-100 rounded-xl"
            >
              Entrar na minha conta
            </Link>
            <Link
              href="/cadastro"
              className="w-full text-center py-3 text-sm font-extrabold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md"
            >
              Criar conta gratuita
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
