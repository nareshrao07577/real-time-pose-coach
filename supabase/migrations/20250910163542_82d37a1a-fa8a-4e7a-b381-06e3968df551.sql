-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  fitness_level TEXT DEFAULT 'Beginner' CHECK (fitness_level IN ('Beginner', 'Intermediate', 'Advanced')),
  height_cm INTEGER,
  weight_kg INTEGER,
  fitness_goals TEXT[],
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercises table
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  description TEXT,
  instructions TEXT[],
  target_muscles TEXT[],
  equipment_needed TEXT[],
  form_points TEXT[],
  reference_video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout_sessions table
CREATE TABLE public.workout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  total_exercises INTEGER DEFAULT 0,
  total_reps INTEGER DEFAULT 0,
  average_accuracy DECIMAL(5,2) DEFAULT 0.0,
  calories_burned INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout_exercises table (tracks individual exercises in a workout)
CREATE TABLE public.workout_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  sets_completed INTEGER DEFAULT 0,
  reps_completed INTEGER DEFAULT 0,
  target_reps INTEGER DEFAULT 0,
  accuracy_score DECIMAL(5,2) DEFAULT 0.0,
  duration_seconds INTEGER DEFAULT 0,
  form_feedback JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  badge_icon TEXT,
  points_reward INTEGER DEFAULT 0,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('streak', 'total_reps', 'accuracy', 'workouts', 'custom')),
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('daily', 'weekly', 'monthly', 'custom')),
  target_value INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  points_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_challenges table
CREATE TABLE public.user_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Create custom_workouts table
CREATE TABLE public.custom_workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  exercise_ids UUID[] NOT NULL,
  estimated_duration_minutes INTEGER DEFAULT 30,
  difficulty TEXT DEFAULT 'Beginner' CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_workouts ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for exercises (public read access)
CREATE POLICY "Anyone can view exercises" ON public.exercises FOR SELECT USING (true);

-- Create policies for workout_sessions
CREATE POLICY "Users can view own workout sessions" ON public.workout_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout sessions" ON public.workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout sessions" ON public.workout_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for workout_exercises
CREATE POLICY "Users can view own workout exercises" ON public.workout_exercises 
FOR SELECT USING (auth.uid() IN (
  SELECT user_id FROM public.workout_sessions WHERE id = workout_session_id
));
CREATE POLICY "Users can insert own workout exercises" ON public.workout_exercises 
FOR INSERT WITH CHECK (auth.uid() IN (
  SELECT user_id FROM public.workout_sessions WHERE id = workout_session_id
));
CREATE POLICY "Users can update own workout exercises" ON public.workout_exercises 
FOR UPDATE USING (auth.uid() IN (
  SELECT user_id FROM public.workout_sessions WHERE id = workout_session_id
));

-- Create policies for achievements (public read)
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);

-- Create policies for user_achievements
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for challenges (public read)
CREATE POLICY "Anyone can view challenges" ON public.challenges FOR SELECT USING (true);

-- Create policies for user_challenges
CREATE POLICY "Users can view own challenge progress" ON public.user_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can join challenges" ON public.user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own challenge progress" ON public.user_challenges FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for custom_workouts
CREATE POLICY "Users can view public workouts or own workouts" ON public.custom_workouts 
FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON public.custom_workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON public.custom_workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON public.custom_workouts FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_custom_workouts_updated_at BEFORE UPDATE ON public.custom_workouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample exercises
INSERT INTO public.exercises (name, category, difficulty, description, instructions, target_muscles, equipment_needed, form_points, reference_video_url) VALUES
('Push-ups', 'Upper Body', 'Beginner', 'Classic upper body exercise targeting chest, shoulders, and triceps', 
 ARRAY['Start in plank position', 'Lower body until chest nearly touches floor', 'Push back up to starting position'], 
 ARRAY['Chest', 'Shoulders', 'Triceps', 'Core'], 
 ARRAY['None'], 
 ARRAY['Keep body straight', 'Don''t let hips sag', 'Full range of motion'], 
 null),

('Squats', 'Lower Body', 'Beginner', 'Fundamental lower body exercise for legs and glutes',
 ARRAY['Stand with feet shoulder-width apart', 'Lower by bending knees and hips', 'Return to standing position'],
 ARRAY['Quadriceps', 'Glutes', 'Hamstrings'],
 ARRAY['None'],
 ARRAY['Keep knees behind toes', 'Maintain straight back', 'Go down to 90 degrees'],
 null),

('Lunges', 'Lower Body', 'Intermediate', 'Single-leg exercise for balance and strength',
 ARRAY['Step forward into lunge position', 'Lower until both knees at 90 degrees', 'Return to starting position'],
 ARRAY['Quadriceps', 'Glutes', 'Hamstrings'],
 ARRAY['None'],
 ARRAY['Keep front knee over ankle', 'Don''t let knee cave inward', 'Maintain upright torso'],
 null),

('Plank', 'Core', 'Beginner', 'Isometric exercise for core strength and stability',
 ARRAY['Start in push-up position on forearms', 'Hold position maintaining straight line', 'Breathe normally'],
 ARRAY['Core', 'Shoulders', 'Back'],
 ARRAY['None'],
 ARRAY['Keep hips level', 'Don''t let back arch', 'Engage core muscles'],
 null),

('Burpees', 'Full Body', 'Advanced', 'High-intensity full-body exercise',
 ARRAY['Start standing', 'Drop to squat and place hands on floor', 'Jump back to plank', 'Do push-up', 'Jump feet back to squat', 'Jump up with arms overhead'],
 ARRAY['Full Body'],
 ARRAY['None'],
 ARRAY['Maintain form throughout', 'Land softly', 'Keep core engaged'],
 null);

-- Insert sample achievements
INSERT INTO public.achievements (name, description, badge_icon, points_reward, requirement_type, requirement_value) VALUES
('First Workout', 'Complete your first workout session', '🏃‍♂️', 50, 'workouts', 1),
('Perfect Form', 'Achieve 95% accuracy in a workout', '💯', 100, 'accuracy', 95),
('Century Club', 'Complete 100 total reps', '💪', 200, 'total_reps', 100),
('Week Warrior', 'Work out 7 days in a row', '🔥', 300, 'streak', 7),
('Dedication Master', 'Complete 50 workout sessions', '🏆', 500, 'workouts', 50);

-- Insert sample challenges  
INSERT INTO public.challenges (name, description, challenge_type, target_value, start_date, end_date, points_reward) VALUES
('30-Day Plank Challenge', 'Hold a plank for 60 seconds every day for 30 days', 'monthly', 30, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 1000),
('Weekly Push-up Goal', 'Complete 200 push-ups this week', 'weekly', 200, CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE) * INTERVAL '1 day', CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE) * INTERVAL '1 day' + INTERVAL '6 days', 300),
('Squat Squad', 'Do 500 squats this month', 'monthly', 500, DATE_TRUNC('month', CURRENT_DATE), DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day', 800);