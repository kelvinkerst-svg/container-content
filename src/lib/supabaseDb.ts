import { supabase } from '../supabase';
import { Container, Photo } from '../types';

export async function getAllContainers(): Promise<Container[]> {
  const { data, error } = await supabase
    .from('containers')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return data.map(row => ({
    id: row.id,
    label: row.label,
    location: row.location,
    notes: row.notes,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  }));
}

export async function getContainer(id: string): Promise<Container | null> {
  const { data, error } = await supabase
    .from('containers')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    label: data.label,
    location: data.location,
    notes: data.notes,
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
  };
}

export async function createContainer(container: Container): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('containers')
    .insert({
      id: container.id,
      user_id: user.id,
      label: container.label,
      location: container.location,
      notes: container.notes,
      created_at: new Date(container.createdAt).toISOString(),
      updated_at: new Date(container.updatedAt).toISOString(),
    });

  if (error) throw error;
}

export async function updateContainer(container: Container): Promise<void> {
  const { error } = await supabase
    .from('containers')
    .update({
      label: container.label,
      location: container.location,
      notes: container.notes,
      updated_at: new Date(container.updatedAt).toISOString(),
    })
    .eq('id', container.id);

  if (error) throw error;
}

export async function deleteContainer(id: string): Promise<void> {
  const photos = await getPhotosByContainer(id);

  for (const photo of photos) {
    await deletePhoto(photo.id);
  }

  const { error } = await supabase
    .from('containers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getPhotosByContainer(containerId: string): Promise<Photo[]> {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('container_id', containerId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const photos: Photo[] = [];

  for (const row of data) {
    const imageBlob = await downloadImage(row.image_url);
    const thumbnailBlob = await downloadImage(row.thumbnail_url);

    if (imageBlob && thumbnailBlob) {
      photos.push({
        id: row.id,
        containerId: row.container_id,
        description: row.description,
        imageBlob,
        thumbnailBlob,
        createdAt: new Date(row.created_at).getTime(),
      });
    }
  }

  return photos;
}

export async function createPhoto(photo: Photo): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const imageUrl = await uploadImage(photo.imageBlob, `${photo.id}-full`);
  const thumbnailUrl = await uploadImage(photo.thumbnailBlob, `${photo.id}-thumb`);

  const { error } = await supabase
    .from('photos')
    .insert({
      id: photo.id,
      container_id: photo.containerId,
      user_id: user.id,
      description: photo.description,
      image_url: imageUrl,
      thumbnail_url: thumbnailUrl,
      created_at: new Date(photo.createdAt).toISOString(),
    });

  if (error) throw error;
}

export async function updatePhoto(photo: Photo): Promise<void> {
  const { error } = await supabase
    .from('photos')
    .update({
      description: photo.description,
    })
    .eq('id', photo.id);

  if (error) throw error;
}

export async function deletePhoto(id: string): Promise<void> {
  const { data: photo } = await supabase
    .from('photos')
    .select('image_url, thumbnail_url')
    .eq('id', id)
    .single();

  if (photo) {
    await deleteImage(photo.image_url);
    await deleteImage(photo.thumbnail_url);
  }

  const { error } = await supabase
    .from('photos')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

async function uploadImage(blob: Blob, filename: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const path = `${user.id}/${filename}`;
  const { error } = await supabase.storage
    .from('photos')
    .upload(path, blob, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(path);

  return publicUrl;
}

async function downloadImage(url: string): Promise<Blob | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.blob();
  } catch {
    return null;
  }
}

async function deleteImage(url: string): Promise<void> {
  const path = url.split('/photos/')[1];
  if (!path) return;

  await supabase.storage
    .from('photos')
    .remove([path]);
}
