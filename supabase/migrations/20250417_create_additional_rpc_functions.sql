
-- Get profile function
CREATE OR REPLACE FUNCTION public.get_profile(user_id UUID)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  profile_data JSONB;
BEGIN
  SELECT 
    jsonb_build_object(
      'id', id,
      'username', username,
      'avatar_url', avatar_url,
      'updated_at', updated_at
    ) INTO profile_data
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN profile_data;
END;
$$;

-- Update profile function
CREATE OR REPLACE FUNCTION public.update_profile(
  profile_username TEXT DEFAULT NULL,
  profile_avatar_url TEXT DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  profile_data JSONB;
  user_id UUID;
BEGIN
  user_id := auth.uid();
  
  UPDATE public.profiles 
  SET 
    username = COALESCE(profile_username, username),
    avatar_url = COALESCE(profile_avatar_url, avatar_url),
    updated_at = NOW()
  WHERE id = user_id
  RETURNING jsonb_build_object(
    'id', id,
    'username', username,
    'avatar_url', avatar_url,
    'updated_at', updated_at
  ) INTO profile_data;
  
  RETURN profile_data;
END;
$$;

-- Get login history function
CREATE OR REPLACE FUNCTION public.get_login_history()
RETURNS SETOF JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'login_timestamp', login_timestamp,
    'logout_timestamp', logout_timestamp,
    'user_agent', user_agent,
    'ip_address', ip_address
  )
  FROM public.login_history
  WHERE user_id = auth.uid()
  ORDER BY login_timestamp DESC;
END;
$$;

-- Record login function 
CREATE OR REPLACE FUNCTION public.record_login(user_agent_str TEXT)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  login_id UUID;
BEGIN
  INSERT INTO public.login_history (user_id, user_agent, ip_address)
  VALUES (auth.uid(), user_agent_str, 'Unknown')
  RETURNING id INTO login_id;
  
  RETURN login_id;
END;
$$;

-- Record logout function
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
