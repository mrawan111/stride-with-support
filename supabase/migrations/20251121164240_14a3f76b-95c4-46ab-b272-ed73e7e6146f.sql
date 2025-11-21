-- Add missing exercise categories for complete fitness program

INSERT INTO public.exercise_categories (key, title_ar, title_en)
VALUES 
  ('agility', 'الرشاقة', 'Agility'),
  ('coordination', 'التوافق العصبي العضلي', 'Neuromuscular Coordination')
ON CONFLICT (key) DO NOTHING;