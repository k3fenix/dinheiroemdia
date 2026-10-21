import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://rjrucyjgcmvkshwldpjc.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY precisa estar definida no ambiente.');
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const email = 'lucianoalkine@gmail.com';
  const password = '14182171Lu@';
  const fullName = 'LUCIANO APARECIDO ALVES ALKINE';

  console.log('Iniciando cadastro/atualizacao do admin:', email);

  const { data: usersData, error: listErr } = await admin.auth.admin.listUsers();
  if (listErr) {
    console.error('Erro ao listar usuarios:', listErr);
  }

  const existing = usersData?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );
  let userId;

  if (existing) {
    userId = existing.id;
    await admin.auth.admin.updateUserById(userId, {
      password: password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    console.log('Senha e email_confirm atualizados!');
  } else {
    const { data: createData, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (createErr) {
      console.error('Erro ao criar usuario:', createErr);
      return;
    }
    userId = createData.user.id;
    console.log('Usuario criado no Auth:', userId);
  }

  await admin.from('profiles').upsert(
    {
      id: userId,
      full_name: fullName,
      preferred_currency: 'BRL',
      timezone: 'America/Sao_Paulo',
      font_scale: 'normal',
      is_blocked: false,
    },
    { onConflict: 'id' }
  );

  await admin.from('user_roles').upsert(
    {
      user_id: userId,
      role: 'admin',
    },
    { onConflict: 'user_id,role' }
  );

  console.log('>>> Admin configurado com sucesso!');
}

main().catch((err) => console.error('Erro fatal:', err));
