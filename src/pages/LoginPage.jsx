import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign in failed:', err);
    }
  };

  return (
    <div className="login-page" id="login-page">
      {/* Decorative elements */}
      <div className="login-page__orb login-page__orb--1" />
      <div className="login-page__orb login-page__orb--2" />
      <div className="login-page__orb login-page__orb--3" />

      <div className="login-page__content animate-fade-in-up">
        {/* Logo */}
        <div className="login-page__logo">
          <div className="login-page__logo-ring">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" stroke="var(--accent)" strokeWidth="3" opacity="0.2" />
              <circle
                cx="32" cy="32" r="28"
                stroke="var(--accent)" strokeWidth="3"
                strokeDasharray="176"
                strokeDashoffset="44"
                strokeLinecap="round"
                transform="rotate(-90 32 32)"
              />
              <text x="32" y="36" textAnchor="middle" fill="var(--accent)" fontSize="20" fontWeight="bold" fontFamily="var(--font-display)">A</text>
            </svg>
          </div>
        </div>

        <h1 className="login-page__title">AlignerFlow</h1>
        <p className="login-page__tagline">
          Your smile journey,<br />beautifully tracked
        </p>

        <div className="login-page__features">
          <div className="login-page__feature">
            <span>⏱</span>
            <span>Track wear time effortlessly</span>
          </div>
          <div className="login-page__feature">
            <span>📊</span>
            <span>Beautiful analytics & insights</span>
          </div>
          <div className="login-page__feature">
            <span>🎯</span>
            <span>Stay on target with your goals</span>
          </div>
        </div>

        <button
          className="login-page__google-btn"
          onClick={handleSignIn}
          id="google-sign-in"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Sign in with Google</span>
        </button>

        <p className="login-page__disclaimer text-caption">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
