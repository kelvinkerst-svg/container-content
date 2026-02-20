/*
  # Container Contents - Initial Schema

  1. New Tables
    - `containers`
      - `id` (text, primary key) - Container ID in format C-XXXX
      - `user_id` (uuid, foreign key) - Owner of the container
      - `label` (text) - Container label/name
      - `location` (text) - Physical location
      - `notes` (text, nullable) - Additional notes
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `photos`
      - `id` (uuid, primary key) - Photo ID
      - `container_id` (text, foreign key) - Reference to container
      - `user_id` (uuid, foreign key) - Owner of the photo
      - `description` (text, nullable) - Photo description
      - `image_url` (text) - Full size image storage path
      - `thumbnail_url` (text) - Thumbnail storage path
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on both tables
    - Users can only access their own containers and photos
    - Policies for SELECT, INSERT, UPDATE, DELETE operations
*/

-- Create containers table
CREATE TABLE IF NOT EXISTS containers (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id text NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description text,
  image_url text NOT NULL,
  thumbnail_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_containers_user_id ON containers(user_id);
CREATE INDEX IF NOT EXISTS idx_containers_updated_at ON containers(updated_at);
CREATE INDEX IF NOT EXISTS idx_photos_container_id ON photos(container_id);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);

-- Enable Row Level Security
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for containers table
CREATE POLICY "Users can view own containers"
  ON containers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own containers"
  ON containers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own containers"
  ON containers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own containers"
  ON containers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for photos table
CREATE POLICY "Users can view own photos"
  ON photos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos"
  ON photos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos"
  ON photos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON photos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);