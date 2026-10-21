import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function getServiceRoleKey(): string {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return process.env.SUPABASE_SERVICE_ROLE_KEY;
  }

  // Fallback: lê diretamente do arquivo .env.local caso o servidor Next.js em dev não tenha sido reiniciado
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch {
    // Silencioso em caso de restrição de leitura
  }

  return '';
}

function getSupabaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return process.env.NEXT_PUBLIC_SUPABASE_URL;
  }

  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\r\n]+)/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch {
    // Silencioso
  }

  return 'https://rjrucyjgcmvkshwldpjc.supabase.co';
}

// Cliente administrativo exclusivo de backend.
export function createAdminClient() {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();

  if (!serviceRoleKey) {
    throw new Error(
      'A variável SUPABASE_SERVICE_ROLE_KEY não foi encontrada no .env.local nem no ambiente da Vercel.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
