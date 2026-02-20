import { useState, useEffect } from 'react';
import { Search, QrCode, Plus, Settings } from 'lucide-react';
import { Container } from '../types';
import { searchContainers } from '../utils/searchUtils';
import { db } from '../db';

interface HomeScreenProps {
  onScanQR: () => void;
  onAddContainer: () => void;
  onOpenContainer: (containerId: string) => void;
  onOpenSettings: () => void;
}

export default function HomeScreen({
  onScanQR,
  onAddContainer,
  onOpenContainer,
  onOpenSettings
}: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [containers, setContainers] = useState<Container[]>([]);
  const [photoCounts, setPhotoCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContainers();
  }, [searchQuery]);

  const loadContainers = async () => {
    setLoading(true);
    try {
      const results = await searchContainers(searchQuery);
      setContainers(results);

      const counts: Record<string, number> = {};
      for (const container of results) {
        const count = await db.photos.where('containerId').equals(container.id).count();
        counts[container.id] = count;
      }
      setPhotoCounts(counts);
    } catch (error) {
      console.error('Failed to load containers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <img
              src="/app_logo.png"
              alt="Kristi's Krap"
              className="h-12 w-auto object-contain"
            />
            <button
              onClick={onOpenSettings}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search containers, locations, descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onScanQR}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <QrCode className="w-5 h-5" />
              Scan QR
            </button>
            <button
              onClick={onAddContainer}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Container
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : containers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              {searchQuery ? 'No containers found' : 'No containers yet'}
            </div>
            {!searchQuery && (
              <p className="text-gray-500 text-sm">
                Scan a QR code or add a container to get started
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {containers.map((container) => (
              <div
                key={container.id}
                onClick={() => onOpenContainer(container.id)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {container.id}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {container.label || 'Unlabeled'}
                      </h3>
                    </div>
                    {container.location && (
                      <p className="text-sm text-gray-600 mb-1">{container.location}</p>
                    )}
                    {container.notes && (
                      <p className="text-sm text-gray-500 line-clamp-1">{container.notes}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {photoCounts[container.id] || 0} photo{photoCounts[container.id] !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
