import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Upload, Database } from 'lucide-react';
import { exportData, importData, getStorageStats } from '../utils/exportImport';

interface SettingsScreenProps {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [stats, setStats] = useState<{
    containerCount: number;
    photoCount: number;
    approximateSize: string;
  } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await getStorageStats();
    setStats(data);
  };

  const handleExport = async () => {
    setExporting(true);
    setMessage(null);

    try {
      const blob = await exportData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `container-backup-${Date.now()}.containervault`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Backup exported successfully' });
    } catch (error) {
      console.error('Export failed:', error);
      setMessage({ type: 'error', text: 'Failed to export backup' });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (!file.name.endsWith('.containervault')) {
      setMessage({ type: 'error', text: 'Invalid file type. Please select a .containervault file' });
      return;
    }

    if (!confirm('Import will replace all current data. This cannot be undone. Continue?')) {
      e.target.value = '';
      return;
    }

    setImporting(true);
    setMessage(null);

    try {
      await importData(file);
      await loadStats();
      setMessage({ type: 'success', text: 'Backup imported successfully' });
    } catch (error) {
      console.error('Import failed:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to import backup'
      });
    } finally {
      setImporting(false);
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
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

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
                <span className="text-gray-600">Approximate Size:</span>
                <span className="font-medium text-gray-900">{stats.approximateSize}</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Loading...</div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Backup & Restore</h2>

          <div className="space-y-4">
            <div>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                {exporting ? 'Exporting...' : 'Export Backup'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Download all your data as a .containervault file
              </p>
            </div>

            <div>
              <label className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                <Upload className="w-5 h-5" />
                {importing ? 'Importing...' : 'Import Backup'}
                <input
                  type="file"
                  accept=".containervault"
                  onChange={handleImport}
                  disabled={importing}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Restore data from a .containervault file (replaces current data)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
          <p className="text-sm text-gray-600 mb-2">Container Contents v1.0.0</p>
          <p className="text-sm text-gray-600">
            An offline-first PWA for managing container inventories with QR codes.
          </p>
        </div>
      </div>
    </div>
  );
}
