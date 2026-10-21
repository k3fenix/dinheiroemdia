import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createMercadoPagoPreference } from '@/lib/mercadopago';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Você precisa estar logado para assinar um plano.' }, { status: 401 });
    }

    const { planId, billingCycle } = await req.json();

    // Busca o plano no banco
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .eq('status', 'published')
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plano não encontrado ou indisponível.' }, { status: 404 });
    }

    const price = billingCycle === 'annual' && plan.annual_price 
      ? Number(plan.annual_price) 
      : Number(plan.monthly_price);

    if (price <= 0) {
      return NextResponse.json({ error: 'Planos gratuitos não requerem checkout de pagamento.' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const preference = await createMercadoPagoPreference({
      title: `Cadê Meu Dinheiro? — Plano ${plan.name} (${billingCycle === 'annual' ? 'Anual' : 'Mensal'})`,
      price,
      payerEmail: user.email || '',
      externalReference: `${user.id}:${plan.id}`,
      backUrls: {
        success: `${siteUrl}/dashboard/assinatura?status=sucesso`,
        failure: `${siteUrl}/dashboard/assinatura?status=falha`,
        pending: `${siteUrl}/dashboard/assinatura?status=pendente`,
      },
    });

    return NextResponse.json({
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    });
  } catch (error: any) {
    console.error('[API Checkout] Erro:', error);
    return NextResponse.json({ error: error.message || 'Falha ao iniciar checkout' }, { status: 500 });
  }
}
