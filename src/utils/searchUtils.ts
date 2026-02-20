import { getAllContainers } from '../lib/supabaseDb';
import { Container } from '../types';
import { supabase } from '../supabase';

export async function searchContainers(query: string): Promise<Container[]> {
  if (!query.trim()) {
    return await getAllContainers();
  }

  const searchTerm = query.toLowerCase().trim();
  const allContainers = await getAllContainers();
  const matchingContainerIds = new Set<string>();

  for (const container of allContainers) {
    if (
      container.id.toLowerCase().includes(searchTerm) ||
      container.label.toLowerCase().includes(searchTerm) ||
      container.location.toLowerCase().includes(searchTerm) ||
      (container.notes && container.notes.toLowerCase().includes(searchTerm))
    ) {
      matchingContainerIds.add(container.id);
    }
  }

  const { data: photos } = await supabase
    .from('photos')
    .select('container_id, description')
    .not('description', 'is', null);

  if (photos) {
    for (const photo of photos) {
      if (photo.description && photo.description.toLowerCase().includes(searchTerm)) {
        matchingContainerIds.add(photo.container_id);
      }
    }
  }

  return allContainers
    .filter(c => matchingContainerIds.has(c.id))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}
