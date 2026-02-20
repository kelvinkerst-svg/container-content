import { useState, useEffect } from 'react';
import { X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Photo } from '../types';
import { blobToDataUrl } from '../utils/imageUtils';
import { db } from '../db';

interface PhotoViewerProps {
  photos: Photo[];
  selectedPhotoId: string;
  onClose: () => void;
  onDelete: (photoId: string) => void;
}

export default function PhotoViewer({ photos, selectedPhotoId, onClose, onDelete }: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const index = photos.findIndex(p => p.id === selectedPhotoId);
    setCurrentIndex(index >= 0 ? index : 0);
  }, [selectedPhotoId, photos]);

  useEffect(() => {
    loadPhoto();
  }, [currentIndex]);

  const loadPhoto = async () => {
    setLoading(true);
    const photo = photos[currentIndex];
    if (photo) {
      const url = await blobToDataUrl(photo.imageBlob);
      setImageUrl(url);
      setDescription(photo.description || '');
    }
    setLoading(false);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleSaveDescription = async () => {
    const photo = photos[currentIndex];
    if (!photo) return;

    try {
      await db.photos.update(photo.id, {
        description: description.trim() || undefined
      });
      await db.containers.update(photo.containerId, { updatedAt: Date.now() });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save description:', error);
      alert('Failed to save description');
    }
  };

  const handleDeleteCurrent = () => {
    const photo = photos[currentIndex];
    if (photo) {
      onDelete(photo.id);
      onClose();
    }
  };

  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="text-sm">
          {currentIndex + 1} / {photos.length}
        </span>
        <button
          onClick={handleDeleteCurrent}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-red-400"
        >
          <Trash2 className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        {loading ? (
          <div className="text-white">Loading...</div>
        ) : (
          imageUrl && (
            <img
              src={imageUrl}
              alt="Photo"
              className="max-w-full max-h-full object-contain"
            />
          )
        )}

        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {currentPhoto && (
        <div className="bg-gray-900 text-white p-4">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description..."
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDescription(currentPhoto.description || '');
                    setIsEditing(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDescription}
                  className="flex-1 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition-colors"
            >
              {description ? (
                <p className="text-sm">{description}</p>
              ) : (
                <p className="text-sm text-gray-400">Tap to add description</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
