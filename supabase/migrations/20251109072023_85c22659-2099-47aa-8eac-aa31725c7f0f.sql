-- Fix search_path for functions that don't have it set
CREATE OR REPLACE FUNCTION public.generate_unique_username()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  words TEXT[] := ARRAY['swift', 'brave', 'bright', 'clever', 'wise', 'quick', 'bold', 'calm', 'cool', 'eager', 'fair', 'free', 'glad', 'keen', 'kind', 'lucky', 'merry', 'neat', 'proud', 'rare', 'safe', 'smart', 'true', 'warm', 'wild'];
  new_username TEXT;
  username_exists BOOLEAN;
BEGIN
  LOOP
    new_username := words[floor(random() * array_length(words, 1) + 1)] || floor(random() * 10000)::TEXT;
    
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = new_username) INTO username_exists;
    
    IF NOT username_exists THEN
      RETURN new_username;
    END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;