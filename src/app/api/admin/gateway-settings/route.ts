import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
    }

    const admin = createAdminClient();
    const { data: setting } = await admin
      .from('app_settings')
      .select('public_value')
      .eq('key', 'mercadopago_credentials')
      .maybeSingle();

    const config = setting?.public_value || {};

    return NextResponse.json({
      success: true,
      hasAccessToken: !!config.accessToken || !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
      accessTokenMasked: config.accessToken
        ? `${config.accessToken.substring(0, 10)}...${config.accessToken.slice(-4)}`
        : process.env.MERCADO_PAGO_ACCESS_TOKEN
        ? 'Configurado via Variáveis de Ambiente'
        : '',
      publicKey: config.publicKey || '',
      webhookSecret: config.webhookSecret || '',
      isSandbox: config.isSandbox ?? false,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
    }

    const body = await req.json();
    const { accessToken, publicKey, webhookSecret, isSandbox } = body;

    const admin = createAdminClient();

    // Recupera valor atual para manter se não alterou o token mascarado
    const { data: currentSetting } = await admin
      .from('app_settings')
      .select('public_value')
      .eq('key', 'mercadopago_credentials')
      .maybeSingle();

    const previousValue = currentSetting?.public_value || {};
    const finalAccessToken = accessToken && !accessToken.includes('...')
      ? accessToken.trim()
      : previousValue.accessToken || '';

    const newConfig = {
      accessToken: finalAccessToken,
      publicKey: (publicKey || '').trim(),
      webhookSecret: (webhookSecret || '').trim(),
      isSandbox: !!isSandbox,
      updatedAt: new Date().toISOString(),
      updatedBy: user.email,
    };

    const { error: upsertErr } = await admin
      .from('app_settings')
      .upsert(
        {
          key: 'mercadopago_credentials',
          public_value: newConfig,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        },
        { onConflict: 'key' }
      );

    if (upsertErr) {
      throw new Error(`Erro ao salvar no banco: ${upsertErr.message}`);
    }

    // Log de auditoria
    await admin.from('admin_audit_logs').insert({
      actor_user_id: user.id,
      action: 'UPDATE_MERCADOPAGO_SETTINGS',
      target_type: 'app_settings',
      target_id: 'mercadopago_credentials',
      reason: 'Atualização das credenciais do Mercado Pago pelo painel administrativo',
    });

    return NextResponse.json({
      success: true,
      message: 'Credenciais do Mercado Pago salvas com sucesso! Clientes pagarão diretamente na sua conta.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
