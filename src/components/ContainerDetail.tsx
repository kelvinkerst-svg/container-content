import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Edit, Trash2, MapPin } from 'lucide-react';
import { Container, Photo } from '../types';
import { getContainer, getPhotosByContainer, createPhoto, updateContainer, deleteContainer, deletePhoto } from '../db';
import { blobToDataUrl } from '../utils/imageUtils';
import PhotoViewer from './PhotoViewer';
import PhotoUploadDialog from './PhotoUploadDialog';

interface ContainerDetailProps {
  containerId: string;
  onBack: () => void;
  onEdit: () => void;
}

export default function ContainerDetail({ containerId, onBack, onEdit }: ContainerDetailProps) {
  const [container, setContainer] = useState<Container | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[] | null>(null);

  useEffect(() => {
    loadContainer();
  }, [containerId]);

  const loadContainer = async () => {
    setLoading(true);
    try {
      const containerData = await getContainer(containerId);
      setContainer(containerData);

      const photoData = await getPhotosByContainer(containerId);
      setPhotos(photoData);

      const urls: Record<string, string> = {};
      for (const photo of photoData) {
        urls[photo.id] = await blobToDataUrl(photo.thumbnailBlob);
      }
      setThumbnailUrls(urls);
    } catch (error) {
      console.error('Failed to load container:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setSelectedFiles(Array.from(files));
    e.target.value = '';
  };

  const handleSavePhotos = async (
    processedPhotos: Array<{ imageBlob: Blob; thumbnailBlob: Blob; description?: string }>
  ) => {
    try {
      for (const processedPhoto of processedPhotos) {
        const photo: Photo = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          containerId,
          description: processedPhoto.description,
          imageBlob: processedPhoto.imageBlob,
          thumbnailBlob: processedPhoto.thumbnailBlob,
          createdAt: Date.now()
        };

        await createPhoto(photo);
      }

      if (container) {
        await updateContainer({ ...container, updatedAt: Date.now() });
      }
      setSelectedFiles(null);
      await loadContainer();
    } catch (error) {
      console.error('Failed to add photos:', error);
      alert('Failed to add photos');
      setSelectedFiles(null);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return;

    try {
      await deletePhoto(photoId);
      if (container) {
        await updateContainer({ ...container, updatedAt: Date.now() });
      }
      await loadContainer();
    } catch (error) {
      console.error('Failed to delete photo:', error);
      alert('Failed to delete photo');
    }
  };

  const handleDeleteContainer = async () => {
    if (!confirm('Delete this container and all its photos? This cannot be undone.')) return;

    try {
      await deleteContainer(containerId);
      onBack();
    } catch (error) {
      console.error('Failed to delete container:', error);
      alert('Failed to delete container');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!container) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Container not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {container.id}
                </span>
                <h1 className="text-2xl font-bold text-gray-900">{container.label}</h1>
              </div>
              {container.location && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {container.location}
                </div>
              )}
            </div>
          </div>

          {container.notes && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">{container.notes}</p>
            </div>
          )}

          <div className="flex gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer">
              <Camera className="w-5 h-5" />
              Add Photo
              <input
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                onChange={handleAddPhoto}
                className="hidden"
              />
            </label>
            <button
              onClick={onEdit}
              className="p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={handleDeleteContainer}
              className="p-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Photos ({photos.length})
        </h2>

        {photos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No photos yet. Add photos to document what's inside this container.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => setSelectedPhotoId(photo.id)}
              >
                {thumbnailUrls[photo.id] && (
                  <img
                    src={thumbnailUrls[photo.id]}
                    alt={photo.description || 'Photo'}
                    className="w-full h-full object-cover"
                  />
                )}
                {photo.description && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2 truncate">
                    {photo.description}
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-25 transition-all" />
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPhotoId && (
        <PhotoViewer
          photos={photos}
          selectedPhotoId={selectedPhotoId}
          onClose={() => setSelectedPhotoId(null)}
          onDelete={handleDeletePhoto}
        />
      )}

      {selectedFiles && (
        <PhotoUploadDialog
          files={selectedFiles}
          onClose={() => setSelectedFiles(null)}
          onSave={handleSavePhotos}
        />
      )}
    </div>
  );
}
