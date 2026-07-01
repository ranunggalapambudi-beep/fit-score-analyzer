CREATE TABLE public.custom_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  procedure TEXT DEFAULT '',
  equipment TEXT[] DEFAULT ARRAY[]::TEXT[],
  reference TEXT DEFAULT '',
  unit TEXT NOT NULL DEFAULT '',
  higher_is_better BOOLEAN NOT NULL DEFAULT true,
  use_age_groups BOOLEAN NOT NULL DEFAULT false,
  norms JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_tests TO authenticated;
GRANT ALL ON public.custom_tests TO service_role;

ALTER TABLE public.custom_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom tests"
  ON public.custom_tests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom tests"
  ON public.custom_tests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom tests"
  ON public.custom_tests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom tests"
  ON public.custom_tests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_custom_tests_user_category ON public.custom_tests(user_id, category_id);

CREATE TRIGGER update_custom_tests_updated_at
  BEFORE UPDATE ON public.custom_tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();