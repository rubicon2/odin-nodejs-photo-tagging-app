import AdminModal from './components/AdminModal';
import TitleBar from './components/TitleBar';
import EditModePage from './pages/EditModePage';
import ViewModePage from './pages/ViewModePage';
import useAdminState from './hooks/useAdminState';
import { useState } from 'react';
import './App.css';

function App() {
  const [isModalActive, setIsModalActive] = useState(false);
  const isAdmin = useAdminState();

  return (
    <>
      {/* Instead of conditionally rendering Modal, keep mounted at all times and use
        isActive to toggle visibility, so it can later be faded in and out nicely. */}
      <AdminModal
        isActive={isModalActive}
        isAdmin={isAdmin}
        onAdminEnabled={() => setIsModalActive(false)}
        onAdminDisabled={() => setIsModalActive(false)}
        onClose={() => setIsModalActive(false)}
      />
      <TitleBar
        isAdminEnabled={isAdmin}
        onSettingsClick={() => setIsModalActive(!isModalActive)}
      />
      {isAdmin ? <EditModePage /> : <ViewModePage />}
    </>
  );
}

export default App;
