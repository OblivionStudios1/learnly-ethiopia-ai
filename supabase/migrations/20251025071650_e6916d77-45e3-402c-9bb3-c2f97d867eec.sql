-- Remove the public SELECT policy that exposes sensitive data
DROP POLICY IF EXISTS "Anyone can view leaderboard stats" ON public.user_stats;

-- Create a secure view that only exposes leaderboard data (username and XP)
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT 
  p.username,
  us.xp_points,
  us.user_id
FROM public.user_stats us
JOIN public.profiles p ON p.id = us.user_id
ORDER BY us.xp_points DESC;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.leaderboard_view TO authenticated;
GRANT SELECT ON public.leaderboard_view TO anon;