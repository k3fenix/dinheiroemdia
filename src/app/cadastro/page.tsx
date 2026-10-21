'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, AlertCircle, ArrowRight, User, Mail, Lock, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [productUpdatesConsent, setProductUpdatesConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('A senha precisa conter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem.');
      return;
    }
    if (!termsAccepted) {
      setErrorMessage('Você precisa aceitar os Termos de Uso e a Política de Privacidade para prosseguir.');
      return;
    }

    setLoading(true);

    try {
      let registered = false;
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.trim(),
            password,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            registered = true;
          } else {
            setErrorMessage(data.error || 'Não foi possível cadastrar.');
            return;
          }
        }
      } catch (fetchErr) {
        console.warn('API interna offline, usando fallback direto do Supabase...', fetchErr);
      }

      if (!registered) {
        // Fallback direto via Supabase Auth
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
          },
        });

        if (signUpError && !signUpError.message.includes('already')) {
          setErrorMessage(signUpError.message);
          return;
        }
      }

      // Login automático instantâneo
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (!loginError) {
        router.push('/dashboard');
        router.refresh();
      } else {
        router.push('/login?cadastrado=true');
      }
    } catch (err: any) {
      setErrorMessage(`Falha na requisição: ${err.message || 'Erro de conexão'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-sm font-black text-2xl group-hover:bg-brand-700 transition">
            R$
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            Cadê Meu Dinheiro?
          </span>
        </Link>
        <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Crie sua conta gratuita
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Comece agora a organizar suas finanças sem conectar sua conta bancária
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl border border-slate-200/80 rounded-3xl">
          {successNotice ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Cadastro realizado com sucesso!
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Enviamos um link de confirmação para <strong>{email}</strong>. Por favor, acerte sua caixa de entrada para ativar sua conta com total segurança.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 transition"
                >
                  Ir para a tela de Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="mb-6 flex items-start space-x-2.5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nome Completo <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Maria da Silva"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    E-mail <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com.br"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Criar Senha <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 dígitos"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirmar Senha <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita sua senha"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                    />
                  </div>
                </div>

                {/* Consentimentos Obrigatório e Opcional Separados */}
                <div className="pt-2 space-y-3">
                  <label className="flex items-start space-x-3 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span>
                      Li e concordo com os{' '}
                      <Link href="/termos" target="_blank" className="font-bold text-brand-700 underline">
                        Termos de Uso
                      </Link>{' '}
                      e a{' '}
                      <Link href="/privacidade" target="_blank" className="font-bold text-brand-700 underline">
                        Política de Privacidade (LGPD)
                      </Link>
                      . <span className="text-rose-500 font-bold">*</span>
                    </span>
                  </label>

                  <label className="flex items-start space-x-3 text-xs text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productUpdatesConsent}
                      onChange={(e) => setProductUpdatesConsent(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span>
                      (Opcional) Desejo receber avisos sobre novidades e dicas práticas de economia por e-mail.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs transition touch-target"
                >
                  {loading ? 'Cadastrando...' : 'Criar minha conta gratuita'}
                  {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-2">
                <p className="text-sm text-slate-600">
                  Já possui uma conta?{' '}
                  <Link href="/login" className="font-bold text-brand-700 hover:text-brand-800">
                    Acessar minha conta
                  </Link>
                </p>
                <p className="text-xs text-slate-400">
                  É o administrador da plataforma?{' '}
                  <Link href="/setup-admin" className="text-amber-600 font-semibold hover:underline">
                    Ativar conta de Administrador
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
