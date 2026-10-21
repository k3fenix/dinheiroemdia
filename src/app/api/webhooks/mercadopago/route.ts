import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyMercadoPagoSignature } from '@/lib/mercadopago';

export async function POST(req: NextRequest) {
  try {
    const xSignature = req.headers.get('x-signature');
    const xRequestId = req.headers.get('x-request-id');
    const body = await req.json();

    const dataId = body.data?.id || body.id;
    const eventType = body.type || body.action || 'unknown';

    if (!dataId) {
      return NextResponse.json({ error: 'Payload sem identificador (data.id)' }, { status: 400 });
    }

    // 1. Validação Criptográfica de Assinatura
    const isValidSignature = verifyMercadoPagoSignature({
      xSignatureHeader: xSignature,
      xRequestId,
      dataId: String(dataId),
    });

    if (!isValidSignature) {
      return NextResponse.json({ error: 'Assinatura criptográfica inválida' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();

    // 2. Proteção de IDEMPOTÊNCIA (registro único no banco)
    const { data: existingEvent, error: checkError } = await supabaseAdmin
      .from('webhook_events')
      .select('id, processing_status')
      .eq('provider', 'mercadopago')
      .eq('provider_event_id', String(dataId))
      .maybeSingle();

    if (existingEvent && existingEvent.processing_status === 'processed') {
      return NextResponse.json({ message: 'Evento já processado anteriormente (idempotente).' }, { status: 200 });
    }

    // Insere ou atualiza o evento como recebido
    if (!existingEvent) {
      await supabaseAdmin.from('webhook_events').insert({
        provider: 'mercadopago',
        provider_event_id: String(dataId),
        event_type: eventType,
        processing_status: 'received',
        payload: body,
      });
    }

    // 3. Processamento de acordo com o tipo de evento
    if (eventType === 'payment' || body.action === 'payment.created' || body.action === 'payment.updated') {
      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado.');
      }

      // Consulta direta na API oficial do Mercado Pago para obter o status real
      const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (paymentRes.ok) {
        const paymentData = await paymentRes.json();
        const externalReference = paymentData.external_reference; // Contém userId:planId
        const status = paymentData.status; // approved, pending, rejected, etc.
        const amount = paymentData.transaction_amount;

        if (externalReference && externalReference.includes(':')) {
          const [userId, planId] = externalReference.split(':');

          // Registra ou atualiza o pagamento
          await supabaseAdmin.from('payments').insert({
            user_id: userId,
            provider: 'mercadopago',
            provider_payment_id: String(dataId),
            amount,
            currency: 'BRL',
            status: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending',
            paid_at: status === 'approved' ? new Date().toISOString() : null,
            raw_response: paymentData,
          });

          // Se aprovado, atualiza ou ativa a assinatura do usuário
          if (status === 'approved') {
            const periodEnd = new Date();
            periodEnd.setMonth(periodEnd.getMonth() + 1);

            await supabaseAdmin.from('subscriptions').upsert(
              {
                user_id: userId,
                plan_id: planId,
                provider: 'mercadopago',
                provider_subscription_id: String(dataId),
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: periodEnd.toISOString(),
                cancel_at_period_end: false,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id' }
            );

            // Cria notificação interna para o cliente
            await supabaseAdmin.from('notifications').insert({
              user_id: userId,
              type: 'subscription_approved',
              title: 'Assinatura confirmada!',
              message: 'Seu pagamento foi confirmado com sucesso. Todos os recursos do seu plano estão liberados.',
              status: 'sent',
              sent_at: new Date().toISOString(),
            });
          }
        }
      }
    }

    // 4. Marca o evento como processado
    await supabaseAdmin
      .from('webhook_events')
      .update({
        processing_status: 'processed',
        processed_at: new Date().toISOString(),
      })
      .eq('provider', 'mercadopago')
      .eq('provider_event_id', String(dataId));

    return NextResponse.json({ success: true, message: 'Webhook processado com sucesso.' }, { status: 200 });
  } catch (error: any) {
    console.error('[Webhook MercadoPago] Erro:', error);
    return NextResponse.json({ error: error.message || 'Erro interno no processamento' }, { status: 500 });
  }
}
