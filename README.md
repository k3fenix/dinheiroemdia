# Cadê Meu Dinheiro? 💰
> **Plataforma completa de organização financeira pessoal e descoberta de economias**
> *Desenvolvida em Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL com RLS) e pronta para implantação na Vercel.*

---

## 🎯 Diferencial do Produto
O **Cadê Meu Dinheiro?** não requer nenhuma conexão bancária, senha de banco ou autorização de Open Finance. O usuário tem privacidade absoluta: insere seus lançamentos voluntariamente e o motor analítico calcula variações reais, despesas recorrentes e oportunidades comprovadas de corte de gastos.

---

## 📁 Estrutura do Projeto

```text
dinheiro-certo/
├── public/
│   ├── icon.svg               # Ícone SVG do app e PWA
│   └── manifest.json          # Manifesto PWA brasileiro
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── account/delete # Exclusão total de dados (LGPD Art. 18)
│   │   │   ├── checkout/      # Criação de checkout de assinaturas no Mercado Pago
│   │   │   ├── export/        # Exportação de dados JSON/CSV (LGPD)
│   │   │   ├── savings-detector/run # Execução do motor de oportunidades
│   │   │   └── webhooks/mercadopago # Webhook com assinatura HMAC e idempotência
│   │   ├── admin/             # Área Administrativa Protegida (is_admin server-side)
│   │   │   ├── auditoria/     # Logs imutáveis de ações administrativas
│   │   │   ├── configuracoes/ # Diagnóstico de conexões e serviços
│   │   │   ├── conteudo/      # CMS para slogan e avisos
│   │   │   ├── planos/        # CRUD de planos e preços
│   │   │   ├── suporte/       # Atendimento aos chamados dos clientes
│   │   │   └── usuarios/      # Gestão de usuários e bloqueio com auditoria
│   │   ├── dashboard/         # Área do Cliente Autenticado
│   │   │   ├── ajuda/         # Central de chamados e suporte
│   │   │   ├── assinatura/    # Status da assinatura e upgrade via Mercado Pago
│   │   │   ├── categorias/    # Categorias personalizadas e arquivamento seguro
│   │   │   ├── configuracoes/ # Escala de fonte para idosos e preferências
│   │   │   ├── contas-a-pagar/# Monitoramento de vencimentos e alertas
│   │   │   ├── despesas/      # Gestão completa de saídas com filtros
│   │   │   ├── metas/         # Metas de economia com histórico de aportes
│   │   │   ├── oportunidades/ # "Onde posso economizar?" com separação de estimativa vs real
│   │   │   ├── orcamento/     # Orçamento mensal por categoria (50%, 80%, 100%)
│   │   │   ├── receitas/      # Gestão completa de entradas
│   │   │   ├── recorrentes/   # Assinaturas e impacto financeiro anual
│   │   │   └── relatorios/    # Relatórios por período com exportação CSV
│   │   ├── cadastro/          # Cadastro com consentimentos LGPD
│   │   ├── login/             # Login seguro com Supabase Auth
│   │   ├── recuperar-senha/   # Recuperação de senha oficial
│   │   ├── planos/            # Página pública de planos e preços
│   │   ├── termos/            # Termos de uso transparentes
│   │   ├── privacidade/       # Política de privacidade LGPD
│   │   ├── layout.tsx         # Layout raiz com SEO e tipografia
│   │   └── page.tsx           # Landing page com demonstrativo e FAQ
│   ├── components/
│   │   ├── admin/             # Sidebar e headers administrativos
│   │   ├── budgets/           # Barra de progresso com alertas 50/80/100%
│   │   ├── dashboard/         # Sidebar, Header, Período e 9 Cards Indicadores
│   │   ├── layout/            # Navbar e Footer institucionais
│   │   ├── opportunities/     # Card com cálculo transparente e registro real
│   │   └── transactions/      # Modal de lançamento de receitas e despesas
│   ├── lib/
│   │   ├── math/financial.ts  # Fórmulas financeiras exatas (sem divisão por zero)
│   │   ├── formatters.ts      # Moeda BRL, datas DD/MM/AAAA e percentuais
│   │   ├── mercadopago.ts     # Assinaturas e verificação criptográfica HMAC
│   │   ├── savings-detector.ts# Motor determinístico de detecção de economias
│   │   └── supabase/          # Clientes browser, server (cookies) e admin
│   ├── tests/                 # Testes unitários de matemática, detector e segurança
│   └── types/database.ts      # Tipos TypeScript de todas as entidades
├── supabase/
│   ├── migrations/
│   │   └── 20261021000000_schema_and_rls.sql # Esquema SQL com 19+ tabelas, RLS e seeds
│   └── make_admin.sql         # Script seguro para atribuir papel de admin
├── .env.example               # Exemplo de variáveis de ambiente sem segredos
├── package.json               # Dependências e scripts de execução
├── tsconfig.json              # Configurações TypeScript
├── tailwind.config.ts         # Design system com cores corporativas e acessibilidade
└── vercel.json                # Configuração de deploy e headers de segurança HTTP
```

---

## 🚀 Como Executar Localmente

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie `.env.example` para `.env.local` e preencha:
```bash
cp .env.example .env.local
```

### 3. Executar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse em: `http://localhost:3000`

### 4. Executar os Testes Automatizados
```bash
npm run test
```

---

## 🗄️ Configuração do Banco de Dados Supabase

1. Crie um projeto gratuito no [Supabase](https://supabase.com).
2. Vá em **SQL Editor** no painel do Supabase.
3. Copie todo o conteúdo do arquivo [supabase/migrations/20261021000000_schema_and_rls.sql](file:///C:/Users/Luciano/Desktop/dinheiro-certo/supabase/migrations/20261021000000_schema_and_rls.sql) e clique em **Run**.
   - Isso criará todas as 19+ tabelas, índices de alta performance, triggers automáticos para novos usuários no auth, categorias essenciais brasileiras, planos iniciais e políticas ativas de Row Level Security (RLS).
4. No Supabase Dashboard:
   - Vá em **Project Settings** -> **API** e copie:
     - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role secret` -> `SUPABASE_SERVICE_ROLE_KEY` (apenas no servidor/Vercel!)
   - Vá em **Authentication** -> **URL Configuration** e defina:
     - Site URL: `https://seu-dominio.vercel.app` (ou `http://localhost:3000` em dev)
     - Redirect URLs: `https://seu-dominio.vercel.app/auth/callback` e `http://localhost:3000/auth/callback`.

### Como Tornar Seu Usuário um Administrador
1. Cadastre-se normalmente no site com seu e-mail.
2. Abra o arquivo [supabase/make_admin.sql](file:///C:/Users/Luciano/Desktop/dinheiro-certo/supabase/make_admin.sql) no SQL Editor do Supabase.
3. Substitua `seu-email-aqui@dominio.com` pelo seu e-mail de cadastro e execute. O papel de admin será concedido de forma segura com registro em auditoria.
4. Você terá acesso total à área restrita em `/admin`.

---

## 💳 Configuração do Mercado Pago (Assinaturas)
1. Acesse o [Mercado Pago Developers](https://www.mercadopago.com.br/developers).
2. Obtenha suas credenciais de teste ou produção:
   - `Access Token` -> configure em `MERCADO_PAGO_ACCESS_TOKEN`.
3. Configure o webhook apontando para:
   - URL: `https://seu-dominio.vercel.app/api/webhooks/mercadopago`
   - Eventos: `payment`, `subscription_preapproval`.
   - Copie o Secret gerado para `MERCADO_PAGO_WEBHOOK_SECRET` para validação criptográfica HMAC-SHA256 das notificações.

---

## 🌐 Publicação na Vercel
1. Conecte seu repositório Git à Vercel.
2. Adicione as variáveis de ambiente em **Settings -> Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - `MERCADO_PAGO_ACCESS_TOKEN`
   - `MERCADO_PAGO_WEBHOOK_SECRET`
3. Clique em **Deploy**.
