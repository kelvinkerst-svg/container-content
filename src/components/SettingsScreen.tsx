import { useState, useEffect } from 'react';
import { ArrowLeft, Database, Cloud } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';

interface SettingsScreenProps {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<{
    containerCount: number;
    photoCount: number;
  } | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: containers } = await supabase
      .from('containers')
      .select('id', { count: 'exact' });

    const { data: photos } = await supabase
      .from('photos')
      .select('id', { count: 'exact' });

    setStats({
      containerCount: containers?.length || 0,
      photoCount: photos?.length || 0,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Cloud className="w-6 h-6 text-slate-600" />
            <h2 className="text-lg font-semibold text-gray-900">Account</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900">{user?.email}</span>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Your data is automatically synced to the cloud and accessible across all your devices.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Storage Stats</h2>
          </div>
          {stats ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Containers:</span>
                <span className="font-medium text-gray-900">{stats.containerCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Photos:</span>
                <span className="font-medium text-gray-900">{stats.photoCount}</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Loading...</div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
          <p className="text-sm text-gray-600 mb-2">Container Contents v2.0.0</p>
          <p className="text-sm text-gray-600">
            A cloud-synced PWA for managing container inventories with QR codes.
          </p>
        </div>
      </div>
    </div>
  );
}
