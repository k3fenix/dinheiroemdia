import { createClient } from '@supabase/supabase-js';

// Cliente administrativo exclusivo de backend.
// NUNCA importe este arquivo em componentes clientes ('use client').
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!serviceRoleKey) {
    throw new Error('A variável SUPABASE_SERVICE_ROLE_KEY não está configurada no ambiente.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
