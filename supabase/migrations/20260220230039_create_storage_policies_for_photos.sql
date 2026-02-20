/*
  # Storage Policies for Photos Bucket

  1. Security
    - Enable RLS on storage.objects for photos bucket
    - Users can upload photos to their own folder
    - Users can view their own photos
    - Users can delete their own photos
*/

-- Enable RLS for storage
CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Public photos are viewable by everyone"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'photos');
