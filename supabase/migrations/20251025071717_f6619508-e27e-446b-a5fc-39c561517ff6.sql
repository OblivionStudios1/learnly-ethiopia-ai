-- Drop the existing view and recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.leaderboard_view;

-- Create a secure view with SECURITY INVOKER that respects RLS policies
CREATE OR REPLACE VIEW public.leaderboard_view 
WITH (security_invoker=on) AS
SELECT 
  p.username,
  us.xp_points,
  us.user_id
FROM public.user_stats us
JOIN public.profiles p ON p.id = us.user_id
ORDER BY us.xp_points DESC;

-- Grant SELECT on the view
GRANT SELECT ON public.leaderboard_view TO authenticated;
GRANT SELECT ON public.leaderboard_view TO anon;