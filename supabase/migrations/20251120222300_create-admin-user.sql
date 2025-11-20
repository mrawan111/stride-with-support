CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- create admin user
  SELECT id INTO admin_id
  FROM auth.admin.create_user(
    email := 'admin@fitness.com',
    password := '12345678',
    email_confirm := true
  );

  -- insert profile
  INSERT INTO public.users (id, name, created_at, updated_at)
  VALUES (admin_id, 'Admin', now(), now());

  -- insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_id, 'admin');
END $$;
