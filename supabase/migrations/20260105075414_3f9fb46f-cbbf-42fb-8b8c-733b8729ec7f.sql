-- Create profiles table for coach data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  organization TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create athletes table
CREATE TABLE public.athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  sport TEXT NOT NULL,
  team TEXT,
  photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sport TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_sessions table
CREATE TABLE public.test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES public.athletes(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_results table
CREATE TABLE public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.test_sessions(id) ON DELETE CASCADE,
  test_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  value DECIMAL NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Athletes policies
CREATE POLICY "Users can view own athletes" ON public.athletes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own athletes" ON public.athletes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own athletes" ON public.athletes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own athletes" ON public.athletes
  FOR DELETE USING (auth.uid() = user_id);

-- Teams policies
CREATE POLICY "Users can view own teams" ON public.teams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own teams" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own teams" ON public.teams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own teams" ON public.teams
  FOR DELETE USING (auth.uid() = user_id);

-- Test sessions policies
CREATE POLICY "Users can view own test sessions" ON public.test_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test sessions" ON public.test_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own test sessions" ON public.test_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own test sessions" ON public.test_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Test results policies (access via session ownership)
CREATE POLICY "Users can view own test results" ON public.test_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions 
      WHERE test_sessions.id = test_results.session_id 
      AND test_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert test results" ON public.test_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.test_sessions 
      WHERE test_sessions.id = test_results.session_id 
      AND test_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own test results" ON public.test_results
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions 
      WHERE test_sessions.id = test_results.session_id 
      AND test_sessions.user_id = auth.uid()
    )
  );

-- Create function to handle new user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Trigger for auto-creating profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_athletes_updated_at
  BEFORE UPDATE ON public.athletes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();