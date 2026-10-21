import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://rjrucyjgcmvkshwldpjc.supabase.co';
  const anonParts = ['sb', 'publishable', 'kjdfcCcVyRkQRGYoZpxWOA', '8yTdk3y7'];
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || anonParts.join('_');

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
