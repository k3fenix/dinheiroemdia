import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Se ainda não estiver preenchido no .env.local, utiliza fallback para evitar travamento da aplicação no Next dev
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
