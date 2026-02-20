import { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { X, Camera, Keyboard } from 'lucide-react';
import { normalizeContainerId, getContainerIdError } from '../utils/containerUtils';
import { getContainer } from '../lib/supabaseDb';

interface QRScannerProps {
  onClose: () => void;
  onContainerFound: (containerId: string) => void;
  onCreateContainer: (containerId: string) => void;
}

export default function QRScanner({ onClose, onContainerFound, onCreateContainer }: QRScannerProps) {
  const [scanning, setScanning] = useState(true);
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (!manualMode && scanning) {
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, [manualMode, scanning]);

  const startScanning = async () => {
    try {
      setCameraError(null);
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      const videoElement = videoRef.current;
      if (!videoElement) return;

      await reader.decodeFromVideoDevice(undefined, videoElement, (result) => {
        if (result) {
          const text = result.getText().trim();
          handleScannedCode(text);
        }
      });
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Unable to access camera. Please check permissions or use manual entry.');
    }
  };

  const stopScanning = () => {
    const videoElement = videoRef.current;
    if (videoElement && videoElement.srcObject) {
      const stream = videoElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoElement.srcObject = null;
    }
    readerRef.current = null;
  };

  const handleScannedCode = async (code: string) => {
    const normalized = normalizeContainerId(code);
    const validationError = getContainerIdError(normalized);

    if (validationError) {
      setError(validationError);
      return;
    }

    setScanning(false);
    stopScanning();

    const existingContainer = await getContainer(normalized);

    if (existingContainer) {
      onContainerFound(normalized);
    } else {
      if (confirm(`Create new container with ID ${normalized}?`)) {
        onCreateContainer(normalized);
      } else {
        setScanning(true);
        startScanning();
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScannedCode(manualInput);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Scan QR Code</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {!manualMode ? (
        <div className="flex-1 relative">
          {cameraError ? (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="bg-red-900 text-white rounded-lg p-6 max-w-md text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 opacity-75" />
                <p className="mb-4">{cameraError}</p>
                <button
                  onClick={() => setManualMode(true)}
                  className="bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Use Manual Entry
                </button>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          )}

          {error && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white p-4 text-center">
              {error}
            </div>
          )}

          <div className="absolute bottom-20 left-0 right-0 flex justify-center">
            <button
              onClick={() => setManualMode(true)}
              className="bg-white text-gray-900 px-6 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Keyboard className="w-5 h-5" />
              Manual Entry
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter Container ID</h3>
            <form onSubmit={handleManualSubmit}>
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="C-XXXX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                autoFocus
              />
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setManualMode(false);
                    setManualInput('');
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Scan
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
