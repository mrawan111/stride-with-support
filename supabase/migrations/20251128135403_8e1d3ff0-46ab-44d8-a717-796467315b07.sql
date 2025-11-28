-- Add accessibility preference columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS font_size text DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large', 'extra-large')),
ADD COLUMN IF NOT EXISTS reduce_motion boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS color_blind_mode_type text DEFAULT 'deuteranopia' CHECK (color_blind_mode_type IN ('protanopia', 'deuteranopia', 'tritanopia'));