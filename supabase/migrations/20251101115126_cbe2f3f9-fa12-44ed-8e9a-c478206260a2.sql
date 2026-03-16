-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  524288000, -- 500MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska']
);

-- Create storage bucket for thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'thumbnails',
  'thumbnails',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Storage policies for videos bucket
CREATE POLICY "Anyone can view videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for thumbnails bucket
CREATE POLICY "Anyone can view thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

CREATE POLICY "Authenticated users can upload thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'thumbnails' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own thumbnails"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'thumbnails' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'thumbnails' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add creator_id to videos table to track who uploaded
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES auth.users(id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_videos_creator_id ON public.videos(creator_id);
CREATE INDEX IF NOT EXISTS idx_videos_grade ON public.videos(grade);

-- Update RLS policies for videos table to allow creators to insert
DROP POLICY IF EXISTS "Creators can insert videos" ON public.videos;
CREATE POLICY "Creators can insert videos"
ON public.videos FOR INSERT
WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Creators can update their videos" ON public.videos;
CREATE POLICY "Creators can update their videos"
ON public.videos FOR UPDATE
USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Creators can delete their videos" ON public.videos;
CREATE POLICY "Creators can delete their videos"
ON public.videos FOR DELETE
USING (auth.uid() = creator_id);