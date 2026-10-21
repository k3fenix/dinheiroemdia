import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const results: any = {
    url,
    anonKeyPrefix: anonKey.substring(0, 15),
    serviceKeyPrefix: serviceKey.substring(0, 15),
  };

  try {
    const supabaseAnon = createClient(url, anonKey);
    const { data: anonData, error: anonErr } = await supabaseAnon.from('plans').select('count');
    results.anonTest = anonErr ? { error: anonErr.message, status: anonErr } : { success: true, anonData };
  } catch (e: any) {
    results.anonTest = { error: e.message };
  }

  try {
    const supabaseAdmin = createClient(url, serviceKey);
    const { data: adminData, error: adminErr } = await supabaseAdmin.auth.admin.listUsers();
    results.adminTest = adminErr ? { error: adminErr.message, status: adminErr } : { success: true, count: adminData?.users?.length };
  } catch (e: any) {
    results.adminTest = { error: e.message };
  }

  return NextResponse.json(results);
}
