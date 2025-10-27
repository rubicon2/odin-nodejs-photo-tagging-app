import EditModePage from './components/EditModePage';
import ViewModePage from './components/ViewModePage';
import React from 'react';
import './App.css';

function App() {
  const isAdmin = import.meta.env.VITE_IS_ADMIN === 'true';
  return <>{isAdmin ? <EditModePage /> : <ViewModePage />}</>;
}

export default App;
