import EditModePage from './components/EditModePage';
import ViewModePage from './components/ViewModePage';
import React from 'react';
import './App.css';

function App() {
  const isDevMode = import.meta.env.MODE === 'development';
  return <>{isDevMode ? <EditModePage /> : <ViewModePage />}</>;
}

export default App;
