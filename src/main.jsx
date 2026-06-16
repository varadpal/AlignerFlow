import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { TimerProvider } from './contexts/TimerContext';
// Service Worker is now handled by ReloadPrompt component

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <TimerProvider>
        <App />
      </TimerProvider>
    </AuthProvider>
  </React.StrictMode>,
);
