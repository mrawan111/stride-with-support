-- Create disability types table
CREATE TABLE public.disability_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercise categories table
CREATE TABLE public.exercise_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercises table
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  disability_type_id UUID NOT NULL REFERENCES public.disability_types(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.exercise_categories(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  instructions_ar TEXT NOT NULL,
  instructions_en TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  equipment TEXT,
  duration_reps TEXT,
  safety_notes_ar TEXT,
  safety_notes_en TEXT,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  disability_type_id UUID REFERENCES public.disability_types(id),
  language_pref TEXT DEFAULT 'ar' CHECK (language_pref IN ('ar', 'en')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user progress table
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(user_id, exercise_id, completed_at)
);

-- Enable RLS on all tables
ALTER TABLE public.disability_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Policies for disability_types (public read)
CREATE POLICY "Disability types are viewable by everyone"
  ON public.disability_types FOR SELECT
  USING (true);

-- Policies for exercise_categories (public read)
CREATE POLICY "Exercise categories are viewable by everyone"
  ON public.exercise_categories FOR SELECT
  USING (true);

-- Policies for exercises (public read)
CREATE POLICY "Exercises are viewable by everyone"
  ON public.exercises FOR SELECT
  USING (true);

-- Policies for users
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policies for user_progress
CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON public.user_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed disability types
INSERT INTO public.disability_types (slug, title_ar, title_en, description_ar, description_en) VALUES
  ('intellectual', 'الإعاقات الذهنية', 'Intellectual Disabilities', 'متلازمة داون وصعوبات معرفية', 'Down syndrome and cognitive difficulties'),
  ('hearing', 'الإعاقات السمعية', 'Hearing Impairments', 'ضعف أو فقدان السمع', 'Hearing loss or deafness'),
  ('motor', 'الإعاقات الحركية الجزئية', 'Motor Impairments', 'الشلل الدماغي وضعف الأطراف', 'Cerebral palsy and limb weakness'),
  ('visual', 'الإعاقات البصرية', 'Visual Impairments', 'ضعف أو فقدان البصر', 'Vision loss or blindness');

-- Seed exercise categories
INSERT INTO public.exercise_categories (key, title_ar, title_en) VALUES
  ('strength', 'القوة العضلية', 'Muscular Strength'),
  ('endurance', 'التحمل', 'Endurance'),
  ('flexibility', 'المرونة', 'Flexibility'),
  ('balance', 'التوازن والتنسيق', 'Balance & Coordination'),
  ('speed', 'السرعة ورد الفعل', 'Speed & Reaction');