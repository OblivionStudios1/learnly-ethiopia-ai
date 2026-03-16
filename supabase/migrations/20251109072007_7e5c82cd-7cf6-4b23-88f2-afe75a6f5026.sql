-- Fix security definer view by recreating with security_invoker=on
DROP VIEW IF EXISTS public.leaderboard_view;

CREATE VIEW public.leaderboard_view 
WITH (security_invoker=on)
AS
SELECT 
  p.username,
  us.xp_points,
  p.show_xp_in_leaderboard
FROM public.profiles p
JOIN public.user_stats us ON p.id = us.user_id
WHERE p.show_xp_in_leaderboard = true
ORDER BY us.xp_points DESC;