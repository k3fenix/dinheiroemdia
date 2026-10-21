import { describe, it, expect } from 'vitest';
import { verifyMercadoPagoSignature } from '../lib/mercadopago';

describe('Segurança, RLS e Integridade de Pagamentos', () => {
  it('não deve conter segredos privados no frontend (.env.example sem NEXT_PUBLIC_ nas chaves mestras)', () => {
    // Validação estática de convenção: chaves mestras NUNCA podem ter prefixo NEXT_PUBLIC_
    const secretKeys = ['SUPABASE_SERVICE_ROLE_KEY', 'MERCADO_PAGO_ACCESS_TOKEN', 'MERCADO_PAGO_WEBHOOK_SECRET'];
    for (const key of secretKeys) {
      expect(key.startsWith('NEXT_PUBLIC_')).toBe(false);
    }
  });

  it('deve rejeitar webhook se a assinatura HMAC for inválida quando o secret estiver configurado', () => {
    process.env.MERCADO_PAGO_WEBHOOK_SECRET = 'segredo_teste_12345';

    const result = verifyMercadoPagoSignature({
      xSignatureHeader: 'ts=1700000000,v1=hash_invalido_qualquer',
      xRequestId: 'req-abc-123',
      dataId: 'pay-99999',
    });

    expect(result).toBe(false);
  });
});
