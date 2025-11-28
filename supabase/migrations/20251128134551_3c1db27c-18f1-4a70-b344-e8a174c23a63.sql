-- Add color_blind_mode preference to users table
ALTER TABLE public.users 
ADD COLUMN color_blind_mode boolean DEFAULT false;

COMMENT ON COLUMN public.users.color_blind_mode IS 'User preference for color-blind friendly UI mode';