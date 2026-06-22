import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SkyToggle from '../ui/SkyToggle';
import './Header.css';

export default function Header() {
  const { userProfile } = useAuth();
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute('data-theme') === 'dark'
  );

  useEffect(() => {
    // Optional: listen to theme changes from other components (like Settings)
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = userProfile?.displayName?.split(' ')[0] || 'there';

  return (
    <header className="header" id="app-header">
      <div className="header__inner">
        <div className="header__left">
          <div className="header__greeting text-body-sm">{getGreeting()},</div>
          <div className="header__name text-h3">{firstName}</div>
        </div>
        <div className="header__right" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <SkyToggle
            checked={isDark}
            onChange={(val) => {
              const newTheme = val ? 'dark' : 'light';
              document.documentElement.setAttribute('data-theme', newTheme);
              localStorage.setItem('theme', newTheme);
              setIsDark(val);
            }}
          />
          
          <Link to="/settings" className="header__avatar-link" aria-label="Open settings">
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile.displayName}
                className="header__avatar"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="header__avatar header__avatar--fallback">
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
