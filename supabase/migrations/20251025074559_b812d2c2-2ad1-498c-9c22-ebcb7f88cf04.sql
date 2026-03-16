-- Add DELETE RLS policies for account deletion to work
CREATE POLICY "Users can delete their own profile"
ON profiles FOR DELETE
USING (auth.uid() = id);

CREATE POLICY "Users can delete their own questions"
ON ai_questions FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stats"
ON user_stats FOR DELETE
USING (auth.uid() = user_id);

-- Add UNIQUE constraint for usernames to prevent duplicates
ALTER TABLE profiles ADD CONSTRAINT profiles_username_unique UNIQUE(username);

-- Add check constraint for username format (3-20 alphanumeric characters, dash, underscore)
ALTER TABLE profiles ADD CONSTRAINT profiles_username_format 
CHECK (username ~ '^[a-zA-Z0-9_-]{3,20}$');