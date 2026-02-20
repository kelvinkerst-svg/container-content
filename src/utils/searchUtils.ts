import { db } from '../db';
import { Container } from '../types';

export async function searchContainers(query: string): Promise<Container[]> {
  if (!query.trim()) {
    return await db.containers.orderBy('updatedAt').reverse().toArray();
  }

  const searchTerm = query.toLowerCase().trim();

  const allContainers = await db.containers.toArray();
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

  const photos = await db.photos
    .where('description')
    .notEqual('')
    .toArray();

  for (const photo of photos) {
    if (photo.description && photo.description.toLowerCase().includes(searchTerm)) {
      matchingContainerIds.add(photo.containerId);
    }
  }

  return allContainers
    .filter(c => matchingContainerIds.has(c.id))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}
