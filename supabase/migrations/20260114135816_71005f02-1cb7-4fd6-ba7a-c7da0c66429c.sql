-- Add missing UPDATE policy for test_results table
CREATE POLICY "Users can update own test results" ON public.test_results
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions 
      WHERE test_sessions.id = test_results.session_id 
      AND test_sessions.user_id = auth.uid()
    )
  );