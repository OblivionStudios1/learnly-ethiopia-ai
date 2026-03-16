-- Drop the existing insecure view
DROP VIEW IF EXISTS public.leaderboard_view;

-- Create a secure view that only exposes public leaderboard data (no user_id)
CREATE OR REPLACE VIEW public.leaderboard_view 
WITH (security_invoker=on) AS
SELECT 
  p.username,
  us.xp_points
FROM public.user_stats us
JOIN public.profiles p ON p.id = us.user_id
ORDER BY us.xp_points DESC;

-- Grant SELECT to authenticated and anonymous users (leaderboard is public)
GRANT SELECT ON public.leaderboard_view TO authenticated;
GRANT SELECT ON public.leaderboard_view TO anon;