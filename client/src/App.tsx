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
      <AdminModal
        isActive={isModalActive}
        isAdmin={isAdmin}
        onAdminEnabled={() => setIsModalActive(false)}
        onAdminDisabled={() => setIsModalActive(false)}
        onMessage={(v: any) => console.log('message:', v)}
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
