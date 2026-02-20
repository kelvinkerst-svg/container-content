import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import AuthScreen from './components/AuthScreen';
import HomeScreen from './components/HomeScreen';
import QRScanner from './components/QRScanner';
import ContainerDetail from './components/ContainerDetail';
import ContainerForm from './components/ContainerForm';
import SettingsScreen from './components/SettingsScreen';

type Screen =
  | { type: 'home' }
  | { type: 'scan' }
  | { type: 'container-detail'; containerId: string }
  | { type: 'container-form'; containerId?: string }
  | { type: 'settings' };

function App() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>({ type: 'home' });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-slate-900 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const navigateToHome = () => setScreen({ type: 'home' });
  const navigateToScan = () => setScreen({ type: 'scan' });
  const navigateToSettings = () => setScreen({ type: 'settings' });
  const navigateToContainer = (containerId: string) =>
    setScreen({ type: 'container-detail', containerId });
  const navigateToAddContainer = () => setScreen({ type: 'container-form' });
  const navigateToEditContainer = (containerId: string) =>
    setScreen({ type: 'container-form', containerId });

  const handleContainerSaved = (containerId: string) => {
    navigateToContainer(containerId);
  };

  const handleCreateContainerFromQR = (containerId: string) => {
    setScreen({ type: 'container-form', containerId });
  };

  if (screen.type === 'home') {
    return (
      <HomeScreen
        onScanQR={navigateToScan}
        onAddContainer={navigateToAddContainer}
        onOpenContainer={navigateToContainer}
        onOpenSettings={navigateToSettings}
      />
    );
  }

  if (screen.type === 'scan') {
    return (
      <QRScanner
        onClose={navigateToHome}
        onContainerFound={navigateToContainer}
        onCreateContainer={handleCreateContainerFromQR}
      />
    );
  }

  if (screen.type === 'container-detail') {
    return (
      <ContainerDetail
        containerId={screen.containerId}
        onBack={navigateToHome}
        onEdit={() => navigateToEditContainer(screen.containerId)}
      />
    );
  }

  if (screen.type === 'container-form') {
    return (
      <ContainerForm
        containerId={screen.containerId}
        onClose={navigateToHome}
        onSave={handleContainerSaved}
      />
    );
  }

  if (screen.type === 'settings') {
    return (
      <SettingsScreen onBack={navigateToHome} />
    );
  }

  return null;
}

export default App;
