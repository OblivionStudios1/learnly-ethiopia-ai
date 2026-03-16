-- Enable realtime for user_stats table to allow live XP updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_stats;