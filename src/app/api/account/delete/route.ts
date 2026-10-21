import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Sessão inválida ou expirada.' }, { status: 401 });
    }

    const { confirmationText } = await req.json();
    if (confirmationText !== 'EXCLUIR MINHA CONTA DEFINITIVAMENTE') {
      return NextResponse.json(
        { error: 'Texto de confirmação incorreto para exclusão.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Registra auditoria de exclusão voluntária antes de apagar
    await supabaseAdmin.from('admin_audit_logs').insert({
      actor_user_id: user.id,
      action: 'USER_SELF_DELETION_LGPD',
      target_type: 'users',
      target_id: user.id,
      reason: 'Solicitação voluntária do titular de exclusão total de dados (LGPD Art. 18).',
    });

    // Exclui o usuário no auth do Supabase (as tabelas filhas com ON DELETE CASCADE serão limpas automaticamente)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true, message: 'Conta e dados excluídos com sucesso.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Falha ao processar exclusão' }, { status: 500 });
  }
}
