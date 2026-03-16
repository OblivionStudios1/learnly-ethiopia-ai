-- Add show_xp_in_leaderboard column to profiles
ALTER TABLE public.profiles
ADD COLUMN show_xp_in_leaderboard BOOLEAN NOT NULL DEFAULT true;

-- Update leaderboard_view to respect privacy settings
DROP VIEW IF EXISTS public.leaderboard_view;

CREATE VIEW public.leaderboard_view AS
SELECT 
  p.username,
  CASE 
    WHEN p.show_xp_in_leaderboard = true THEN COALESCE(us.xp_points, 0)
    ELSE 0
  END as xp_points,
  p.show_xp_in_leaderboard
FROM public.profiles p
LEFT JOIN public.user_stats us ON p.id = us.user_id
WHERE p.show_xp_in_leaderboard = true
ORDER BY xp_points DESC;