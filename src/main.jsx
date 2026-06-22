import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// Providers (Auth, Timer) are in App.jsx — single source of truth.
// Service Worker is handled by the ReloadPrompt component.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
