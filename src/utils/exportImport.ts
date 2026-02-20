import JSZip from 'jszip';
import { db } from '../db';
import { Container, Photo, ExportManifest } from '../types';

const APP_VERSION = '1.0.0';

export async function exportData(): Promise<Blob> {
  const zip = new JSZip();

  const containers = await db.containers.toArray();
  const photos = await db.photos.toArray();

  const manifest: ExportManifest = {
    appVersion: APP_VERSION,
    exportDate: Date.now(),
    containerCount: containers.length,
    photoCount: photos.length
  };

  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  const databaseData = {
    containers,
    photos: photos.map(p => ({
      id: p.id,
      containerId: p.containerId,
      description: p.description,
      createdAt: p.createdAt
    }))
  };

  zip.file('database.json', JSON.stringify(databaseData, null, 2));

  const photosFolder = zip.folder('photos');
  const thumbsFolder = zip.folder('thumbs');

  for (const photo of photos) {
    if (photosFolder) {
      photosFolder.file(`${photo.id}.jpg`, photo.imageBlob);
    }
    if (thumbsFolder) {
      thumbsFolder.file(`${photo.id}.jpg`, photo.thumbnailBlob);
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}

export async function importData(file: File): Promise<void> {
  const zip = await JSZip.loadAsync(file);

  const manifestFile = zip.file('manifest.json');
  if (!manifestFile) {
    throw new Error('Invalid backup file: missing manifest.json');
  }

  const manifestText = await manifestFile.async('text');
  JSON.parse(manifestText) as ExportManifest;

  const databaseFile = zip.file('database.json');
  if (!databaseFile) {
    throw new Error('Invalid backup file: missing database.json');
  }

  const databaseText = await databaseFile.async('text');
  const databaseData: {
    containers: Container[];
    photos: Array<Omit<Photo, 'imageBlob' | 'thumbnailBlob'>>;
  } = JSON.parse(databaseText);

  const photoPromises = databaseData.photos.map(async (photoMeta) => {
    const imageFile = zip.file(`photos/${photoMeta.id}.jpg`);
    const thumbFile = zip.file(`thumbs/${photoMeta.id}.jpg`);

    if (!imageFile || !thumbFile) {
      console.warn(`Missing photo files for ${photoMeta.id}, skipping`);
      return null;
    }

    const [imageBlob, thumbnailBlob] = await Promise.all([
      imageFile.async('blob'),
      thumbFile.async('blob')
    ]);

    return {
      ...photoMeta,
      imageBlob,
      thumbnailBlob
    };
  });

  const photosWithBlobs = (await Promise.all(photoPromises)).filter(
    (photo): photo is Photo => photo !== null
  );

  await db.transaction('rw', db.containers, db.photos, async () => {
    await db.containers.clear();
    await db.photos.clear();

    await db.containers.bulkAdd(databaseData.containers);

    if (photosWithBlobs.length > 0) {
      await db.photos.bulkAdd(photosWithBlobs);
    }
  });
}

export async function getStorageStats(): Promise<{
  containerCount: number;
  photoCount: number;
  approximateSize: string;
}> {
  const containerCount = await db.containers.count();
  const photoCount = await db.photos.count();

  const photos = await db.photos.toArray();
  let totalBytes = 0;

  for (const photo of photos) {
    totalBytes += photo.imageBlob.size + photo.thumbnailBlob.size;
  }

  let size = '';
  if (totalBytes < 1024) {
    size = `${totalBytes} B`;
  } else if (totalBytes < 1024 * 1024) {
    size = `${(totalBytes / 1024).toFixed(1)} KB`;
  } else {
    size = `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return {
    containerCount,
    photoCount,
    approximateSize: size
  };
}
