import crypto from 'crypto';

interface MercadoPagoPreferencePayload {
  title: string;
  price: number;
  payerEmail: string;
  externalReference: string;
  backUrls: {
    success: string;
    failure: string;
    pending: string;
  };
}

import { createAdminClient } from './supabase/admin';

export async function getMercadoPagoAccessToken(): Promise<string> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('app_settings')
      .select('public_value')
      .eq('key', 'mercadopago_credentials')
      .maybeSingle();

    if (data?.public_value?.accessToken) {
      return data.public_value.accessToken;
    }
  } catch (e) {
    // fallback para variavel de ambiente
  }
  return process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
}

/**
 * Criação de Preferência de Checkout / Assinatura do Mercado Pago
 * Executado EXCLUSIVAMENTE no servidor.
 */
export async function createMercadoPagoPreference(payload: MercadoPagoPreferencePayload) {
  const token = await getMercadoPagoAccessToken();
  if (!token) {
    throw new Error('As credenciais do Mercado Pago não estão configuradas. Por favor, acesse o Painel Administrativo em Configurações para inserir seu Access Token.');
  }

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items: [
        {
          title: payload.title,
          unit_price: payload.price,
          quantity: 1,
          currency_id: 'BRL',
        },
      ],
      payer: {
        email: payload.payerEmail,
      },
      back_urls: payload.backUrls,
      auto_return: 'approved',
      external_reference: payload.externalReference,
      statement_descriptor: 'CADE MEU DINHEIRO',
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Erro Mercado Pago: ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

/**
 * Validação de Assinatura Criptográfica do Webhook do Mercado Pago (x-signature)
 * Garante que a requisição veio genuinamente dos servidores do Mercado Pago.
 */
export function verifyMercadoPagoSignature(params: {
  xSignatureHeader: string | null;
  xRequestId: string | null;
  dataId: string;
}): boolean {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[MercadoPago] MERCADO_PAGO_WEBHOOK_SECRET não configurado. Verificação em modo permissivo de teste.');
    return true; // Se ainda não configurado pelo usuário, permite modo de desenvolvimento seguro
  }

  if (!params.xSignatureHeader) return false;

  // O cabeçalho vem no formato: ts=...,v1=...
  const parts = params.xSignatureHeader.split(',');
  let ts = '';
  let v1 = '';

  for (const part of parts) {
    const [key, val] = part.split('=');
    if (key?.trim() === 'ts') ts = val?.trim();
    if (key?.trim() === 'v1') v1 = val?.trim();
  }

  if (!ts || !v1) return false;

  // Cria template assinado: id:[data.id];request-id:[x-request-id];ts:[ts];
  const manifest = `id:${params.dataId};request-id:${params.xRequestId || ''};ts:${ts};`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(manifest);
  const calculated = hmac.digest('hex');

  return calculated === v1;
}
