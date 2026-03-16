-- Create policy for leaderboard (allow users to see all user stats with usernames for ranking)
CREATE POLICY "Anyone can view leaderboard stats"
ON public.user_stats
FOR SELECT
USING (true);