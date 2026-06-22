import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TimerProvider } from './contexts/TimerContext';

// Route pages are code-split so each loads only when navigated to.
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

import ReloadPrompt from './components/common/ReloadPrompt';
import InstallPrompt from './components/common/InstallPrompt';
import ErrorBoundary from './components/common/ErrorBoundary';

function PageLoader() {
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
    <Suspense fallback={<PageLoader />}>
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
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <NotesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <TimerProvider>
            <AppRoutes />
            <ReloadPrompt />
            <InstallPrompt />
          </TimerProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
