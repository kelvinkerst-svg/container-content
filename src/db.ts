import Dexie, { Table } from 'dexie';
import { Container, Photo } from './types';

export class ContainerDatabase extends Dexie {
  containers!: Table<Container, string>;
  photos!: Table<Photo, string>;

  constructor() {
    super('ContainerContentsDB');

    this.version(1).stores({
      containers: 'id, label, location, createdAt, updatedAt',
      photos: 'id, containerId, description, createdAt'
    });
  }
}

export const db = new ContainerDatabase();

export async function getAllContainers(): Promise<Container[]> {
  return await db.containers.orderBy('updatedAt').reverse().toArray();
}

export async function getContainer(id: string): Promise<Container | undefined> {
  return await db.containers.get(id);
}

export async function createContainer(container: Container): Promise<void> {
  await db.containers.add(container);
}

export async function updateContainer(container: Container): Promise<void> {
  await db.containers.put(container);
}

export async function deleteContainer(id: string): Promise<void> {
  const photos = await getPhotosByContainer(id);
  for (const photo of photos) {
    await deletePhoto(photo.id);
  }
  await db.containers.delete(id);
}

export async function getPhotosByContainer(containerId: string): Promise<Photo[]> {
  return await db.photos
    .where('containerId')
    .equals(containerId)
    .reverse()
    .sortBy('createdAt');
}

export async function createPhoto(photo: Photo): Promise<void> {
  await db.photos.add(photo);
}

export async function updatePhoto(photo: Photo): Promise<void> {
  await db.photos.put(photo);
}

export async function deletePhoto(id: string): Promise<void> {
  await db.photos.delete(id);
}

export async function getPhotoCount(containerId: string): Promise<number> {
  return await db.photos.where('containerId').equals(containerId).count();
}
