-- ==============================================================================
-- CADÊ MEU DINHEIRO? — ESQUEMA COMPLETO DE BANCO DE DADOS E SEGURANÇA RLS
-- PostgreSQL / Supabase
-- ==============================================================================

-- Extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TABELA DE PERFIS (PROFILES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    preferred_currency VARCHAR(3) DEFAULT 'BRL' NOT NULL,
    timezone TEXT DEFAULT 'America/Sao_Paulo' NOT NULL,
    font_scale TEXT DEFAULT 'normal' CHECK (font_scale IN ('normal', 'large', 'extra-large')),
    is_blocked BOOLEAN DEFAULT FALSE NOT NULL,
    blocked_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. TABELA DE PAPÉIS ADMINISTRATIVOS (USER_ROLES)
-- Somente verificado e atribuído via backend / migração
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'support', 'client')),
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- Função de segurança para verificar se o usuário é administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- ------------------------------------------------------------------------------
-- 3. CATEGORIAS FINANCEIRAS (CATEGORIES)
-- Suporta categorias do sistema (globais, user_id NULL) e personalizadas
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('expense', 'income', 'both')),
    icon VARCHAR(50) DEFAULT 'Tag',
    color VARCHAR(30) DEFAULT '#16a34a',
    is_system BOOLEAN DEFAULT FALSE NOT NULL,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. LANÇAMENTOS / TRANSAÇÕES (TRANSACTIONS)
-- Uso rigoroso de NUMERIC(14,2) para precisão monetária (nunca float)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    competence_date DATE NOT NULL,
    due_date DATE,
    paid_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL CHECK (status IN ('prevista', 'pendente', 'paga', 'cancelada')),
    expense_type VARCHAR(20) DEFAULT 'variavel' CHECK (expense_type IN ('fixa', 'variavel', 'recorrente')),
    recurrence_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 5. REGRAS DE RECORRÊNCIA (RECURRING_RULES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recurring_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('semanal', 'mensal', 'trimestral', 'anual')),
    start_date DATE NOT NULL,
    end_date DATE,
    next_occurrence DATE NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. GASTOS RECORRENTES E ASSINATURAS (RECURRING_EXPENSES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recurring_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    frequency VARCHAR(20) DEFAULT 'mensal' NOT NULL,
    next_due_date DATE,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    marked_for_review BOOLEAN DEFAULT FALSE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 7. ORÇAMENTO MENSAL (BUDGETS & BUDGET_CATEGORIES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year SMALLINT NOT NULL CHECK (year >= 2020),
    total_limit NUMERIC(14, 2) NOT NULL CHECK (total_limit >= 0),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_user_month_year UNIQUE (user_id, month, year)
);

CREATE TABLE IF NOT EXISTS public.budget_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    limit_amount NUMERIC(14, 2) NOT NULL CHECK (limit_amount >= 0),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_budget_category UNIQUE (budget_id, category_id)
);

-- ------------------------------------------------------------------------------
-- 8. METAS FINANCEIRAS (SAVINGS_GOALS & GOAL_CONTRIBUTIONS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_amount NUMERIC(14, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(14, 2) DEFAULT 0.00 NOT NULL CHECK (current_amount >= 0),
    target_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'canceled')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.goal_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    contribution_date DATE DEFAULT CURRENT_DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 9. DETECTOR DE OPORTUNIDADES DE ECONOMIA (SAVINGS_OPPORTUNITIES)
-- Distinção obrigatória entre economia potencial estimada e economia confirmada
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.savings_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    opportunity_type VARCHAR(50) NOT NULL, -- 'aumento_mensal', 'assinatura_recorrente', 'estouro_orcamento', 'potencial_limite', 'despesa_duplicada'
    reference_period VARCHAR(50) NOT NULL, -- ex: '10/2026 vs 09/2026'
    reference_amount NUMERIC(14, 2) DEFAULT 0.00 NOT NULL,
    target_amount NUMERIC(14, 2) DEFAULT 0.00 NOT NULL,
    potential_savings NUMERIC(14, 2) DEFAULT 0.00 NOT NULL CHECK (potential_savings >= 0),
    confirmed_savings NUMERIC(14, 2) DEFAULT 0.00 NOT NULL CHECK (confirmed_savings >= 0),
    confidence_level VARCHAR(20) DEFAULT 'media' CHECK (confidence_level IN ('alta', 'media', 'baixa')),
    status VARCHAR(30) DEFAULT 'nova' CHECK (status IN ('nova', 'em_analise', 'meta_definida', 'resultado_informado', 'confirmada', 'descartada')),
    calculation_details JSONB DEFAULT '{}'::jsonb NOT NULL,
    confirmed_at TIMESTAMPTZ,
    user_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 10. NOTIFICAÇÕES E PREFERÊNCIAS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed', 'read')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    due_date_reminders BOOLEAN DEFAULT TRUE NOT NULL,
    budget_alerts BOOLEAN DEFAULT TRUE NOT NULL,
    product_updates BOOLEAN DEFAULT FALSE NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 11. PLANOS E PREÇOS (PLANS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    monthly_price NUMERIC(10, 2) NOT NULL,
    annual_price NUMERIC(10, 2),
    currency VARCHAR(3) DEFAULT 'BRL' NOT NULL,
    limits JSONB DEFAULT '{}'::jsonb NOT NULL,
    features JSONB DEFAULT '[]'::jsonb NOT NULL,
    display_order INT DEFAULT 0 NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 12. ASSINATURAS E PAGAMENTOS (SUBSCRIPTIONS, PAYMENTS, WEBHOOK_EVENTS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id),
    provider VARCHAR(50) DEFAULT 'mercadopago' NOT NULL,
    provider_subscription_id VARCHAR(255),
    status VARCHAR(30) DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    provider VARCHAR(50) DEFAULT 'mercadopago' NOT NULL,
    provider_payment_id VARCHAR(255),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL' NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'refunded', 'charged_back')),
    paid_at TIMESTAMPTZ,
    raw_response JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Tabela de Webhooks com unicidade estrita para garantir IDEMPOTÊNCIA
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50) NOT NULL,
    provider_event_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    processing_status VARCHAR(30) DEFAULT 'received' CHECK (processing_status IN ('received', 'processed', 'ignored', 'failed')),
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_provider_event UNIQUE (provider, provider_event_id)
);

-- ------------------------------------------------------------------------------
-- 13. SUPORTE E CHAMADOS (SUPPORT_TICKETS & SUPPORT_MESSAGES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta')),
    status VARCHAR(20) DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'respondido', 'fechado')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 14. AUDITORIA ADMINISTRATIVA (ADMIN_AUDIT_LOGS)
-- Registros imutáveis para transparência e segurança
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_user_id UUID NOT NULL REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(100) NOT NULL,
    target_id VARCHAR(255),
    reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 15. CONFIGURAÇÕES PÚBLICAS / CMS (APP_SETTINGS)
-- Segredos NUNCA são salvos aqui
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    public_value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_by UUID REFERENCES auth.users(id)
);

-- ==============================================================================
-- ÍNDICES DE ALTA PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, competence_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_status ON public.transactions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_recurring_user ON public.recurring_rules(user_id, active);
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON public.budgets(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_opportunities_user_status ON public.savings_opportunities(user_id, status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets(user_id, status);
CREATE INDEX IF NOT EXISTS idx_admin_audit_actor ON public.admin_audit_logs(actor_user_id, created_at DESC);

-- ==============================================================================
-- POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES
CREATE POLICY "Usuário lê o próprio perfil" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Usuário atualiza o próprio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. USER_ROLES (Apenas admins podem ler e modificar)
CREATE POLICY "Admins leem papéis" ON public.user_roles
    FOR SELECT USING (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Apenas admin altera papéis" ON public.user_roles
    FOR ALL USING (public.is_admin());

-- 3. CATEGORIES (Categorias globais são públicas para leitura; personalizadas isoladas por user_id)
CREATE POLICY "Usuários leem categorias de sistema ou próprias" ON public.categories
    FOR SELECT USING (is_system = TRUE OR auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Usuários criam suas próprias categorias" ON public.categories
    FOR INSERT WITH CHECK (auth.uid() = user_id AND is_system = FALSE);

CREATE POLICY "Usuários alteram suas próprias categorias" ON public.categories
    FOR UPDATE USING (auth.uid() = user_id AND is_system = FALSE);

CREATE POLICY "Usuários excluem/arquivam suas próprias categorias" ON public.categories
    FOR DELETE USING (auth.uid() = user_id AND is_system = FALSE);

-- 4. TRANSACTIONS (Isolamento estrito entre usuários)
CREATE POLICY "Usuário lê apenas suas transações" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Usuário insere transação para si" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário edita apenas suas transações" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuário deleta apenas suas transações" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);

-- 5. RECURRING_RULES & RECURRING_EXPENSES
CREATE POLICY "Usuário controla suas regras de recorrência" ON public.recurring_rules
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuário controla suas despesas recorrentes" ON public.recurring_expenses
    FOR ALL USING (auth.uid() = user_id);

-- 6. BUDGETS & BUDGET_CATEGORIES
CREATE POLICY "Usuário controla seus orçamentos" ON public.budgets
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuário controla categorias do seu orçamento" ON public.budget_categories
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.budgets b
        WHERE b.id = budget_categories.budget_id AND b.user_id = auth.uid()
      )
    );

-- 7. SAVINGS_GOALS & GOAL_CONTRIBUTIONS
CREATE POLICY "Usuário controla suas metas" ON public.savings_goals
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuário controla contribuições de suas metas" ON public.goal_contributions
    FOR ALL USING (auth.uid() = user_id);

-- 8. SAVINGS_OPPORTUNITIES
CREATE POLICY "Usuário lê e atualiza suas oportunidades" ON public.savings_opportunities
    FOR ALL USING (auth.uid() = user_id);

-- 9. NOTIFICAÇÕES & PREFERÊNCIAS
CREATE POLICY "Usuário lê suas notificações" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuário atualiza status de suas notificações" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuário gerencia preferências de notificação" ON public.notification_preferences
    FOR ALL USING (auth.uid() = user_id);

-- 10. PLANS (Públicos para leitura de qualquer usuário, mutáveis apenas por admin)
CREATE POLICY "Planos publicados são públicos para leitura" ON public.plans
    FOR SELECT USING (status = 'published' OR public.is_admin());

CREATE POLICY "Apenas admin altera planos" ON public.plans
    FOR ALL USING (public.is_admin());

-- 11. SUBSCRIPTIONS & PAYMENTS
CREATE POLICY "Usuário lê suas assinaturas" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Usuário lê seus pagamentos" ON public.payments
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- 12. WEBHOOK_EVENTS & AUDIT_LOGS (Apenas administradores leem; escrita via backend)
CREATE POLICY "Apenas admins leem logs de webhook" ON public.webhook_events
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Apenas admins leem auditoria" ON public.admin_audit_logs
    FOR SELECT USING (public.is_admin());

-- 13. SUPPORT_TICKETS & MESSAGES
CREATE POLICY "Usuário acessa seus tickets de suporte" ON public.support_tickets
    FOR ALL USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Usuário envia e lê mensagens de seus tickets" ON public.support_messages
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.support_tickets t
        WHERE t.id = support_messages.ticket_id AND (t.user_id = auth.uid() OR public.is_admin())
      )
    );

-- 14. APP_SETTINGS (Leitura pública se configurada, edição apenas admin)
CREATE POLICY "Qualquer um lê configurações públicas" ON public.app_settings
    FOR SELECT USING (TRUE);

CREATE POLICY "Apenas admins alteram configurações públicas" ON public.app_settings
    FOR ALL USING (public.is_admin());

-- ==============================================================================
-- TRIGGER AUTOMÁTICO: CRIAÇÃO DE PERFIL E PREFERÊNCIAS AO CADASTRAR NO AUTH.USERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Cria perfil do usuário
  INSERT INTO public.profiles (id, full_name, preferred_currency, timezone, font_scale)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    'BRL',
    'America/Sao_Paulo',
    'normal'
  );

  -- Cria preferências de notificação padrão
  INSERT INTO public.notification_preferences (user_id, email_enabled, due_date_reminders, budget_alerts, product_updates)
  VALUES (NEW.id, TRUE, TRUE, TRUE, FALSE);

  -- Concede papel de cliente regular
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- SEED INICIAL: CATEGORIAS PADRÃO BRASILEIRAS (SISTEMA)
-- ==============================================================================
INSERT INTO public.categories (name, type, icon, color, is_system) VALUES
('Moradia', 'expense', 'Home', '#0284c7', TRUE),
('Água', 'expense', 'Droplet', '#0ea5e9', TRUE),
('Energia Elétrica', 'expense', 'Zap', '#eab308', TRUE),
('Internet e Telefone', 'expense', 'Wifi', '#6366f1', TRUE),
('Alimentação', 'expense', 'Utensils', '#f97316', TRUE),
('Supermercado', 'expense', 'ShoppingCart', '#10b981', TRUE),
('Transporte', 'expense', 'Car', '#64748b', TRUE),
('Combustível', 'expense', 'Fuel', '#f43f5e', TRUE),
('Saúde', 'expense', 'Activity', '#ef4444', TRUE),
('Farmácia', 'expense', 'Pill', '#ec4899', TRUE),
('Educação', 'expense', 'GraduationCap', '#8b5cf6', TRUE),
('Filhos', 'expense', 'Smile', '#a855f7', TRUE),
('Animais de Estimação', 'expense', 'PawPrint', '#d97706', TRUE),
('Lazer', 'expense', 'Tv', '#14b8a6', TRUE),
('Restaurantes', 'expense', 'Coffee', '#f59e0b', TRUE),
('Compras', 'expense', 'ShoppingBag', '#06b6d4', TRUE),
('Assinaturas Digitais', 'expense', 'CreditCard', '#84cc16', TRUE),
('Seguros', 'expense', 'Shield', '#3b82f6', TRUE),
('Impostos e Taxas', 'expense', 'Receipt', '#78716c', TRUE),
('Dívidas e Financiamentos', 'expense', 'AlertTriangle', '#dc2626', TRUE),
('Serviços Domésticos', 'expense', 'Tool', '#475569', TRUE),
('Outros Gastos', 'expense', 'MoreHorizontal', '#94a3b8', TRUE),
('Salário', 'income', 'DollarSign', '#16a34a', TRUE),
('Renda Extra / Freelance', 'income', 'Briefcase', '#22c55e', TRUE),
('Rendimentos', 'income', 'TrendingUp', '#4ade80', TRUE),
('Outras Receitas', 'income', 'PlusCircle', '#86efac', TRUE)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- SEED INICIAL: PLANOS DE ASSINATURA CONFORME ESPECIFICAÇÃO
-- ==============================================================================
INSERT INTO public.plans (name, slug, description, monthly_price, annual_price, currency, limits, features, display_order, status) VALUES
(
  'Gratuito',
  'gratuito',
  'Ideal para começar a organizar receitas, despesas e entender seu orçamento.',
  0.00,
  0.00,
  'BRL',
  '{"max_transactions_month": 50, "savings_detector": false, "family_sharing": false, "export_data": true}'::jsonb,
  '["Cadastro manual de receitas e despesas", "Categorias essenciais", "Resumo mensal básico", "Contas a pagar do mês", "Totalmente sem conectar banco"]'::jsonb,
  1,
  'published'
),
(
  'Econômico',
  'economico',
  'Para quem deseja descobrir onde está vazando dinheiro e criar metas reais de economia.',
  14.90,
  149.00,
  'BRL',
  '{"max_transactions_month": 99999, "savings_detector": true, "family_sharing": false, "export_data": true, "historical_months": 24}'::jsonb,
  '["Tudo do plano gratuito", "Lançamentos ilimitados", "Detector inteligente de economias", "Registro de economia real confirmada", "Metas financeiras com histórico", "Lembretes de vencimento por e-mail", "Relatórios comparativos completos"]'::jsonb,
  2,
  'published'
),
(
  'Família',
  'familia',
  'Organização compartilhada para o casal ou para toda a casa com controle de privacidade.',
  24.90,
  249.00,
  'BRL',
  '{"max_transactions_month": 99999, "savings_detector": true, "family_sharing": true, "max_members": 5, "export_data": true, "historical_months": 60}'::jsonb,
  '["Tudo do plano Econômico", "Compartilhamento com até 5 membros da família", "Orçamentos familiares conjuntos", "Metas de economia conjuntas", "Relatórios por membro e consolidados", "Suporte prioritário"]'::jsonb,
  3,
  'published'
)
ON CONFLICT (slug) DO UPDATE SET
  monthly_price = EXCLUDED.monthly_price,
  features = EXCLUDED.features;
