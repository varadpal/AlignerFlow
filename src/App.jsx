import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TimerProvider } from './contexts/TimerContext';

import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotesPage from './pages/NotesPage';
import ReportPage from './pages/ReportPage';
import SettingsPage from './pages/SettingsPage';
import ReloadPrompt from './components/common/ReloadPrompt';
import InstallPrompt from './components/common/InstallPrompt';

function ProtectedRoute({ children }) {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading__ring">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="28" stroke="var(--border)" strokeWidth="3" />
            <circle
              cx="32" cy="32" r="28"
              stroke="var(--accent)" strokeWidth="3"
              strokeDasharray="176"
              strokeDashoffset="132"
              strokeLinecap="round"
              transform="rotate(-90 32 32)"
              style={{ animation: 'spin 1s linear infinite', transformOrigin: 'center' }}
            />
          </svg>
        </div>
        <div className="app-loading__text text-body-sm">Loading AlignerFlow...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (userProfile && !userProfile.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading__ring">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="28" stroke="var(--border)" strokeWidth="3" />
            <circle
              cx="32" cy="32" r="28"
              stroke="var(--accent)" strokeWidth="3"
              strokeDasharray="176"
              strokeDashoffset="132"
              strokeLinecap="round"
              transform="rotate(-90 32 32)"
              style={{ animation: 'spin 1s linear infinite', transformOrigin: 'center' }}
            />
          </svg>
        </div>
        <div className="app-loading__text text-body-sm">Loading AlignerFlow...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/onboarding"
        element={
          !user ? <Navigate to="/login" replace /> :
          userProfile?.onboardingComplete ? <Navigate to="/" replace /> :
          <OnboardingPage />
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <TimerProvider>
              <DashboardPage />
            </TimerProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <TimerProvider>
              <AnalyticsPage />
            </TimerProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <TimerProvider>
              <NotesPage />
            </TimerProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <TimerProvider>
              <ReportPage />
            </TimerProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <TimerProvider>
              <SettingsPage />
            </TimerProvider>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ReloadPrompt />
        <InstallPrompt />
      </AuthProvider>
    </BrowserRouter>
  );
}
