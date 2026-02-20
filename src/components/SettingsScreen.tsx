import { useState, useEffect } from 'react';
import { ArrowLeft, Database, Download, Upload } from 'lucide-react';
import { getStorageStats, exportData, importData } from '../utils/exportImport';

interface SettingsScreenProps {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [stats, setStats] = useState<{
    containerCount: number;
    photoCount: number;
    approximateSize: string;
  } | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const storageStats = await getStorageStats();
    setStats(storageStats);
  };

  const handleExport = async () => {
    try {
      const blob = await exportData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `container-backup-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('This will replace all existing data. Continue?')) {
      e.target.value = '';
      return;
    }

    try {
      await importData(file);
      await loadStats();
      alert('Data imported successfully');
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import data');
    } finally {
      e.target.value = '';
    }
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
              <div className="flex justify-between">
                <span className="text-gray-600">Storage Used:</span>
                <span className="font-medium text-gray-900">{stats.approximateSize}</span>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                All data is stored locally on your device.
              </p>
            </div>
          ) : (
            <div className="text-gray-500">Loading...</div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Backup & Restore</h2>
          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              Export Data
            </button>
            <label className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer">
              <Upload className="w-5 h-5" />
              Import Data
              <input
                type="file"
                accept=".zip"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500">
              Export your data as a backup or import from a previous backup.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
          <p className="text-sm text-gray-600 mb-2">Container Contents v2.0.0</p>
          <p className="text-sm text-gray-600">
            A local-first PWA for managing container inventories with QR codes.
          </p>
        </div>
      </div>
    </div>
  );
}
