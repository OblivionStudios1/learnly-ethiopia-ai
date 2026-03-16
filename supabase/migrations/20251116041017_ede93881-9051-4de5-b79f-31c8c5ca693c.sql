-- Add subscription_plan column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'basic';

-- Add last_upload_date column to track daily upload limits
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_upload_date date DEFAULT NULL;

-- Add upload_count_today column to track uploads
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS upload_count_today integer DEFAULT 0;