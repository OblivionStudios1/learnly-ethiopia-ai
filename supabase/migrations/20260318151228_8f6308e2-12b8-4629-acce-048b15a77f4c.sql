CREATE POLICY "Anyone can upload demo videos"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'videos');