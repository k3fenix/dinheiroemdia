-- ==============================================================================
-- CADÊ MEU DINHEIRO? — ATRIBUIÇÃO SEGURA DE ADMINISTRADOR
-- Execute este script no SQL Editor do Supabase substituindo o e-mail do operador
-- ==============================================================================

DO $$
DECLARE
  v_user_email TEXT := 'seu-email-aqui@dominio.com'; -- Substitua pelo e-mail do administrador
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_user_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário com o e-mail % não foi encontrado no auth.users. Cadastre-se primeiro pelo site!', v_user_email;
  END IF;

  -- Insere ou atualiza o papel para admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Registra auditoria
  INSERT INTO public.admin_audit_logs (actor_user_id, action, target_type, target_id, reason)
  VALUES (v_user_id, 'GRANT_ADMIN_INITIAL', 'user_roles', v_user_id::text, 'Atribuição inicial de administrador do sistema');

  RAISE NOTICE 'Papel de ADMIN concedido com sucesso ao usuário % (ID: %)', v_user_email, v_user_id;
END;
$$;
