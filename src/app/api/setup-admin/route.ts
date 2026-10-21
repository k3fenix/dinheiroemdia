import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { success: false, error: 'E-mail, senha e nome completo são obrigatórios.' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 1. Tentar criar o usuário no Auth com e-mail confirmado automaticamente
    let userId: string;
    const { data: createData, error: createError } = await admin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName.trim(),
      },
    });

    if (createError) {
      // Se o usuário já existir no auth.users
      if (
        createError.message.toLowerCase().includes('already') ||
        createError.message.toLowerCase().includes('exists') ||
        createError.status === 422
      ) {
        const { data: usersData, error: listError } = await admin.auth.admin.listUsers();
        if (listError) {
          return NextResponse.json(
            { success: false, error: `Erro ao buscar usuários: ${listError.message}` },
            { status: 400 }
          );
        }

        const existingUser = usersData.users.find(
          (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
        );

        if (!existingUser) {
          return NextResponse.json(
            { success: false, error: createError.message },
            { status: 400 }
          );
        }

        userId = existingUser.id;

        // Atualiza a senha e confirma o e-mail se necessário
        await admin.auth.admin.updateUserById(userId, {
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName.trim() },
        });
      } else {
        return NextResponse.json(
          { success: false, error: `Erro no Supabase Auth: ${createError.message}` },
          { status: 400 }
        );
      }
    } else {
      userId = createData.user.id;
    }

    // 2. Garantir criação/atualização na tabela profiles
    const { error: profileError } = await admin.from('profiles').upsert(
      {
        id: userId,
        full_name: fullName.trim(),
        preferred_currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        font_scale: 'normal',
        is_blocked: false,
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      return NextResponse.json(
        {
          success: false,
          error: `As tabelas do banco parecem não ter sido criadas ainda no Supabase. Execute o script 'supabase/migrations/20261021000000_schema_and_rls.sql' no SQL Editor do Supabase. Detalhe: ${profileError.message}`,
        },
        { status: 500 }
      );
    }

    // 3. Garantir privilégio de Administrador em user_roles
    const { error: roleError } = await admin.from('user_roles').upsert(
      {
        user_id: userId,
        role: 'admin',
      },
      { onConflict: 'user_id,role' }
    );

    if (roleError) {
      return NextResponse.json(
        {
          success: false,
          error: `Erro ao atribuir papel de admin: ${roleError.message}`,
        },
        { status: 500 }
      );
    }

    // 4. Registro no log de auditoria
    await admin.from('admin_audit_logs').insert({
      actor_user_id: userId,
      action: 'SETUP_FIRST_ADMIN',
      target_type: 'user_roles',
      target_id: userId,
      reason: 'Criação do Administrador mestre pelo assistente de configuração',
    });

    return NextResponse.json({
      success: true,
      message: `Administrador ${email} cadastrado e ativado com sucesso! Você já pode fazer login.`,
      userId,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Erro inesperado ao cadastrar administrador.',
      },
      { status: 500 }
    );
  }
}
