import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const email = 'lucianoalkine@gmail.com';
    const password = '14182171Lu@';
    const fullName = 'LUCIANO APARECIDO ALVES ALKINE';

    const admin = createAdminClient();

    // 1. Procurar ou criar usuário
    const { data: usersData } = await admin.auth.admin.listUsers();
    const existing = usersData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    let userId: string;

    if (existing) {
      userId = existing.id;
      const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      });
      if (updErr) throw new Error(`Erro ao atualizar senha: ${updErr.message}`);
    } else {
      const { data: createData, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      });
      if (createErr) throw new Error(`Erro ao criar usuário: ${createErr.message}`);
      userId = createData.user.id;
    }

    // 2. Garantir profile
    await admin.from('profiles').upsert({
      id: userId,
      full_name: fullName,
      preferred_currency: 'BRL',
      timezone: 'America/Sao_Paulo',
      font_scale: 'normal',
      is_blocked: false
    }, { onConflict: 'id' });

    // 3. Garantir admin role
    await admin.from('user_roles').upsert({
      user_id: userId,
      role: 'admin'
    }, { onConflict: 'user_id,role' });

    return NextResponse.json({
      success: true,
      message: 'ADMIN CADASTRADO E ATIVADO COM SUCESSO!',
      email,
      senhaDefinida: '14182171Lu@',
      userId
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
