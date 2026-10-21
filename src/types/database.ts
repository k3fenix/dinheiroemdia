export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'prevista' | 'pendente' | 'paga' | 'cancelada';
export type ExpenseType = 'fixa' | 'variavel' | 'recorrente';
export type OpportunityStatus = 'nova' | 'em_analise' | 'meta_definida' | 'resultado_informado' | 'confirmada' | 'descartada';
export type ConfidenceLevel = 'alta' | 'media' | 'baixa';
export type TicketStatus = 'aberto' | 'em_andamento' | 'respondido' | 'fechado';
export type PlanStatus = 'draft' | 'published' | 'archived';

export interface Profile {
  id: string;
  full_name: string;
  preferred_currency: string;
  timezone: string;
  font_scale: 'normal' | 'large' | 'extra-large';
  is_blocked: boolean;
  blocked_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'support' | 'client';
  granted_by?: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  user_id?: string | null;
  name: string;
  type: 'expense' | 'income' | 'both';
  icon: string;
  color: string;
  is_system: boolean;
  archived_at?: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id?: string | null;
  type: TransactionType;
  description: string;
  amount: number;
  competence_date: string; // YYYY-MM-DD
  due_date?: string | null; // YYYY-MM-DD
  paid_at?: string | null;
  status: TransactionStatus;
  expense_type: ExpenseType;
  recurrence_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface RecurringRule {
  id: string;
  user_id: string;
  category_id?: string | null;
  description: string;
  amount: number;
  frequency: 'semanal' | 'mensal' | 'trimestral' | 'anual';
  start_date: string;
  end_date?: string | null;
  next_occurrence: string;
  active: boolean;
  created_at: string;
}

export interface RecurringExpense {
  id: string;
  user_id: string;
  transaction_id?: string | null;
  category_id?: string | null;
  name: string;
  amount: number;
  frequency: string;
  next_due_date?: string | null;
  active: boolean;
  marked_for_review: boolean;
  notes?: string | null;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  month: number;
  year: number;
  total_limit: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetCategory {
  id: string;
  budget_id: string;
  category_id: string;
  limit_amount: number;
  created_at: string;
  category?: Category | null;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string | null;
  status: 'active' | 'completed' | 'paused' | 'canceled';
  created_at: string;
  updated_at: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  contribution_date: string;
  notes?: string | null;
  created_at: string;
}

export interface SavingsOpportunity {
  id: string;
  user_id: string;
  category_id?: string | null;
  title: string;
  description: string;
  opportunity_type: string;
  reference_period: string;
  reference_amount: number;
  target_amount: number;
  potential_savings: number;
  confirmed_savings: number;
  confidence_level: ConfidenceLevel;
  status: OpportunityStatus;
  calculation_details: {
    formula?: string;
    previous_value?: number;
    current_value?: number;
    difference_abs?: number;
    difference_pct?: number | null;
    target_reduction?: number;
    reason?: string;
  };
  confirmed_at?: string | null;
  user_notes?: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  scheduled_at?: string | null;
  sent_at?: string | null;
  read_at?: string | null;
  status: 'scheduled' | 'sent' | 'failed' | 'read';
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  due_date_reminders: boolean;
  budget_alerts: boolean;
  product_updates: boolean;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthly_price: number;
  annual_price?: number | null;
  currency: string;
  limits: {
    max_transactions_month?: number;
    savings_detector?: boolean;
    family_sharing?: boolean;
    export_data?: boolean;
    max_members?: number;
    historical_months?: number;
  };
  features: string[];
  display_order: number;
  status: PlanStatus;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  provider: string;
  provider_subscription_id?: string | null;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  plan?: Plan | null;
}

export interface PaymentRecord {
  id: string;
  user_id: string;
  subscription_id?: string | null;
  provider: string;
  provider_payment_id?: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'refunded' | 'charged_back';
  paid_at?: string | null;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  category: string;
  priority: 'baixa' | 'media' | 'alta';
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_user_id: string;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  actor_user_id: string;
  action: string;
  target_type: string;
  target_id?: string | null;
  reason?: string | null;
  metadata?: Record<string, any>;
  ip_address?: string | null;
  created_at: string;
  actor_email?: string;
}
