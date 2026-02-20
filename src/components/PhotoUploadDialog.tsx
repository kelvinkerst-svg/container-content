import { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { processPhoto, blobToDataUrl } from '../utils/imageUtils';

interface PhotoUpload {
  file: File;
  description: string;
  thumbnailUrl?: string;
}

interface PhotoUploadDialogProps {
  files: File[];
  onClose: () => void;
  onSave: (photos: Array<{ imageBlob: Blob; thumbnailBlob: Blob; description?: string }>) => void;
}

export default function PhotoUploadDialog({ files, onClose, onSave }: PhotoUploadDialogProps) {
  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadThumbnails();
  }, [files]);

  const loadThumbnails = async () => {
    setLoading(true);
    const photoUploads: PhotoUpload[] = [];

    for (const file of files) {
      try {
        const { thumbnailBlob } = await processPhoto(file);
        const thumbnailUrl = await blobToDataUrl(thumbnailBlob);
        photoUploads.push({
          file,
          description: '',
          thumbnailUrl
        });
      } catch (error) {
        console.error('Failed to process photo:', error);
      }
    }

    setPhotos(photoUploads);
    setLoading(false);
  };

  const handleDescriptionChange = (index: number, description: string) => {
    setPhotos(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], description };
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const processedPhotos: Array<{ imageBlob: Blob; thumbnailBlob: Blob; description?: string }> = [];

      for (const photo of photos) {
        const { imageBlob, thumbnailBlob } = await processPhoto(photo.file);
        processedPhotos.push({
          imageBlob,
          thumbnailBlob,
          description: photo.description.trim() || undefined
        });
      }

      onSave(processedPhotos);
    } catch (error) {
      console.error('Failed to process photos:', error);
      alert('Failed to process photos');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Add Photos ({files.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Processing photos...
            </div>
          ) : (
            <div className="space-y-4">
              {photos.map((photo, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      {photo.thumbnailUrl ? (
                        <img
                          src={photo.thumbnailUrl}
                          alt={`Photo ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (optional)
                      </label>
                      <input
                        type="text"
                        value={photo.description}
                        onChange={(e) => handleDescriptionChange(index, e.target.value)}
                        placeholder="e.g., Winter clothes, Kitchen utensils..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Add a description to make this photo easier to find later
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save All Photos'}
          </button>
        </div>
      </div>
    </div>
  );
}
