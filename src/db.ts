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
