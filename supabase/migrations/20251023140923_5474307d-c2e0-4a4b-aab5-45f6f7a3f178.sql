-- Add username to profiles (unique, random word + number)
ALTER TABLE public.profiles
ADD COLUMN username TEXT UNIQUE;

-- Create user_stats table
CREATE TABLE public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  questions_asked INTEGER DEFAULT 0,
  day_streak INTEGER DEFAULT 0,
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  xp_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own stats"
ON public.user_stats FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
ON public.user_stats FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
ON public.user_stats FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create saved_videos table
CREATE TABLE public.saved_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Enable RLS
ALTER TABLE public.saved_videos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own saved videos"
ON public.saved_videos FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can save videos"
ON public.saved_videos FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave videos"
ON public.saved_videos FOR DELETE
USING (auth.uid() = user_id);

-- Create ai_questions table
CREATE TABLE public.ai_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  subject TEXT,
  grade INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_questions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own questions"
ON public.ai_questions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questions"
ON public.ai_questions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add trigger for user_stats updated_at
CREATE TRIGGER update_user_stats_updated_at
BEFORE UPDATE ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique username
CREATE OR REPLACE FUNCTION generate_unique_username()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
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
$$;

-- Function to initialize user data on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile with unique username
  INSERT INTO public.profiles (id, email, username, grade, subjects)
  VALUES (
    NEW.id,
    NEW.email,
    generate_unique_username(),
    7,
    '[]'::jsonb
  );
  
  -- Insert user_stats
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_complete();