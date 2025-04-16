
-- Function to record login history
CREATE OR REPLACE FUNCTION public.record_login(user_agent_str TEXT)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.login_history (user_id, user_agent, ip_address)
  VALUES (auth.uid(), user_agent_str, 'Unknown');
END;
$$;

-- Function to update logout timestamp
CREATE OR REPLACE FUNCTION public.record_logout()
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.login_history
  SET logout_timestamp = NOW()
  WHERE user_id = auth.uid()
  AND logout_timestamp IS NULL
  ORDER BY login_timestamp DESC
  LIMIT 1;
END;
$$;
