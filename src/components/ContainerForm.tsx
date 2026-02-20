import { useState, useEffect } from 'react';
import { X, Copy, Shuffle } from 'lucide-react';
import { Container } from '../types';
import { db } from '../db';
import { normalizeContainerId, getContainerIdError, generateContainerId } from '../utils/containerUtils';

interface ContainerFormProps {
  containerId?: string;
  onClose: () => void;
  onSave: (containerId: string) => void;
}

export default function ContainerForm({ containerId, onClose, onSave }: ContainerFormProps) {
  const [id, setId] = useState('');
  const [label, setLabel] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (containerId) {
      loadContainer();
    }
  }, [containerId]);

  const loadContainer = async () => {
    if (!containerId) return;

    const container = await db.containers.get(containerId);
    if (container) {
      setId(container.id);
      setLabel(container.label);
      setLocation(container.location);
      setNotes(container.notes || '');
      setIsEditing(true);
    } else {
      setId(containerId);
      setIsEditing(false);
    }
  };

  const handleGenerateId = async () => {
    let newId = generateContainerId();
    while (await db.containers.get(newId)) {
      newId = generateContainerId();
    }
    setId(newId);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedId = normalizeContainerId(id);
    const validationError = getContainerIdError(normalizedId);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!isEditing) {
      const existing = await db.containers.get(normalizedId);
      if (existing) {
        setError(`Container with ID ${normalizedId} already exists`);
        return;
      }
    }

    setLoading(true);

    try {
      const now = Date.now();
      const containerData: Container = {
        id: normalizedId,
        label: label.trim() || 'Unlabeled',
        location: location.trim(),
        notes: notes.trim() || undefined,
        createdAt: isEditing ? (await db.containers.get(normalizedId))!.createdAt : now,
        updatedAt: now
      };

      if (isEditing) {
        await db.containers.update(normalizedId, containerData);
      } else {
        await db.containers.add(containerData);
      }

      onSave(normalizedId);
    } catch (err) {
      console.error('Failed to save container:', err);
      setError('Failed to save container');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Container' : 'Add Container'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Container ID *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="C-XXXX"
                disabled={isEditing}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              />
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleGenerateId}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Generate ID"
                >
                  <Shuffle className="w-5 h-5 text-gray-600" />
                </button>
              )}
              {id && (
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Copy ID"
                >
                  <Copy className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Format: C-XXXX (4 characters: 0-9 and A-Z only)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Kitchen Supplies"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Garage, Top Shelf"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Container'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
