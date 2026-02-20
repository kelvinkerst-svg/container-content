export interface Container {
  id: string;
  label: string;
  location: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Photo {
  id: string;
  containerId: string;
  description?: string;
  imageBlob: Blob;
  thumbnailBlob: Blob;
  createdAt: number;
}

export interface ExportManifest {
  appVersion: string;
  exportDate: number;
  containerCount: number;
  photoCount: number;
}
