import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cadê Meu Dinheiro? — Descubra para onde seu dinheiro vai',
  description: 'Organize suas contas, encontre oportunidades reais de economia e acompanhe seus resultados sem nunca conectar sua conta bancária.',
  keywords: ['finanças pessoais', 'controle financeiro', 'economizar dinheiro', 'onde economizar', 'organização financeira sem banco', 'orçamento familiar'],
  authors: [{ name: 'Cadê Meu Dinheiro?' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#16a34a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={fontSans.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
