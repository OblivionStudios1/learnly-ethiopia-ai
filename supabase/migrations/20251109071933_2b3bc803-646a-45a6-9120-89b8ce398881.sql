-- Fix the trigger to handle duplicate profiles gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile with unique username, ignore if already exists
  INSERT INTO public.profiles (id, email, username, grade, subjects)
  VALUES (
    NEW.id,
    NEW.email,
    generate_unique_username(),
    7,
    '[]'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert user_stats, ignore if already exists
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;